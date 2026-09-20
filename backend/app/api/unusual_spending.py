from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.transaction import Transaction
from app.services.unusual_spending import (
    detect_unusual_spending
)


router = APIRouter(
    prefix="/api/unusual-spending",
    tags=["Unusual Spending"]
)


@router.get("/")
def get_unusual_spending(
    db: Session = Depends(get_db)
):
    transactions = (
        db.query(Transaction)
        .order_by(Transaction.date.asc())
        .all()
    )

    unusual_transactions = (
        detect_unusual_spending(
            transactions
        )
    )

    return {
        "count": len(unusual_transactions),
        "unusual_transactions": unusual_transactions
    }