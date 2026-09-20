import React, { useEffect, useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import "./Dashboard.css";

const API_URL =
  "https://janeen-boric-nontangibly.ngrok-free.dev";

const COLORS = [
  "#f97316",
  "#a855f7",
  "#06b6d4",
  "#ec4899",
  "#22c55e",
  "#3b82f6",
  "#eab308",
  "#ef4444",
  "#14b8a6",
  "#8b5cf6",
];

function Dashboard() {
  /* =====================================================
     STATE
  ===================================================== */

  const [summary, setSummary] = useState(null);

  const [categories, setCategories] = useState([]);

  const [unusualSpending, setUnusualSpending] = useState([]);

  /* Monthly Summary */
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [monthlyLoading, setMonthlyLoading] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     FETCH DASHBOARD DATA
  ===================================================== */

  useEffect(() => {
    Promise.all([
      /* =================================================
         FINANCIAL SUMMARY
      ================================================= */

      fetch(`${API_URL}/api/summary/`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      }),

      /* =================================================
         SPENDING BY CATEGORY
      ================================================= */

      fetch(`${API_URL}/api/category-summary/`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      }),

      /* =================================================
         UNUSUAL SPENDING
      ================================================= */

      fetch(`${API_URL}/api/unusual-spending/`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      }),

      /* =================================================
         MONTHLY SUMMARY
      ================================================= */

      fetch(`${API_URL}/api/monthly-summary/`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      }),
    ])
      .then(
        async ([
          summaryResponse,
          categoryResponse,
          unusualResponse,
          monthlyResponse,
        ]) => {
          if (!summaryResponse.ok) {
            throw new Error(
              "Failed to fetch financial summary"
            );
          }

          if (!categoryResponse.ok) {
            throw new Error(
              "Failed to fetch category summary"
            );
          }

          if (!unusualResponse.ok) {
            throw new Error(
              "Failed to fetch unusual spending"
            );
          }

          if (!monthlyResponse.ok) {
            throw new Error(
              "Failed to fetch monthly summary"
            );
          }

          const summaryData =
            await summaryResponse.json();

          const categoryData =
            await categoryResponse.json();

          const unusualData =
            await unusualResponse.json();

          const monthlyData =
            await monthlyResponse.json();

          return {
            summaryData,
            categoryData,
            unusualData,
            monthlyData,
          };
        }
      )
      .then((data) => {
        /* Financial Summary */

        setSummary(data.summaryData);

        /* Category Summary */

        setCategories(
          data.categoryData.categories || []
        );

        /* Unusual Spending */

        setUnusualSpending(
          data.unusualData.unusual_transactions || []
        );

        /* Monthly Summary */

        setMonthlySummary(
          data.monthlyData.months || []
        );

        setLoading(false);
        setMonthlyLoading(false);
      })
      .catch((err) => {
        console.error(err);

        setError(
          "Unable to load financial dashboard."
        );

        setLoading(false);
        setMonthlyLoading(false);
      });
  }, []);

  /* =====================================================
     MONTHLY CHART DATA
  ===================================================== */

  const monthlyChartData = monthlySummary.map(
    (item) => {
      const [year, month] =
        item.month.split("-");

      const monthName = new Date(
        Number(year),
        Number(month) - 1
      ).toLocaleString("en-US", {
        month: "short",
      });

      return {
        month: monthName,
        expenses: Number(
          item.expenses || 0
        ),
        income: Number(
          item.income || 0
        ),
        balance: Number(
          item.balance || 0
        ),
      };
    }
  );

  /* =====================================================
     MONTHLY ANALYSIS
  ===================================================== */

  let monthlyInsight =
    "Not enough monthly data to compare spending.";

  let monthlyChange = null;

  let highestSpendingMonth = null;

  /*
     Compare the latest month with
     the previous month.
  */

  if (monthlySummary.length >= 2) {
    const currentMonth =
      monthlySummary[
        monthlySummary.length - 1
      ];

    const previousMonth =
      monthlySummary[
        monthlySummary.length - 2
      ];

    const currentExpenses =
      Number(currentMonth.expenses || 0);

    const previousExpenses =
      Number(previousMonth.expenses || 0);

    /*
       Calculate percentage change
    */

    if (previousExpenses > 0) {
      monthlyChange =
        ((currentExpenses - previousExpenses) /
          previousExpenses) *
        100;
    }

    /*
       Generate insight
    */

    if (
      currentExpenses >
      previousExpenses
    ) {
      monthlyInsight =
        "Your spending increased compared with the previous month.";
    } else if (
      currentExpenses <
      previousExpenses
    ) {
      monthlyInsight =
        "Your spending decreased compared with the previous month.";
    } else {
      monthlyInsight =
        "Your spending remained similar to the previous month.";
    }
  }

  /*
     Find the month with the highest
     spending.
  */

  if (monthlySummary.length > 0) {
    highestSpendingMonth =
      monthlySummary.reduce(
        (highest, current) => {
          const highestExpenses =
            Number(
              highest.expenses || 0
            );

          const currentExpenses =
            Number(
              current.expenses || 0
            );

          return currentExpenses >
            highestExpenses
            ? current
            : highest;
        }
      );
  }

  /* =====================================================
     FORMAT MONTH NAME
  ===================================================== */

  const formatMonth = (monthValue) => {
    if (!monthValue) {
      return "";
    }

    const [year, month] =
      monthValue.split("-");

    return new Date(
      Number(year),
      Number(month) - 1
    ).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1>Financial Dashboard</h1>

          <p>
            Loading your financial information...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1>Financial Dashboard</h1>

          <p>
            Overview of your income and spending
          </p>
        </div>

        <p className="error-message">
          {error}
        </p>
      </div>
    );
  }

  /* =====================================================
     DASHBOARD
  ===================================================== */

  return (
    <div className="dashboard-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dashboard-header">
        <h1>Financial Dashboard</h1>

        <p>
          Overview of your income and spending
        </p>
      </div>

      {/* =================================================
          FINANCIAL SUMMARY
      ================================================= */}

      <div className="summary-grid">

        {/* Total Income */}

        <div className="summary-card">
          <p>Total Income</p>

          <h2>
            ₹
            {Number(
              summary?.total_income || 0
            ).toLocaleString("en-IN")}
          </h2>
        </div>

        {/* Total Expenses */}

        <div className="summary-card">
          <p>Total Expenses</p>

          <h2>
            ₹
            {Number(
              summary?.total_expenses || 0
            ).toLocaleString("en-IN")}
          </h2>
        </div>

        {/* Balance */}

        <div className="summary-card">
          <p>Balance</p>

          <h2>
            ₹
            {Number(
              summary?.balance || 0
            ).toLocaleString("en-IN")}
          </h2>
        </div>

        {/* Transactions */}

        <div className="summary-card">
          <p>Transactions</p>

          <h2>
            {Number(
              summary?.transaction_count || 0
            ).toLocaleString("en-IN")}
          </h2>
        </div>

      </div>

      {/* =================================================
          SPENDING BY CATEGORY
      ================================================= */}

      <div className="category-section">

        <div className="category-header">
          <h2>Spending by Category</h2>

          <p>
            Understand where your money is going
          </p>
        </div>

        {categories.length === 0 ? (
          <p className="empty-message">
            No spending category data available.
          </p>
        ) : (
          <div className="category-content">

            {/* PIE CHART */}

            <div className="category-chart">

              <ResponsiveContainer
                width="100%"
                height={350}
              >

                <PieChart>

                  <Pie
                    data={categories}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={65}
                    paddingAngle={3}
                    label
                  >

                    {categories.map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            COLORS[
                              index %
                                COLORS.length
                            ]
                          }
                          stroke="#16181f"
                          strokeWidth={2}
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        "#111318",
                      border:
                        "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      color: "#f8fafc",
                      boxShadow:
                        "0 10px 30px rgba(0,0,0,0.35)",
                    }}
                    itemStyle={{
                      color: "#f8fafc",
                    }}
                    labelStyle={{
                      color: "#94a3b8",
                    }}
                    formatter={(value) =>
                      `₹${Number(
                        value
                      ).toLocaleString(
                        "en-IN"
                      )}`
                    }
                  />

                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => (
                      <span
                        style={{
                          color: "#cbd5e1",
                          fontSize: "12px",
                        }}
                      >
                        {value}
                      </span>
                    )}
                  />

                </PieChart>

              </ResponsiveContainer>

            </div>

            {/* CATEGORY LIST */}

            <div className="category-list">

              {categories.map(
                (category, index) => (
                  <div
                    className="category-item"
                    key={index}
                    style={{
                      "--category-color":
                        COLORS[
                          index %
                            COLORS.length
                        ],
                    }}
                  >

                    <div>

                      <strong>
                        {category.category}
                      </strong>

                      <p>
                        Spending
                      </p>

                    </div>

                    <span>
                      ₹
                      {Number(
                        category.amount || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </span>

                  </div>
                )
              )}

            </div>

          </div>
        )}

      </div>

      {/* =================================================
          MONTHLY SPENDING TREND
      ================================================= */}

      <div className="monthly-trend-section">

        <div className="monthly-header">

          <div>

            <h2>
              Monthly Spending Trend
            </h2>

            <p>
              Track how your income and expenses
              change over time
            </p>

          </div>

        </div>

        {monthlyLoading ? (

          <p className="empty-message">
            Loading monthly trends...
          </p>

        ) : monthlyChartData.length === 0 ? (

          <p className="empty-message">
            No monthly spending data available.
          </p>

        ) : (

          <>

            {/* =================================================
                LINE CHART
            ================================================= */}

            <div className="monthly-chart-container">

              <ResponsiveContainer
                width="100%"
                height={340}
              >

                <LineChart
                  data={monthlyChartData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 10,
                    bottom: 10,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.08)"
                  />

                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    stroke="#94a3b8"
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 12,
                    }}
                    tickFormatter={(value) =>
                      `₹${Number(
                        value
                      ).toLocaleString(
                        "en-IN"
                      )}`
                    }
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        "#111318",
                      border:
                        "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      color: "#f8fafc",
                      boxShadow:
                        "0 10px 30px rgba(0,0,0,0.35)",
                    }}
                    labelStyle={{
                      color: "#94a3b8",
                      marginBottom: "5px",
                    }}
                    formatter={(value) =>
                      `₹${Number(
                        value
                      ).toLocaleString(
                        "en-IN"
                      )}`
                    }
                  />

                  <Legend
                    verticalAlign="top"
                    height={36}
                    formatter={(value) => (
                      <span
                        style={{
                          color: "#cbd5e1",
                          fontSize: "12px",
                        }}
                      >
                        {value}
                      </span>
                    )}
                  />

                  <Line
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#f87171"
                    strokeWidth={3}
                    dot={{
                      r: 5,
                    }}
                    activeDot={{
                      r: 7,
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#4ade80"
                    strokeWidth={3}
                    dot={{
                      r: 5,
                    }}
                    activeDot={{
                      r: 7,
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

            {/* =================================================
                MONTHLY INSIGHT
            ================================================= */}

            <div className="monthly-insight">

              <div className="monthly-insight-icon">
                ↗
              </div>

              <div>

                <h3>
                  Monthly Insight
                </h3>

                <p>
                  {monthlyInsight}
                </p>

                {/* MONTHLY CHANGE */}

                {monthlyChange !== null && (
                  <p>
                    {monthlyChange > 0 ? (
                      <>
                        Your spending increased by{" "}
                        <strong>
                          {monthlyChange.toFixed(
                            1
                          )}
                          %
                        </strong>{" "}
                        compared with the
                        previous month.
                      </>
                    ) : monthlyChange < 0 ? (
                      <>
                        Your spending decreased by{" "}
                        <strong>
                          {Math.abs(
                            monthlyChange
                          ).toFixed(1)}
                          %
                        </strong>{" "}
                        compared with the
                        previous month.
                      </>
                    ) : (
                      <>
                        Your spending remained the
                        same as the previous month.
                      </>
                    )}
                  </p>
                )}

                {/* HIGHEST SPENDING MONTH */}

                {highestSpendingMonth && (
                  <p>
                    Your highest spending month so
                    far is{" "}
                    <strong>
                      {formatMonth(
                        highestSpendingMonth.month
                      )}
                    </strong>{" "}
                    with expenses of{" "}
                    <strong>
                      ₹
                      {Number(
                        highestSpendingMonth.expenses ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>.
                  </p>
                )}

              </div>

            </div>

          </>
        )}

      </div>

      {/* =================================================
          UNUSUAL SPENDING
      ================================================= */}

      <div className="unusual-section">

        <div className="unusual-header">

          <div>

            <h2>
              Unusual Spending
            </h2>

            <p>
              Transactions that are significantly
              higher than your usual spending pattern
            </p>

          </div>

          <div className="unusual-badge">

            {unusualSpending.length === 0
              ? "No Alerts"
              : `${unusualSpending.length} Alert${
                  unusualSpending.length > 1
                    ? "s"
                    : ""
                }`}

          </div>

        </div>

        {/* =================================================
            NO UNUSUAL SPENDING
        ================================================= */}

        {unusualSpending.length === 0 ? (

          <div className="no-unusual">

            <div className="no-unusual-icon">
              ✓
            </div>

            <div>

              <strong>
                No unusual spending detected
              </strong>

              <p>
                Your current transactions do not
                contain unusually high expenses.
              </p>

            </div>

          </div>

        ) : (

          /* =================================================
             UNUSUAL TRANSACTION LIST
          ================================================= */

          <div className="unusual-list">

            {unusualSpending.map(
              (transaction) => (

                <div
                  className="unusual-item"
                  key={transaction.id}
                >

                  <div className="unusual-icon">
                    !
                  </div>

                  <div className="unusual-info">

                    <strong>
                      {transaction.description}
                    </strong>

                    <span>
                      {transaction.category}
                    </span>

                    <p>
                      {transaction.reason}
                    </p>

                    <small>
                      {transaction.date}
                    </small>

                  </div>

                  <div className="unusual-amount">

                    <span>
                      Unusual
                    </span>

                    <strong>
                      ₹
                      {Number(
                        transaction.amount
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>

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

export default Dashboard;