from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.goal import Goal

from app.services.recurring_detector import (
    detect_recurring_transactions
)

from app.services.upcoming_obligations import (
    get_upcoming_obligations
)

from app.services.unusual_spending import (
    detect_unusual_spending
)

from app.services.monthly_financial_summary import (
    generate_monthly_financial_summary
)

from datetime import date


router = APIRouter(
    prefix="/api/monthly-financial-summary",
    tags=["Monthly Financial Summary"]
)


@router.get("/")
def get_monthly_financial_summary(
    db: Session = Depends(get_db)
):

    transactions = (
        db.query(Transaction)
        .order_by(Transaction.date.asc())
        .all()
    )

    budgets = (
        db.query(Budget)
        .all()
    )

    goals = (
        db.query(Goal)
        .all()
    )

    recurring_transactions = (
        detect_recurring_transactions(
            transactions
        )
    )

    subscriptions = recurring_transactions

    obligations = get_upcoming_obligations(
        recurring_transactions,
        date.today()
    )

    unusual_transactions = (
        detect_unusual_spending(
            transactions
        )
    )

    summary = (
        generate_monthly_financial_summary(
            transactions=transactions,
            budgets=budgets,
            goals=goals,
            subscriptions=subscriptions,
            obligations=obligations,
            unusual_transactions=
                unusual_transactions,
        )
    )

    return {
        "status": "success",
        "summary": summary
    }