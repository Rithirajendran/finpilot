import React, { useEffect, useState } from "react";
import "./Subscriptions.css";

const API_URL =
  "https://janeen-boric-nontangibly.ngrok-free.dev";

function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/subscriptions/`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch subscriptions");
        }

        return response.json();
      })
      .then((data) => {
        setSubscriptions(data.subscriptions || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load subscriptions.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="subscriptions-page">

      <div className="subscriptions-header">
        <h1>Subscriptions</h1>
        <p>
          Track your recurring payments and subscriptions
        </p>
      </div>

      <div className="subscription-card">

        {loading && (
          <p>Loading subscriptions...</p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {!loading && !error && subscriptions.length === 0 && (
          <p>No recurring subscriptions detected.</p>
        )}

        {!loading && !error && subscriptions.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Subscription</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Frequency</th>
                <th>Occurrences</th>
                <th>Latest Date</th>
              </tr>
            </thead>

            <tbody>
              {subscriptions.map((subscription, index) => (
                <tr key={index}>

                  <td>
                    <strong>
                      {subscription.description}
                    </strong>
                  </td>

                  <td>
                    <span className="subscription-category">
                      {subscription.category || "Other"}
                    </span>
                  </td>

                  <td>
                    ₹
                    {Number(subscription.amount).toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  <td>
                    <span className="frequency">
                      {subscription.frequency}
                    </span>
                  </td>

                  <td>
                    {subscription.occurrences}
                  </td>

                  <td>
                    {subscription.latest_date}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}

export default Subscriptions;