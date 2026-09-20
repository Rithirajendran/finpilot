from collections import defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.transaction import Transaction


router = APIRouter(
    prefix="/api/expense-comparison",
    tags=["Expense Comparison"]
)


@router.get("/")
def get_expense_comparison(
    db: Session = Depends(get_db)
):
    # --------------------------------------------------
    # 1. Get all transactions
    # --------------------------------------------------

    transactions = (
        db.query(Transaction)
        .order_by(Transaction.date.asc())
        .all()
    )

    # --------------------------------------------------
    # 2. Store expenses by month and category
    # --------------------------------------------------

    monthly_expenses = defaultdict(float)

    monthly_category_expenses = defaultdict(
        lambda: defaultdict(float)
    )

    for transaction in transactions:

        # Only expenses are considered
        if transaction.transaction_type != "expense":
            continue

        if not transaction.date:
            continue

        amount = float(
            transaction.amount or 0
        )

        month = transaction.date.strftime(
            "%Y-%m"
        )

        category = (
            transaction.category
            or "Other"
        )

        monthly_expenses[month] += amount

        monthly_category_expenses[
            month
        ][category] += amount

    # --------------------------------------------------
    # 3. Sort available months
    # --------------------------------------------------

    months = sorted(
        monthly_expenses.keys()
    )

    # --------------------------------------------------
    # 4. Create monthly totals
    # --------------------------------------------------

    monthly_comparison = []

    for month in months:

        monthly_comparison.append({
            "month": month,
            "expenses": round(
                monthly_expenses[month],
                2
            )
        })

    # --------------------------------------------------
    # 5. Need at least two months for comparison
    # --------------------------------------------------

    if len(months) < 2:

        return {
            "status": "success",
            "message": (
                "At least two months of "
                "expense data are required "
                "for comparison."
            ),
            "current_month": (
                months[-1]
                if months
                else None
            ),
            "previous_month": None,
            "current_expenses": round(
                monthly_expenses[months[-1]],
                2
            ) if months else 0,
            "previous_expenses": 0,
            "change": 0,
            "change_percentage": 0,
            "category_comparison": [],
            "monthly_comparison": monthly_comparison
        }

    # --------------------------------------------------
    # 6. Current and previous month
    # --------------------------------------------------

    current_month = months[-1]
    previous_month = months[-2]

    current_expenses = monthly_expenses[
        current_month
    ]

    previous_expenses = monthly_expenses[
        previous_month
    ]

    # --------------------------------------------------
    # 7. Calculate overall change
    # --------------------------------------------------

    change = (
        current_expenses
        - previous_expenses
    )

    if previous_expenses != 0:
        change_percentage = (
            change
            / previous_expenses
        ) * 100
    else:
        change_percentage = 0

    # --------------------------------------------------
    # 8. Compare categories
    # --------------------------------------------------

    all_categories = set(
        monthly_category_expenses[
            current_month
        ].keys()
    ) | set(
        monthly_category_expenses[
            previous_month
        ].keys()
    )

    category_comparison = []

    for category in all_categories:

        current_amount = (
            monthly_category_expenses[
                current_month
            ].get(category, 0)
        )

        previous_amount = (
            monthly_category_expenses[
                previous_month
            ].get(category, 0)
        )

        category_change = (
            current_amount
            - previous_amount
        )

        if previous_amount != 0:
            category_change_percentage = (
                category_change
                / previous_amount
            ) * 100
        else:
            category_change_percentage = (
                100
                if current_amount > 0
                else 0
            )

        category_comparison.append({
            "category": category,
            "previous_month_amount": round(
                previous_amount,
                2
            ),
            "current_month_amount": round(
                current_amount,
                2
            ),
            "change": round(
                category_change,
                2
            ),
            "change_percentage": round(
                category_change_percentage,
                2
            )
        })

    # --------------------------------------------------
    # 9. Sort categories by change
    # --------------------------------------------------

    category_comparison.sort(
        key=lambda item: item["change"],
        reverse=True
    )

    # --------------------------------------------------
    # 10. Biggest increase
    # --------------------------------------------------

    increases = [
        item
        for item in category_comparison
        if item["change"] > 0
    ]

    biggest_increase = (
        increases[0]
        if increases
        else None
    )

    # --------------------------------------------------
    # 11. Biggest decrease
    # --------------------------------------------------

    decreases = [
        item
        for item in category_comparison
        if item["change"] < 0
    ]

    biggest_decrease = (
        min(
            decreases,
            key=lambda item: item["change"]
        )
        if decreases
        else None
    )

    # --------------------------------------------------
    # 12. Final response
    # --------------------------------------------------

    return {
        "status": "success",

        "current_month": current_month,

        "previous_month": previous_month,

        "current_expenses": round(
            current_expenses,
            2
        ),

        "previous_expenses": round(
            previous_expenses,
            2
        ),

        "change": round(
            change,
            2
        ),

        "change_percentage": round(
            change_percentage,
            2
        ),

        "biggest_increase": (
            biggest_increase
        ),

        "biggest_decrease": (
            biggest_decrease
        ),

        "category_comparison": (
            category_comparison
        ),

        "monthly_comparison": (
            monthly_comparison
        )
    }