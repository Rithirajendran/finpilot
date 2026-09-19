import React, { useEffect, useState } from "react";
import "./Transactions.css";

const API_URL =
  "https://janeen-boric-nontangibly.ngrok-free.dev";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/transactions/`,
        {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load transactions"
        );
      }

      setTransactions(data.transactions || []);
    } catch (err) {
      console.error("Transaction loading error:", err);
      setError(
        "Unable to load transactions. Please check the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="transactions-page">
        <div className="transactions-header">
          <div>
            <h1>Transactions</h1>
            <p>View and analyze your financial transactions</p>
          </div>
        </div>

        <div className="transactions-state">
          Loading transactions...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transactions-page">
        <div className="transactions-header">
          <div>
            <h1>Transactions</h1>
            <p>View and analyze your financial transactions</p>
          </div>
        </div>

        <div className="transactions-error">
          <div className="error-icon">!</div>
          <h3>Unable to load transactions</h3>
          <p>{error}</p>

          <button onClick={fetchTransactions}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="transactions-page">

      {/* Header */}
      <div className="transactions-header">
        <div>
          <h1>Transactions</h1>
          <p>
            View and analyze your financial transactions
          </p>
        </div>

        <div className="transaction-count">
          {transactions.length} Transactions
        </div>
      </div>

      {/* Summary */}
      <div className="transaction-summary">

        <div className="summary-card">
          <span>Total Transactions</span>
          <strong>
            {transactions.length}
          </strong>
        </div>

        <div className="summary-card income-card">
          <span>Income Transactions</span>
          <strong>
            {
              transactions.filter(
                (transaction) =>
                  transaction.transaction_type === "income"
              ).length
            }
          </strong>
        </div>

        <div className="summary-card expense-card">
          <span>Expense Transactions</span>
          <strong>
            {
              transactions.filter(
                (transaction) =>
                  transaction.transaction_type === "expense"
              ).length
            }
          </strong>
        </div>

      </div>

      {/* Table */}
      <div className="transactions-card">

        <div className="table-header">
          <div>
            <h2>Transaction History</h2>
            <p>
              Imported transactions from your financial
              statements
            </p>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="transactions-state">
            No transactions found.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="transactions-table">

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>

                    <td>
                      {formatDate(transaction.date)}
                    </td>

                    <td>
                      <div className="transaction-description">
                        {transaction.description}
                      </div>
                    </td>

                    <td>
                      <span className="category-badge">
                        {transaction.category || "Other"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`type-badge ${
                          transaction.transaction_type ===
                          "income"
                            ? "income"
                            : "expense"
                        }`}
                      >
                        {transaction.transaction_type ===
                        "income"
                          ? "Income"
                          : "Expense"}
                      </span>
                    </td>

                    <td
                      className={`amount ${
                        transaction.transaction_type ===
                        "income"
                          ? "income-amount"
                          : "expense-amount"
                      }`}
                    >
                      {transaction.transaction_type ===
                      "income"
                        ? "+"
                        : "-"}
                      {formatAmount(transaction.amount)}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>
    </div>
  );
}

export default Transactions;