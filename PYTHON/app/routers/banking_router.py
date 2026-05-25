from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from app.database import get_connection
from app.utils.auth_utils import get_current_user
import pymysql

router = APIRouter()

@router.get("/banking/utilized")
async def get_banking_utilized(year: int, current_user: dict = Depends(get_current_user)):
    """
    Fetches the total actual allotments (utilized units) and slot-wise units (c1, c2, c4, c5)
    from actual_allotment, alongside powerplant slot-wise net units (pp_c1, pp_c2, pp_c4, pp_c5)
    from eb_statements and eb_statements_details, for the specified financial year.
    """
    conn = get_connection(db_name="windmill")
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.callproc("sp_get_banking_utilized", (year,))
        rows = cursor.fetchall()
        
        # Convert Decimal values to float for JSON serialization
        for r in rows:
            for field in ['total_utilized', 'c1', 'c2', 'c4', 'c5', 'pp_c1', 'pp_c2', 'pp_c4', 'pp_c5']:
                if field in r and r[field] is not None:
                    r[field] = float(r[field])
                else:
                    r[field] = 0.0
                
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()
