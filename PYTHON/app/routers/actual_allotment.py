from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.database import get_connection
import pymysql

router = APIRouter()

# ✅ Request Schema
class ActualsResponse(BaseModel):
    actual_month: int
    actual_year: int
    customer_name: Optional[str]
    sc_number: Optional[str]
   

# ✅ API (POST because we pass body)
@router.get("/actuals/list")
async def get_actuals():
    conn = get_connection(db_name="windmill")
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        cursor.callproc("sp_get_actuals_list")
        rows = cursor.fetchall()
        return rows

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()



@router.get("/actuals/pdf/{client_eb_id}")
async def get_actuals_pdf(client_eb_id: int):
    conn = get_connection(db_name="windmill")
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        cursor.callproc("sp_get_actuals_pdf", (client_eb_id,))
        rows = cursor.fetchall()

        if not rows:
            return {"message": "No data found"}

        first = rows[0]

        # ✅ Header (now includes tax)
        header = {
            "customer_name": first["customer_name"],
            "sc_number": first["sc_number"],
            "month": first["actual_month"],
            "year": first["actual_year"],
            "self_gen_tax": float(first["self_gen_tax"]) if first.get("self_gen_tax") is not None else 0.0,
        }

        # ✅ Get original wheeling charges to recalculate precision if needed
        cursor.execute("""
            SELECT energy_number, wheeling_charges 
            FROM eb_bill_adjustment_charges 
            WHERE eb_bill_header_id = %s
        """, (client_eb_id,))
        adj_rows = cursor.fetchall()
        adj_map = {row["energy_number"]: float(row["wheeling_charges"] or 0) for row in adj_rows}

        # ✅ Get windmill types and wheeling charge configurations
        cursor.execute("SELECT windmill_number, type FROM masters.master_windmill")
        type_map = {r["windmill_number"]: (r["type"] or "windmill").lower() for r in cursor.fetchall()}
        
        cursor.execute("SELECT energy_type, cost, discount_charges FROM masters.master_consumption_chargers WHERE charge_code = 'C009'")
        rate_map = {r["energy_type"].lower(): float(r["cost"] or 0) * (float(r["discount_charges"] or 0) / 100.0) for r in cursor.fetchall()}
        
        # ✅ Table data
        table_data = []
        calculated_total = 0.0
        updated_total = 0.0

        for row in rows:
            windmill = row["windmill"]
            actual_id = row["actual_id"]
            updated_unit = float(row["updated_windmill_unit"]) if row.get("updated_windmill_unit") is not None else None
            
            sys_val = float(row["wheeling_charges"] or 0)
            orig_charges = adj_map.get(windmill, 0.0)

            # High Precision Recalculation based on Energy Type
            if orig_charges > 0:
                wm_type = type_map.get(windmill, "windmill")
                rate = rate_map.get(wm_type, rate_map.get("windmill", 0.5415))
                if rate > 0:
                    sys_val = orig_charges / rate

            # If updated_unit is not set, default to sys_val (Wheeling Units)
            final_updated_unit = updated_unit if updated_unit is not None else sys_val

            table_data.append({
                "actual_id": actual_id,
                "windmill": windmill,
                "windmill_name": row.get("windmill_name") or "",
                "wheeling_charges": sys_val,
                "updated_windmill_unit": final_updated_unit
            })
            calculated_total += sys_val
            updated_total += final_updated_unit

        # ✅ Update Self Generation Tax based on updated total
        cursor.execute("SELECT IFNULL(cost, 0) as cost FROM masters.master_consumption_chargers WHERE charge_code = 'C011' LIMIT 1")
        tax_row = cursor.fetchone()
        tax_rate = float(tax_row["cost"] or 0.1) if tax_row else 0.1
        
        header["self_gen_tax"] = updated_total * tax_rate

        return {
            "header": header,
            "data": table_data,
            "total": calculated_total,
            "updated_total": updated_total,
            "grand_total": updated_total + header["self_gen_tax"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()

class UpdateUnitsRequest(BaseModel):
    updates: List[dict] # [{"actual_id": 1, "updated_windmill_unit": 100}, ...]

@router.post("/actuals/update-units")
async def update_windmill_units(req: UpdateUnitsRequest):
    conn = get_connection(db_name="windmill")
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
        # Get tax rate
        cursor.execute("SELECT IFNULL(cost, 0.1) as cost FROM masters.master_consumption_chargers WHERE charge_code = 'C011' LIMIT 1")
        tax_row = cursor.fetchone()
        tax_rate = float(tax_row["cost"] or 0.1) if tax_row else 0.1

        for update in req.updates:
            actual_id = update.get("actual_id")
            val = float(update.get("updated_windmill_unit") or 0)
            tax_val = val * tax_rate
            
            if actual_id is not None:
                cursor.execute("""
                    UPDATE windmill.actual 
                    SET updated_windmill_unit = %s,
                        self_gen_tax = %s
                    WHERE id = %s
                """, (val, tax_val, actual_id))
        
        conn.commit()
        return {"status": "success", "message": "Units updated successfully"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()