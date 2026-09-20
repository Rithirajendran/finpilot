from collections import defaultdict
from datetime import date

from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.goal import Goal

from app.services.recurring_detector import (
    detect_recurring_transactions
)

from app.services.upcoming_obligations import (
    get_upcoming_obligations
)

from app.services.unusual_spending import (
    detect_unusual_spending
)

from app.services.monthly_financial_summary import (
    generate_monthly_financial_summary
)


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

            category_totals[
                category
            ] += amount

    balance = (
        total_income
        - total_expenses
    )

    # ==================================================
    # RECURRING PAYMENTS
    # ==================================================

    recurring = detect_recurring_transactions(
        transactions
    )

    # ==================================================
    # UPCOMING OBLIGATIONS
    # ==================================================

    upcoming = get_upcoming_obligations(
        recurring,
        date.today()
    )

    # ==================================================
    # UNUSUAL SPENDING
    # ==================================================

    unusual_transactions = detect_unusual_spending(
        transactions
    )

    # ==================================================
    # MONTHLY FINANCIAL SUMMARY
    # ==================================================

    monthly_financial_summary = (
        generate_monthly_financial_summary(
            transactions=transactions,
            budgets=budgets,
            goals=goals,
            subscriptions=recurring,
            obligations=upcoming,
            unusual_transactions=unusual_transactions
        )
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
        "unusual_transactions": unusual_transactions,
        "monthly_financial_summary": monthly_financial_summary,
    }


