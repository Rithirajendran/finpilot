from collections import defaultdict

from app.services.categorizer import categorize_transaction


def normalize_description(description: str) -> str:
    if not description:
        return ""

    return " ".join(
        description.lower().strip().split()
    )


def detect_frequency(dates):
    unique_dates = sorted(set(dates))

    if len(unique_dates) < 3:
        return None

    intervals = []

    for i in range(1, len(unique_dates)):
        difference = (
            unique_dates[i] - unique_dates[i - 1]
        ).days

        intervals.append(difference)

    average_interval = sum(intervals) / len(intervals)

    if 5 <= average_interval <= 9:
        return "Weekly"

    if 25 <= average_interval <= 35:
        return "Monthly"

    if 80 <= average_interval <= 100:
        return "Quarterly"

    if 350 <= average_interval <= 380:
        return "Yearly"

    return None


def detect_recurring_transactions(transactions):
    groups = defaultdict(list)

    for transaction in transactions:

        if transaction.transaction_type != "expense":
            continue

        description = normalize_description(
            transaction.description
        )

        if not description:
            continue

        groups[description].append(transaction)

    recurring = []

    for description, items in groups.items():

        dates = [
            item.date
            for item in items
            if item.date is not None
        ]

        unique_dates = sorted(set(dates))

        if len(unique_dates) < 3:
            continue

        frequency = detect_frequency(unique_dates)

        if not frequency:
            continue

        amounts = [
            float(item.amount)
            for item in items
            if item.amount is not None
        ]

        if not amounts:
            continue

        average_amount = sum(amounts) / len(amounts)

        amount_variation = (
            max(amounts) - min(amounts)
        )

        if amount_variation > max(
            100,
            average_amount * 0.10
        ):
            continue

        latest_transaction = max(
            items,
            key=lambda item: item.date
        )

        # Use existing category.
        # If category is missing, calculate it again.
        category = latest_transaction.category

        if not category:
            category = categorize_transaction(
                latest_transaction.description
            )

        recurring.append({
            "description": latest_transaction.description,
            "category": category,
            "amount": round(average_amount, 2),
            "frequency": frequency,
            "occurrences": len(unique_dates),
            "latest_date": str(
                latest_transaction.date
            )
        })

    return recurring