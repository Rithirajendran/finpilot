import React, { useEffect, useState } from "react";
import "./Budgets.css";

const API_URL =
  "https://janeen-boric-nontangibly.ngrok-free.dev";

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [month, setMonth] = useState("2026-09");
  const [category, setCategory] = useState("Shopping");
  const [amount, setAmount] = useState("");

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/budgets/`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load budgets");
      }

      const data = await response.json();

      setBudgets(data.budgets || []);
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid budget amount.");
      return;
    }

    try {
      setError("");
      setMessage("");

      const url =
        `${API_URL}/api/budgets/` +
        `?month=${encodeURIComponent(month)}` +
        `&category=${encodeURIComponent(category)}` +
        `&amount=${encodeURIComponent(amount)}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to save budget");
      }

      setMessage(data.message);

      setAmount("");

      await fetchBudgets();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to save budget.");
    }
  };

  const handleDelete = async (budgetId) => {
    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/budgets/${budgetId}`,
        {
          method: "DELETE",
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete budget");
      }

      setMessage("Budget deleted successfully.");

      await fetchBudgets();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to delete budget.");
    }
  };

  const getProgressClass = (status) => {
    if (status === "Exceeded") {
      return "progress-exceeded";
    }

    if (status === "Warning") {
      return "progress-warning";
    }

    return "progress-safe";
  };

  return (
    <div className="budgets-page">

      <div className="budgets-header">
        <h1>Budgets</h1>
        <p>
          Set monthly spending limits and monitor your budget usage.
        </p>
      </div>

      <div className="budget-form-card">

        <h2>Create / Update Budget</h2>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Month</label>

            <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Category</label>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="Food">Food</option>
              <option value="Shopping">Shopping</option>
              <option value="Entertainment">
                Entertainment
              </option>
              <option value="Transport">Transport</option>
              <option value="Bills">Bills</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Monthly Budget</label>

            <input
              type="number"
              min="1"
              placeholder="Enter amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>

          <button type="submit" className="budget-submit-btn">
            Save Budget
          </button>

        </form>

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

      </div>

      <div className="budget-list-card">

        <div className="budget-list-header">
          <div>
            <h2>Budget Overview</h2>
            <p>
              Track your actual spending against your limits.
            </p>
          </div>
        </div>

        {loading && (
          <p className="loading-message">
            Loading budgets...
          </p>
        )}

        {!loading && budgets.length === 0 && (
          <div className="empty-budget">
            <h3>No budgets created yet</h3>
            <p>
              Create your first monthly budget above.
            </p>
          </div>
        )}

        {!loading && budgets.length > 0 && (
          <div className="budget-grid">

            {budgets.map((budget) => {

              const progress = Math.min(
                Number(budget.usage_percentage),
                100
              );

              return (
                <div
                  className="budget-card"
                  key={budget.id}
                >

                  <div className="budget-card-top">

                    <div>
                      <h3>{budget.category}</h3>

                      <span className="budget-month">
                        {budget.month}
                      </span>
                    </div>

                    <span
                      className={`budget-status ${budget.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {budget.status}
                    </span>

                  </div>

                  <div className="budget-amounts">

                    <div>
                      <span>Budget</span>
                      <strong>
                        ₹
                        {Number(
                          budget.budget
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div>
                      <span>Spent</span>
                      <strong>
                        ₹
                        {Number(
                          budget.actual_spending
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                  </div>

                  <div className="progress-section">

                    <div className="progress-label">

                      <span>
                        {budget.usage_percentage}% used
                      </span>

                      <span>
                        {budget.remaining >= 0
                          ? `₹${Number(
                              budget.remaining
                            ).toLocaleString("en-IN")} remaining`
                          : `₹${Math.abs(
                              Number(
                                budget.remaining
                              )
                            ).toLocaleString(
                              "en-IN"
                            )} over budget`}
                      </span>

                    </div>

                    <div className="progress-track">

                      <div
                        className={`progress-bar ${getProgressClass(
                          budget.status
                        )}`}
                        style={{
                          width: `${progress}%`,
                        }}
                      />

                    </div>

                  </div>

                  <button
                    className="delete-budget-btn"
                    onClick={() =>
                      handleDelete(budget.id)
                    }
                  >
                    Delete Budget
                  </button>

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