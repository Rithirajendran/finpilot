from collections import defaultdict


def generate_monthly_financial_summary(
    transactions,
    budgets,
    goals,
    subscriptions,
    obligations,
    unusual_transactions,
):
    if not transactions:
        return {
            "month": None,
            "income": 0,
            "expenses": 0,
            "balance": 0,
            "top_category": None,
            "category_breakdown": [],
            "observations": [],
            "action_items": [],
        }

    # Find latest month in the database
    valid_transactions = [
        transaction
        for transaction in transactions
        if transaction.date
    ]

    if not valid_transactions:
        return {
            "month": None,
            "income": 0,
            "expenses": 0,
            "balance": 0,
            "top_category": None,
            "category_breakdown": [],
            "observations": [],
            "action_items": [],
        }

    latest_month = max(
        transaction.date
        for transaction in valid_transactions
    ).strftime("%Y-%m")

    monthly_transactions = [
        transaction
        for transaction in valid_transactions
        if transaction.date.strftime("%Y-%m")
        == latest_month
    ]

    income = 0
    expenses = 0

    category_totals = defaultdict(float)

    for transaction in monthly_transactions:

        amount = float(
            transaction.amount or 0
        )

        if transaction.transaction_type == "income":
            income += amount

        else:
            expenses += amount

            category = (
                transaction.category
                or "Other"
            )

            category_totals[category] += amount

    balance = income - expenses

    category_breakdown = []

    for category, amount in category_totals.items():

        percentage = (
            (amount / expenses) * 100
            if expenses > 0
            else 0
        )

        category_breakdown.append({
            "category": category,
            "amount": round(amount, 2),
            "percentage": round(
                percentage,
                2
            ),
        })

    category_breakdown.sort(
        key=lambda item: item["amount"],
        reverse=True
    )

    top_category = (
        category_breakdown[0]
        if category_breakdown
        else None
    )

    observations = []
    action_items = []

    # ---------------------------------
    # Spending observation
    # ---------------------------------

    if income > 0:

        expense_ratio = (
            expenses / income
        ) * 100

        if expense_ratio > 90:

            observations.append(
                "Most of the recorded income "
                "has been used for expenses "
                "this month."
            )

            action_items.append(
                "Review your largest spending "
                "categories and identify "
                "expenses that can be reduced."
            )

        elif expense_ratio > 70:

            observations.append(
                "A large portion of the recorded "
                "income has been used for expenses."
            )

            action_items.append(
                "Monitor discretionary spending "
                "to maintain more available cash."
            )

        else:

            observations.append(
                "Recorded expenses are below "
                "the total recorded income "
                "for this month."
            )

    # ---------------------------------
    # Top spending category
    # ---------------------------------

    if top_category:

        observations.append(
            f"{top_category['category']} is your "
            f"largest spending category at "
            f"₹{top_category['amount']:,.2f}."
        )

        if top_category["percentage"] >= 30:

            action_items.append(
                f"Review your {top_category['category']} "
                "expenses because they represent a "
                "significant share of this month's "
                "spending."
            )

    # ---------------------------------
    # Budget observations
    # ---------------------------------

    exceeded_budgets = []

    for budget in budgets:

        if budget.month != latest_month:
            continue

        budget_amount = float(
            budget.amount or 0
        )

        actual_amount = sum(
            float(transaction.amount or 0)
            for transaction in monthly_transactions
            if transaction.transaction_type == "expense"
            and (
                transaction.category
                or "Other"
            ) == budget.category
        )

        if actual_amount > budget_amount:

            exceeded_budgets.append({
                "category": budget.category,
                "budget": budget_amount,
                "actual": actual_amount,
                "exceeded_by": (
                    actual_amount - budget_amount
                ),
            })

    for item in exceeded_budgets:

        observations.append(
            f"{item['category']} spending exceeded "
            f"the monthly budget by "
            f"₹{item['exceeded_by']:,.2f}."
        )

        action_items.append(
            f"Review {item['category']} spending "
            "and adjust upcoming expenses."
        )

    # ---------------------------------
    # Subscription observation
    # ---------------------------------

    if subscriptions:

        total_subscription_cost = sum(
            float(item.get("amount", 0))
            for item in subscriptions
        )

        observations.append(
            f"{len(subscriptions)} recurring "
            f"payments were detected."
        )

        action_items.append(
            f"Review recurring payments totaling "
            f"approximately "
            f"₹{total_subscription_cost:,.2f} "
            "per detected cycle."
        )

    # ---------------------------------
    # Unusual spending
    # ---------------------------------

    current_unusual = [
        item
        for item in unusual_transactions
        if str(item.get("date", "")).startswith(
            latest_month
        )
    ]

    if current_unusual:

        observations.append(
            f"{len(current_unusual)} unusual "
            "spending transaction(s) were "
            "detected this month."
        )

        action_items.append(
            "Review unusual transactions and "
            "confirm that they were intentional."
        )

    # ---------------------------------
    # Upcoming obligations
    # ---------------------------------

    if obligations:

        total_upcoming = sum(
            float(item.get("amount", 0))
            for item in obligations
        )

        observations.append(
            f"{len(obligations)} upcoming recurring "
            f"obligation(s) were identified."
        )

        action_items.append(
            f"Keep approximately "
            f"₹{total_upcoming:,.2f} available "
            "for upcoming recurring obligations."
        )

    # ---------------------------------
    # Goals
    # ---------------------------------

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

        if progress >= 100:

            observations.append(
                f"The {goal.name} goal has "
                "reached its target."
            )

        elif progress >= 75:

            observations.append(
                f"The {goal.name} goal is "
                f"{progress:.1f}% complete."
            )

        else:

            action_items.append(
                f"Continue contributing toward "
                f"your {goal.name} goal."
            )

    # Remove duplicate action items
    action_items = list(
        dict.fromkeys(action_items)
    )

    return {
        "month": latest_month,
        "income": round(income, 2),
        "expenses": round(expenses, 2),
        "balance": round(balance, 2),
        "top_category": top_category,
        "category_breakdown": category_breakdown,
        "observations": observations,
        "action_items": action_items,
        "budget_exceeded_count": len(
            exceeded_budgets
        ),
        "unusual_spending_count": len(
            current_unusual
        ),
        "subscription_count": len(
            subscriptions
        ),
        "upcoming_obligation_count": len(
            obligations
        ),
    }