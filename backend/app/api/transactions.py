from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.transaction import Transaction

router = APIRouter(
    prefix="/api/transactions",
    tags=["Transactions"]
)


@router.get("/")
def get_transactions(db: Session = Depends(get_db)):
    transactions = db.query(Transaction).all()

    return transactions