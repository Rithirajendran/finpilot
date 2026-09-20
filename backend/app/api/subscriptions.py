from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.transaction import Transaction
from app.services.recurring_detector import (
    detect_recurring_transactions
)


router = APIRouter(
    prefix="/api/subscriptions",
    tags=["Subscriptions"]
)


@router.get("/")
def get_subscriptions(
    db: Session = Depends(get_db)
):
    transactions = (
        db.query(Transaction)
        .order_by(Transaction.date.asc())
        .all()
    )

    subscriptions = detect_recurring_transactions(
        transactions
    )

    return {
        "count": len(subscriptions),
        "subscriptions": subscriptions
    }