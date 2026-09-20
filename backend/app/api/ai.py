from collections import defaultdict

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.goal import Goal

from app.services.ai_assistant import (
    answer_financial_question
)

from app.services.recurring_detector import (
    detect_recurring_transactions
)

from app.services.upcoming_obligations import (
    get_upcoming_obligations
)

from app.services.unusual_spending import (
    detect_unusual_spending
)

from app.services.goal_impact import (
    calculate_goal_impact
)

from app.services.cash_flow_outlook import (
    calculate_cash_flow_outlook
)


router = APIRouter(
    prefix="/api/ai",
    tags=["AI Assistant"]
)


# ============================================================
# REQUEST MODEL
# ============================================================

class AIQuestion(BaseModel):
    question: str


# ============================================================
# SUPPORTING DATA HELPER
# ============================================================

def build_supporting_response(
    question,
    transactions,
    budgets,
    goals
):

    question_lower = (
        question
        .lower()
        .strip()
    )

    # --------------------------------------------------------
    # Basic totals
    # --------------------------------------------------------

    total_income = 0
    total_expenses = 0

    category_totals = defaultdict(float)

    for transaction in transactions:

        amount = float(
            transaction.amount or 0
        )

        if transaction.transaction_type == "income":

            total_income += amount

        else:

            total_expenses += amount

            category = (
                transaction.category
                or "Other"
            )

            category_totals[category] += amount

    balance = (
        total_income
        - total_expenses
    )

    # --------------------------------------------------------
    # Recurring
    # --------------------------------------------------------

    recurring = detect_recurring_transactions(
        transactions
    )

    # --------------------------------------------------------
    # Upcoming
    # --------------------------------------------------------

    upcoming = get_upcoming_obligations(
        recurring,
        __import__("datetime").date.today()
    )

    # --------------------------------------------------------
    # Unusual
    # --------------------------------------------------------

    unusual = detect_unusual_spending(
        transactions
    )

    # --------------------------------------------------------
    # CASH FLOW
    # --------------------------------------------------------

    if (
        "cash flow" in question_lower
        or "cashflow" in question_lower
        or "cash-flow" in question_lower
        or "projected balance" in question_lower
        or "next 30 days" in question_lower
        or "future balance" in question_lower
        or "cash position" in question_lower
    ):

        cash_flow = calculate_cash_flow_outlook(
            transactions=transactions,
            upcoming_obligations=upcoming,
            goals=goals
        )

        current_balance = float(
            cash_flow.get(
                "current_balance",
                balance
            )
            or 0
        )

        upcoming_30 = float(
            cash_flow.get(
                "upcoming_30_days_amount",
                0
            )
            or 0
        )

        projected_30 = float(
            cash_flow.get(
                "projected_balance_30_days",
                current_balance
            )
            or 0
        )

        commitment = float(
            cash_flow.get(
                "goal_monthly_commitment",
                0
            )
            or 0
        )

        status = cash_flow.get(
            "status",
            "Stable"
        )

        return {
            "key_finding": (
                f"Your projected balance after "
                f"30 days is ₹{projected_30:,.2f}, "
                f"after accounting for "
                f"₹{upcoming_30:,.2f} in upcoming "
                f"recurring obligations."
            ),
            "suggested_action": (
                f"Keep approximately "
                f"₹{commitment:,.2f} available "
                f"for your monthly savings "
                f"commitment and monitor upcoming "
                f"recurring payments."
                if commitment > 0
                else (
                    "Continue monitoring your "
                    "upcoming recurring payments "
                    "and projected balance."
                )
            ),
            "supporting_data": [
                {
                    "label": "Current balance",
                    "value": f"₹{current_balance:,.2f}"
                },
                {
                    "label": "Upcoming in 30 days",
                    "value": f"₹{upcoming_30:,.2f}"
                },
                {
                    "label": "Projected 30-day balance",
                    "value": f"₹{projected_30:,.2f}"
                },
                {
                    "label": "Monthly savings commitment",
                    "value": f"₹{commitment:,.2f}"
                },
                {
                    "label": "Cash-flow status",
                    "value": status
                }
            ],
            "data_backed": True
        }

    # --------------------------------------------------------
    # UNUSUAL SPENDING
    # --------------------------------------------------------

    if (
        "unusual spending" in question_lower
        or "unusual expense" in question_lower
        or "unusual expenses" in question_lower
        or "unusual transaction" in question_lower
        or "unusual transactions" in question_lower
        or "abnormal spending" in question_lower
        or "suspicious spending" in question_lower
    ):

        if not unusual:

            return {
                "key_finding": (
                    "No unusual spending patterns "
                    "were detected in the recorded "
                    "transactions."
                ),
                "suggested_action": (
                    "Continue monitoring your spending "
                    "for transactions that are "
                    "significantly higher than your "
                    "usual category spending."
                ),
                "supporting_data": [
                    {
                        "label": "Unusual transactions",
                        "value": "0 detected"
                    },
                    {
                        "label": "Transactions analyzed",
                        "value": str(len(transactions))
                    }
                ],
                "data_backed": True
            }

        highest = unusual[0]

        return {
            "key_finding": (
                f"{highest['description']} was flagged "
                f"as unusual at "
                f"₹{float(highest['amount']):,.2f}, "
                f"compared with a category average "
                f"of ₹{float(highest['average_category_spending']):,.2f}."
            ),
            "suggested_action": (
                "Review the flagged transaction and "
                "confirm whether it was expected. "
                "If it was unnecessary spending, "
                "consider monitoring this category."
            ),
            "supporting_data": [
                {
                    "label": "Flagged transaction",
                    "value": highest["description"]
                },
                {
                    "label": "Amount",
                    "value": (
                        f"₹{float(highest['amount']):,.2f}"
                    )
                },
                {
                    "label": "Category",
                    "value": highest["category"]
                },
                {
                    "label": "Category average",
                    "value": (
                        f"₹{float(highest['average_category_spending']):,.2f}"
                    )
                },
                {
                    "label": "Unusual transactions",
                    "value": str(len(unusual))
                }
            ],
            "data_backed": True
        }

    # --------------------------------------------------------
    # SUBSCRIPTIONS
    # --------------------------------------------------------

    if (
        "subscription" in question_lower
        or "recurring payment" in question_lower
        or "recurring payments" in question_lower
    ):

        recurring_total = sum(
            float(item.get("amount", 0) or 0)
            for item in recurring
        )

        return {
            "key_finding": (
                f"{len(recurring)} recurring payment(s) "
                f"were detected in your transaction history."
            ),
            "suggested_action": (
                "Review your recurring payments and "
                "cancel any subscriptions or services "
                "you no longer use."
            ),
            "supporting_data": [
                {
                    "label": "Recurring payments",
                    "value": str(len(recurring))
                },
                {
                    "label": "Detected recurring amount",
                    "value": f"₹{recurring_total:,.2f}"
                }
            ],
            "data_backed": True
        }

    # --------------------------------------------------------
    # UPCOMING PAYMENTS
    # --------------------------------------------------------

    if (
        "upcoming" in question_lower
        or "coming up" in question_lower
        or "payments coming" in question_lower
        or "next payment" in question_lower
    ):

        upcoming_total = sum(
            float(item.get("amount", 0) or 0)
            for item in upcoming
        )

        return {
            "key_finding": (
                f"{len(upcoming)} upcoming recurring "
                f"payment(s) were identified within "
                f"the next 30 days."
            ),
            "suggested_action": (
                f"Keep approximately "
                f"₹{upcoming_total:,.2f} available "
                f"for the identified upcoming payments."
            ),
            "supporting_data": [
                {
                    "label": "Upcoming payments",
                    "value": str(len(upcoming))
                },
                {
                    "label": "Total upcoming amount",
                    "value": f"₹{upcoming_total:,.2f}"
                }
            ],
            "data_backed": True
        }

    # --------------------------------------------------------
    # HIGHEST SPENDING
    # --------------------------------------------------------

    if (
        "spent the most" in question_lower
        or "spend the most" in question_lower
        or "highest spending" in question_lower
        or "highest expense" in question_lower
    ):

        if category_totals:

            highest_category = max(
                category_totals,
                key=category_totals.get
            )

            highest_amount = category_totals[
                highest_category
            ]

            return {
                "key_finding": (
                    f"{highest_category} is your "
                    f"largest spending category "
                    f"at ₹{highest_amount:,.2f}."
                ),
                "suggested_action": (
                    f"Review your {highest_category} "
                    "transactions and identify "
                    "whether any spending can be reduced."
                ),
                "supporting_data": [
                    {
                        "label": "Top category",
                        "value": highest_category
                    },
                    {
                        "label": "Amount spent",
                        "value": f"₹{highest_amount:,.2f}"
                    },
                    {
                        "label": "Total expenses",
                        "value": f"₹{total_expenses:,.2f}"
                    }
                ],
                "data_backed": True
            }

    # --------------------------------------------------------
    # BALANCE
    # --------------------------------------------------------

    if (
        "current balance" in question_lower
        or question_lower == "balance"
        or "my balance" in question_lower
    ):

        return {
            "key_finding": (
                f"Your recorded balance is "
                f"₹{balance:,.2f}."
            ),
            "suggested_action": (
                "Continue monitoring the difference "
                "between your recorded income and "
                "expenses."
            ),
            "supporting_data": [
                {
                    "label": "Total income",
                    "value": f"₹{total_income:,.2f}"
                },
                {
                    "label": "Total expenses",
                    "value": f"₹{total_expenses:,.2f}"
                },
                {
                    "label": "Current balance",
                    "value": f"₹{balance:,.2f}"
                }
            ],
            "data_backed": True
        }

    # --------------------------------------------------------
    # BUDGET
    # --------------------------------------------------------

    if (
        "budget" in question_lower
        or "committed" in question_lower
    ):

        if budgets:

            supporting_data = []

            for budget in budgets:

                actual = 0

                for transaction in transactions:

                    if transaction.transaction_type != "expense":
                        continue

                    if transaction.category != budget.category:
                        continue

                    if not transaction.date:
                        continue

                    if (
                        transaction.date.strftime("%Y-%m")
                        != budget.month
                    ):
                        continue

                    actual += float(
                        transaction.amount or 0
                    )

                remaining = (
                    budget.amount
                    - actual
                )

                supporting_data.append({
                    "label": budget.category,
                    "value": (
                        f"₹{actual:,.2f} spent / "
                        f"₹{budget.amount:,.2f} budget / "
                        f"₹{remaining:,.2f} remaining"
                    )
                })

            return {
                "key_finding": (
                    "Your current budget usage is "
                    "based on the recorded expenses "
                    "for each configured category."
                ),
                "suggested_action": (
                    "Review categories with high "
                    "budget usage before making "
                    "additional discretionary purchases."
                ),
                "supporting_data": supporting_data,
                "data_backed": True
            }

    # --------------------------------------------------------
    # SAVINGS GOALS
    # --------------------------------------------------------

    if (
        "savings goal" in question_lower
        or "saving goal" in question_lower
        or (
            "goal" in question_lower
            and not (
                "affect" in question_lower
                or "impact" in question_lower
                or "track" in question_lower
            )
        )
    ):

        if goals:

            goal = goals[0]

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

            progress = (
                (current / target) * 100
                if target > 0
                else 0
            )

            return {
                "key_finding": (
                    f"{goal.name} is "
                    f"{progress:.1f}% complete, "
                    f"with ₹{remaining:,.2f} remaining."
                ),
                "suggested_action": (
                    "Continue contributing toward "
                    "your savings goal and monitor "
                    "your monthly progress."
                ),
                "supporting_data": [
                    {
                        "label": "Goal",
                        "value": goal.name
                    },
                    {
                        "label": "Target",
                        "value": f"₹{target:,.2f}"
                    },
                    {
                        "label": "Current amount",
                        "value": f"₹{current:,.2f}"
                    },
                    {
                        "label": "Remaining",
                        "value": f"₹{remaining:,.2f}"
                    },
                    {
                        "label": "Progress",
                        "value": f"{progress:.1f}%"
                    }
                ],
                "data_backed": True
            }

    # --------------------------------------------------------
    # DEFAULT
    # --------------------------------------------------------

    return {
        "key_finding": (
            "The response is based on your "
            "recorded financial data."
        ),
        "suggested_action": (
            "Review the detailed answer above "
            "and use the available financial "
            "insights to guide your next action."
        ),
        "supporting_data": [
            {
                "label": "Recorded income",
                "value": f"₹{total_income:,.2f}"
            },
            {
                "label": "Recorded expenses",
                "value": f"₹{total_expenses:,.2f}"
            },
            {
                "label": "Recorded balance",
                "value": f"₹{balance:,.2f}"
            },
            {
                "label": "Transactions analyzed",
                "value": str(len(transactions))
            }
        ],
        "data_backed": True
    }


