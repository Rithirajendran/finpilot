from datetime import timedelta


def add_frequency_days(date, frequency):
    if frequency == "Weekly":
        return date + timedelta(days=7)

    if frequency == "Monthly":
        return date + timedelta(days=30)

    if frequency == "Quarterly":
        return date + timedelta(days=90)

    if frequency == "Yearly":
        return date + timedelta(days=365)

    return None


def get_upcoming_obligations(
    recurring_transactions,
    today
):
    obligations = []

    for item in recurring_transactions:

        latest_date = item.get("latest_date")

        if not latest_date:
            continue

        try:
            latest_date = (
                __import__("datetime")
                .datetime
                .strptime(
                    latest_date,
                    "%Y-%m-%d"
                )
                .date()
            )
        except ValueError:
            continue

        frequency = item.get("frequency")

        next_date = add_frequency_days(
            latest_date,
            frequency
        )

        if not next_date:
            continue

        days_until_due = (
            next_date - today
        ).days

        # If the calculated date has already passed,
        # move it forward until it becomes upcoming.
        while days_until_due < 0:

            next_date = add_frequency_days(
                next_date,
                frequency
            )

            if not next_date:
                break

            days_until_due = (
                next_date - today
            ).days

        if not next_date:
            continue

        if days_until_due <= 30:

            if days_until_due <= 3:
                status = "Due Soon"
            elif days_until_due <= 7:
                status = "Upcoming"
            else:
                status = "Scheduled"

            obligations.append({
                "description": item.get(
                    "description"
                ),
                "category": item.get(
                    "category"
                ),
                "amount": round(
                    float(
                        item.get("amount", 0)
                    ),
                    2
                ),
                "frequency": frequency,
                "next_due_date": str(
                    next_date
                ),
                "days_until_due": days_until_due,
                "status": status
            })

    obligations.sort(
        key=lambda item:
        item["next_due_date"]
    )

    return obligations