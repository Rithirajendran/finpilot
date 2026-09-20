from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.budget import Budget
from app.models.transaction import Transaction


router = APIRouter(
    prefix="/api/budgets",
    tags=["Budgets"]
)


@router.post("/")
def create_budget(
    month: str,
    category: str,
    amount: float,
    db: Session = Depends(get_db)
):
    if amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Budget amount must be greater than zero."
        )

    existing_budget = (
        db.query(Budget)
        .filter(
            Budget.month == month,
            Budget.category == category
        )
        .first()
    )

    if existing_budget:
        existing_budget.amount = amount
        db.commit()
        db.refresh(existing_budget)

        return {
            "status": "updated",
            "message": "Budget updated successfully.",
            "budget": {
                "id": existing_budget.id,
                "month": existing_budget.month,
                "category": existing_budget.category,
                "amount": existing_budget.amount
            }
        }

    budget = Budget(
        month=month,
        category=category,
        amount=amount
    )

    db.add(budget)
    db.commit()
    db.refresh(budget)

    return {
        "status": "created",
        "message": "Budget created successfully.",
        "budget": {
            "id": budget.id,
            "month": budget.month,
            "category": budget.category,
            "amount": budget.amount
        }
    }


@router.get("/")
def get_budgets(
    db: Session = Depends(get_db)
):
    budgets = (
        db.query(Budget)
        .order_by(
            Budget.month.asc(),
            Budget.category.asc()
        )
        .all()
    )

    result = []

    for budget in budgets:

        transactions = (
            db.query(Transaction)
            .filter(
                Transaction.category == budget.category,
                Transaction.transaction_type == "expense"
            )
            .all()
        )

        actual_spending = 0

        for transaction in transactions:

            if not transaction.date:
                continue

            transaction_month = transaction.date.strftime(
                "%Y-%m"
            )

            if transaction_month == budget.month:
                actual_spending += float(
                    transaction.amount or 0
                )

        remaining = budget.amount - actual_spending

        usage_percentage = (
            actual_spending / budget.amount
        ) * 100

        if usage_percentage >= 100:
            status = "Exceeded"
        elif usage_percentage >= 80:
            status = "Warning"
        else:
            status = "On Track"

        result.append({
            "id": budget.id,
            "month": budget.month,
            "category": budget.category,
            "budget": round(budget.amount, 2),
            "actual_spending": round(
                actual_spending,
                2
            ),
            "remaining": round(
                remaining,
                2
            ),
            "usage_percentage": round(
                usage_percentage,
                2
            ),
            "status": status
        })

    return {
        "count": len(result),
        "budgets": result
    }


@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db)
):
    budget = (
        db.query(Budget)
        .filter(Budget.id == budget_id)
        .first()
    )

    if not budget:
        raise HTTPException(
            status_code=404,
            detail="Budget not found."
        )

    db.delete(budget)
    db.commit()

    return {
        "status": "success",
        "message": "Budget deleted successfully."
    }