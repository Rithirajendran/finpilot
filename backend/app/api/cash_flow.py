from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date

from app.database import get_db
from app.models.transaction import Transaction
from app.models.goal import Goal

from app.services.recurring_detector import (
    detect_recurring_transactions
)

from app.services.upcoming_obligations import (
    get_upcoming_obligations
)

from app.services.cash_flow_outlook import (
    calculate_cash_flow_outlook
)


router = APIRouter(
    prefix="/api/cash-flow",
    tags=["Cash Flow Outlook"]
)


@router.get("/")
def get_cash_flow_outlook(
    db: Session = Depends(get_db)
):

    transactions = (
        db.query(Transaction)
        .order_by(Transaction.date.asc())
        .all()
    )

    goals = db.query(Goal).all()

    total_income = 0
    total_expenses = 0

    for transaction in transactions:

        amount = float(
            transaction.amount or 0
        )

        if transaction.transaction_type == "income":
            total_income += amount
        else:
            total_expenses += amount

    current_balance = (
        total_income - total_expenses
    )

    recurring_transactions = (
        detect_recurring_transactions(
            transactions
        )
    )

    upcoming_obligations = (
        get_upcoming_obligations(
            recurring_transactions,
            date.today()
        )
    )

    outlook = calculate_cash_flow_outlook(
        current_balance=current_balance,
        upcoming_obligations=upcoming_obligations,
        goals=goals
    )

    return {
        "status": "success",
        "total_income": round(
            total_income,
            2
        ),
        "total_expenses": round(
            total_expenses,
            2
        ),
        "outlook": outlook
    }