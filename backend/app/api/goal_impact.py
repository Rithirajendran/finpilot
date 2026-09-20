from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.transaction import Transaction
from app.models.goal import Goal

from app.services.goal_impact import (
    calculate_goal_impact
)

router = APIRouter(
    prefix="/api/goal-impact",
    tags=["Goal Impact"]
)


@router.get("/")
def get_goal_impact(
    db: Session = Depends(get_db)
):

    transactions = (
        db.query(Transaction)
        .all()
    )

    goals = (
        db.query(Goal)
        .all()
    )

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

    available_amount = (
        total_income
        - total_expenses
    )

    goal_analysis = calculate_goal_impact(
        total_income,
        total_expenses,
        goals
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
        "available_after_expenses": round(
            available_amount,
            2
        ),
        "goal_count": len(goal_analysis),
        "goals": goal_analysis
    }