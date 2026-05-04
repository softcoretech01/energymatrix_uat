from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ===============================
# CREATE CUSTOMER MODEL
# ===============================
class CustomerCreate(BaseModel):
    customer_name: str
    city: Optional[str] = None
    phone_no: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None
    status: Optional[int] = 1
    is_submitted: Optional[int] = 0


# ===============================
# UPDATE CUSTOMER MODEL
# ===============================
class CustomerUpdate(BaseModel):
    customer_name: Optional[str] = None
    city: Optional[str] = None
    phone_no: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None
    status: Optional[int] = None
    is_submitted: Optional[int] = None


# ===============================
# RESPONSE MODEL
# ===============================
class CustomerResponse(BaseModel):
    id: int
    customer_name: str
    city: Optional[str] = None
    phone_no: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None
    status: int
    created_by: Optional[int]
    created_at: Optional[datetime]
    modified_by: Optional[int]
    modified_at: Optional[datetime]
    is_submitted: Optional[int]

# ===============================
# AGREED UNITS
# ===============================
class AgreedUnitsRow(BaseModel):
    month: str
    c1: Optional[str | int | float] = ""
    c2: Optional[str | int | float] = ""
    c4: Optional[str | int | float] = ""
    c5: Optional[str | int | float] = ""

class AgreedUnitsRequest(BaseModel):
    total_agreed_units: Optional[str | int | float] = ""
    rate_per_unit: Optional[str | int | float] = ""
    unit_allocation: List[AgreedUnitsRow]