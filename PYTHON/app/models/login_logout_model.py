from sqlalchemy import Column, Integer, String, DateTime, Text, func
from app.database import BaseMasters as Base

class LoginLog(Base):
    __tablename__ = "login_logs"
    __table_args__ = {"schema": "masters"}

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, nullable=False)
    user_name    = Column(String(100), nullable=False)
    login_time   = Column(DateTime, server_default=func.now())
    ip_address   = Column(String(45), nullable=True)
    browser_info = Column(Text, nullable=True)
    login_status = Column(String(20), nullable=False, default="SUCCESS")  # SUCCESS | FAILED
    fail_reason  = Column(String(255), nullable=True)  # e.g. "Invalid password"


class LogoutLog(Base):
    __tablename__ = "logout_logs"
    __table_args__ = {"schema": "masters"}

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, nullable=False)
    user_name   = Column(String(100), nullable=False)
    logout_time = Column(DateTime, server_default=func.now())
    ip_address  = Column(String(45), nullable=True)
    logout_type = Column(String(30), nullable=False, default="MANUAL")  # MANUAL | SESSION_TIMEOUT | TOKEN_EXPIRED