def calculate_expense_comparison(
    transactions
):

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

        month = transaction.date.strftime(
            "%Y-%m"
        )

        category = (
            transaction.category
            or "Other"
        )

        monthly_expenses[
            month
        ] += amount

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
            "current_expenses": (
                round(
                    monthly_expenses[
                        months[-1]
                    ],
                    2
                )
                if months
                else 0
            ),
            "previous_expenses": 0,
            "change": 0,
            "change_percentage": 0,
            "increases": [],
            "decreases": [],
        }

    previous_month = months[-2]
    current_month = months[-1]

    previous_expenses = (
        monthly_expenses[
            previous_month
        ]
    )

    current_expenses = (
        monthly_expenses[
            current_month
        ]
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
                previous_month
            ].keys()
        )
        |
        set(
            monthly_category_expenses[
                current_month
            ].keys()
        )
    )

    increases = []
    decreases = []

    for category in all_categories:

        previous_amount = (
            monthly_category_expenses[
                previous_month
            ].get(
                category,
                0
            )
        )

        current_amount = (
            monthly_category_expenses[
                current_month
            ].get(
                category,
                0
            )
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

        item = {
            "category": category,
            "previous_amount": round(
                previous_amount,
                2
            ),
            "current_amount": round(
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
        }

        if category_change > 0:

            increases.append(item)

        elif category_change < 0:

            decreases.append(item)

    increases.sort(
        key=lambda item: item["change"],
        reverse=True
    )

    decreases.sort(
        key=lambda item: item["change"]
    )

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
        "increases": increases,
        "decreases": decreases,
    }


def answer_finance_question(
    question,
    db
):

    question_lower = (
        question
        .lower()
        .strip()
    )

    context = get_financial_context(
        db
    )

    total_income = context[
        "total_income"
    ]

    total_expenses = context[
        "total_expenses"
    ]

    balance = context[
        "balance"
    ]

    category_totals = context[
        "category_totals"
    ]

    budgets = context[
        "budgets"
    ]

    goals = context[
        "goals"
    ]

    recurring = context[
        "recurring"
    ]

    upcoming = context[
        "upcoming"
    ]

    # ==================================================
    # MONTHLY FINANCIAL SUMMARY
    # ==================================================

    if (
        "monthly financial summary" in question_lower
        or "monthly summary" in question_lower
        or "summarize my finances" in question_lower
        or "summarize my financial" in question_lower
        or "financial summary" in question_lower
        or "how am i doing financially" in question_lower
    ):

        summary = context.get(
            "monthly_financial_summary"
        )

        if not summary:

            return {
                "answer": (
                    "I could not generate your monthly "
                    "financial summary because there is "
                    "not enough financial data."
                )
            }

        month = summary.get(
            "month",
            "the current month"
        )

        income = float(
            summary.get("income", 0) or 0
        )

        expenses = float(
            summary.get("expenses", 0) or 0
        )

        summary_balance = float(
            summary.get("balance", 0) or 0
        )

        top_category = summary.get(
            "top_category"
        )

        answer = (
            f"Here is your financial summary for "
            f"{month}:\n\n"
            f"Income: ₹{income:,.2f}\n"
            f"Expenses: ₹{expenses:,.2f}\n"
            f"Available balance: ₹{summary_balance:,.2f}\n"
        )

        if top_category:

            category = top_category.get(
                "category",
                "Unknown"
            )

            amount = float(
                top_category.get(
                    "amount",
                    0
                ) or 0
            )

            percentage = float(
                top_category.get(
                    "percentage",
                    0
                ) or 0
            )

            answer += (
                f"\nYour highest spending category is "
                f"{category} at "
                f"₹{amount:,.2f}, which represents "
                f"{percentage:.1f}% of your expenses.\n"
            )

        observations = summary.get(
            "observations",
            []
        ) or []

        if observations:

            answer += (
                "\nKey observations:\n"
            )

            for observation in observations:

                answer += (
                    f"- {observation}\n"
                )

        action_items = summary.get(
            "action_items",
            []
        ) or []

        if action_items:

            answer += (
                "\nSuggested actions:\n"
            )

            for action_item in action_items:

                answer += (
                    f"- {action_item}\n"
                )

        return {
            "answer": answer.strip()
        }

    # ==================================================
    # EXPENSE COMPARISON
    # ==================================================

    if (
        "which spending categories increased"
        in question_lower
        or "spending categories increased"
        in question_lower
        or "which expenses increased"
        in question_lower
        or "what expenses increased"
        in question_lower
        or "what spending increased"
        in question_lower
        or "expenses increased"
        in question_lower
        or "spending increased"
        in question_lower
        or "increased compared with last month"
        in question_lower
        or "increased compared to last month"
        in question_lower
    ):

        comparison = (
            calculate_expense_comparison(
                context["transactions"]
            )
        )

        current_month = comparison[
            "current_month"
        ]

        previous_month = comparison[
            "previous_month"
        ]

        if not previous_month:

            return {
                "answer":
                    "There is not enough historical "
                    "expense data to compare the "
                    "current month with the previous "
                    "month."
            }

        increases = comparison[
            "increases"
        ]

        if not increases:

            return {
                "answer":
                    f"No spending categories "
                    f"increased from "
                    f"{previous_month} to "
                    f"{current_month}."
            }

        lines = []

        for item in increases:

            if item["previous_amount"] == 0:

                lines.append(
                    f"{item['category']}: "
                    f"new spending of "
                    f"₹{item['current_amount']:,.2f}"
                )

            else:

                lines.append(
                    f"{item['category']}: "
                    f"₹{item['previous_amount']:,.2f} "
                    f"→ "
                    f"₹{item['current_amount']:,.2f} "
                    f"(+₹{item['change']:,.2f})"
                )

        overall_change = comparison[
            "change"
        ]

        if overall_change > 0:

            overall_text = (
                f"Overall expenses increased by "
                f"₹{overall_change:,.2f} "
                f"({comparison['change_percentage']:.2f}%)."
            )

        elif overall_change < 0:

            overall_text = (
                f"Overall expenses decreased by "
                f"₹{abs(overall_change):,.2f}."
            )

        else:

            overall_text = (
                "Overall expenses remained unchanged."
            )

        return {
            "answer":
                f"Spending increased in "
                f"{len(increases)} category/categories "
                f"from {previous_month} to "
                f"{current_month}:\n"
                + "\n".join(lines)
                + f"\n\n{overall_text}"
        }

    # ==================================================
    # BALANCE
    # ==================================================

    if "balance" in question_lower:

        return {
            "answer":
                f"Your recorded income minus "
                f"expenses is "
                f"₹{balance:,.2f}."
        }

    # ==================================================
    # TOTAL INCOME
    # ==================================================

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

    # ==================================================
    # TOTAL EXPENSES
    # ==================================================

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

    # ==================================================
    # HIGHEST SPENDING
    # ==================================================

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
                    "to identify a highest spending "
                    "category."
            }

        highest_category = max(
            category_totals,
            key=category_totals.get
        )

        highest_amount = (
            category_totals[
                highest_category
            ]
        )

        return {
            "answer":
                f"Your highest spending category "
                f"is {highest_category}, with "
                f"recorded expenses of "
                f"₹{highest_amount:,.2f}."
        }

    # ==================================================
    # CATEGORY QUESTIONS
    # ==================================================

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

                if (
                    existing_category.lower()
                    == category
                ):

                    matching_category = (
                        existing_category
                    )

                    break

            if matching_category:

                amount = (
                    category_totals[
                        matching_category
                    ]
                )

                return {
                    "answer":
                        f"Your recorded "
                        f"{matching_category} "
                        f"expenses are "
                        f"₹{amount:,.2f}."
                }

            return {
                "answer":
                    f"No recorded expenses were "
                    f"found for "
                    f"{category.title()}."
            }

    # ==================================================
    # SUBSCRIPTIONS
    # ==================================================

    if (
        "subscription" in question_lower
        or "recurring payment" in question_lower
        or "recurring payments" in question_lower
    ):

        if not recurring:

            return {
                "answer":
                    "No recurring payments were "
                    "detected from the current "
                    "transaction data."
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

    # ==================================================
    # UPCOMING PAYMENTS
    # ==================================================

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

    # ==================================================
    # BUDGET
    # ==================================================

    if (
        "budget" in question_lower
        or "committed" in question_lower
    ):

        if not budgets:

            return {
                "answer":
                    "No budgets have been configured "
                    "yet."
            }

        budget_lines = []

        for budget in budgets:

            actual = 0

            for transaction in context[
                "transactions"
            ]:

                if (
                    transaction.transaction_type
                    != "expense"
                ):
                    continue

                if (
                    transaction.category
                    != budget.category
                ):
                    continue

                if not transaction.date:
                    continue

                if (
                    transaction.date.strftime(
                        "%Y-%m"
                    )
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

            budget_lines.append(
                f"{budget.category}: "
                f"₹{actual:,.2f} spent of "
                f"₹{budget.amount:,.2f} "
                f"budget"
            )

            if remaining < 0:

                budget_lines[-1] += (
                    f" (₹{abs(remaining):,.2f} "
                    f"over budget)"
                )

            else:

                budget_lines[-1] += (
                    f" (₹{remaining:,.2f} "
                    f"remaining)"
                )

        return {
            "answer":
                "Budget status: "
                + "; ".join(
                    budget_lines
                )
                + "."
        }

    # ==================================================
    # SAVINGS GOALS
    # ==================================================

    if (
        "savings goal" in question_lower
        or "saving goal" in question_lower
        or "emergency fund" in question_lower
        or "goal" in question_lower
    ):

        if not goals:

            return {
                "answer":
                    "No savings goals have been "
                    "configured yet."
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
                    current
                    / target
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
                + "; ".join(
                    goal_lines
                )
                + "."
        }

    # ==================================================
    # FALLBACK
    # ==================================================

    return {
        "answer": (
            "I can help you with your income, expenses, "
            "balance, spending categories, subscriptions, "
            "budgets, savings goals, expense changes, "
            "monthly summaries, and upcoming payments."
        )
    }