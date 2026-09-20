from datetime import date, timedelta


def calculate_cash_flow_outlook(
    transactions,
    upcoming_obligations,
    goals
):
    """
    Calculates a simple cash-flow outlook based on:

    - Current recorded balance
    - Upcoming recurring obligations
    - 7-day projected balance
    - 30-day projected balance
    - Savings-goal commitment

    This is decision support only.
    It does not provide investment or financial advice.
    """

    total_income = 0
    total_expenses = 0

    for transaction in transactions:

        amount = float(
            transaction.amount or 0
        )

        if transaction.transaction_type == "income":
            total_income += amount

        else:
            total_expenses += amount

    current_balance = (
        total_income
        - total_expenses
    )

    today = date.today()

    upcoming_7_days = []
    upcoming_30_days = []

    for obligation in upcoming_obligations:

        due_date_text = obligation.get(
            "next_due_date"
        )

        if not due_date_text:
            continue

        try:
            due_date = date.fromisoformat(
                due_date_text
            )
        except ValueError:
            continue

        amount = float(
            obligation.get(
                "amount",
                0
            ) or 0
        )

        days_until_due = (
            due_date - today
        ).days

        if 0 <= days_until_due <= 7:
            upcoming_7_days.append(
                amount
            )

        if 0 <= days_until_due <= 30:
            upcoming_30_days.append(
                amount
            )

    upcoming_7_days_amount = sum(
        upcoming_7_days
    )

    upcoming_30_days_amount = sum(
        upcoming_30_days
    )

    projected_balance_7_days = (
        current_balance
        - upcoming_7_days_amount
    )

    projected_balance_30_days = (
        current_balance
        - upcoming_30_days_amount
    )

    # ------------------------------------------------------
    # Savings goal commitment
    # ------------------------------------------------------

    goal_monthly_commitment = 0

    for goal in goals:

        target = float(
            goal.target_amount or 0
        )

        current = float(
            goal.current_amount or 0
        )

        remaining = max(
            target - current,
            0
        )

        deadline = goal.deadline

        if not deadline or remaining <= 0:
            continue

        try:
            deadline_date = date.fromisoformat(
                deadline
            )

            months_remaining = (
                (
                    deadline_date.year
                    - today.year
                ) * 12
                + (
                    deadline_date.month
                    - today.month
                )
            )

            months_remaining = max(
                months_remaining,
                1
            )

            monthly_required = (
                remaining
                / months_remaining
            )

            goal_monthly_commitment += (
                monthly_required
            )

        except ValueError:
            continue

    # ------------------------------------------------------
    # Cash-flow status
    # ------------------------------------------------------

    if projected_balance_30_days < 0:

        status = "Needs Attention"

    elif (
        goal_monthly_commitment > 0
        and projected_balance_30_days
        < goal_monthly_commitment
    ):

        status = "Tight"

    else:

        status = "Stable"

    # ------------------------------------------------------
    # Observations
    # ------------------------------------------------------

    observations = []

    if upcoming_30_days_amount > 0:

        observations.append(
            f"₹{upcoming_30_days_amount:,.2f} "
            "of recurring obligations are "
            "expected within the next 30 days."
        )

    if projected_balance_30_days < 0:

        observations.append(
            "Projected balance becomes negative "
            "after the identified upcoming "
            "obligations."
        )

    elif projected_balance_30_days < current_balance:

        observations.append(
            "Your projected balance decreases "
            "after accounting for upcoming "
            "recurring obligations."
        )

    if goal_monthly_commitment > 0:

        observations.append(
            f"Your savings goals require "
            f"approximately "
            f"₹{goal_monthly_commitment:,.2f} "
            "per month based on their deadlines."
        )

    if not observations:

        observations.append(
            "No major cash-flow pressure was "
            "identified from the currently "
            "recorded data."
        )

    return {
        "current_balance": round(
            current_balance,
            2
        ),

        "upcoming_7_days_amount": round(
            upcoming_7_days_amount,
            2
        ),

        "upcoming_30_days_amount": round(
            upcoming_30_days_amount,
            2
        ),

        "projected_balance_7_days": round(
            projected_balance_7_days,
            2
        ),

        "projected_balance_30_days": round(
            projected_balance_30_days,
            2
        ),

        "goal_monthly_commitment": round(
            goal_monthly_commitment,
            2
        ),

        "status": status,

        "observations": observations
    }