from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime

# Auth
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    created_at: datetime
    class Config: from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Tax inputs
class TOSInput(BaseModel):
    is_resident: bool = True
    base_salary: float = 0
    bonus: float = 0
    overtime: float = 0
    other_benefits: float = 0
    has_spouse: bool = False
    num_children: int = 0

class PPTInput(BaseModel):
    monthly_revenue: float
    includes_vat: bool = True

class PLTInput(BaseModel):
    price_incl_vat: float

class STPInput(BaseModel):
    price_incl_vat: float
    category: str  # spirits, beer, tobacco, softdrinks, entertainment

class ATInput(BaseModel):
    room_rate_incl_vat: float

class WHTInput(BaseModel):
    gross_payment: float
    is_resident: bool = True
    payment_type: Optional[str] = "interest"  # dividends, interest, royalties, rent, services
    use_dta: bool = False

# Results
class TaxResult(BaseModel):
    tax_type: str
    inputs: Dict[str, Any]
    results: Dict[str, Any]
    currency: str = "KHR"

class CalculationResponse(BaseModel):
    id: int
    tax_type: str
    inputs: Dict[str, Any]
    results: Dict[str, Any]
    currency: str
    created_at: datetime
    class Config: from_attributes = True
