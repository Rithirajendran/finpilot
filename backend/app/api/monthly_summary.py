from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.transaction import Transaction
from app.services.monthly_summary import calculate_monthly_summary


router = APIRouter(
    prefix="/api/monthly-summary",
    tags=["Monthly Summary"]
)


@router.get("/")
def get_monthly_summary(
    db: Session = Depends(get_db)
):
    transactions = (
        db.query(Transaction)
        .order_by(Transaction.date.asc())
        .all()
    )

    monthly_summary = calculate_monthly_summary(
        transactions
    )

    return {
        "count": len(monthly_summary),
        "months": monthly_summary
    }