import React, { useEffect, useState } from "react";
import "./Budgets.css";

const API_URL =
  "https://janeen-boric-nontangibly.ngrok-free.dev";

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [month, setMonth] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/budgets/`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Failed to load budgets"
        );
      }

      setBudgets(result.budgets || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load budgets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const addBudget = async (event) => {
    event.preventDefault();

    if (!month || !category || !amount) {
      alert("Please fill all budget fields.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/budgets/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            month,
            category,
            amount: Number(amount),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Failed to create budget"
        );
      }

      setMonth("");
      setCategory("");
      setAmount("");

      await fetchBudgets();

      alert("Budget created successfully.");
    } catch (err) {
      console.error(err);
      alert(err.message || "Unable to create budget.");
    }
  };

  const deleteBudget = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/budgets/${id}`,
        {
          method: "DELETE",
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Failed to delete budget"
        );
      }

      await fetchBudgets();
    } catch (err) {
      console.error(err);
      alert(err.message || "Unable to delete budget.");
    }
  };

  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const getStatusClass = (status) => {
    if (status === "Exceeded") {
      return "budget-status exceeded";
    }

    if (status === "Warning") {
      return "budget-status warning";
    }

    return "budget-status safe";
  };

  const getProgressWidth = (percentage) => {
    return Math.min(
      Math.max(Number(percentage || 0), 0),
      100
    );
  };

  const totalBudget = budgets.reduce(
    (sum, item) =>
      sum + Number(item.budget || 0),
    0
  );

  const totalSpending = budgets.reduce(
    (sum, item) =>
      sum + Number(item.actual_spending || 0),
    0
  );

  const totalRemaining = budgets.reduce(
    (sum, item) =>
      sum + Number(item.remaining || 0),
    0
  );

  const totalCommittedPercentage =
    totalBudget > 0
      ? (totalSpending / totalBudget) * 100
      : 0;

  if (loading) {
    return (
      <div className="budgets-page">
        <h1>Budgets</h1>

        <div className="budget-state">
          Loading your budgets...
        </div>
      </div>
    );
  }

  return (
    <div className="budgets-page">

      {/* Header */}

      <div className="budgets-header">

        <div>
          <h1>Budgets</h1>

          <p>
            Track your spending against your planned
            monthly budgets.
          </p>
        </div>

        <button
          className="budget-refresh"
          onClick={fetchBudgets}
        >
          Refresh
        </button>

      </div>


      {/* Error */}

      {error && (
        <div className="budget-error">
          {error}
        </div>
      )}


      {/* Budget commitment overview */}

      <div className="budget-overview">

        <div className="budget-overview-card">

          <span>
            Total Budget
          </span>

          <strong>
            {formatAmount(totalBudget)}
          </strong>

          <small>
            Planned spending
          </small>

        </div>


        <div className="budget-overview-card">

          <span>
            Committed Spending
          </span>

          <strong>
            {formatAmount(totalSpending)}
          </strong>

          <small>
            {totalCommittedPercentage.toFixed(1)}% of budget
          </small>

        </div>


        <div className="budget-overview-card">

          <span>
            Remaining
          </span>

          <strong
            className={
              totalRemaining < 0
                ? "amount-danger"
                : "amount-safe"
            }
          >
            {formatAmount(totalRemaining)}
          </strong>

          <small>
            Across all budgets
          </small>

        </div>

      </div>


      {/* Add budget */}

      <div className="budget-form-card">

        <div className="budget-card-heading">

          <div>
            <h2>
              Create Budget
            </h2>

            <p>
              Set a spending limit for a category.
            </p>
          </div>

        </div>


        <form
          className="budget-form"
          onSubmit={addBudget}
        >

          <div className="budget-field">

            <label>
              Month
            </label>

            <input
              type="month"
              value={month}
              onChange={(event) =>
                setMonth(event.target.value)
              }
            />

          </div>


          <div className="budget-field">

            <label>
              Category
            </label>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
            >

              <option value="">
                Select category
              </option>

              <option value="Food">
                Food
              </option>

              <option value="Shopping">
                Shopping
              </option>

              <option value="Transport">
                Transport
              </option>

              <option value="Bills">
                Bills
              </option>

              <option value="Entertainment">
                Entertainment
              </option>

              <option value="Health">
                Health
              </option>

              <option value="Education">
                Education
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          <div className="budget-field">

            <label>
              Budget Amount
            </label>

            <input
              type="number"
              min="1"
              step="0.01"
              placeholder="30000"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
            />

          </div>


          <button
            type="submit"
            className="add-budget-button"
          >
            Add Budget
          </button>

        </form>

      </div>


      {/* Budget commitment */}

      <div className="budget-list-card">

        <div className="budget-card-heading">

          <div>
            <h2>
              Budget Commitment
            </h2>

            <p>
              See how much of each budget has already
              been committed by actual spending.
            </p>
          </div>

        </div>


        {budgets.length === 0 ? (

          <div className="empty-budget">
            <h3>
              No budgets yet
            </h3>

            <p>
              Create your first monthly budget above.
            </p>
          </div>

        ) : (

          <div className="budget-list">

            {budgets.map((item) => {

              const percentage =
                Number(
                  item.usage_percentage || 0
                );

              const progressWidth =
                getProgressWidth(percentage);

              return (
                <div
                  className="budget-item"
                  key={item.id}
                >

                  <div className="budget-item-header">

                    <div>

                      <h3>
                        {item.category}
                      </h3>

                      <span>
                        {item.month}
                      </span>

                    </div>


                    <div
                      className={getStatusClass(
                        item.status
                      )}
                    >
                      {item.status}
                    </div>

                  </div>


                  <div className="budget-money">

                    <div>
                      <span>
                        Budget
                      </span>

                      <strong>
                        {formatAmount(
                          item.budget
                        )}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Spent
                      </span>

                      <strong>
                        {formatAmount(
                          item.actual_spending
                        )}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Remaining
                      </span>

                      <strong
                        className={
                          Number(
                            item.remaining
                          ) < 0
                            ? "amount-danger"
                            : "amount-safe"
                        }
                      >
                        {formatAmount(
                          item.remaining
                        )}
                      </strong>
                    </div>

                  </div>


                  {/* Progress */}

                  <div className="budget-progress-section">

                    <div className="budget-progress-info">

                      <span>
                        Budget committed
                      </span>

                      <strong>
                        {percentage.toFixed(1)}%
                      </strong>

                    </div>


                    <div className="budget-progress">

                      <div
                        className={`budget-progress-fill ${
                          percentage > 100
                            ? "progress-danger"
                            : percentage >= 80
                            ? "progress-warning"
                            : "progress-safe"
                        }`}
                        style={{
                          width: `${progressWidth}%`,
                        }}
                      />

                    </div>

                  </div>


                  <div className="budget-item-footer">

                    <span>
                      {percentage > 100
                        ? "Budget exceeded"
                        : percentage >= 80
                        ? "Approaching budget limit"
                        : "Within budget"}
                    </span>


                    <button
                      className="delete-budget"
                      onClick={() =>
                        deleteBudget(item.id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </div>

    </div>
  );
}

export default Budgets;