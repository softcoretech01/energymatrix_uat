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
        # We fetch original wheeling charges from eb_bill_adjustment_charges
        cursor.execute("""
            SELECT energy_number, wheeling_charges 
            FROM eb_bill_adjustment_charges 
            WHERE eb_bill_header_id = %s
        """, (client_eb_id,))
        adj_rows = cursor.fetchall()
        adj_map = {row["energy_number"]: float(row["wheeling_charges"] or 0) for row in adj_rows}

        # ✅ Table data
        table_data = []
        calculated_total = 0.0

        for row in rows:
            windmill = row["windmill"]
            sys_val = float(row["wheeling_charges"] or 0)
            orig_charges = adj_map.get(windmill, 0.0)

            # High Precision Recalculation (Concept: 1.083/2 and 1.069/2)
            if orig_charges > 0 and sys_val > 0:
                approx_rate = orig_charges / sys_val
                rate1 = 1.083 / 2.0  # 0.5415
                rate2 = 1.069 / 2.0  # 0.5345
                
                if abs(approx_rate - 0.54) < 0.01:
                    sys_val = orig_charges / rate1
                elif abs(approx_rate - 0.53) < 0.01:
                    sys_val = orig_charges / rate2

            table_data.append({
                "windmill": windmill,
                "wheeling_charges": sys_val,
            })
            calculated_total += sys_val

        return {
            "header": header,
            "data": table_data,
            "total": calculated_total
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()