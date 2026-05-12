from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List
from app.database import get_db
from app.utils.auth_utils import get_current_user

router = APIRouter(prefix="/login-logs", tags=["Login Logs"])


@router.get("/")
def get_login_logs(
    user_name: Optional[str] = Query(None),
    status: Optional[str] = Query(None, description="SUCCESS | FAILED"),
    limit: int = Query(200, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Fetch login event logs."""
    try:
        query = "SELECT * FROM masters.login_logs WHERE 1=1"
        params: dict = {"limit": limit, "offset": offset}

        if user_name:
            query += " AND user_name LIKE :user_name"
            params["user_name"] = f"%{user_name}%"
        if status:
            query += " AND login_status = :status"
            params["status"] = status

        query += " ORDER BY login_time DESC LIMIT :limit OFFSET :offset"
        result = db.execute(text(query), params)
        return [dict(row._mapping) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary")
def get_login_summary(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Returns today's login stats."""
    try:
        result = db.execute(text("""
            SELECT
                COUNT(*)                                              AS total_all_time,
                SUM(DATE(login_time) = CURDATE())                     AS logins_today,
                SUM(DATE(login_time) = CURDATE() AND login_status = 'SUCCESS') AS success_today,
                SUM(DATE(login_time) = CURDATE() AND login_status = 'FAILED')  AS failed_today
            FROM masters.login_logs
        """))
        row = result.fetchone()
        return dict(row._mapping) if row else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/logout-logs")
def get_logout_logs(
    user_name: Optional[str] = Query(None),
    limit: int = Query(200, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Fetch logout event logs."""
    try:
        query = "SELECT * FROM masters.logout_logs WHERE 1=1"
        params: dict = {"limit": limit, "offset": offset}

        if user_name:
            query += " AND user_name LIKE :user_name"
            params["user_name"] = f"%{user_name}%"

        query += " ORDER BY logout_time DESC LIMIT :limit OFFSET :offset"
        result = db.execute(text(query), params)
        return [dict(row._mapping) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/error-summary")
def get_error_summary(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Returns error log stats."""
    try:
        result = db.execute(text("""
            SELECT
                COUNT(*)                                              AS total_all_time,
                SUM(DATE(created_at) = CURDATE())                     AS errors_today,
                COUNT(DISTINCT module_name)                           AS modules_affected
            FROM masters.error_logs
        """))
        row = result.fetchone()
        return dict(row._mapping) if row else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
