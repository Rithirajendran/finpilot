from collections import defaultdict

from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.goal import Goal
from datetime import date
from app.services.recurring_detector import detect_recurring_transactions
from app.services.upcoming_obligations import get_upcoming_obligations


def get_financial_context(db):

    transactions = (
        db.query(Transaction)
        .order_by(Transaction.date.asc())
        .all()
    )

    budgets = db.query(Budget).all()
    goals = db.query(Goal).all()

    total_income = 0
    total_expenses = 0

    category_totals = defaultdict(float)

    for transaction in transactions:

        amount = float(transaction.amount or 0)

        if transaction.transaction_type == "income":
            total_income += amount

        else:
            total_expenses += amount

            category = transaction.category or "Other"
            category_totals[category] += amount

    balance = total_income - total_expenses

    recurring = detect_recurring_transactions(
        transactions
    )

    upcoming = get_upcoming_obligations(
    recurring,
    date.today()
)

    return {
        "transactions": transactions,
        "budgets": budgets,
        "goals": goals,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "balance": balance,
        "category_totals": category_totals,
        "recurring": recurring,
        "upcoming": upcoming,
    }


def answer_finance_question(question, db):

    question_lower = question.lower().strip()

    context = get_financial_context(db)

    total_income = context["total_income"]
    total_expenses = context["total_expenses"]
    balance = context["balance"]

    category_totals = context["category_totals"]
    budgets = context["budgets"]
    goals = context["goals"]
    recurring = context["recurring"]
    upcoming = context["upcoming"]

    # --------------------------------------------------
    # BALANCE
    # --------------------------------------------------

    if "balance" in question_lower:

        return {
            "answer":
                f"Your recorded income minus expenses is "
                f"₹{balance:,.2f}."
        }

    # --------------------------------------------------
    # TOTAL INCOME
    # --------------------------------------------------

    if (
        "total income" in question_lower
        or "how much income" in question_lower
        or "income" == question_lower
    ):

        return {
            "answer":
                f"Your recorded total income is "
                f"₹{total_income:,.2f}."
        }

    # --------------------------------------------------
    # TOTAL EXPENSES
    # --------------------------------------------------

    if (
        "total expenses" in question_lower
        or "how much did i spend" in question_lower
        or "total spending" in question_lower
    ):

        return {
            "answer":
                f"Your recorded total expenses are "
                f"₹{total_expenses:,.2f}."
        }

    # --------------------------------------------------
    # HIGHEST SPENDING
    # --------------------------------------------------

    if (
        "spent the most" in question_lower
        or "spend the most" in question_lower
        or "highest spending" in question_lower
        or "highest expense" in question_lower
    ):

        if not category_totals:

            return {
                "answer":
                    "There is not enough expense data "
                    "to identify a highest spending category."
            }

        highest_category = max(
            category_totals,
            key=category_totals.get
        )

        highest_amount = category_totals[
            highest_category
        ]

        return {
            "answer":
                f"Your highest spending category is "
                f"{highest_category}, with recorded "
                f"expenses of ₹{highest_amount:,.2f}."
        }

    # --------------------------------------------------
    # CATEGORY QUESTIONS
    # --------------------------------------------------

    categories = [
        "food",
        "shopping",
        "transport",
        "entertainment",
        "bills",
        "health",
        "education",
        "other",
    ]

    for category in categories:

        if category in question_lower:

            matching_category = None

            for existing_category in category_totals:

                if existing_category.lower() == category:
                    matching_category = existing_category
                    break

            if matching_category:

                amount = category_totals[
                    matching_category
                ]

                return {
                    "answer":
                        f"Your recorded {matching_category} "
                        f"expenses are ₹{amount:,.2f}."
                }

            return {
                "answer":
                    f"No recorded expenses were found "
                    f"for {category.title()}."
            }

    # --------------------------------------------------
    # SUBSCRIPTIONS
    # --------------------------------------------------

    if (
        "subscription" in question_lower
        or "recurring payment" in question_lower
        or "recurring payments" in question_lower
    ):

        if not recurring:

            return {
                "answer":
                    "No recurring payments were detected "
                    "from the current transaction data."
            }

        names = []

        for item in recurring:
            names.append(
                f"{item['description']} "
                f"(₹{item['amount']:,.2f}, "
                f"{item['frequency']})"
            )

        return {
            "answer":
                "Detected recurring payments: "
                + ", ".join(names)
                + "."
        }

    # --------------------------------------------------
    # UPCOMING PAYMENTS
    # --------------------------------------------------

    if (
        "upcoming" in question_lower
        or "coming up" in question_lower
        or "payments coming" in question_lower
        or "next payment" in question_lower
    ):

        if not upcoming:

            return {
                "answer":
                    "No upcoming recurring payments "
                    "were identified within the next "
                    "30 days."
            }

        items = []

        for item in upcoming:

            items.append(
                f"{item['description']} "
                f"(₹{item['amount']:,.2f}) "
                f"on {item['next_due_date']}"
            )

        return {
            "answer":
                "Upcoming payments: "
                + ", ".join(items)
                + "."
        }

    # --------------------------------------------------
    # BUDGET
    # --------------------------------------------------

    if (
        "budget" in question_lower
        or "committed" in question_lower
    ):

        if not budgets:

            return {
                "answer":
                    "No budgets have been configured yet."
            }

        budget_lines = []

        for budget in budgets:

            actual = 0

            for transaction in context["transactions"]:

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

            remaining = budget.amount - actual

            budget_lines.append(
                f"{budget.category}: "
                f"₹{actual:,.2f} spent of "
                f"₹{budget.amount:,.2f} "
                f"budget"
            )

            if remaining < 0:
                budget_lines[-1] += (
                    f" (₹{abs(remaining):,.2f} over budget)"
                )
            else:
                budget_lines[-1] += (
                    f" (₹{remaining:,.2f} remaining)"
                )

        return {
            "answer":
                "Budget status: "
                + "; ".join(budget_lines)
                + "."
        }

    # --------------------------------------------------
    # SAVINGS GOALS
    # --------------------------------------------------

    if (
        "savings goal" in question_lower
        or "saving goal" in question_lower
        or "emergency fund" in question_lower
        or "goal" in question_lower
    ):

        if not goals:

            return {
                "answer":
                    "No savings goals have been configured yet."
            }

        goal_lines = []

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

            if target > 0:
                progress = (
                    current / target
                ) * 100
            else:
                progress = 0

            goal_lines.append(
                f"{goal.name}: "
                f"{progress:.1f}% complete, "
                f"₹{remaining:,.2f} remaining"
            )

        return {
            "answer":
                "Savings goal status: "
                + "; ".join(goal_lines)
                + "."
        }

    # --------------------------------------------------
    # FALLBACK
    # --------------------------------------------------

    return {
        "answer":
            "I can help you with your income, expenses, "
            "balance, spending categories, subscriptions, "
            "budgets, savings goals, and upcoming payments."
    }