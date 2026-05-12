from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.schemas.error_log_schema import ErrorLogCreate, ErrorLogResponse
from app.utils.auth_utils import get_current_user
from app.utils.logger import log_error
from sqlalchemy import text

router = APIRouter(prefix="/error-logs", tags=["Error Logs"])

@router.get("/", response_model=List[ErrorLogResponse])
def get_error_logs(
    module_name: Optional[str] = Query(None),
    page_name: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Fetch error logs from the database."""
    try:
        query = "SELECT * FROM masters.error_logs WHERE 1=1"
        params = {"limit": limit, "offset": offset}
        
        if module_name:
            query += " AND module_name = :module"
            params["module"] = module_name
        if page_name:
            query += " AND page_name = :page"
            params["page"] = page_name
            
        query += " ORDER BY created_at DESC LIMIT :limit OFFSET :offset"
        
        result = db.execute(text(query), params)
        logs = [dict(row._mapping) for row in result]
        return logs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/log")
def create_error_log(
    log_data: ErrorLogCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Create a new error log entry (usually from frontend)."""
    try:
        ip_address = request.client.host
        log_error(
            user_id=log_data.user_id,
            page_name=log_data.page_name,
            module_name=log_data.module_name or "Frontend",
            error_message=log_data.error_message,
            error_stack=log_data.error_stack,
            endpoint=log_data.endpoint,
            method=log_data.method,
            browser_info=log_data.browser_info,
            ip_address=ip_address
        )
        return {"status": "success", "message": "Error log created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
