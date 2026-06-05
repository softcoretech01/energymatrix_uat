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

@router.get("/banking/monthly-summary")
async def get_banking_monthly_summary(year: int, mode: str = "financial", current_user: dict = Depends(get_current_user)):
    conn = get_connection(db_name="windmill")
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        # 1. Fetch active windmills
        cursor.execute("""
            SELECT id, TRIM(windmill_number) as windmill_number, COALESCE(transmission_loss, 0.0) as transmission_loss 
            FROM masters.master_windmill 
            WHERE status = 'Active' AND LOWER(type) = 'windmill'
        """)
        windmills = cursor.fetchall()
        
        # 2. Fetch EB statement details
        eb_query = """
            SELECT 
                mw.id as windmill_id,
                es.year,
                CASE TRIM(es.month)
                    WHEN 'January' THEN 1 WHEN 'February' THEN 2 WHEN 'March' THEN 3
                    WHEN 'April' THEN 4 WHEN 'May' THEN 5 WHEN 'June' THEN 6
                    WHEN 'July' THEN 7 WHEN 'August' THEN 8 WHEN 'September' THEN 9
                    WHEN 'October' THEN 10 WHEN 'November' THEN 11 WHEN 'December' THEN 12
                END as month,
                d.slots as slot,
                COALESCE(d.banking_units, 0.0) as banking_units,
                COALESCE(d.net_unit, 0.0) as net_unit
            FROM windmill.eb_statements es
            JOIN masters.master_windmill mw ON es.windmill_id = mw.id
            JOIN windmill.eb_statements_details d ON es.id = d.eb_header_id
            WHERE (
                (%(mode)s = 'financial' AND (
                    (es.year = %(year)s AND CASE TRIM(es.month)
                        WHEN 'January' THEN 1 WHEN 'February' THEN 2 WHEN 'March' THEN 3
                        WHEN 'April' THEN 4 WHEN 'May' THEN 5 WHEN 'June' THEN 6
                        WHEN 'July' THEN 7 WHEN 'August' THEN 8 WHEN 'September' THEN 9
                        WHEN 'October' THEN 10 WHEN 'November' THEN 11 WHEN 'December' THEN 12
                    END >= 4)
                    OR
                    (es.year = %(year)s + 1 AND CASE TRIM(es.month)
                        WHEN 'January' THEN 1 WHEN 'February' THEN 2 WHEN 'March' THEN 3
                        WHEN 'April' THEN 4 WHEN 'May' THEN 5 WHEN 'June' THEN 6
                        WHEN 'July' THEN 7 WHEN 'August' THEN 8 WHEN 'September' THEN 9
                        WHEN 'October' THEN 10 WHEN 'November' THEN 11 WHEN 'December' THEN 12
                    END <= 4)
                ))
                OR
                (%(mode)s = 'calendar' AND (
                    es.year = %(year)s
                    OR
                    (es.year = %(year)s + 1 AND CASE TRIM(es.month)
                        WHEN 'January' THEN 1 WHEN 'February' THEN 2 WHEN 'March' THEN 3
                        WHEN 'April' THEN 4 WHEN 'May' THEN 5 WHEN 'June' THEN 6
                        WHEN 'July' THEN 7 WHEN 'August' THEN 8 WHEN 'September' THEN 9
                        WHEN 'October' THEN 10 WHEN 'November' THEN 11 WHEN 'December' THEN 12
                    END = 1)
                ))
            ) AND LOWER(mw.type) = 'windmill'
        """
        cursor.execute(eb_query, {"year": year, "mode": mode})
        eb_rows = cursor.fetchall()
        
        eb_map = {}
        for r in eb_rows:
            slot_str = str(r['slot']).strip().lower()
            if not slot_str.startswith('c'):
                slot_str = f"c{slot_str}"
            key = (r['windmill_id'], r['year'], r['month'], slot_str)
            eb_map[key] = {
                'banking_units': float(r['banking_units']),
                'net_unit': float(r['net_unit'])
            }
            
        # 3. Fetch Allotment Orders
        ao_query = """
            SELECT 
                mw.id as windmill_id,
                aou.year,
                CAST(aou.month AS SIGNED) as month,
                d.slots as slot,
                COALESCE(d.from_banking, 0.0) as from_banking,
                COALESCE(d.balance_banking, 0.0) as balance_banking
            FROM windmill.allotment_order_upload aou
            JOIN masters.master_windmill mw ON aou.windmill_id = mw.id
            JOIN windmill.allotment_order_details d ON aou.id = d.allotment_order_id
            WHERE (
                (%(mode)s = 'financial' AND ((aou.year = %(year)s AND CAST(aou.month AS SIGNED) >= 4) OR (aou.year = %(year)s + 1 AND CAST(aou.month AS SIGNED) <= 3)))
                OR
                (%(mode)s = 'calendar' AND aou.year = %(year)s)
            ) AND LOWER(mw.type) = 'windmill'
        """
        cursor.execute(ao_query, {"year": year, "mode": mode})
        ao_rows = cursor.fetchall()
        
        ao_map = {}
        for r in ao_rows:
            slot_str = str(r['slot']).strip().lower()
            if not slot_str.startswith('c'):
                slot_str = f"c{slot_str}"
            key = (r['windmill_id'], r['year'], r['month'], slot_str)
            ao_map[key] = {
                'from_banking': float(r['from_banking']),
                'balance_banking': float(r['balance_banking'])
            }
            
        # 4. Fetch Actual Allotments
        aa_query = """
            SELECT 
                mw.id as windmill_id,
                aa.year,
                aa.month,
                CAST(COALESCE(NULLIF(TRIM(aa.c1), ''), '0') AS DECIMAL(15,2)) as c1,
                CAST(COALESCE(NULLIF(TRIM(aa.c2), ''), '0') AS DECIMAL(15,2)) as c2,
                CAST(COALESCE(NULLIF(TRIM(aa.c4), ''), '0') AS DECIMAL(15,2)) as c4,
                CAST(COALESCE(NULLIF(TRIM(aa.c5), ''), '0') AS DECIMAL(15,2)) as c5
            FROM windmill.actual_allotment aa
            JOIN masters.master_windmill mw ON aa.windmill_id = mw.id
            WHERE (
                (%(mode)s = 'financial' AND ((aa.year = %(year)s AND aa.month >= 4) OR (aa.year = %(year)s + 1 AND aa.month <= 3)))
                OR
                (%(mode)s = 'calendar' AND aa.year = %(year)s)
            ) AND LOWER(mw.type) = 'windmill'
        """
        cursor.execute(aa_query, {"year": year, "mode": mode})
        aa_rows = cursor.fetchall()
        
        aa_map = {}
        for r in aa_rows:
            for slot in ['c1', 'c2', 'c4', 'c5']:
                key = (r['windmill_id'], r['year'], r['month'], slot)
                aa_map[key] = float(r[slot] or 0.0)
                
        # Build monthly list
        if mode == 'financial':
            months_list = [
                (4, year), (5, year), (6, year), (7, year), (8, year), (9, year),
                (10, year), (11, year), (12, year), (1, year+1), (2, year+1), (3, year+1)
            ]
        else:
            months_list = [(m, year) for m in range(1, 13)]
            
        running_balances = {}
        monthly_data = []
        
        for month_num, month_year in months_list:
            month_name = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][month_num]
            
            m_opening = 0.0
            m_utilized = 0.0
            m_added = 0.0
            m_ending = 0.0
            
            windmill_records = []
            
            for wm in windmills:
                wm_id = wm['id']
                wm_num = wm['windmill_number']
                
                w_opening = 0.0
                w_utilized = 0.0
                w_added = 0.0
                w_ending = 0.0
                
                slot_records = []
                
                for slot in ['c1', 'c2', 'c4', 'c5']:
                    bal_key = (wm_id, slot)
                    opening = running_balances.get(bal_key, 0.0)
                    
                    eb_curr = eb_map.get((wm_id, month_year, month_num, slot), {})
                    if (wm_id, month_year, month_num, slot) in eb_map:
                        opening = eb_curr.get('banking_units', 0.0)
                        
                    next_m = month_num + 1
                    next_y = month_year
                    if next_m > 12:
                        next_m = 1
                        next_y = month_year + 1
                        
                    eb_next = eb_map.get((wm_id, next_y, next_m, slot), {})
                    ao_curr = ao_map.get((wm_id, month_year, month_num, slot), {})
                    
                    if (wm_id, next_y, next_m, slot) in eb_map:
                        ending = eb_next.get('banking_units', 0.0)
                    elif (wm_id, month_year, month_num, slot) in ao_map:
                        ending = ao_curr.get('balance_banking', 0.0)
                    else:
                        ending = None
                        
                    if (wm_id, month_year, month_num, slot) in ao_map:
                        utilized = ao_curr.get('from_banking', 0.0)
                    elif (wm_id, month_year, month_num, slot) in aa_map:
                        utilized = aa_map.get((wm_id, month_year, month_num, slot), 0.0)
                    else:
                        if ending is not None:
                            utilized = max(0.0, opening - ending)
                        else:
                            utilized = 0.0
                            
                    if ending is None:
                        ending = max(0.0, opening - utilized)
                        
                    if ending > (opening - utilized):
                        added = ending - (opening - utilized)
                    else:
                        added = 0.0
                        
                    running_balances[bal_key] = ending
                    
                    slot_records.append({
                        "slot": slot.upper(),
                        "opening": opening,
                        "utilized": utilized,
                        "added": added,
                        "ending": ending
                    })
                    
                    w_opening += opening
                    w_utilized += utilized
                    w_added += added
                    w_ending += ending
                    
                windmill_records.append({
                    "windmillNumber": wm_num,
                    "opening": w_opening,
                    "utilized": w_utilized,
                    "added": w_added,
                    "ending": w_ending,
                    "slots": slot_records
                })
                
                m_opening += w_opening
                m_utilized += w_utilized
                m_added += w_added
                m_ending += w_ending
                
            monthly_data.append({
                "monthName": month_name,
                "displayMonth": f"{month_name} {month_year}",
                "year": month_year,
                "month": month_num,
                "opening": m_opening,
                "utilized": m_utilized,
                "added": m_added,
                "ending": m_ending,
                "windmills": windmill_records
            })
            
        return {"status": "success", "data": monthly_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

