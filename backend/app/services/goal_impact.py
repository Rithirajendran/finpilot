from datetime import date


def calculate_goal_impact(
    total_income,
    total_expenses,
    goals,
    monthly_expenses=None
):
    results = []

    available_amount = (
        float(total_income or 0)
        - float(total_expenses or 0)
    )

    for goal in goals:
        target_amount = float(
            goal.target_amount or 0
        )

        current_amount = float(
            goal.current_amount or 0
        )

        remaining_amount = max(
            target_amount - current_amount,
            0
        )

        progress_percentage = (
            (current_amount / target_amount) * 100
            if target_amount > 0
            else 0
        )

        deadline = goal.deadline

        months_remaining = None

        if deadline:
            try:
                deadline_date = date.fromisoformat(
                    deadline
                )

                today = date.today()

                months_remaining = (
                    (deadline_date.year - today.year) * 12
                    + deadline_date.month
                    - today.month
                )

                months_remaining = max(
                    months_remaining,
                    1
                )

            except ValueError:
                months_remaining = None

        if months_remaining:
            required_monthly_saving = (
                remaining_amount / months_remaining
            )
        else:
            required_monthly_saving = 0

        if required_monthly_saving <= 0:
            impact_status = "Goal Completed"

        elif available_amount >= required_monthly_saving:
            impact_status = "On Track"

        else:
            impact_status = "Needs Attention"

        results.append({
            "goal_id": goal.id,
            "goal_name": goal.name,
            "goal_type": goal.goal_type,
            "target_amount": round(
                target_amount,
                2
            ),
            "current_amount": round(
                current_amount,
                2
            ),
            "remaining_amount": round(
                remaining_amount,
                2
            ),
            "progress_percentage": round(
                progress_percentage,
                2
            ),
            "deadline": deadline,
            "months_remaining": months_remaining,
            "required_monthly_saving": round(
                required_monthly_saving,
                2
            ),
            "available_after_expenses": round(
                available_amount,
                2
            ),
            "impact_status": impact_status
        })

    return results