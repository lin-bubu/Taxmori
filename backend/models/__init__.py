from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    calculations = relationship("TaxCalculation", back_populates="user")

class TaxCalculation(Base):
    __tablename__ = "tax_calculations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    tax_type = Column(String, nullable=False)  # TOS, PPT, PLT, STP, AT, WHT
    inputs = Column(JSON)
    results = Column(JSON)
    currency = Column(String, default="KHR")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="calculations")
