from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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