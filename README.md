# 🇰🇭 Cambodia Tax Calculator System

A professional, full-stack tax calculator for Cambodia — supporting all 6 major tax types with bilingual (Khmer/English), dark/light mode, AI chatbot, charts, and PDF export.

---

## 📦 Project Structure

```
cambodia-tax/
├── frontend/          # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── context/
│   │   │   └── AppContext.jsx
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   └── UI.jsx
│   │   └── pages/
│   │       ├── Dashboard.jsx
│   │       ├── TaxOnSalary.jsx
│   │       ├── PrepaymentProfitTax.jsx
│   │       ├── PublicLightingTax.jsx
│   │       ├── OtherTaxes.jsx       (STP, AT, WHT)
│   │       └── ComplianceAndOthers.jsx (Compliance, History, AI)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── backend/           # FastAPI + PostgreSQL
    ├── main.py
    ├── database.py
    ├── requirements.txt
    ├── .env.example
    ├── models/
    │   └── __init__.py
    ├── schemas/
    │   └── __init__.py
    └── routers/
        ├── auth.py
        ├── tax.py
        └── history.py
```

---

## 🚀 Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:3000
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # Edit with your DB credentials
uvicorn main:app --reload --port 8000
# API docs at http://localhost:8000/docs
```

### PostgreSQL Setup

```sql
CREATE DATABASE cambodia_tax;
```
Then set `DATABASE_URL` in `.env`.

---

## 🧮 Tax Calculators

| Calculator | Type | Rate |
|---|---|---|
| **TOS** | Tax on Salary | 0–20% progressive (resident) / 20% flat (non-resident) |
| **PPT** | Prepayment Profit Tax | 1% of monthly revenue |
| **PLT** | Public Lighting Tax | 5% on alcohol & tobacco |
| **STP** | Specific Tax | 10–35% by category |
| **AT** | Accommodation Tax | 2% on room rates |
| **WHT** | Withholding Tax | 0–15% by payment type |

---

## ✨ Features

- 🇰🇭 **Bilingual** — Khmer & English
- 🌙 **Dark / Light mode**
- 💱 **KHR / USD currency toggle** (rate: 4,100 KHR/USD)
- 📊 **Interactive charts** (Recharts)
- 🤖 **AI Tax Assistant chatbot** (Claude Sonnet via Anthropic API)
- 📋 **Calculation history**
- 📱 **Mobile-first responsive design**
- 🔐 **JWT authentication**
- 📅 **GDT Circular 024 (2026) compliant**

---

## 🔑 AI Assistant Setup

The AI chatbot uses the Anthropic API. To enable it:

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. In `frontend/src/pages/ComplianceAndOthers.jsx`, the `AIAssistant` component already makes requests — the API key is handled by the platform when deployed on Claude.ai Artifacts, or you can add a backend proxy.

For standalone use, add a backend proxy endpoint in FastAPI:

```python
# backend/routers/ai.py
@router.post("/chat")
async def chat(messages: list, anthropic_client = Depends(get_anthropic)):
    ...
```

---

## 📋 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login (JWT) |
| POST | `/api/tax/tos` | Calculate TOS |
| POST | `/api/tax/ppt` | Calculate PPT |
| POST | `/api/tax/plt` | Calculate PLT |
| POST | `/api/tax/stp` | Calculate STP |
| POST | `/api/tax/at` | Calculate AT |
| POST | `/api/tax/wht` | Calculate WHT |
| GET  | `/api/tax/rates` | All current rates |
| POST | `/api/history/save` | Save calculation |
| GET  | `/api/history/` | Get history |

---

## 📅 Filing Deadlines (GDT 2026)

| Tax | Deadline |
|---|---|
| Monthly taxes (TOS, VAT, PPT, WHT) | 20th of following month |
| E-Filing via GDT eTax portal | 25th of following month |
| Annual CIT/PIT | 3 months after fiscal year end |

---

## 🏛️ Compliance

- **GDT Circular 024 (2026)**: WHT exemptions for payments < 50,000 KHR and service fees with VAT invoice
- **Resident**: Present in Cambodia > 182 days/year
- **Non-Resident**: < 182 days/year, 20% flat rate on salary, 14% WHT
- **QIP companies**: May be exempt from PPT

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS 3 |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | FastAPI, Python 3.11+ |
| Database | PostgreSQL (asyncpg) |
| ORM | SQLAlchemy 2.0 (async) |
| Auth | JWT (python-jose) |
| AI | Anthropic Claude Sonnet |

---

*Built for Cambodian businesses, accountants, students, and GDT tax officers.*
