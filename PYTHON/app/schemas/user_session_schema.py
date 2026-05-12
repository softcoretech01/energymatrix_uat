from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserSessionResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    login_time: datetime
    logout_time: Optional[datetime]
    ip_address: Optional[str]
    browser_info: Optional[str]
    status: str

    class Config:
        from_attributes = True
