from collections import defaultdict

from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.goal import Goal

from app.services.recurring_detector import (
    detect_recurring_transactions
)

from app.services.upcoming_obligations import (
    get_upcoming_obligations
)

from datetime import date


def generate_financial_insights(db):

    transactions = (
        db.query(Transaction)
        .order_by(Transaction.date.asc())
        .all()
    )

    budgets = db.query(Budget).all()

    goals = db.query(Goal).all()

    insights = []

    # --------------------------------------------------
    # 1. CATEGORY SPENDING
    # --------------------------------------------------

    category_totals = defaultdict(float)

    for transaction in transactions:

        if transaction.transaction_type != "expense":
            continue

        category = (
            transaction.category
            or "Other"
        )

        category_totals[category] += float(
            transaction.amount or 0
        )

    if category_totals:

        highest_category = max(
            category_totals,
            key=category_totals.get
        )

        highest_amount = category_totals[
            highest_category
        ]

        insights.append({
            "type": "spending",
            "priority": "medium",
            "title": "Highest Spending Category",
            "message": (
                f"{highest_category} is your "
                f"highest spending category with "
                f"₹{highest_amount:,.2f} in recorded "
                f"expenses."
            )
        })

    # --------------------------------------------------
    # 2. BUDGET ANALYSIS
    # --------------------------------------------------

    for budget in budgets:

        actual_spending = 0

        for transaction in transactions:

            if (
                transaction.transaction_type
                != "expense"
            ):
                continue

            if (
                transaction.category
                != budget.category
            ):
                continue

            if not transaction.date:
                continue

            transaction_month = (
                transaction.date.strftime(
                    "%Y-%m"
                )
            )

            if transaction_month == budget.month:

                actual_spending += float(
                    transaction.amount or 0
                )

        if budget.amount <= 0:
            continue

        usage = (
            actual_spending /
            budget.amount
        ) * 100

        if usage >= 100:

            insights.append({
                "type": "budget",
                "priority": "high",
                "title": "Budget Exceeded",
                "message": (
                    f"Your {budget.category} "
                    f"spending has exceeded your "
                    f"₹{budget.amount:,.2f} budget "
                    f"for {budget.month}."
                )
            })

        elif usage >= 80:

            insights.append({
                "type": "budget",
                "priority": "medium",
                "title": "Budget Warning",
                "message": (
                    f"You have used "
                    f"{usage:.1f}% of your "
                    f"{budget.category} budget "
                    f"for {budget.month}."
                )
            })

    # --------------------------------------------------
    # 3. SAVINGS GOAL ANALYSIS
    # --------------------------------------------------

    for goal in goals:

        target = float(
            goal.target_amount or 0
        )

        current = float(
            goal.current_amount or 0
        )

        if target <= 0:
            continue

        progress = (
            current / target
        ) * 100

        remaining = max(
            target - current,
            0
        )

        if current >= target:

            insights.append({
                "type": "goal",
                "priority": "low",
                "title": "Goal Completed",
                "message": (
                    f"Your {goal.name} goal "
                    f"has been completed."
                )
            })

        elif progress >= 75:

            insights.append({
                "type": "goal",
                "priority": "medium",
                "title": "Goal Almost Reached",
                "message": (
                    f"You're {progress:.1f}% toward "
                    f"your {goal.name} goal. "
                    f"₹{remaining:,.2f} remains."
                )
            })

        else:

            insights.append({
                "type": "goal",
                "priority": "medium",
                "title": "Savings Goal Progress",
                "message": (
                    f"Your {goal.name} goal is "
                    f"{progress:.1f}% complete, "
                    f"with ₹{remaining:,.2f} remaining."
                )
            })

    # --------------------------------------------------
    # 4. RECURRING PAYMENTS
    # --------------------------------------------------

    recurring = detect_recurring_transactions(
        transactions
    )

    if recurring:

        recurring_total = sum(
            float(item.get("amount", 0))
            for item in recurring
        )

        insights.append({
            "type": "subscription",
            "priority": "medium",
            "title": "Recurring Payments",
            "message": (
                f"You have {len(recurring)} "
                f"detected recurring payments, "
                f"with approximately "
                f"₹{recurring_total:,.2f} "
                f"per recurring cycle."
            )
        })

    # --------------------------------------------------
    # 5. UPCOMING OBLIGATIONS
    # --------------------------------------------------

    upcoming = get_upcoming_obligations(
        recurring,
        date.today()
    )

    if upcoming:

        upcoming_total = sum(
            float(item.get("amount", 0))
            for item in upcoming
        )

        insights.append({
            "type": "obligation",
            "priority": "medium",
            "title": "Upcoming Payments",
            "message": (
                f"₹{upcoming_total:,.2f} in "
                f"recurring payments may be "
                f"due within the next 30 days."
            )
        })

    # --------------------------------------------------
    # 6. PRIORITY SORTING
    # --------------------------------------------------

    priority_order = {
        "high": 0,
        "medium": 1,
        "low": 2
    }

    insights.sort(
        key=lambda item:
        priority_order.get(
            item["priority"],
            3
        )
    )

    return insights