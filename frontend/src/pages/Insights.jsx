import React, { useEffect, useState } from "react";
import "./Insights.css";

const API_URL =
  "https://janeen-boric-nontangibly.ngrok-free.dev";

function Insights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/financial-insights/`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load financial insights"
        );
      }

      setInsights(data.insights || []);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load financial insights."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getPriorityClass = (priority) => {
    if (priority === "high") return "high";
    if (priority === "medium") return "medium";
    return "low";
  };

  const getTypeLabel = (type) => {
    const labels = {
      spending: "Spending",
      budget: "Budget",
      goal: "Savings Goal",
      subscription: "Subscription",
      obligation: "Upcoming Payment",
    };

    return labels[type] || "Financial";
  };

  if (loading) {
    return (
      <div className="insights-page">
        <h1>Financial Insights</h1>
        <p className="page-subtitle">
          Understanding your financial patterns
        </p>

        <div className="insights-state">
          Analyzing your financial data...
        </div>
      </div>
    );
  }

  return (
    <div className="insights-page">

      <div className="insights-header">
        <div>
          <h1>Financial Insights</h1>
          <p className="page-subtitle">
            Actionable insights generated from your
            financial activity
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchInsights}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="insights-error">
          {error}
        </div>
      )}

      {!error && insights.length === 0 && (
        <div className="empty-insights">
          <div className="empty-icon">✦</div>

          <h2>No insights available</h2>

          <p>
            Add transactions, budgets, or savings goals
            to generate financial insights.
          </p>
        </div>
      )}

      <div className="insights-grid">

        {insights.map((insight, index) => (
          <div
            key={index}
            className={`insight-card ${getPriorityClass(
              insight.priority
            )}`}
          >

            <div className="insight-top">

              <span className="insight-type">
                {getTypeLabel(insight.type)}
              </span>

              <span
                className={`priority-badge ${getPriorityClass(
                  insight.priority
                )}`}
              >
                {insight.priority}
              </span>

            </div>

            <h2>{insight.title}</h2>

            <p>{insight.message}</p>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Insights;