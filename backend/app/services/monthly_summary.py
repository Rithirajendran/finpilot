from collections import defaultdict


def get_month_key(date):
    return date.strftime("%Y-%m")


def calculate_monthly_summary(transactions):
    monthly_data = defaultdict(
        lambda: {
            "income": 0,
            "expenses": 0,
            "transaction_count": 0,
        }
    )

    for transaction in transactions:

        if not transaction.date:
            continue

        month = get_month_key(transaction.date)

        amount = float(
            transaction.amount or 0
        )

        monthly_data[month][
            "transaction_count"
        ] += 1

        if transaction.transaction_type == "income":

            monthly_data[month][
                "income"
            ] += amount

        else:

            monthly_data[month][
                "expenses"
            ] += amount

    result = []

    for month, data in monthly_data.items():

        income = data["income"]
        expenses = data["expenses"]

        balance = income - expenses

        result.append(
            {
                "month": month,
                "income": round(
                    income, 2
                ),
                "expenses": round(
                    expenses, 2
                ),
                "balance": round(
                    balance, 2
                ),
                "transaction_count":
                    data[
                        "transaction_count"
                    ],
            }
        )

    result.sort(
        key=lambda item: item["month"]
    )

    return result