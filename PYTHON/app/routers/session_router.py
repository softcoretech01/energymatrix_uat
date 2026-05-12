from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from sqlalchemy import text
from app.database import get_db
from app.schemas.user_session_schema import UserSessionResponse
from app.utils.auth_utils import get_current_user

router = APIRouter(prefix="/sessions", tags=["User Sessions"])


@router.get("/", response_model=List[UserSessionResponse])
def get_sessions(
    user_name: Optional[str] = Query(None, description="Filter by username"),
    status: Optional[str] = Query(None, description="ACTIVE | LOGGED_OUT | EXPIRED"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """
    Fetch login/logout session history.
    Admins can filter by user name or status.
    """
    try:
        query = "SELECT * FROM masters.user_sessions WHERE 1=1"
        params: dict = {"limit": limit, "offset": offset}

        if user_name:
            query += " AND user_name LIKE :user_name"
            params["user_name"] = f"%{user_name}%"
        if status:
            query += " AND status = :status"
            params["status"] = status

        query += " ORDER BY login_time DESC LIMIT :limit OFFSET :offset"

        result = db.execute(text(query), params)
        rows = [dict(row._mapping) for row in result]
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary")
def get_session_summary(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """
    Returns a quick summary:
    - Total logins today
    - Currently active sessions
    - Total sessions all time
    """
    try:
        result = db.execute(text("""
            SELECT
                COUNT(*)                                                          AS total_all_time,
                SUM(status = 'ACTIVE')                                            AS currently_active,
                SUM(DATE(login_time) = CURDATE())                                 AS logins_today,
                SUM(DATE(login_time) = CURDATE() AND status = 'LOGGED_OUT')       AS logouts_today
            FROM masters.user_sessions
        """))
        row = result.fetchone()
        return dict(row._mapping) if row else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
