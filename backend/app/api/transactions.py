from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.transaction import Transaction

router = APIRouter(
    prefix="/api/transactions",
    tags=["Transactions"]
)


@router.get("/")
def get_transactions(
    db: Session = Depends(get_db)
):
    transactions = (
        db.query(Transaction)
        .order_by(Transaction.date.desc())
        .all()
    )

    return {
        "count": len(transactions),
        "transactions": [
            {
                "id": transaction.id,
                "date": str(transaction.date),
                "description": transaction.description,
                "amount": float(transaction.amount or 0),
                "transaction_type": transaction.transaction_type,
                "category": transaction.category,
                "source": transaction.source,
            }
            for transaction in transactions
        ],
    }