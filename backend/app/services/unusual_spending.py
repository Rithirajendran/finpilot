from collections import defaultdict


def detect_unusual_spending(transactions):
    category_transactions = defaultdict(list)

    # Group expense transactions by category
    for transaction in transactions:

        if transaction.transaction_type != "expense":
            continue

        category = transaction.category or "Other"

        category_transactions[category].append(
            transaction
        )

    unusual_transactions = []

    for category, items in category_transactions.items():

        # Need enough history to identify a normal pattern
        if len(items) < 3:
            continue

        amounts = [
            float(item.amount)
            for item in items
            if item.amount is not None
        ]

        if len(amounts) < 3:
            continue

        average_amount = sum(amounts) / len(amounts)

        # Detect transactions significantly above normal
        threshold = max(
            average_amount * 2,
            average_amount + 500
        )

        for transaction in items:

            amount = float(transaction.amount or 0)

            if amount <= threshold:
                continue

            unusual_transactions.append({
                "id": transaction.id,
                "date": str(transaction.date),
                "description": transaction.description,
                "category": category,
                "amount": round(amount, 2),
                "average_category_spending": round(
                    average_amount,
                    2
                ),
                "threshold": round(
                    threshold,
                    2
                ),
                "reason": (
                    f"This expense is significantly "
                    f"higher than your usual "
                    f"{category} spending."
                )
            })

    # Highest unusual expense first
    unusual_transactions.sort(
        key=lambda item: item["amount"],
        reverse=True
    )

    return unusual_transactions