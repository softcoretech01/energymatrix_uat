from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from app.database import get_connection
from app.utils.auth_utils import get_current_user
import pymysql

router = APIRouter()

@router.get("/banking/utilized")
async def get_banking_utilized(year: int, mode: str = "financial", current_user: dict = Depends(get_current_user)):
    """
    Fetches the total actual allotments (utilized units) and slot-wise units (c1, c2, c4, c5)
    from actual_allotment, alongside powerplant slot-wise net units (pp_c1, pp_c2, pp_c4, pp_c5)
    from eb_statements and eb_statements_details, for the specified calendar/financial year.
    """
    conn = get_connection(db_name="windmill")
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # 1. Fetch main banking utilized records via stored procedure
        cursor.callproc("sp_get_banking_utilized", (year, mode))
        rows = cursor.fetchall()
        
        # 2. Fetch transmission loss for each windmill
        cursor.execute("SELECT windmill_number, COALESCE(transmission_loss, 0.0) as transmission_loss FROM masters.master_windmill")
        windmill_losses = {str(row["windmill_number"]).strip(): float(row["transmission_loss"]) for row in cursor.fetchall() if row.get("windmill_number")}
        
        # 3. Fetch banking loss from configuration
        cursor.execute("SELECT COALESCE(banking_loss, 0.0) as banking_loss FROM masters.configuration LIMIT 1")
        config_row = cursor.fetchone()
        banking_loss = float(config_row["banking_loss"]) if config_row else 0.0
        
        # 4. Fetch Energy Allotment "Utilized Bank" totals per windmill/year/month/slot
        # This is the sum of banking_allocated from energy_allotment_details grouped by windmill
        ea_query = """
            SELECT 
                mw.windmill_number,
                h.year,
                h.month,
                COALESCE(SUM(CASE WHEN d.slot='c1' THEN d.banking_allocated ELSE 0 END), 0) as ea_bank_c1,
                COALESCE(SUM(CASE WHEN d.slot='c2' THEN d.banking_allocated ELSE 0 END), 0) as ea_bank_c2,
                COALESCE(SUM(CASE WHEN d.slot='c4' THEN d.banking_allocated ELSE 0 END), 0) as ea_bank_c4,
                COALESCE(SUM(CASE WHEN d.slot='c5' THEN d.banking_allocated ELSE 0 END), 0) as ea_bank_c5
            FROM windmill.energy_allotment_header h
            JOIN windmill.energy_allotment_details d ON h.allocation_id = d.allocation_id
            JOIN masters.master_windmill mw ON h.windmill_id = mw.id
            WHERE h.status = '1' AND d.status = '1'
              AND LOWER(mw.type) = 'windmill'
              AND (
                (%(mode)s = 'financial' AND ((h.year = %(year)s AND h.month >= 4) OR (h.year = %(year)s + 1 AND h.month <= 3)))
                OR
                (%(mode)s = 'calendar' AND h.year = %(year)s)
              )
            GROUP BY mw.windmill_number, h.year, h.month
        """
        cursor.execute(ea_query, {"year": year, "mode": mode})
        ea_rows = cursor.fetchall()
        
        # Build lookup: key = "windmill_number-year-month" -> {ea_bank_c1, ea_bank_c2, ea_bank_c4, ea_bank_c5}
        ea_lookup = {}
        for ea in ea_rows:
            ea_key = f"{str(ea['windmill_number']).strip()}-{ea['year']}-{ea['month']}"
            ea_lookup[ea_key] = {
                "ea_bank_c1": float(ea["ea_bank_c1"]) if ea["ea_bank_c1"] is not None else 0.0,
                "ea_bank_c2": float(ea["ea_bank_c2"]) if ea["ea_bank_c2"] is not None else 0.0,
                "ea_bank_c4": float(ea["ea_bank_c4"]) if ea["ea_bank_c4"] is not None else 0.0,
                "ea_bank_c5": float(ea["ea_bank_c5"]) if ea["ea_bank_c5"] is not None else 0.0,
            }

        # 4a. Fetch Energy Allotment Total Allotted units per windmill/year/month
        ea_allotted_query = """
            SELECT 
                mw.windmill_number,
                h.year,
                h.month,
                COALESCE(SUM(d.allocated), 0) as total_allotted
            FROM windmill.energy_allotment_header h
            JOIN windmill.energy_allotment_details d ON h.allocation_id = d.allocation_id
            JOIN masters.master_windmill mw ON h.windmill_id = mw.id
            WHERE h.status = '1' AND d.status = '1'
              AND LOWER(mw.type) = 'windmill'
              AND (
                (%(mode)s = 'financial' AND ((h.year = %(year)s AND h.month >= 4) OR (h.year = %(year)s + 1 AND h.month <= 3)))
                OR
                (%(mode)s = 'calendar' AND h.year = %(year)s)
              )
            GROUP BY mw.windmill_number, h.year, h.month
        """
        cursor.execute(ea_allotted_query, {"year": year, "mode": mode})
        ea_allotted_rows = cursor.fetchall()
        ea_allotted_lookup = {}
        for row in ea_allotted_rows:
            key = f"{str(row['windmill_number']).strip()}-{row['year']}-{row['month']}"
            ea_allotted_lookup[key] = float(row["total_allotted"]) if row["total_allotted"] is not None else 0.0

        # 4b. Fetch actual total calculated_wheeling_value per windmill/year/month
        actual_query = """
            SELECT 
                TRIM(a.energy_number) as windmill_number,
                a.actual_year as year,
                a.actual_month as month,
                COALESCE(SUM(a.calculated_wheeling_value), 0) as total_calculated_wheeling_value
            FROM windmill.actual a
            WHERE (
                (%(mode)s = 'financial' AND ((a.actual_year = %(year)s AND a.actual_month >= 4) OR (a.actual_year = %(year)s + 1 AND a.actual_month <= 3)))
                OR
                (%(mode)s = 'calendar' AND a.actual_year = %(year)s)
            )
            GROUP BY TRIM(a.energy_number), a.actual_year, a.actual_month
        """
        cursor.execute(actual_query, {"year": year, "mode": mode})
        actual_rows = cursor.fetchall()
        actual_lookup = {}
        for row in actual_rows:
            if row.get("windmill_number"):
                key = f"{str(row['windmill_number']).strip()}-{row['year']}-{row['month']}"
                actual_lookup[key] = float(row["total_calculated_wheeling_value"]) if row["total_calculated_wheeling_value"] is not None else 0.0
        
        # Convert Decimal values to float and attach transmission_loss/banking_loss/ea_bank
        for r in rows:
            for field in [
                'total_utilized', 'c1', 'c2', 'c4', 'c5', 
                'pp_c1', 'pp_c2', 'pp_c4', 'pp_c5', 
                'eb_c1', 'eb_c2', 'eb_c4', 'eb_c5',
                'ao_pp_c1', 'ao_pp_c2', 'ao_pp_c4', 'ao_pp_c5',
                'ao_bank_c1', 'ao_bank_c2', 'ao_bank_c4', 'ao_bank_c5',
                'ao_bal_c1', 'ao_bal_c2', 'ao_bal_c4', 'ao_bal_c5'
            ]:
                if field in r and r[field] is not None:
                    r[field] = float(r[field])
                else:
                    r[field] = 0.0
            
            wm_num = str(r.get("windmill_number") or "").strip()
            r["transmission_loss"] = windmill_losses.get(wm_num, 0.0)
            r["banking_loss"] = banking_loss
            
            # Attach energy allotment utilized bank values
            ea_key = f"{wm_num}-{r.get('year')}-{r.get('month')}"
            ea_data = ea_lookup.get(ea_key, {})
            r["ea_bank_c1"] = ea_data.get("ea_bank_c1", 0.0)
            r["ea_bank_c2"] = ea_data.get("ea_bank_c2", 0.0)
            r["ea_bank_c4"] = ea_data.get("ea_bank_c4", 0.0)
            r["ea_bank_c5"] = ea_data.get("ea_bank_c5", 0.0)
            
            # Attach total allotted and actual calculated wheeling value
            r["ea_total_allotted"] = ea_allotted_lookup.get(ea_key, 0.0)
            r["act_total_calculated_wheeling_value"] = actual_lookup.get(ea_key, 0.0)
                
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
