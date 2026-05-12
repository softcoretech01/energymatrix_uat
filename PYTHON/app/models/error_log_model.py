from sqlalchemy import Column, Integer, String, DateTime, Text, func
from app.database import BaseMasters as Base

class ErrorLog(Base):
    __tablename__ = "error_logs"
    __table_args__ = {"schema": "masters"}

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, nullable=True)
    page_name     = Column(String(255), nullable=True)
    module_name   = Column(String(100), nullable=True)  # e.g., "Frontend", "Backend", "Customer"
    error_message = Column(Text, nullable=False)
    error_stack   = Column(Text, nullable=True)
    endpoint      = Column(String(255), nullable=True)
    method        = Column(String(10), nullable=True)   # GET, POST, etc.
    browser_info  = Column(Text, nullable=True)
    ip_address    = Column(String(45), nullable=True)
    created_at    = Column(DateTime, server_default=func.now())
