import React from "react";
import "./Transactions.css";

const transactions = [
  {
    date: "05 Sep",
    description: "Swiggy",
    category: "Food",
    amount: 450,
  },
  {
    date: "04 Sep",
    description: "Netflix",
    category: "Entertainment",
    amount: 649,
  },
  {
    date: "03 Sep",
    description: "Uber",
    category: "Transport",
    amount: 280,
  },
  {
    date: "02 Sep",
    description: "Amazon",
    category: "Shopping",
    amount: 1299,
  },
];

function Transactions() {
  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <h1>Transactions</h1>
        <p>View and manage your financial transactions</p>
      </div>

      <div className="transaction-card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.date}</td>

                <td>{transaction.description}</td>

                <td>
                  <span className="category">
                    {transaction.category}
                  </span>
                </td>

                <td>
                  ₹{transaction.amount.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Transactions;