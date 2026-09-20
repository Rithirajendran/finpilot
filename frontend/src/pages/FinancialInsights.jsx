import React, { useEffect, useState } from "react";
import "./FinancialInsights.css";

const API_URL =
  "https://janeen-boric-nontangibly.ngrok-free.dev";

function FinancialInsights() {

  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const fetchInsights = async () => {

      try {

        const response = await fetch(
          `${API_URL}/api/financial-insights/`,
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load financial insights"
          );
        }

        const data = await response.json();

        setInsights(
          data.insights || []
        );

      } catch (err) {

        console.error(err);

        setError(
          "Unable to load financial insights."
        );

      } finally {

        setLoading(false);

      }
    };

    fetchInsights();

  }, []);

  return (
    <div className="financial-insights-page">

      <div className="financial-insights-header">

        <h1>
          Financial Insights
        </h1>

        <p>
          FinPilot analyzes your spending,
          budgets, goals and recurring payments
          to highlight important financial signals.
        </p>

      </div>

      {loading && (
        <div className="insights-state">
          Analyzing your financial data...
        </div>
      )}

      {error && (
        <div className="insights-error">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        insights.length === 0 && (

          <div className="insights-state">

            <h3>
              No major insights yet
            </h3>

            <p>
              Continue adding financial data
              to receive useful insights.
            </p>

          </div>
        )}

      {!loading &&
        !error &&
        insights.length > 0 && (

          <div className="insights-grid">

            {insights.map(
              (insight, index) => (

                <div
                  className={`insight-card ${insight.priority}`}
                  key={index}
                >

                  <div className="insight-top">

                    <span className="insight-type">
                      {insight.type}
                    </span>

                    <span className="insight-priority">
                      {insight.priority}
                    </span>

                  </div>

                  <h2>
                    {insight.title}
                  </h2>

                  <p>
                    {insight.message}
                  </p>

                </div>

              )
            )}

          </div>
        )}

    </div>
  );
}

export default FinancialInsights;