def detect_transaction_type(description: str) -> str:
    """
    Detect whether a transaction is income or expense
    based on the transaction description.
    """

    if not description:
        return "expense"

    text = description.lower().strip()

    income_keywords = [
        "salary",
        "payroll",
        "income",
        "freelance",
        "freelancing",
        "credit",
        "cashback",
        "refund",
        "reimbursement",
        "bonus",
        "interest received",
        "dividend",
        "deposit",
        "payment received",
        "money received"
    ]

    for keyword in income_keywords:
        if keyword in text:
            return "income"

    return "expense"