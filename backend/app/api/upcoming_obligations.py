from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.transaction import Transaction
from app.services.recurring_detector import (
    detect_recurring_transactions
)
from app.services.upcoming_obligations import (
    get_upcoming_obligations
)


router = APIRouter(
    prefix="/api/upcoming-obligations",
    tags=["Upcoming Obligations"]
)


@router.get("/")
def get_upcoming_financial_obligations(
    db: Session = Depends(get_db)
):

    transactions = (
        db.query(Transaction)
        .order_by(
            Transaction.date.asc()
        )
        .all()
    )

    recurring_transactions = (
        detect_recurring_transactions(
            transactions
        )
    )

    obligations = get_upcoming_obligations(
        recurring_transactions,
        date.today()
    )

    total_upcoming = sum(
        item["amount"]
        for item in obligations
    )

    return {
        "count": len(obligations),
        "total_upcoming_amount": round(
            total_upcoming,
            2
        ),
        "obligations": obligations
    }