# ============================================================
# AI QUESTION ENDPOINT
# ============================================================

@router.post("/ask")
def ask_financial_question(
    request: AIQuestion,
    db: Session = Depends(get_db)
):

    transactions = (
        db.query(Transaction)
        .order_by(Transaction.date.asc())
        .all()
    )

    budgets = (
        db.query(Budget)
        .all()
    )

    goals = (
        db.query(Goal)
        .all()
    )

    # --------------------------------------------------------
    # Main AI answer
    # --------------------------------------------------------

    result = answer_financial_question(
        question=request.question,
        transactions=transactions,
        budgets=budgets,
        goals=goals
    )

    # --------------------------------------------------------
    # Additional decision-support information
    # --------------------------------------------------------

    metadata = build_supporting_response(
        question=request.question,
        transactions=transactions,
        budgets=budgets,
        goals=goals
    )

    return {
        "status": "success",
        "question": request.question,
        "answer": result.get(
            "answer",
            ""
        ),
        "key_finding": metadata.get(
            "key_finding",
            ""
        ),
        "suggested_action": metadata.get(
            "suggested_action",
            ""
        ),
        "supporting_data": metadata.get(
            "supporting_data",
            []
        ),
        "data_backed": metadata.get(
            "data_backed",
            True
        )
    }