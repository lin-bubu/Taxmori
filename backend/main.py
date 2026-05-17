from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from contextlib import asynccontextmanager
import uvicorn

from routers import tax, auth, history
from database import create_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    yield

app = FastAPI(
    title="Cambodia Tax Calculator API",
    description="Backend API for Cambodia Tax Calculator System - GDT Compliant 2026",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(tax.router, prefix="/api/tax", tags=["Tax Calculations"])
app.include_router(history.router, prefix="/api/history", tags=["Calculation History"])

@app.get("/")
async def root():
    return {
        "message": "Cambodia Tax Calculator API",
        "version": "1.0.0",
        "gdt_compliant": "2026",
        "docs": "/docs",
    }

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "Cambodia Tax API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
