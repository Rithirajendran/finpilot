from collections import defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.transaction import Transaction
from app.services.categorizer import categorize_transaction


router = APIRouter(
    prefix="/api/category-summary",
    tags=["Category Summary"]
)


@router.get("/")
def get_category_summary(
    db: Session = Depends(get_db)
):
    transactions = (
        db.query(Transaction)
        .all()
    )

    category_totals = defaultdict(float)

    for transaction in transactions:

        # Only expenses
        if transaction.transaction_type != "expense":
            continue

        amount = float(transaction.amount or 0)

        # Use stored category
        category = transaction.category

        # Fix older records where category is NULL
        if not category:
            category = categorize_transaction(
                transaction.description
            )

        category_totals[category] += amount

    result = []

    for category, amount in category_totals.items():

        result.append({
            "category": category,
            "amount": round(amount, 2)
        })

    # Highest spending first
    result.sort(
        key=lambda item: item["amount"],
        reverse=True
    )

    return {
        "count": len(result),
        "categories": result
    }