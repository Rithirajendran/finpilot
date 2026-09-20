from collections import defaultdict


def calculate_expense_comparison(transactions):
    monthly_expenses = defaultdict(float)

    monthly_category_expenses = defaultdict(
        lambda: defaultdict(float)
    )

    for transaction in transactions:

        if transaction.transaction_type != "expense":
            continue

        if not transaction.date:
            continue

        amount = float(
            transaction.amount or 0
        )

        month = transaction.date.strftime("%Y-%m")

        category = (
            transaction.category
            or "Other"
        )

        monthly_expenses[month] += amount

        monthly_category_expenses[
            month
        ][category] += amount

    months = sorted(
        monthly_expenses.keys()
    )

    if len(months) < 2:

        return {
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
            "increases": [],
            "decreases": []
        }

    current_month = months[-1]
    previous_month = months[-2]

    current_expenses = (
        monthly_expenses[current_month]
    )

    previous_expenses = (
        monthly_expenses[previous_month]
    )

    change = (
        current_expenses
        - previous_expenses
    )

    if previous_expenses > 0:

        change_percentage = (
            change
            / previous_expenses
        ) * 100

    else:

        change_percentage = 0

    all_categories = (
        set(
            monthly_category_expenses[
                current_month
            ].keys()
        )
        |
        set(
            monthly_category_expenses[
                previous_month
            ].keys()
        )
    )

    category_comparison = []

    for category in all_categories:

        previous_amount = (
            monthly_category_expenses[
                previous_month
            ].get(category, 0)
        )

        current_amount = (
            monthly_category_expenses[
                current_month
            ].get(category, 0)
        )

        category_change = (
            current_amount
            - previous_amount
        )

        if previous_amount > 0:

            category_change_percentage = (
                category_change
                / previous_amount
            ) * 100

        elif current_amount > 0:

            category_change_percentage = 100

        else:

            category_change_percentage = 0

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

    category_comparison.sort(
        key=lambda item: item["change"],
        reverse=True
    )

    increases = [
        item
        for item in category_comparison
        if item["change"] > 0
    ]

    decreases = [
        item
        for item in category_comparison
        if item["change"] < 0
    ]

    return {
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
        "category_comparison": (
            category_comparison
        ),
        "increases": increases,
        "decreases": decreases
    }