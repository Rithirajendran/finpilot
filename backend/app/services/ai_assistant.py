from collections import defaultdict
from datetime import date

from app.services.recurring_detector import (
    detect_recurring_transactions
)

from app.services.upcoming_obligations import (
    get_upcoming_obligations
)

from app.services.monthly_financial_summary import (
    generate_monthly_financial_summary
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


# ==========================================================
# FINANCIAL CONTEXT
# ==========================================================

def build_financial_context(
    transactions,
    budgets,
    goals
):
    total_income = 0
    total_expenses = 0

    category_totals = defaultdict(float)

    for transaction in transactions:
        amount = float(transaction.amount or 0)

        if transaction.transaction_type == "income":
            total_income += amount

        else:
            total_expenses += amount

            category = (
                transaction.category
                or "Other"
            )

            category_totals[category] += amount

    balance = total_income - total_expenses

    # ------------------------------------------------------
    # Recurring payments
    # ------------------------------------------------------

    recurring = detect_recurring_transactions(
        transactions
    )

    # ------------------------------------------------------
    # Upcoming obligations
    # ------------------------------------------------------

    upcoming = get_upcoming_obligations(
        recurring,
        date.today()
    )

    # ------------------------------------------------------
    # Unusual spending
    # ------------------------------------------------------

    unusual_transactions = detect_unusual_spending(
        transactions
    )

    # ------------------------------------------------------
    # Monthly financial summary
    # ------------------------------------------------------

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

    # ------------------------------------------------------
    # Goal impact
    # ------------------------------------------------------

    goal_impact = calculate_goal_impact(
        total_income=total_income,
        total_expenses=total_expenses,
        goals=goals
    )

    # ------------------------------------------------------
    # Cash-flow outlook
    # ------------------------------------------------------

    cash_flow_outlook = calculate_cash_flow_outlook(
        transactions=transactions,
        upcoming_obligations=upcoming,
        goals=goals
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

        "monthly_financial_summary":
            monthly_financial_summary,

        "goal_impact": goal_impact,

        "cash_flow_outlook":
            cash_flow_outlook
    }


# ==========================================================
# EXPENSE COMPARISON
# ==========================================================

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

        amount = float(transaction.amount or 0)

        month = transaction.date.strftime("%Y-%m")

        category = (
            transaction.category
            or "Other"
        )

        monthly_expenses[month] += amount

        monthly_category_expenses[
            month
        ][category] += amount

    months = sorted(monthly_expenses.keys())

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
                    monthly_expenses[months[-1]],
                    2
                )
                if months
                else 0
            ),
            "previous_expenses": 0,
            "change": 0,
            "change_percentage": 0,
            "increases": [],
            "decreases": []
        }

    previous_month = months[-2]
    current_month = months[-1]

    previous_expenses = monthly_expenses[
        previous_month
    ]

    current_expenses = monthly_expenses[
        current_month
    ]

    change = current_expenses - previous_expenses

    if previous_expenses > 0:
        change_percentage = (
            change / previous_expenses
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
            ].get(category, 0)
        )

        current_amount = (
            monthly_category_expenses[
                current_month
            ].get(category, 0)
        )

        category_change = (
            current_amount - previous_amount
        )

        if previous_amount > 0:
            category_change_percentage = (
                category_change / previous_amount
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
        "decreases": decreases
    }


# ==========================================================
# MAIN AI FUNCTION
# ==========================================================

