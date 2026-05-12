from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, func
from app.database import BaseMasters as Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = {"schema": "masters"}

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, nullable=False)
    action_type  = Column(String(50),  nullable=False)  # CREATE, UPDATE, DELETE, SAVE, UPLOAD, etc.
    module_name  = Column(String(100), nullable=False)  # Windmill, Customer, EB_Solar, etc.
    page_name    = Column(String(100), nullable=True)   # UI page where the change was made
    entity_id    = Column(Integer,     nullable=True)
    details      = Column(JSON,        nullable=True)   # Snapshot of relevant fields at time of action
    changed_from = Column(JSON,        nullable=True)   # Field values BEFORE the change
    changed_to   = Column(JSON,        nullable=True)   # Field values AFTER the change
    ip_address   = Column(String(45),  nullable=True)
    created_at   = Column(DateTime,    server_default=func.now())
