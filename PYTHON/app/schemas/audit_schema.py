from pydantic import BaseModel
from typing import Optional, Any, List
from datetime import datetime


class AuditLogCreate(BaseModel):
    user_id      : int
    action_type  : str
    module_name  : str
    entity_id    : Optional[int] = None
    details      : Optional[Any] = None
    ip_address   : Optional[str] = None
    page_name    : Optional[str] = None   # UI page where the change was made
    changed_from : Optional[Any] = None   # Field values BEFORE the change
    changed_to   : Optional[Any] = None   # Field values AFTER the change


class AuditLogResponse(BaseModel):
    id           : int
    user_id      : int
    user_name    : Optional[str] = None
    action_type  : str
    module_name  : str
    page_name    : Optional[str] = None
    entity_id    : Optional[int] = None
    details      : Optional[Any] = None
    changed_from : Optional[Any] = None
    changed_to   : Optional[Any] = None
    ip_address   : Optional[str] = None
    created_at   : datetime

    class Config:
        from_attributes = True


class AuditLogListResponse(BaseModel):
    total : int
    items : List[AuditLogResponse]
