from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

from app.api.transactions import router as transaction_router
from app.api.upload import router as upload_router
from app.api.subscriptions import router as subscriptions_router
from app.api.summary import router as summary_router
from app.api.category_summary import router as category_summary_router
from app.api.reprocess import router as reprocess_router
from app.api.unusual_spending import router as unusual_spending_router
from app.api.monthly_summary import router as monthly_summary_router
from app.api.budgets import router as budgets_router
from app.api.goals import router as goals_router
from app.api.upcoming_obligations import router as upcoming_obligations_router

from app.api.financial_insights import (
    router as financial_insights_router
)

from app.api.delete_upload import (
    router as delete_upload_router
)

from app.api.cleanup import (
    router as cleanup_router
)

from app.api.expense_comparison import (
    router as expense_comparison_router
)

from app.api.goal_impact import (
    router as goal_impact_router
)

from app.api.monthly_financial_summary import (
    router as monthly_financial_summary_router
)

from app.api.cash_flow import (
    router as cash_flow_router
)

from app.api.ai import (
    router as ai_router
)

from app.api.auth import (
    router as auth_router
)
# ============================================================
# IMPORT MODELS
# ============================================================
# Import all models so SQLAlchemy knows about all tables.

from app.models import (
    Transaction,
    Budget,
    Goal,
    RecurringPayment
)


# ============================================================
# DATABASE
# ============================================================

Base.metadata.create_all(
    bind=engine
)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="FinPilot API",
    description="Personal Finance Decision Support Agent",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTERS
# ============================================================

app.include_router(
    transaction_router
)

app.include_router(
    upload_router
)

app.include_router(
    subscriptions_router
)

app.include_router(
    summary_router
)

app.include_router(
    category_summary_router
)

app.include_router(
    reprocess_router
)

app.include_router(
    unusual_spending_router
)

app.include_router(
    monthly_summary_router
)

app.include_router(
    budgets_router
)

app.include_router(
    goals_router
)

app.include_router(
    upcoming_obligations_router
)

app.include_router(
    financial_insights_router
)

app.include_router(
    delete_upload_router
)

app.include_router(
    cleanup_router
)

app.include_router(
    expense_comparison_router
)

app.include_router(
    goal_impact_router
)

app.include_router(
    monthly_financial_summary_router
)

app.include_router(
    cash_flow_router
)


# ============================================================
# NEW AI DECISION-SUPPORT ASSISTANT
# ============================================================
#
# POST /api/ai/ask
#
# app/api/ai.py
#       ↓
# app/services/ai_assistant.py
#
# This is the ONLY AI assistant router registered
# for /api/ai/ask.
#
app.include_router(
    auth_router
)
app.include_router(
    ai_router
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "service": "FinPilot Backend",
        "status": "running",
        "version": "1.0.0"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "FinPilot Backend",
        "database": "connected"
    }