def answer_financial_question(
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

    context = build_financial_context(
        transactions,
        budgets,
        goals
    )

    total_income = context["total_income"]

    total_expenses = context["total_expenses"]

    balance = context["balance"]

    category_totals = context["category_totals"]

    recurring = context["recurring"]

    upcoming = context["upcoming"]

    unusual_transactions = context.get(
        "unusual_transactions",
        []
    )

    # ======================================================
    # MONTHLY FINANCIAL SUMMARY
    # ======================================================

    if (
        "monthly financial summary"
        in question_lower
        or "monthly summary"
        in question_lower
        or "summarize my finances"
        in question_lower
        or "summarize my financial"
        in question_lower
        or "financial summary"
        in question_lower
        or "how am i doing financially"
        in question_lower
    ):
        summary = context.get(
            "monthly_financial_summary"
        )

        if not summary:
            return {
                "answer": (
                    "I could not generate your "
                    "monthly financial summary "
                    "because there is not enough "
                    "financial data."
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
            f"Here is your financial summary "
            f"for {month}:\n\n"
            f"Income: ₹{income:,.2f}\n"
            f"Expenses: ₹{expenses:,.2f}\n"
            f"Available balance: "
            f"₹{summary_balance:,.2f}\n"
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
                f"\nYour highest spending "
                f"category is {category} "
                f"at ₹{amount:,.2f}, "
                f"which represents "
                f"{percentage:.1f}% "
                f"of your expenses."
            )

        observations = summary.get(
            "observations",
            []
        ) or []

        if observations:
            answer += (
                "\n\nKey observations:\n"
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

    # ======================================================
    # CASH FLOW OUTLOOK
    # ======================================================

    if (
        "cash flow" in question_lower
        or "cashflow" in question_lower
        or "cash-flow" in question_lower
        or "projected balance" in question_lower
        or "projected cash" in question_lower
        or "future balance" in question_lower
        or "next 30 days" in question_lower
        or "next 30 day" in question_lower
        or "next month" in question_lower
        or "cover my upcoming payments"
        in question_lower
        or "afford my upcoming payments"
        in question_lower
        or "cash position"
        in question_lower
    ):
        cash_flow = context.get(
            "cash_flow_outlook"
        )

        if not cash_flow:
            return {
                "answer": (
                    "I could not calculate your "
                    "cash-flow outlook because "
                    "there is not enough financial "
                    "data."
                )
            }

        current_balance = float(
            cash_flow.get(
                "current_balance",
                balance
            ) or 0
        )

        upcoming_7_days = float(
            cash_flow.get(
                "upcoming_7_days_amount",
                0
            ) or 0
        )

        upcoming_30_days = float(
            cash_flow.get(
                "upcoming_30_days_amount",
                0
            ) or 0
        )

        projected_7_days = float(
            cash_flow.get(
                "projected_balance_7_days",
                current_balance
            ) or 0
        )

        projected_30_days = float(
            cash_flow.get(
                "projected_balance_30_days",
                current_balance
            ) or 0
        )

        goal_commitment = float(
            cash_flow.get(
                "goal_monthly_commitment",
                0
            ) or 0
        )

        status = cash_flow.get(
            "status",
            "Unknown"
        )

        observations = cash_flow.get(
            "observations",
            []
        ) or []

        answer = (
            "Here is your current cash-flow "
            "outlook:\n\n"
            f"Current recorded balance: "
            f"₹{current_balance:,.2f}\n"
            f"Upcoming obligations in 7 days: "
            f"₹{upcoming_7_days:,.2f}\n"
            f"Upcoming obligations in 30 days: "
            f"₹{upcoming_30_days:,.2f}\n"
            f"Projected balance after 7 days: "
            f"₹{projected_7_days:,.2f}\n"
            f"Projected balance after 30 days: "
            f"₹{projected_30_days:,.2f}\n"
            f"Monthly savings commitment: "
            f"₹{goal_commitment:,.2f}\n\n"
            f"Cash-flow status: {status}."
        )

        if observations:
            answer += (
                "\n\nKey observations:\n"
            )

            for observation in observations:
                answer += (
                    f"- {observation}\n"
                )

        return {
            "answer": answer.strip()
        }

    # ======================================================
    # UNUSUAL SPENDING
    # ======================================================

    if (
        "unusual spending" in question_lower
        or "unusual expense" in question_lower
        or "unusual expenses" in question_lower
        or "unusual transaction" in question_lower
        or "unusual transactions" in question_lower
        or "abnormal spending" in question_lower
        or "abnormal expense" in question_lower
        or "abnormal expenses" in question_lower
        or "suspicious spending" in question_lower
        or "suspicious expense" in question_lower
    ):
        if not unusual_transactions:
            return {
                "answer": (
                    "I did not find any unusual "
                    "spending patterns in your "
                    "recorded transactions."
                )
            }

        answer = (
            "I found the following unusual "
            "spending patterns:\n\n"
        )

        for item in unusual_transactions:

            description = item.get(
                "description",
                "Unknown transaction"
            )

            amount = float(
                item.get(
                    "amount",
                    0
                ) or 0
            )

            category = item.get(
                "category",
                "Other"
            )

            average = float(
                item.get(
                    "average_category_spending",
                    0
                ) or 0
            )

            transaction_date = item.get(
                "date",
                "Unknown date"
            )

            reason = item.get(
                "reason",
                "This transaction is higher "
                "than the usual spending pattern."
            )

            answer += (
                f"- {description}\n"
                f"  Amount: ₹{amount:,.2f}\n"
                f"  Category: {category}\n"
                f"  Date: {transaction_date}\n"
                f"  Usual category average: "
                f"₹{average:,.2f}\n"
                f"  Reason: {reason}\n\n"
            )

        return {
            "answer": answer.strip()
        }

    # ======================================================
    # EXPENSE COMPARISON
    # ======================================================

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
        comparison = calculate_expense_comparison(
            transactions
        )

        current_month = comparison[
            "current_month"
        ]

        previous_month = comparison[
            "previous_month"
        ]

        if not previous_month:
            return {
                "answer": (
                    "There is not enough "
                    "historical expense data "
                    "to compare the current "
                    "month with the previous "
                    "month."
                )
            }

        increases = comparison[
            "increases"
        ]

        if not increases:
            return {
                "answer": (
                    f"No spending categories "
                    f"increased from "
                    f"{previous_month} to "
                    f"{current_month}."
                )
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
                f"Overall expenses increased "
                f"by ₹{overall_change:,.2f} "
                f"({comparison['change_percentage']:.2f}%)."
            )

        elif overall_change < 0:
            overall_text = (
                f"Overall expenses decreased "
                f"by ₹{abs(overall_change):,.2f}."
            )

        else:
            overall_text = (
                "Overall expenses remained unchanged."
            )

        return {
            "answer": (
                f"Spending increased in "
                f"{len(increases)} "
                f"category/categories from "
                f"{previous_month} to "
                f"{current_month}:\n"
                + "\n".join(lines)
                + f"\n\n{overall_text}"
            )
        }

    # ======================================================
    # GOAL IMPACT
    # ======================================================

    if (
        "affecting my savings"
        in question_lower
        or "affect my savings"
        in question_lower
        or "affecting my goal"
        in question_lower
        or "affect my goal"
        in question_lower
        or "impact my savings"
        in question_lower
        or "impact my goal"
        in question_lower
        or "goal impact"
        in question_lower
        or "on track for my goal"
        in question_lower
        or "on track for my savings"
        in question_lower
        or "spending affecting"
        in question_lower
        or (
            "emergency fund"
            in question_lower
            and (
                "spending"
                in question_lower
                or "affect"
                in question_lower
                or "impact"
                in question_lower
                or "track"
                in question_lower
            )
        )
    ):
        goal_impact = context.get(
            "goal_impact",
            []
        )

        if not goal_impact:
            return {
                "answer": (
                    "No savings goals are "
                    "currently configured, "
                    "so I cannot analyze "
                    "the impact of your spending."
                )
            }

        first_goal = goal_impact[0]

        answer = (
            "Your current spending leaves "
            f"₹{first_goal['available_after_expenses']:,.2f} "
            "available after recorded expenses.\n\n"
            f"For your {first_goal['goal_name']} goal, "
            f"you need approximately "
            f"₹{first_goal['required_monthly_saving']:,.2f} "
            "per month to reach the target by "
            f"{first_goal['deadline']}.\n\n"
            f"Your goal is currently "
            f"{first_goal['impact_status'].lower()}."
        )

        return {
            "answer": answer
        }

    # ======================================================
    # BALANCE
    # ======================================================

    if "balance" in question_lower:
        return {
            "answer": (
                "Your recorded income minus "
                f"expenses is ₹{balance:,.2f}."
            )
        }

    # ======================================================
    # TOTAL INCOME
    # ======================================================

    if (
        "total income" in question_lower
        or "how much income" in question_lower
        or question_lower == "income"
    ):
        return {
            "answer": (
                "Your recorded total income is "
                f"₹{total_income:,.2f}."
            )
        }

    # ======================================================
    # TOTAL EXPENSES
    # ======================================================

    if (
        "total expenses" in question_lower
        or "how much did i spend"
        in question_lower
        or "total spending"
        in question_lower
    ):
        return {
            "answer": (
                "Your recorded total expenses are "
                f"₹{total_expenses:,.2f}."
            )
        }

    # ======================================================
    # HIGHEST SPENDING
    # ======================================================

    if (
        "spent the most" in question_lower
        or "spend the most" in question_lower
        or "highest spending" in question_lower
        or "highest expense" in question_lower
    ):
        if not category_totals:
            return {
                "answer": (
                    "There is not enough expense "
                    "data to identify a highest "
                    "spending category."
                )
            }

        highest_category = max(
            category_totals,
            key=category_totals.get
        )

        highest_amount = category_totals[
            highest_category
        ]

        return {
            "answer": (
                "Your highest spending category "
                f"is {highest_category}, with "
                f"recorded expenses of "
                f"₹{highest_amount:,.2f}."
            )
        }

    # ======================================================
    # CATEGORY QUESTIONS
    # ======================================================

    categories = [
        "food",
        "shopping",
        "transport",
        "entertainment",
        "bills",
        "health",
        "education",
        "other"
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

                amount = category_totals[
                    matching_category
                ]

                return {
                    "answer": (
                        f"Your recorded "
                        f"{matching_category} "
                        f"expenses are "
                        f"₹{amount:,.2f}."
                    )
                }

            return {
                "answer": (
                    "No recorded expenses were "
                    f"found for {category.title()}."
                )
            }

    # ======================================================
    # SUBSCRIPTIONS
    # ======================================================

    if (
        "subscription" in question_lower
        or "recurring payment" in question_lower
        or "recurring payments" in question_lower
    ):
        if not recurring:
            return {
                "answer": (
                    "No recurring payments were "
                    "detected from the current "
                    "transaction data."
                )
            }

        names = []

        for item in recurring:
            names.append(
                f"{item['description']} "
                f"(₹{item['amount']:,.2f}, "
                f"{item['frequency']})"
            )

        return {
            "answer": (
                "Detected recurring payments: "
                + ", ".join(names)
                + "."
            )
        }

    # ======================================================
    # UPCOMING PAYMENTS
    # ======================================================

    if (
        "upcoming" in question_lower
        or "coming up" in question_lower
        or "payments coming" in question_lower
        or "next payment" in question_lower
    ):
        if not upcoming:
            return {
                "answer": (
                    "No upcoming recurring "
                    "payments were identified "
                    "within the next 30 days."
                )
            }

        items = []

        for item in upcoming:
            items.append(
                f"{item['description']} "
                f"(₹{item['amount']:,.2f}) "
                f"on {item['next_due_date']}"
            )

        return {
            "answer": (
                "Upcoming payments: "
                + ", ".join(items)
                + "."
            )
        }

    # ======================================================
    # BUDGET
    # ======================================================

    if (
        "budget" in question_lower
        or "committed" in question_lower
    ):
        if not budgets:
            return {
                "answer": (
                    "No budgets have been "
                    "configured yet."
                )
            }

        budget_lines = []

        for budget in budgets:

            actual = 0

            for transaction in context["transactions"]:

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
                f"₹{budget.amount:,.2f} budget"
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
            "answer": (
                "Budget status: "
                + "; ".join(budget_lines)
                + "."
            )
        }

    # ======================================================
    # SAVINGS GOALS
    # ======================================================

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
        if not goals:
            return {
                "answer": (
                    "No savings goals have "
                    "been configured yet."
                )
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
            "answer": (
                "Savings goal status: "
                + "; ".join(goal_lines)
                + "."
            )
        }

    # ======================================================
    # FALLBACK
    # ======================================================

    return {
        "answer": (
            "I can help you with your income, "
            "expenses, balance, spending categories, "
            "subscriptions, budgets, savings goals, "
            "expense changes, monthly summaries, "
            "goal impact, cash flow, unusual spending, "
            "and upcoming payments."
        )
    }