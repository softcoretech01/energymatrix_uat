from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ErrorLogCreate(BaseModel):
    user_id: Optional[int] = None
    page_name: Optional[str] = None
    module_name: Optional[str] = None
    error_message: str
    error_stack: Optional[str] = None
    endpoint: Optional[str] = None
    method: Optional[str] = None
    browser_info: Optional[str] = None
    ip_address: Optional[str] = None

class ErrorLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    page_name: Optional[str]
    module_name: Optional[str]
    error_message: str
    error_stack: Optional[str]
    endpoint: Optional[str]
    method: Optional[str]
    browser_info: Optional[str]
    ip_address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
