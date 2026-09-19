from fastapi import FastAPI

from app.api.transactions import router as transaction_router
from app.database import Base, engine

# Import all models so SQLAlchemy knows about all tables
from app.models import (
    Transaction,
    Budget,
    Goal,
    RecurringPayment
)

# Automatically create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinPilot API",
    description="Personal Finance Decision Support Agent",
    version="1.0.0"
)

# Transaction API
app.include_router(transaction_router)


@app.get("/")
def root():
    return {
        "service": "FinPilot Backend",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "FinPilot Backend",
        "database": "connected"
    }