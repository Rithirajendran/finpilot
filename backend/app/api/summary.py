from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.transaction import Transaction


router = APIRouter(
    prefix="/api/summary",
    tags=["Summary"]
)


@router.get("/")
def get_financial_summary(
    db: Session = Depends(get_db)
):
    transactions = (
        db.query(Transaction)
        .all()
    )

    total_income = 0
    total_expenses = 0

    for transaction in transactions:

        amount = float(transaction.amount or 0)

        if transaction.transaction_type == "income":
            total_income += amount

        else:
            total_expenses += amount

    balance = total_income - total_expenses

    return {
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "balance": round(balance, 2),
        "transaction_count": len(transactions)
    }