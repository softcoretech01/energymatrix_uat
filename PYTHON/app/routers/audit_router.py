from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List
import json
from app.database import get_db
from app.schemas.audit_schema import AuditLogResponse, AuditLogCreate
from app.utils.auth_utils import get_current_user

router = APIRouter(prefix="/audit", tags=["Audit Logs"])

@router.get("/", response_model=List[AuditLogResponse])
def get_audit_logs(
    module_name: Optional[str] = Query(None),
    entity_id: Optional[int] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Fetch audit logs using stored procedure."""
    try:
        result = db.execute(
            text("CALL masters.sp_get_audit_logs(:module, :entity_id, :limit, :offset)"),
            {
                "module": module_name,
                "entity_id": entity_id,
                "limit": limit,
                "offset": offset
            }
        )

        logs = []
        for row in result:
            row_dict = dict(row._mapping)
            # Parse JSON fields if they come back as strings
            for json_field in ("details", "changed_from", "changed_to"):
                if isinstance(row_dict.get(json_field), str):
                    try:
                        row_dict[json_field] = json.loads(row_dict[json_field])
                    except Exception:
                        pass
            logs.append(row_dict)

        return logs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/log")
def create_log(
    log_data: AuditLogCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """Manually create an audit log entry."""
    try:
        db.execute(
            text(
                "CALL masters.sp_insert_audit_log("
                ":user_id, :action, :module, :entity_id, :details, :ip,"
                ":page_name, :changed_from, :changed_to)"
            ),
            {
                "user_id":      log_data.user_id,
                "action":       log_data.action_type,
                "module":       log_data.module_name,
                "entity_id":    log_data.entity_id,
                "details":      json.dumps(log_data.details)      if log_data.details      else None,
                "ip":           log_data.ip_address,
                "page_name":    log_data.page_name,
                "changed_from": json.dumps(log_data.changed_from) if log_data.changed_from else None,
                "changed_to":   json.dumps(log_data.changed_to)   if log_data.changed_to   else None,
            }
        )
        db.commit()
        return {"status": "success", "message": "Log created successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
