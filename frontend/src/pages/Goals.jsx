import React, { useEffect, useState } from "react";
import "./Goals.css";

const API_URL =
  "https://janeen-boric-nontangibly.ngrok-free.dev";

function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [goalType, setGoalType] = useState("Savings Goal");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/goals/`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load goals");
      }

      const data = await response.json();
      setGoals(data.goals || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load savings goals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!name.trim()) {
      setError("Please enter a goal name.");
      return;
    }

    if (!targetAmount || Number(targetAmount) <= 0) {
      setError("Please enter a valid target amount.");
      return;
    }

    if (
      currentAmount === "" ||
      Number(currentAmount) < 0
    ) {
      setError("Please enter a valid current amount.");
      return;
    }

    if (Number(currentAmount) > Number(targetAmount)) {
      setError("Current amount cannot exceed target amount.");
      return;
    }

    try {
      const params = new URLSearchParams({
        name: name,
        goal_type: goalType,
        target_amount: targetAmount,
        current_amount: currentAmount,
      });

      if (deadline) {
        params.append("deadline", deadline);
      }

      const response = await fetch(
        `${API_URL}/api/goals/?${params.toString()}`,
        {
          method: "POST",
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to create goal"
        );
      }

      setMessage("Savings goal created successfully.");

      setName("");
      setGoalType("Savings Goal");
      setTargetAmount("");
      setCurrentAmount("");
      setDeadline("");

      await fetchGoals();
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Unable to create savings goal."
      );
    }
  };

  const handleUpdateSavings = async (goal) => {
    const value = window.prompt(
      `Enter current savings for "${goal.name}":`,
      goal.current_amount
    );

    if (value === null) {
      return;
    }

    const currentAmount = Number(value);

    if (
      Number.isNaN(currentAmount) ||
      currentAmount < 0
    ) {
      setError("Please enter a valid amount.");
      return;
    }

    if (currentAmount > goal.target_amount) {
      setError(
        "Current savings cannot exceed the target amount."
      );
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/goals/${goal.id}?current_amount=${encodeURIComponent(
          currentAmount
        )}`,
        {
          method: "PUT",
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to update goal"
        );
      }

      setMessage("Savings amount updated successfully.");

      await fetchGoals();
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Unable to update savings."
      );
    }
  };

  const handleDeleteGoal = async (goalId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this goal?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/goals/${goalId}`,
        {
          method: "DELETE",
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to delete goal"
        );
      }

      setMessage("Savings goal deleted successfully.");

      await fetchGoals();
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Unable to delete goal."
      );
    }
  };

  return (
    <div className="goals-page">

      <div className="goals-header">
        <h1>Savings Goals</h1>

        <p>
          Set financial goals and track your progress
          toward them.
        </p>
      </div>

      {/* CREATE GOAL */}

      <div className="goal-form-card">

        <h2>Create Savings Goal</h2>

        <form onSubmit={handleCreateGoal}>

          <div className="goal-form-group">
            <label>Goal Name</label>

            <input
              type="text"
              placeholder="Example: Emergency Fund"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
            />
          </div>

          <div className="goal-form-group">
            <label>Goal Type</label>

            <select
              value={goalType}
              onChange={(event) =>
                setGoalType(event.target.value)
              }
            >
              <option value="Savings Goal">
                Savings Goal
              </option>

              <option value="Emergency Fund">
                Emergency Fund
              </option>

              <option value="Travel">
                Travel
              </option>

              <option value="Education">
                Education
              </option>

              <option value="Purchase">
                Purchase
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>

          <div className="goal-form-group">
            <label>Target Amount</label>

            <input
              type="number"
              min="1"
              placeholder="₹100000"
              value={targetAmount}
              onChange={(event) =>
                setTargetAmount(event.target.value)
              }
            />
          </div>

          <div className="goal-form-group">
            <label>Current Savings</label>

            <input
              type="number"
              min="0"
              placeholder="₹25000"
              value={currentAmount}
              onChange={(event) =>
                setCurrentAmount(event.target.value)
              }
            />
          </div>

          <div className="goal-form-group">
            <label>Deadline</label>

            <input
              type="date"
              value={deadline}
              onChange={(event) =>
                setDeadline(event.target.value)
              }
            />
          </div>

          <button
            type="submit"
            className="goal-submit-btn"
          >
            Create Goal
          </button>

        </form>

        {message && (
          <div className="goal-success">
            {message}
          </div>
        )}

        {error && (
          <div className="goal-error">
            {error}
          </div>
        )}

      </div>

      {/* GOALS */}

      <div className="goal-list-card">

        <div className="goal-list-header">
          <h2>Your Goals</h2>

          <p>
            Monitor your savings progress and update
            your current savings.
          </p>
        </div>

        {loading && (
          <div className="goal-empty">
            Loading goals...
          </div>
        )}

        {!loading && goals.length === 0 && (
          <div className="goal-empty">
            <h3>No savings goals yet</h3>

            <p>
              Create your first savings goal above.
            </p>
          </div>
        )}

        {!loading && goals.length > 0 && (
          <div className="goals-grid">

            {goals.map((goal) => {

              const progress = Math.min(
                Number(goal.progress_percentage),
                100
              );

              return (
                <div
                  className="goal-card"
                  key={goal.id}
                >

                  <div className="goal-card-top">

                    <div>
                      <h3>{goal.name}</h3>

                      <span className="goal-type">
                        {goal.goal_type}
                      </span>
                    </div>

                    <span
                      className={`goal-status ${goal.status
                        .toLowerCase()
                        .replaceAll(" ", "-")}`}
                    >
                      {goal.status}
                    </span>

                  </div>

                  <div className="goal-amounts">

                    <div>
                      <span>Saved</span>

                      <strong>
                        ₹
                        {Number(
                          goal.current_amount
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div>
                      <span>Target</span>

                      <strong>
                        ₹
                        {Number(
                          goal.target_amount
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                  </div>

                  <div className="goal-progress">

                    <div className="goal-progress-label">

                      <span>
                        {goal.progress_percentage}%
                        completed
                      </span>

                      <span>
                        ₹
                        {Number(
                          goal.remaining
                        ).toLocaleString("en-IN")}
                        {" "}remaining
                      </span>

                    </div>

                    <div className="goal-progress-track">

                      <div
                        className="goal-progress-bar"
                        style={{
                          width: `${progress}%`,
                        }}
                      />

                    </div>

                  </div>

                  <div className="goal-deadline">

                    <span>Deadline</span>

                    <strong>
                      {goal.deadline || "No deadline"}
                    </strong>

                  </div>

                  <div className="goal-actions">

                    <button
                      onClick={() =>
                        handleUpdateSavings(goal)
                      }
                    >
                      Update Savings
                    </button>

                    <button
                      className="delete-goal-btn"
                      onClick={() =>
                        handleDeleteGoal(goal.id)
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

export default Goals;