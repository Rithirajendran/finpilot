import React, { useState } from "react";
import "./Settings.css";

function Settings() {
  const [currency, setCurrency] = useState("INR");
  const [notifications, setNotifications] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const saveSettings = () => {
    const settings = {
      currency,
      notifications,
      budgetAlerts,
    };

    localStorage.setItem(
      "finpilot_settings",
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="settings-page">

      <div className="settings-header">
        <h1>Settings</h1>

        <p>
          Manage your FinPilot preferences
        </p>
      </div>

      <div className="settings-container">

        {/* Currency */}

        <section className="settings-card">

          <div className="settings-title">
            <h2>Currency</h2>

            <p>
              Choose the currency used throughout
              your financial dashboard.
            </p>
          </div>

          <select
            value={currency}
            onChange={(event) =>
              setCurrency(event.target.value)
            }
          >
            <option value="INR">
              Indian Rupee (₹)
            </option>

            <option value="USD">
              US Dollar ($)
            </option>

            <option value="EUR">
              Euro (€)
            </option>
          </select>

        </section>

        {/* Notifications */}

        <section className="settings-card">

          <div className="settings-title">
            <h2>Notifications</h2>

            <p>
              Control financial alerts and reminders.
            </p>
          </div>

          <div className="setting-row">

            <div>
              <strong>Financial Notifications</strong>

              <span>
                Receive important financial alerts.
              </span>
            </div>

            <label className="switch">

              <input
                type="checkbox"
                checked={notifications}
                onChange={(event) =>
                  setNotifications(
                    event.target.checked
                  )
                }
              />

              <span className="slider"></span>

            </label>

          </div>

          <div className="setting-row">

            <div>
              <strong>Budget Alerts</strong>

              <span>
                Get notified when spending approaches
                or exceeds a budget.
              </span>
            </div>

            <label className="switch">

              <input
                type="checkbox"
                checked={budgetAlerts}
                onChange={(event) =>
                  setBudgetAlerts(
                    event.target.checked
                  )
                }
              />

              <span className="slider"></span>

            </label>

          </div>

        </section>

        {/* Privacy */}

        <section className="settings-card">

          <div className="settings-title">
            <h2>Privacy & Data</h2>

            <p>
              FinPilot processes your uploaded financial
              data to generate analysis and insights.
            </p>
          </div>

          <div className="privacy-box">
            <strong>Your financial data</strong>

            <p>
              Uploaded transaction data is stored in the
              FinPilot application database and is used
              to calculate summaries, budgets, goals,
              recurring payments, and financial insights.
            </p>
          </div>

        </section>

        {/* AI disclaimer */}

        <section className="settings-card">

          <div className="settings-title">
            <h2>AI Assistant</h2>

            <p>
              Information about FinPilot's AI features.
            </p>
          </div>

          <div className="privacy-box">

            <strong>
              Decision-support only
            </strong>

            <p>
              FinPilot provides financial summaries,
              spending analysis, and decision-support
              information based on your recorded data.
              It does not provide investment or
              financial advice.
            </p>

          </div>

        </section>

        {/* Save */}

        <div className="settings-actions">

          {saved && (
            <span className="saved-message">
              Settings saved
            </span>
          )}

          <button
            onClick={saveSettings}
            className="save-settings"
          >
            Save Settings
          </button>

        </div>

      </div>

    </div>
  );
}

export default Settings;