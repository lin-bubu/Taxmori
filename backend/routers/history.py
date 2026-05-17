from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import TaxCalculation
from schemas import TaxResult, CalculationResponse
from typing import List

router = APIRouter()

@router.post("/save", response_model=CalculationResponse)
async def save_calculation(data: TaxResult, db: AsyncSession = Depends(get_db)):
    calc = TaxCalculation(
        tax_type=data.tax_type,
        inputs=data.inputs,
        results=data.results,
        currency=data.currency,
    )
    db.add(calc)
    await db.commit()
    await db.refresh(calc)
    return calc

@router.get("/", response_model=List[CalculationResponse])
async def get_history(limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(TaxCalculation).order_by(TaxCalculation.created_at.desc()).limit(limit)
    )
    return result.scalars().all()
