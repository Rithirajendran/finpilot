import React, { useEffect, useState } from "react";
import "./MonthlyFinancialSummary.css";

const API_URL =
  "https://janeen-boric-nontangibly.ngrok-free.dev";

function MonthlyFinancialSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/monthly-financial-summary/`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail ||
            "Failed to load monthly summary"
        );
      }

      setSummary(result.summary);
    } catch (err) {
      console.error(err);
      setError("Unable to load monthly summary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const formatAmount = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatMonth = (month) => {
    if (!month) return "-";

    const [year, monthNumber] =
      month.split("-");

    const date = new Date(
      Number(year),
      Number(monthNumber) - 1
    );

    return date.toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <div className="monthly-summary-page">
        <h1>Monthly Financial Summary</h1>

        <div className="summary-state">
          Analyzing your finances...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="monthly-summary-page">
        <h1>Monthly Financial Summary</h1>

        <div className="summary-error">
          <h3>Unable to load summary</h3>
          <p>{error}</p>

          <button onClick={fetchSummary}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="monthly-summary-page">

      {/* Header */}

      <div className="summary-header">

        <div>
          <h1>
            Monthly Financial Summary
          </h1>

          <p>
            A simple overview of your latest
            financial activity and what needs
            your attention.
          </p>
        </div>

        <button
          className="summary-refresh"
          onClick={fetchSummary}
        >
          Refresh
        </button>

      </div>


      {/* Month */}

      <div className="summary-month">
        {formatMonth(summary.month)}
      </div>


      {/* Financial overview */}

      <div className="summary-overview">

        <div className="summary-card income-card">

          <span>
            Income
          </span>

          <strong>
            {formatAmount(summary.income)}
          </strong>

          <small>
            Total recorded income
          </small>

        </div>


        <div className="summary-card expense-card">

          <span>
            Expenses
          </span>

          <strong>
            {formatAmount(summary.expenses)}
          </strong>

          <small>
            Total recorded spending
          </small>

        </div>


        <div className="summary-card balance-card">

          <span>
            Balance
          </span>

          <strong
            className={
              summary.balance >= 0
                ? "positive"
                : "negative"
            }
          >
            {formatAmount(summary.balance)}
          </strong>

          <small>
            Income minus expenses
          </small>

        </div>

      </div>


      {/* Top spending category */}

      {summary.top_category && (
        <div className="top-category-card">

          <div>
            <span>
              Largest Spending Category
            </span>

            <h2>
              {summary.top_category.category}
            </h2>
          </div>

          <div className="top-category-amount">

            <strong>
              {formatAmount(
                summary.top_category.amount
              )}
            </strong>

            <small>
              {summary.top_category.percentage}%
              {" "}of total expenses
            </small>

          </div>

        </div>
      )}


      {/* Category breakdown */}

      {summary.category_breakdown?.length > 0 && (
        <div className="summary-section">

          <div className="section-heading">

            <h2>
              Spending Breakdown
            </h2>

            <p>
              Where your recorded expenses went
              this month.
            </p>

          </div>


          <div className="category-summary-list">

            {summary.category_breakdown.map(
              (item) => (
                <div
                  className="category-summary-row"
                  key={item.category}
                >

                  <div className="category-summary-name">
                    <strong>
                      {item.category}
                    </strong>

                    <span>
                      {item.percentage}%
                    </span>
                  </div>


                  <div className="category-summary-bar">

                    <div
                      className="category-summary-fill"
                      style={{
                        width: `${Math.min(
                          item.percentage,
                          100
                        )}%`,
                      }}
                    />

                  </div>


                  <strong className="category-summary-value">
                    {formatAmount(item.amount)}
                  </strong>

                </div>
              )
            )}

          </div>

        </div>
      )}


      {/* Observations */}

      <div className="summary-section">

        <div className="section-heading">

          <h2>
            What FinPilot Observed
          </h2>

          <p>
            Important patterns detected in your
            financial activity.
          </p>

        </div>


        <div className="observation-list">

          {summary.observations?.length > 0 ? (

            summary.observations.map(
              (observation, index) => (
                <div
                  className="observation-item"
                  key={index}
                >

                  <div className="observation-icon">
                    ✓
                  </div>

                  <p>
                    {observation}
                  </p>

                </div>
              )
            )

          ) : (

            <div className="empty-summary">
              No significant observations
              detected.
            </div>

          )}

        </div>

      </div>


      {/* Action items */}

      <div className="summary-section action-section">

        <div className="section-heading">

          <h2>
            Suggested Action Items
          </h2>

          <p>
            Practical areas to review based on
            your recorded financial activity.
          </p>

        </div>


        <div className="action-list">

          {summary.action_items?.length > 0 ? (

            summary.action_items.map(
              (action, index) => (
                <div
                  className="action-item"
                  key={index}
                >

                  <div className="action-number">
                    {index + 1}
                  </div>

                  <p>
                    {action}
                  </p>

                </div>
              )
            )

          ) : (

            <div className="empty-summary">
              No action items were generated.
            </div>

          )}

        </div>

      </div>


      {/* Activity indicators */}

      <div className="summary-section">

        <div className="section-heading">

          <h2>
            Financial Activity
          </h2>

        </div>


        <div className="activity-grid">

          <div className="activity-card">

            <strong>
              {summary.subscription_count}
            </strong>

            <span>
              Recurring Payments
            </span>

          </div>


          <div className="activity-card">

            <strong>
              {summary.upcoming_obligation_count}
            </strong>

            <span>
              Upcoming Obligations
            </span>

          </div>


          <div className="activity-card">

            <strong>
              {summary.unusual_spending_count}
            </strong>

            <span>
              Unusual Transactions
            </span>

          </div>


          <div className="activity-card">

            <strong>
              {summary.budget_exceeded_count}
            </strong>

            <span>
              Exceeded Budgets
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default MonthlyFinancialSummary;