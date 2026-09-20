import React, { useEffect, useState } from "react";
import "./Obligations.css";

const API_URL =
  "https://janeen-boric-nontangibly.ngrok-free.dev";

function Obligations() {
  const [obligations, setObligations] = useState([]);
  const [totalUpcoming, setTotalUpcoming] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchObligations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/upcoming-obligations/`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load upcoming obligations"
        );
      }

      const data = await response.json();

      setObligations(
        data.obligations || []
      );

      setTotalUpcoming(
        data.total_upcoming_amount || 0
      );
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load upcoming obligations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObligations();
  }, []);

  return (
    <div className="obligations-page">

      <div className="obligations-header">
        <h1>Upcoming Obligations</h1>

        <p>
          Track recurring payments that may be
          due soon.
        </p>
      </div>

      <div className="upcoming-total-card">

        <span>
          Upcoming Payments
        </span>

        <strong>
          ₹
          {Number(
            totalUpcoming
          ).toLocaleString("en-IN")}
        </strong>

      </div>

      <div className="obligations-card">

        {loading && (
          <p>
            Loading upcoming payments...
          </p>
        )}

        {error && (
          <p className="obligation-error">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          obligations.length === 0 && (
            <div className="no-obligations">
              <h3>
                No Upcoming Payments
              </h3>

              <p>
                No recurring payments are
                expected within the next
                30 days.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          obligations.length > 0 && (
            <div className="obligation-list">

              {obligations.map(
                (obligation, index) => (
                  <div
                    className="obligation-item"
                    key={index}
                  >

                    <div className="obligation-info">

                      <h3>
                        {
                          obligation.description
                        }
                      </h3>

                      <span>
                        {
                          obligation.category
                        }
                        {" • "}
                        {
                          obligation.frequency
                        }
                      </span>

                    </div>

                    <div className="obligation-date">

                      <span>
                        Due
                      </span>

                      <strong>
                        {
                          obligation.next_due_date
                        }
                      </strong>

                      <small>
                        {
                          obligation.days_until_due
                        }{" "}
                        days
                      </small>

                    </div>

                    <div className="obligation-amount">

                      <strong>
                        ₹
                        {Number(
                          obligation.amount
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                      <span
                        className={`obligation-status ${obligation.status
                          .toLowerCase()
                          .replaceAll(
                            " ",
                            "-"
                          )}`}
                      >
                        {
                          obligation.status
                        }
                      </span>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

      </div>

    </div>
  );
}

export default Obligations;