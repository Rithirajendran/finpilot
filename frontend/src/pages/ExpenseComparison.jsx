import React, { useEffect, useState } from "react";
import "./ExpenseComparison.css";

const API_URL =
  "https://janeen-boric-nontangibly.ngrok-free.dev";

function ExpenseComparison() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchComparison = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/expense-comparison/`,
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
            "Failed to load expense comparison"
        );
      }

      setData(result);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load expense comparison."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
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
      <div className="comparison-page">
        <h1>Expense Comparison</h1>
        <div className="comparison-state">
          Analyzing your spending...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="comparison-page">
        <h1>Expense Comparison</h1>

        <div className="comparison-error">
          <h3>Unable to load comparison</h3>
          <p>{error}</p>

          <button onClick={fetchComparison}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isIncrease = data.change > 0;

  return (
    <div className="comparison-page">

      {/* Header */}

      <div className="comparison-header">

        <div>
          <h1>Expense Comparison</h1>

          <p>
            Understand how your spending changed
            compared with the previous month.
          </p>
        </div>

        <button
          className="refresh-comparison"
          onClick={fetchComparison}
        >
          Refresh
        </button>

      </div>


      {/* Main comparison */}

      <div className="comparison-overview">

        <div className="month-card">

          <span>
            {formatMonth(
              data.previous_month
            )}
          </span>

          <strong>
            {formatAmount(
              data.previous_expenses
            )}
          </strong>

          <small>
            Previous month
          </small>

        </div>


        <div className="comparison-arrow">
          →
        </div>


        <div className="month-card current">

          <span>
            {formatMonth(
              data.current_month
            )}
          </span>

          <strong>
            {formatAmount(
              data.current_expenses
            )}
          </strong>

          <small>
            Current month
          </small>

        </div>


        <div
          className={`change-card ${
            isIncrease
              ? "increase"
              : "decrease"
          }`}
        >

          <span>
            {isIncrease
              ? "Spending Increased"
              : "Spending Decreased"}
          </span>

          <strong>
            {isIncrease ? "+" : ""}
            {formatAmount(
              data.change
            )}
          </strong>

          <small>
            {isIncrease ? "+" : ""}
            {Number(
              data.change_percentage || 0
            ).toFixed(2)}
            %
          </small>

        </div>

      </div>


      {/* Monthly trend */}

      <div className="comparison-card">

        <div className="card-heading">

          <div>
            <h2>
              Monthly Spending
            </h2>

            <p>
              Recorded expenses over time
            </p>
          </div>

        </div>

        <div className="monthly-list">

          {data.monthly_comparison.map(
            (item) => {

              const maxExpense =
                Math.max(
                  ...data.monthly_comparison.map(
                    (month) =>
                      month.expenses
                  )
                );

              const width =
                maxExpense > 0
                  ? (item.expenses /
                      maxExpense) *
                    100
                  : 0;

              return (
                <div
                  className="monthly-row"
                  key={item.month}
                >

                  <div className="monthly-label">
                    {formatMonth(
                      item.month
                    )}
                  </div>

                  <div className="monthly-bar-area">

                    <div className="monthly-bar">
                      <div
                        className="monthly-bar-fill"
                        style={{
                          width: `${width}%`,
                        }}
                      />
                    </div>

                  </div>

                  <div className="monthly-value">
                    {formatAmount(
                      item.expenses
                    )}
                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>


      {/* Category comparison */}

      <div className="comparison-card">

        <div className="card-heading">

          <div>
            <h2>
              Category Changes
            </h2>

            <p>
              How each spending category
              changed from the previous month
            </p>
          </div>

        </div>


        <div className="category-grid">

          {data.category_comparison.map(
            (item) => {

              const increase =
                item.change > 0;

              const decrease =
                item.change < 0;

              return (
                <div
                  className="category-change-card"
                  key={item.category}
                >

                  <div className="category-change-top">

                    <h3>
                      {item.category}
                    </h3>

                    <span
                      className={
                        increase
                          ? "increase-text"
                          : decrease
                          ? "decrease-text"
                          : "neutral-text"
                      }
                    >
                      {increase
                        ? "↑"
                        : decrease
                        ? "↓"
                        : "—"}
                    </span>

                  </div>


                  <div className="category-amounts">

                    <div>
                      <span>
                        Previous
                      </span>

                      <strong>
                        {formatAmount(
                          item.previous_month_amount
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Current
                      </span>

                      <strong>
                        {formatAmount(
                          item.current_month_amount
                        )}
                      </strong>
                    </div>

                  </div>


                  <div className="category-change-value">

                    <strong
                      className={
                        increase
                          ? "increase-text"
                          : decrease
                          ? "decrease-text"
                          : "neutral-text"
                      }
                    >
                      {increase
                        ? "+"
                        : ""}
                      {formatAmount(
                        item.change
                      )}
                    </strong>

                    <span>
                      {item.previous_month_amount ===
                      0
                        ? "New spending"
                        : `${
                            increase
                              ? "+"
                              : ""
                          }${Number(
                            item.change_percentage ||
                              0
                          ).toFixed(2)}%`}
                    </span>

                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>


      {/* Biggest changes */}

      <div className="highlight-grid">

        {data.biggest_increase && (
          <div className="highlight-card">

            <span>
              Biggest Increase
            </span>

            <h2>
              {data.biggest_increase.category}
            </h2>

            <strong className="increase-text">
              +
              {formatAmount(
                data.biggest_increase.change
              )}
            </strong>

          </div>
        )}


        {data.biggest_decrease && (
          <div className="highlight-card">

            <span>
              Biggest Decrease
            </span>

            <h2>
              {data.biggest_decrease.category}
            </h2>

            <strong className="decrease-text">
              {formatAmount(
                data.biggest_decrease.change
              )}
            </strong>

          </div>
        )}

      </div>

    </div>
  );
}

export default ExpenseComparison;