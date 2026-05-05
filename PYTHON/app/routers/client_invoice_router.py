from fastapi import APIRouter, Depends, HTTPException, Query
from app.utils.auth_utils import get_current_user
from app.database import get_connection
from datetime import date
from typing import Optional
import pymysql

router = APIRouter(
    prefix="/invoices",
    tags=["Client Invoice"]
)


# =====================================================
# 🔵 GENERATE (create) a new client invoice
# =====================================================
@router.post("/generate")
async def generate_invoice(data: dict, user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_connection(db_name="windmill")
        cursor = conn.cursor(pymysql.cursors.DictCursor)

        # Step 0: Check if invoice already exists for this service/year/month
        cursor.execute("""
            SELECT id FROM client_invoice 
            WHERE service_id = %s AND year = %s AND month = %s
        """, (int(data["service_id"]), int(data["year"]), data["month"]))
        if cursor.fetchone():
            raise HTTPException(
                status_code=400, 
                detail=f"Invoice already exists for {data['month']} {data['year']} for this service number."
            )

        # Step 1: Get the next sequential invoice number
        cursor.callproc("sp_get_next_invoice_number")
        row = cursor.fetchone()
        next_number = row["next_number"] if row else 1
        # drain any remaining result sets
        while cursor.nextset():
            pass

        # Step 2: Save the new invoice record
        today = date.today()
        cursor.callproc("sp_save_client_invoice", (
            next_number,
            int(data["customer_id"]),
            int(data["service_id"]),
            int(data["year"]),
            data["month"],
            today,
            user["id"]
        ))
        result = cursor.fetchone()
        conn.commit()

        # Step 3: Auto-populate client_invoice_details
        invoice_id = result["id"] if result else None
        if invoice_id:
            # Step 1: Fetch invoice metadata
            cursor.callproc("windmill.sp_get_client_invoice_metadata", (invoice_id,))
            invoice = cursor.fetchone()
            while cursor.nextset(): pass
            
            if invoice:
                month_map = {
                    "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6,
                    "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12
                }
                m_int = month_map.get(invoice.get("month", ""), 0)

                # Step 2: Fetch actual tax
                cursor.callproc("windmill.sp_get_actual_tax_total", (
                    invoice.get("customer_id"), 
                    invoice.get("service_id"), 
                    invoice.get("year"), 
                    m_int
                ))
                tax_row = cursor.fetchone()
                actual_tax = float(tax_row["total_tax"] or 0) if tax_row else 0.0
                while cursor.nextset(): pass

                # Step 3: Populate details
                charge_fields = [
                    ("Meter", "meter"),
                    ("O&M Charges", "om"),
                    ("Transmsn Chrgs", "trans"),
                    ("Sys Opr Chrgs", "sys_opr"),
                    ("RkvAh", "rkvah"),
                    ("Import Chrgs", "import"),
                    ("Scheduling chrgs", "scheduling"),
                    ("DSM Charges", "dsm"),
                    ("Wheeling", "wheeling"),
                    ("Other Charges", "other"),
                    ("Selfenergy chrgs", "tax"),
                ]

                d_map = {}
                # Units and Rate
                units = float(invoice.get("generated_units", 0))
                rate = float(invoice.get("invoice_constant", 0.00))
                d_map["Units"] = {"amount": units, "calc": None}
                d_map["Rate"] = {"amount": rate, "calc": None}

                for label, key in charge_fields:
                    w = float(invoice.get(f"charge_{key}_windmill", 0))
                    s = float(invoice.get(f"charge_{key}_solar", 0))
                    total = w + s
                    calc = f"{w:,.2f} (Windmill) + {s:,.2f} (Solar) = {total:,.2f}"
                    d_map[label] = {"amount": total, "calc": calc}

                # Self Energy Tax (handled via charge_fields map)
                
                total_charges = sum(v["amount"] for k, v in d_map.items() if k not in ["Units", "Rate"])
                net_units_value = units * rate
                final_amount = net_units_value - total_charges
                
                # Add Total field
                d_map["Total"] = {"amount": total_charges, "calc": f"Sum of all above charges = {total_charges:,.2f}"}

                for field_name, val in d_map.items():
                    cursor.callproc("windmill.sp_upsert_client_invoice_detail", (invoice_id, field_name, val["amount"], val["calc"]))
                
                # Update main invoice amount
                cursor.callproc("windmill.sp_update_client_invoice_amount", (invoice_id, final_amount))
                
                conn.commit()

        return {
            "status": "success",
            "invoice_id": invoice_id,
            "invoice_number": next_number
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# =====================================================
# 🔵 LIST client invoices (with optional filters)
# =====================================================
@router.get("")
async def get_invoice_list(
    customer_id: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    month: Optional[str] = Query(None),
    user: dict = Depends(get_current_user)
):
    conn = None
    cursor = None
    try:
        conn = get_connection(db_name="windmill")
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        cursor.callproc("sp_get_client_invoice_list", (customer_id, year, month))
        rows = cursor.fetchall()
        while cursor.nextset():
            pass

        # Convert date / decimal fields to serializable types
        result = []
        for r in rows:
            row_copy = dict(r)
            if row_copy.get("invoice_date"):
                row_copy["invoice_date"] = str(row_copy["invoice_date"])
            result.append(row_copy)

        return {"status": "success", "data": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# =====================================================
# 🔵 GET a single invoice by ID (for print view)
# =====================================================
@router.get("/{invoice_id}/print-data")
async def get_invoice_print_data(
    invoice_id: int,
    user: dict = Depends(get_current_user)
):
    conn = None
    cursor = None
    try:
        conn = get_connection(db_name="windmill")
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        cursor.callproc("sp_get_client_invoice_by_id", (invoice_id,))
        row = cursor.fetchone()
        while cursor.nextset():
            pass

        if not row:
            raise HTTPException(status_code=404, detail="Invoice not found")

        # Fetch stored details
        cursor.callproc("sp_get_client_invoice_details", (invoice_id,))
        details = cursor.fetchall()
        while cursor.nextset(): pass
        
        # Serialize
        row_copy = dict(row)
        if row_copy.get("invoice_date"):
            row_copy["invoice_date"] = str(row_copy["invoice_date"])
            
        row_copy["details"] = details
        
        # Fallback: If Selfenergy chrgs is 0 or missing, try to fetch from actual table
        tax_entry = next((d for d in details if d["field_name"] == "Selfenergy chrgs"), None)
        if not tax_entry or float(tax_entry["amount"]) == 0:
            month_map = {
                "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6,
                "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12
            }
            m_int = month_map.get(row_copy.get("month", ""), 0)
            
            # Use stored procedure for tax
            cursor.callproc("windmill.sp_get_actual_tax_total", (
                row_copy.get("customer_id"), 
                row_copy.get("service_id"), 
                row_copy.get("year"), 
                m_int
            ))
            tax_row = cursor.fetchone()
            while cursor.nextset(): pass

            if tax_row and tax_row["total_tax"]:
                actual_tax = float(tax_row["total_tax"])
                if not tax_entry:
                    row_copy["details"].append({"field_name": "Selfenergy chrgs", "amount": actual_tax})
                else:
                    tax_entry["amount"] = actual_tax

        return {"status": "success", "data": row_copy}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
# =====================================================
# 🔵 GET invoice details (for editing)
# =====================================================
@router.get("/{invoice_id}/details")
async def get_invoice_details(invoice_id: int, user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_connection(db_name="windmill")
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        # Fetch stored details
        cursor.callproc("windmill.sp_get_client_invoice_details", (invoice_id,))
        rows = cursor.fetchall()
        while cursor.nextset(): pass
        
        # If no details exist (for old invoices), populate them
        if not rows:
            cursor.callproc("windmill.sp_get_client_invoice_metadata", (invoice_id,))
            invoice = cursor.fetchone()
            while cursor.nextset(): pass
            
            if invoice:
                month_map = {
                    "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6,
                    "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12
                }
                m_int = month_map.get(invoice.get("month", ""), 0)
                
                # Fetch tax via SP
                cursor.callproc("windmill.sp_get_actual_tax_total", (
                    invoice.get("customer_id"), 
                    invoice.get("service_id"), 
                    invoice.get("year"), 
                    m_int
                ))
                tax_row = cursor.fetchone()
                actual_tax = float(tax_row["total_tax"] or 0) if tax_row else 0.0
                while cursor.nextset(): pass

                charge_fields = [
                    ("Meter", "meter"),
                    ("O&M Charges", "om"),
                    ("Transmsn Chrgs", "trans"),
                    ("Sys Opr Chrgs", "sys_opr"),
                    ("RkvAh", "rkvah"),
                    ("Import Chrgs", "import"),
                    ("Scheduling chrgs", "scheduling"),
                    ("DSM Charges", "dsm"),
                    ("Wheeling", "wheeling"),
                ]

                d_map = {}
                # Units and Rate
                units = float(invoice.get("generated_units", 0))
                rate = float(invoice.get("invoice_constant", 0.00))
                d_map["Units"] = {"amount": units, "calc": None}
                d_map["Rate"] = {"amount": rate, "calc": None}

                for label, key in charge_fields:
                    w = float(invoice.get(f"charge_{key}_windmill", 0))
                    s = float(invoice.get(f"charge_{key}_solar", 0))
                    total = w + s
                    calc = f"{w:,.2f} (Windmill) + {s:,.2f} (Solar) = {total:,.2f}"
                    d_map[label] = {"amount": total, "calc": calc}

                # Self Energy Tax
                d_map["Selfenergy chrgs"] = {"amount": actual_tax, "calc": f"Summed from actual table = {actual_tax:,.2f}"}
                
                total_charges = sum(v["amount"] for k, v in d_map.items() if k not in ["Units", "Rate"])
                net_units_value = units * rate
                final_amount = net_units_value - total_charges
                
                # Add Total field
                d_map["Total"] = {"amount": total_charges, "calc": f"Sum of all above charges = {total_charges:,.2f}"}

                for field_name, val in d_map.items():
                    cursor.callproc("windmill.sp_upsert_client_invoice_detail", (invoice_id, field_name, val["amount"], val["calc"]))
                
                # Update main invoice amount
                cursor.callproc("windmill.sp_update_client_invoice_amount", (invoice_id, final_amount))
                
                conn.commit()
                # Refresh rows via SP
                cursor.callproc("windmill.sp_get_client_invoice_details", (invoice_id,))
                rows = cursor.fetchall()
                while cursor.nextset(): pass
        
        # Even if rows existed, check if tax is 0 and try to update it
        tax_entry = next((r for r in rows if r["field_name"] == "Selfenergy chrgs"), None)
        if not tax_entry or float(tax_entry["amount"]) == 0:
             # Logic to re-calculate tax for existing rows via metadata SP
             cursor.callproc("windmill.sp_get_client_invoice_metadata", (invoice_id,))
             inv_info = cursor.fetchone()
             while cursor.nextset(): pass

             if inv_info:
                month_map = {
                    "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6,
                    "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12
                }
                m_int = month_map.get(inv_info.get("month", ""), 0)
                
                cursor.callproc("windmill.sp_get_actual_tax_total", (
                    inv_info.get("customer_id"), 
                    inv_info.get("service_id"), 
                    inv_info.get("year"), 
                    m_int
                ))
                tax_row = cursor.fetchone()
                while cursor.nextset(): pass

                if tax_row and tax_row["total_tax"]:
                    actual_tax = float(tax_row["total_tax"])
                    cursor.callproc("windmill.sp_upsert_client_invoice_detail", (invoice_id, "Selfenergy chrgs", actual_tax))
                    conn.commit()
                    # Refresh rows again
                    cursor.callproc("windmill.sp_get_client_invoice_details", (invoice_id,))
                    rows = cursor.fetchall()
                    while cursor.nextset(): pass

        return {"status": "success", "data": rows}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# =====================================================
# 🔵 UPDATE invoice details & main amount
# =====================================================
@router.put("/{invoice_id}/details")
async def update_invoice_details(invoice_id: int, data: dict, user: dict = Depends(get_current_user)):
    conn = None
    cursor = None
    try:
        conn = get_connection(db_name="windmill")
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        details = data.get("details", [])
        
        # 1. Update details table via SP
        for item in details:
            cursor.callproc("windmill.sp_upsert_client_invoice_detail", (invoice_id, item["field_name"], item["amount"], item.get("calculation")))
            
        # 2. Recalculate total amount for the main invoice table
        # Formula: Amount = Net Units - Total
        d_map = {d["field_name"]: float(d["amount"]) for d in details}
        units = d_map.get("Units", 0)
        rate = d_map.get("Rate", 0.00)
        net_units_value = units * rate
        
        charges_list = [
            "Meter", "O&M Charges", "Transmsn Chrgs", "Sys Opr Chrgs",
            "RkvAh", "Import Chrgs", "Scheduling chrgs", "DSM Charges",
            "Wheeling", "Selfenergy chrgs"
        ]
        total_charges = sum(d_map.get(c, 0) for c in charges_list)
        final_amount = net_units_value - total_charges
        
        # 3. Update main invoice fields
        main_fields = [
            "delivery_note", "mode_terms_of_payment", "reference_no_date",
            "other_references", "buyers_order_no", "buyers_order_date",
            "dispatch_doc_no", "delivery_note_date", "dispatched_through",
            "destination", "terms_of_delivery"
        ]
        
        for field in main_fields:
            if field in data:
                val = data[field]
                if val == "": val = None
                cursor.execute(f"UPDATE client_invoice SET {field} = %s WHERE id = %s", (val, invoice_id))

        # Update Total charge detail
        cursor.callproc("windmill.sp_upsert_client_invoice_detail", (invoice_id, "Total", total_charges, f"Sum of all updated charges = {total_charges:,.2f}"))

        # Update final amount via SP
        cursor.callproc("windmill.sp_update_client_invoice_amount", (invoice_id, final_amount))

        conn.commit()
        return {"status": "success", "final_amount": final_amount, "total_charges": total_charges}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
