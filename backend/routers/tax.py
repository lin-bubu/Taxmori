from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from schemas import TOSInput, PPTInput, PLTInput, STPInput, ATInput, WHTInput

router = APIRouter()

# Tax bracket constants
PROGRESSIVE_BRACKETS = [
    (0, 1_500_000, 0.00),
    (1_500_001, 2_000_000, 0.05),
    (2_000_001, 8_500_000, 0.10),
    (8_500_001, 12_500_000, 0.15),
    (12_500_001, float('inf'), 0.20),
]

STP_RATES = {
    "spirits": 0.35,
    "beer": 0.30,
    "tobacco": 0.20,
    "softdrinks": 0.10,
    "entertainment": 0.10,
}

WHT_RESIDENT = {
    "dividends": 0.00,
    "interest": 0.15,
    "royalties": 0.15,
    "rent": 0.10,
    "services": 0.15,
}

def calc_progressive_tax(taxable_income: float):
    tax = 0.0
    breakdown = []
    remaining = taxable_income
    for min_v, max_v, rate in PROGRESSIVE_BRACKETS:
        if remaining <= 0:
            break
        bracket_size = (max_v - min_v + 1) if max_v != float('inf') else remaining
        taxable_in_bracket = min(remaining, bracket_size)
        bracket_tax = taxable_in_bracket * rate
        if taxable_in_bracket > 0:
            breakdown.append({"bracket": f"{min_v:,}–{max_v if max_v != float('inf') else '∞'}", "rate": rate, "amount": taxable_in_bracket, "tax": bracket_tax})
        tax += bracket_tax
        remaining -= taxable_in_bracket
    return tax, breakdown

@router.post("/tos")
async def calculate_tos(data: TOSInput):
    gross = data.base_salary + data.bonus + data.overtime + data.other_benefits
    spouse_rebate = 150_000 if data.has_spouse else 0
    child_rebate = data.num_children * 150_000
    total_deductions = spouse_rebate + child_rebate
    taxable_income = max(0, gross - total_deductions)

    if data.is_resident:
        tax, breakdown = calc_progressive_tax(taxable_income)
    else:
        tax = taxable_income * 0.20
        breakdown = [{"bracket": "Flat", "rate": 0.20, "amount": taxable_income, "tax": tax}]

    net = gross - tax
    effective_rate = (tax / gross * 100) if gross > 0 else 0

    return {
        "tax_type": "TOS",
        "gross_salary": gross,
        "spouse_rebate": spouse_rebate,
        "child_rebate": child_rebate,
        "total_deductions": total_deductions,
        "taxable_income": taxable_income,
        "tax_payable": tax,
        "net_salary": net,
        "effective_rate": round(effective_rate, 2),
        "bracket_breakdown": breakdown,
        "is_resident": data.is_resident,
    }

@router.post("/ppt")
async def calculate_ppt(data: PPTInput):
    gross = data.monthly_revenue
    tax_base = gross / 1.1 if data.includes_vat else gross
    ppt = tax_base * 0.01
    annual_estimate = ppt * 12
    return {
        "tax_type": "PPT",
        "gross_revenue": gross,
        "revenue_excl_vat": tax_base,
        "ppt_rate": 0.01,
        "ppt_payable": ppt,
        "annual_estimate": annual_estimate,
    }

@router.post("/plt")
async def calculate_plt(data: PLTInput):
    price = data.price_incl_vat
    excl_vat = price / 1.1
    excl_stp = excl_vat / 1.05
    plt_base = excl_stp * 0.20
    plt = plt_base * 0.05
    return {
        "tax_type": "PLT",
        "price_incl_vat": price,
        "price_excl_vat": excl_vat,
        "price_excl_stp": excl_stp,
        "plt_base": plt_base,
        "plt_payable": plt,
        "plt_rate": 0.05,
    }

@router.post("/stp")
async def calculate_stp(data: STPInput):
    rate = STP_RATES.get(data.category, 0.10)
    excl_vat = data.price_incl_vat / 1.1
    excl_stp = excl_vat / (1 + rate)
    base_90 = excl_stp * 0.90
    stp = base_90 * rate
    return {
        "tax_type": "STP",
        "category": data.category,
        "rate": rate,
        "price_incl_vat": data.price_incl_vat,
        "excl_vat": excl_vat,
        "excl_stp": excl_stp,
        "tax_base_90pct": base_90,
        "stp_payable": stp,
    }

@router.post("/at")
async def calculate_at(data: ATInput):
    excl_vat = data.room_rate_incl_vat / 1.1
    tax_base = excl_vat / 1.02
    at = tax_base * 0.02
    return {
        "tax_type": "AT",
        "room_rate_incl_vat": data.room_rate_incl_vat,
        "excl_vat": excl_vat,
        "tax_base": tax_base,
        "at_rate": 0.02,
        "at_payable": at,
    }

@router.post("/wht")
async def calculate_wht(data: WHTInput):
    # Circular 024: exempt if < 50,000 KHR
    if data.gross_payment < 50_000:
        return {
            "tax_type": "WHT",
            "exempt": True,
            "reason": "Payment under 50,000 KHR – exempt per Circular 024 (2026)",
            "gross_payment": data.gross_payment,
            "tax_withheld": 0,
            "net_payment": data.gross_payment,
        }

    if data.is_resident:
        rate = WHT_RESIDENT.get(data.payment_type, 0.15)
        # Services with VAT invoice: check via payment_type flag (simplified)
    else:
        rate = 0.10 if data.use_dta else 0.14

    withheld = data.gross_payment * rate
    net = data.gross_payment - withheld

    return {
        "tax_type": "WHT",
        "exempt": False,
        "is_resident": data.is_resident,
        "payment_type": data.payment_type,
        "use_dta": data.use_dta,
        "gross_payment": data.gross_payment,
        "wht_rate": rate,
        "tax_withheld": withheld,
        "net_payment": net,
    }

@router.get("/rates")
async def get_all_rates():
    """Return all current tax rates for reference."""
    return {
        "tos": {
            "resident_brackets": [{"range": f"{b[0]:,}–{b[1]:,}", "rate": f"{b[2]*100:.0f}%"} for b in PROGRESSIVE_BRACKETS],
            "non_resident": "20% flat",
            "spouse_rebate": 150_000,
            "child_rebate": 150_000,
        },
        "ppt": {"rate": "1% of monthly turnover (excl. VAT)"},
        "plt": {"rate": "5% of tax base (20% of price ex-VAT ex-STP)"},
        "stp": STP_RATES,
        "at": {"rate": "2%"},
        "wht": {"resident": WHT_RESIDENT, "non_resident": {"standard": 0.14, "dta": 0.10}},
        "circular_024_2026": {
            "small_transaction_exemption": "< 50,000 KHR",
            "service_with_vat_invoice": "exempt",
            "dividends_resident": "0%",
        },
    }
