from app.utils.auth_utils import get_current_user
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
import re
import traceback
import pdfplumber
import pymysql
from datetime import datetime
from app.database import get_connection, DB_NAME_WINDMILL
from app.schemas.actual_allotment_schema import ActualAllotmentUploadResponse
from app.models.windmill_models import ActualAllotment

router = APIRouter(prefix="/actuals", tags=["Actual Allotment"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "actual_allotment")
os.makedirs(UPLOAD_DIR, exist_ok=True)

DEBUG_LOG = os.path.join(BASE_DIR, "debug_upload.log")

def log_debug(msg):
    with open(DEBUG_LOG, "a") as f:
        f.write(f"[{datetime.now()}] {msg}\n")
    print(msg)

def _find_adjusted_total_col(table: list) -> int:
    adjusted_start_idx = -1
    for row in table[:3]:
        if not row: continue
        row_upper = [str(c).upper().strip() if c else "" for c in row]
        for i, cell in enumerate(row_upper):
            if "ADJUSTED" in cell:
                adjusted_start_idx = i
                break
        if adjusted_start_idx != -1:
            break
            
    if adjusted_start_idx == -1:
        return 21

    for row in table[:5]:
        if not row: continue
        row_upper = [str(c).upper().strip() if c else "" for c in row]
        for i, cell in enumerate(row_upper):
            if i >= adjusted_start_idx and cell == "TOTAL":
                return i
                
    return 21

def extract_actual_allotment_data(pdf_path: str) -> dict:
    allotments = []
    pdf_month = None
    pdf_year = None
    pdf_service_nos = set()

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text and not pdf_month:
                # Improved regex for period: "MM, YYYY" below "ENERGY ADJUSTED REPORT - WIND"
                pattern = r"ENERGY ADJUSTED REPORT\s*-\s*WIND\s*.*?\b(\d{1,2}),\s*(\d{4})\b"
                period_match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
                if period_match:
                    pdf_month = int(period_match.group(1))
                    pdf_year = int(period_match.group(2))
                    log_debug(f"PDF Header Match: Month={pdf_month}, Year={pdf_year}")

            tables = page.extract_tables()
            for table in tables:
                if not table: continue
                adjusted_total_col = _find_adjusted_total_col(table)
                for row in table:
                    if not row or len(row) <= adjusted_total_col: continue
                    sno = str(row[0]).strip() if row[0] else ""
                    if not sno.isdigit(): continue
                    service_no  = str(row[1]).strip() if len(row) > 1 and row[1] else ""
                    consumer_no = str(row[2]).strip() if len(row) > 2 and row[2] else ""
                    if not consumer_no: continue
                    if service_no: pdf_service_nos.add(service_no)
                    try:
                        raw = str(row[adjusted_total_col]).replace(",", "").strip()
                        allotment_total = float(raw) if raw else 0.0
                    except:
                        allotment_total = 0.0
                    allotments.append({"service_no": service_no, "consumer_no": consumer_no, "allotment_total": allotment_total})

    return {
        "allotments": allotments,
        "pdf_month": pdf_month,
        "pdf_year": pdf_year,
        "pdf_service_nos": pdf_service_nos
    }

@router.post("/upload", response_model=ActualAllotmentUploadResponse)
async def upload_actual_allotment(
    windmill_id: int = Form(...),
    year: int = Form(...),
    month: int = Form(...),
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    log_debug(f"--- START UPLOAD: {file.filename} ---")
    log_debug(f"Params: WM={windmill_id}, Year={year}, Month={month}")
    
    file_path = None
    try:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files allowed")

        conn = get_connection(db_name=DB_NAME_WINDMILL)
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # 1. Fetch expected WM No via SP
        cursor.callproc("windmill.sp_get_all_windmill_numbers", ())
        wm_rows = cursor.fetchall()
        while cursor.nextset(): pass
        
        if not wm_rows:
            log_debug(f"Error: No windmills found in database")
            raise HTTPException(status_code=404, detail="No windmills found")
            
        # Find the specific windmill we are interested in
        selected_wm = next((r for r in wm_rows if r["id"] == windmill_id), None)
        if not selected_wm:
            log_debug(f"Error: Windmill ID {windmill_id} not found in list")
            raise HTTPException(status_code=404, detail="Selected windmill not found")
            
        expected_wm_no = str(selected_wm["windmill_number"]).strip()
        log_debug(f"Expected WM No: {expected_wm_no}")

        # 2. Save file temporarily
        file_path = os.path.join(UPLOAD_DIR, f"TEMP_{windmill_id}_{file.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        log_debug(f"Temp file saved: {file_path}")

        # 3. Extract & Validate PDF content
        extracted = extract_actual_allotment_data(file_path)
        allotments = extracted["allotments"]
        pdf_month = extracted["pdf_month"]
        pdf_year = extracted["pdf_year"]
        pdf_service_nos = extracted["pdf_service_nos"]
        
        log_debug(f"Extracted PDF Meta: Month={pdf_month}, Year={pdf_year}, Rows={len(allotments)}")
        log_debug(f"Extracted PDF Services: {list(pdf_service_nos)}")

        if not allotments:
            log_debug("Error: No data rows found in PDF")
            raise HTTPException(status_code=400, detail="No valid data found in PDF")

        # 3a. PERIOD VALIDATION
        if pdf_month is not None and pdf_year is not None:
            if pdf_month != month or pdf_year != year:
                log_debug(f"Mismatch Period: PDF={pdf_month}/{pdf_year} vs UI={month}/{year}")
                month_names = ["January","February","March","April","May","June","July","August","September","October","November","December"]
                pdf_month_name = month_names[pdf_month - 1] if 1 <= pdf_month <= 12 else str(pdf_month)
                sel_month_name = month_names[month - 1] if 1 <= month <= 12 else str(month)
                raise HTTPException(
                    status_code=400, 
                    detail=f"Period Mismatch: PDF is for {pdf_month_name} {pdf_year}, but you selected {sel_month_name} {year}."
                )

        # 3b. WINDMILL VALIDATION
        if pdf_service_nos:
            if expected_wm_no not in pdf_service_nos:
                # Check stripped versions
                pdf_stripped = {s.lstrip('0') for s in pdf_service_nos}
                expected_stripped = expected_wm_no.lstrip('0')
                if expected_stripped not in pdf_stripped:
                    log_debug(f"Mismatch Windmill: Expected={expected_wm_no}, Found={pdf_service_nos}")
                    raise HTTPException(
                        status_code=400,
                        detail=f"Windmill Mismatch: PDF contains records for {', '.join(list(pdf_service_nos)[:3])}, but you selected Windmill {expected_wm_no}."
                    )

        # 4. Save to DB
        parsed_count = 0
        unmatched = []
        for item in allotments:
            consumer_no = item["consumer_no"]
            allotment_total = item["allotment_total"]
            
            # Resolve service_id via SP
            cursor.callproc("windmill.sp_get_service_id_by_consumer_no", (consumer_no,))
            row = cursor.fetchone()
            while cursor.nextset(): pass

            if row:
                service_id = row[0] if isinstance(row, tuple) else row.get("id")
                if service_id is not None:
                    ActualAllotment.save_allotment(cursor, windmill_id, service_id, allotment_total, year, month, file_path, user["id"])
                    parsed_count += 1
                else:
                    unmatched.append(consumer_no)
            else:
                unmatched.append(consumer_no)

        conn.commit()
        log_debug(f"SUCCESS: Processed {parsed_count} rows")

        return {
            "message": "Actual Allotment uploaded and processed successfully",
            "filename": file.filename,
            "parsed_count": parsed_count,
            "unmatched_count": len(unmatched),
            "unmatched_samples": unmatched[:5]
        }

    except HTTPException as he:
        if file_path and os.path.exists(file_path): os.remove(file_path)
        raise he
    except Exception as e:
        log_debug(f"CRITICAL ERROR: {str(e)}")
        log_debug(traceback.format_exc())
        if file_path and os.path.exists(file_path): os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

@router.get("/list")
async def get_actual_allotment_list(
    windmill_id: Optional[int] = None,
    year: Optional[int] = None,
    month: Optional[int] = None
):
    conn = get_connection(db_name=DB_NAME_WINDMILL)
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # 1. Query combined reconciliation list via SP
        cursor.callproc("windmill.sp_get_actual_reconciliation_list", (year, month))
        rows = cursor.fetchall()
        while cursor.nextset(): pass

        final_result = []
        for r in rows:
            safe_r = _safe_row(r)
            manual_val = float(r['manual_adjusted_total']) if r.get('manual_adjusted_total') is not None else None
            safe_r['manual_adjusted_total'] = manual_val
            
            if manual_val is None:
                safe_r['reconciliation_status'] = 'Missing Manual PDF'
            else:
                sys_val = float(r['system_wheeling_charge'] or 0)
                safe_r['reconciliation_status'] = 'Matched' if abs(manual_val - sys_val) < 0.0001 else 'Mismatched'
            final_result.append(safe_r)
        
        return final_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

def _safe_row(row: dict) -> dict:
    from decimal import Decimal
    result = {}
    for k, v in row.items():
        if isinstance(v, Decimal): result[k] = float(v)
        elif isinstance(v, bytes): result[k] = v.decode("utf-8", errors="replace")
        else: result[k] = v
    return result

@router.delete("/delete/{record_id}")
async def delete_actual_allotment(record_id: int, user: dict = Depends(get_current_user)):
    conn = get_connection(db_name=DB_NAME_WINDMILL)
    cursor = conn.cursor()
    try:
        cursor.callproc("windmill.sp_delete_actual_allotment", (record_id,))
        if cursor.rowcount == 0: raise HTTPException(status_code=404, detail="Record not found")
        conn.commit()
        return {"message": "Record deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@router.get("/reconciliation/{client_eb_id}")
async def get_reconciliation_details(client_eb_id: int):
    conn = get_connection(db_name=DB_NAME_WINDMILL)
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    sp_cursor = conn.cursor() 
    try:
        cursor.callproc("windmill.sp_get_eb_bill_header_info", (client_eb_id,))
        header = cursor.fetchone()
        while cursor.nextset(): pass
        if not header: raise HTTPException(status_code=404, detail="EB Bill not found")
        
        b_year, b_month, s_id = header['bill_year'], header['bill_month'], header['sc_id']
        cursor.callproc("windmill.sp_get_customer_service_info", (s_id,))
        customer_info = cursor.fetchone()
        while cursor.nextset(): pass

        # Fetch from windmill.actual via SP
        cursor.callproc("windmill.sp_get_reconciliation_system_charges", (client_eb_id,))
        actual_rows = cursor.fetchall()
        while cursor.nextset(): pass
        
        system_charges = {
            str(row['energy_number']): {
                "windmill_name": row.get('windmill_name') or "",
                "calculated_value": float(row['calculated_wheeling_value'] or 0),
                "original_charges": float(row['wheeling_charges'] or 0)
            }
            for row in actual_rows
        }
        
        # 2. Get manual allotment totals from actual_allotment table
        cursor.execute("""
            SELECT mw.windmill_number, mw.windmill_name, aa.allotment_total, aa.pdf_file_path
            FROM actual_allotment aa
            JOIN masters.master_windmill mw ON aa.windmill_id = mw.id
            WHERE aa.year = %s AND aa.month = %s AND aa.service_id = %s
        """, (b_year, b_month, s_id))
        manual_rows = cursor.fetchall()
        manual_map = {
            str(row['windmill_number']): {
                "windmill_name": row.get('windmill_name') or "",
                "total": float(row['allotment_total'] or 0), 
                "is_uploaded": bool(row['pdf_file_path'])
            } 
            for row in manual_rows
        }

        # ✅ Get windmill types and wheeling charge configurations
        cursor.execute("SELECT windmill_number, type FROM masters.master_windmill")
        type_map = {r["windmill_number"]: (r["type"] or "windmill").lower() for r in cursor.fetchall()}
        
        cursor.execute("SELECT energy_type, cost, discount_charges FROM masters.master_consumption_chargers WHERE charge_code = 'C009'")
        rate_map = {r["energy_type"].lower(): float(r["cost"] or 0) * (float(r["discount_charges"] or 0) / 100.0) for r in cursor.fetchall()}

        # 3. Combine data
        all_windmills = sorted([wm for wm in set(system_charges.keys()).union(set(manual_map.keys())) if wm and wm != 'None'])
        comparison = []
        for wm in all_windmills:
            sys_data = system_charges.get(wm, {"calculated_value": 0.0, "original_charges": 0.0, "windmill_name": ""})
            man_data = manual_map.get(wm, {"total": 0.0, "is_uploaded": False, "windmill_name": ""})
            
            orig_charges = sys_data["original_charges"]
            sys_val = sys_data["calculated_value"]
            wm_name = sys_data["windmill_name"] or man_data["windmill_name"]
            
            # ✅ High Precision Recalculation based on Energy Type
            if orig_charges > 0:
                wm_type = type_map.get(wm, "windmill")
                rate = rate_map.get(wm_type, rate_map.get("windmill", 0.5415))
                if rate > 0:
                    sys_val = orig_charges / rate
            
            man_val = man_data["total"]
            is_uploaded = man_data["is_uploaded"]
            
            comparison.append({
                "windmill": wm, 
                "windmill_name": wm_name,
                "system_wheeling_charge": sys_val, 
                "original_wheeling_charges": orig_charges,
                "manual_adjusted_total": man_val,
                "is_uploaded": is_uploaded,
                "status": 'Matched' if abs(sys_val - man_val) < 0.0001 else 'Mismatched'
            })

        month_names = ["January","February","March","April","May","June","July","August","September","October","November","December"]
        return {
            "customer_name": customer_info['customer_name'] if customer_info else "",
            "service_number": customer_info['service_number'] if customer_info else "",
            "year": b_year, "month": month_names[b_month - 1] if 1 <= b_month <= 12 else "",
            "details": comparison
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        sp_cursor.close()
        conn.close()

@router.get("/pdf/{client_eb_id}")
async def get_actuals_pdf(client_eb_id: int):
    conn = get_connection(db_name=DB_NAME_WINDMILL)
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.callproc("sp_get_actuals_pdf", (client_eb_id,))
        rows = cursor.fetchall()
        if not rows:
            return {"message": "No data found"}

        first = rows[0]
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
            actual_id = row.get("actual_id")
            updated_unit = float(row["updated_windmill_unit"]) if row.get("updated_windmill_unit") is not None else None
            sys_val = float(row["wheeling_charges"] or 0)
            orig_charges = adj_map.get(windmill, 0.0)

            # High Precision Recalculation based on Energy Type
            if orig_charges > 0:
                wm_type = type_map.get(windmill, "windmill")
                # Fallback to windmill if type not in rate_map
                rate = rate_map.get(wm_type, rate_map.get("windmill", 0.5415))
                if rate > 0:
                    sys_val = orig_charges / rate

            final_updated_unit = updated_unit if updated_unit is not None else sys_val

            table_data.append({
                "actual_id": actual_id,
                "windmill": windmill,
                "windmill_name": row.get("windmill_name") or "",
                "wheeling_charges": sys_val,
                "updated_windmill_unit": final_updated_unit,
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
    updates: List[dict]

@router.post("/update-units")
async def update_windmill_units(req: UpdateUnitsRequest):
    conn = get_connection(db_name=DB_NAME_WINDMILL)
    cursor = conn.cursor(pymysql.cursors.DictCursor)

    try:
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
