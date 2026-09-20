import { useState } from "react";
import "./AIAssistant.css";

const API_URL =
  "https://janeen-boric-nontangibly.ngrok-free.dev";

/* =========================================================
   ANALYSIS HELPERS
   ========================================================= */

function buildAnalysisMeta(result) {
  const question = (
    result?.question || ""
  ).toLowerCase();

  const answer =
    result?.answer || "";

  /* -------------------------------------------------------
     If backend already provides structured data,
     use it directly.
  ------------------------------------------------------- */

  if (
    result?.key_finding ||
    result?.suggested_action ||
    (
      Array.isArray(result?.evidence) &&
      result.evidence.length > 0
    )
  ) {
    return {
      keyFinding:
        result.key_finding ||
        "FinPilot identified a relevant financial pattern from your recorded data.",

      suggestedAction:
        result.suggested_action ||
        "Review the supporting information and use it to guide your next financial decision.",

      evidence:
        Array.isArray(result.evidence)
          ? result.evidence
          : []
    };
  }

  /* =======================================================
     CASH FLOW
  ======================================================= */

  if (
    question.includes("cash flow") ||
    question.includes("cashflow") ||
    question.includes("projected balance") ||
    question.includes("next 30 days") ||
    question.includes("next month")
  ) {
    const projectedMatch =
      answer.match(
        /Projected balance after 30 days:\s*₹([\d,]+\.\d+)/
      );

    const obligationMatch =
      answer.match(
        /Upcoming obligations in 30 days:\s*₹([\d,]+\.\d+)/
      );

    const commitmentMatch =
      answer.match(
        /Monthly savings commitment:\s*₹([\d,]+\.\d+)/
      );

    const projectedBalance =
      projectedMatch
        ? projectedMatch[1]
        : null;

    const upcoming =
      obligationMatch
        ? obligationMatch[1]
        : null;

    const commitment =
      commitmentMatch
        ? commitmentMatch[1]
        : null;

    return {
      keyFinding:
        projectedBalance
          ? `Your projected balance after 30 days is ₹${projectedBalance}.`
          : "Your current cash-flow position is based on recorded income, expenses and upcoming obligations.",

      suggestedAction:
        upcoming && commitment
          ? `Keep ₹${upcoming} available for upcoming obligations and continue tracking the ₹${commitment} monthly savings commitment.`
          : "Continue monitoring upcoming payments and your monthly savings commitment.",

      evidence: [
        projectedBalance
          ? `Projected 30-day balance: ₹${projectedBalance}`
          : "Projected 30-day balance is available in the cash-flow analysis.",

        upcoming
          ? `Upcoming obligations in 30 days: ₹${upcoming}`
          : "Upcoming recurring obligations were included in the analysis.",

        commitment
          ? `Monthly savings commitment: ₹${commitment}`
          : "Savings-goal commitments were considered."
      ]
    };
  }

  /* =======================================================
     UNUSUAL SPENDING
  ======================================================= */

  if (
    question.includes("unusual spending") ||
    question.includes("unusual expense") ||
    question.includes("abnormal spending") ||
    question.includes("unusual transaction")
  ) {
    return {
      keyFinding:
        answer.includes("No unusual")
          ? "No unusual spending pattern was identified in the recorded transactions."
          : "FinPilot is checking your spending patterns for transactions that are significantly higher than your usual category spending.",

      suggestedAction:
        answer.includes("No unusual")
          ? "Continue monitoring your spending and review new transactions regularly."
          : "Review the flagged transaction(s) and confirm whether the spending was intentional.",

      evidence: [
        "Spending was compared against recorded category-level transaction patterns.",
        "Transactions with unusually high amounts are considered for review.",
        "The analysis is based only on transactions currently stored in FinPilot."
      ]
    };
  }

  /* =======================================================
     HIGHEST SPENDING
  ======================================================= */

  if (
    question.includes("spent the most") ||
    question.includes("spend the most") ||
    question.includes("highest spending") ||
    question.includes("highest expense")
  ) {
    return {
      keyFinding:
        answer.replace(
          "Your highest spending category is ",
          "Highest spending category: "
        ),

      suggestedAction:
        "Review this category first if you want to identify areas where your spending could be reduced.",

      evidence: [
        "Category totals were calculated from your recorded expense transactions.",
        "Income transactions were excluded from spending-category totals.",
        "The category with the highest recorded expense amount was identified."
      ]
    };
  }

  /* =======================================================
     SUBSCRIPTIONS
  ======================================================= */

  if (
    question.includes("subscription") ||
    question.includes("recurring payment") ||
    question.includes("recurring payments")
  ) {
    return {
      keyFinding:
        answer,

      suggestedAction:
        "Review each recurring payment and keep only the subscriptions or services you still use.",

      evidence: [
        "Recurring transactions were identified from repeated transaction descriptions and dates.",
        "Only recurring expense patterns detected from your recorded data are shown.",
        "The detected frequency and average amount are used for the recurring-payment analysis."
      ]
    };
  }

  /* =======================================================
     UPCOMING PAYMENTS
  ======================================================= */

  if (
    question.includes("upcoming") ||
    question.includes("coming up") ||
    question.includes("next payment")
  ) {
    return {
      keyFinding:
        answer,

      suggestedAction:
        "Keep enough balance available for the upcoming recurring payments shown in the analysis.",

      evidence: [
        "Upcoming payments are estimated from detected recurring transactions.",
        "The next expected payment date is calculated from the detected payment frequency.",
        "Only obligations identified within the supported upcoming-payment window are shown."
      ]
    };
  }

  /* =======================================================
     BUDGET
  ======================================================= */

  if (
    question.includes("budget") ||
    question.includes("committed")
  ) {
    return {
      keyFinding:
        answer,

      suggestedAction:
        "Review categories that are close to or above their budget and adjust future spending where necessary.",

      evidence: [
        "Budget limits were compared with recorded category expenses.",
        "Actual spending is calculated from transactions matching the budget month and category.",
        "Remaining or exceeded budget amounts are included in the analysis."
      ]
    };
  }

  /* =======================================================
     SAVINGS GOALS
  ======================================================= */

  if (
    question.includes("savings goal") ||
    question.includes("saving goal") ||
    question === "goal" ||
    question.includes("my goals")
  ) {
    return {
      keyFinding:
        answer,

      suggestedAction:
        "Continue tracking progress toward each savings goal and maintain contributions according to the target timeline.",

      evidence: [
        "Goal progress is calculated from the configured target and current amount.",
        "Remaining goal amount is calculated from target minus current progress.",
        "Configured deadlines are used when available."
      ]
    };
  }

  /* =======================================================
     GOAL IMPACT
  ======================================================= */

  if (
    question.includes("affect my savings") ||
    question.includes("affect my goal") ||
    question.includes("impact my savings") ||
    question.includes("impact my goal") ||
    question.includes("goal impact") ||
    question.includes("on track")
  ) {
    return {
      keyFinding:
        answer,

      suggestedAction:
        "Compare your available balance with the required monthly contribution and continue monitoring spending against your goal timeline.",

      evidence: [
        "Recorded income and expenses were used to calculate available funds.",
        "The remaining goal amount was compared with the available financial position.",
        "The goal deadline was used to estimate the required monthly contribution."
      ]
    };
  }

  /* =======================================================
     EXPENSE COMPARISON
  ======================================================= */

  if (
    question.includes("increased") ||
    question.includes("compared with last month") ||
    question.includes("compared to last month")
  ) {
    return {
      keyFinding:
        answer,

      suggestedAction:
        "Review the categories with the largest increases and check whether those increases were planned or necessary.",

      evidence: [
        "Current-month expenses were compared with the previous recorded month.",
        "Category-level spending changes were calculated from recorded transactions.",
        "Both new spending categories and increases in existing categories are considered."
      ]
    };
  }

  /* =======================================================
     BALANCE
  ======================================================= */

  if (
    question.includes("balance") ||
    question.includes("how much money")
  ) {
    return {
      keyFinding:
        answer,

      suggestedAction:
        "Use the recorded balance as a reference point while considering upcoming obligations and savings goals.",

      evidence: [
        "Balance is calculated as recorded income minus recorded expenses.",
        "Only transactions currently stored in FinPilot are included.",
        "Upcoming obligations are not automatically deducted from the current recorded balance."
      ]
    };
  }

  /* =======================================================
     INCOME
  ======================================================= */

  if (
    question.includes("income")
  ) {
    return {
      keyFinding:
        answer,

      suggestedAction:
        "Compare recorded income with your expenses, budgets and savings commitments to understand your available financial capacity.",

      evidence: [
        "Income transactions are identified using the transaction-type classification.",
        "Recorded income amounts are summed from the current transaction database.",
        "The result reflects recorded data rather than external bank information."
      ]
    };
  }

  /* =======================================================
     DEFAULT
  ======================================================= */

  return {
    keyFinding:
      "FinPilot analyzed the recorded financial information relevant to your question.",

    suggestedAction:
      "Review the answer and supporting data before making your next financial decision.",

    evidence: [
      "Analysis is based on your recorded transactions and configured financial data.",
      "FinPilot does not use this information to provide investment advice.",
      "Results may change when new transactions, budgets or goals are added."
    ]
  };
}


/* =========================================================
   MAIN COMPONENT
   ========================================================= */

function AIAssistant() {

  const [question, setQuestion] =
    useState("");

  const [result, setResult] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     ASK QUESTION
  ======================================================= */

  const askQuestion = async (
    customQuestion = null
  ) => {

    const finalQuestion = (
      customQuestion || question
    ).trim();

    if (!finalQuestion) {
      return;
    }

    setQuestion(finalQuestion);
    setLoading(true);
    setResult(null);
    setError("");

    try {

      /* =====================================================
         GET JWT TOKEN
         ===================================================== */

      const token =
        localStorage.getItem(
          "finpilot_token"
        );

      /* =====================================================
         SEND AI REQUEST WITH JWT
         ===================================================== */

      const response =
        await fetch(
          `${API_URL}/api/ai/ask`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              "Authorization":
                `Bearer ${token}`,

              "ngrok-skip-browser-warning":
                "true"
            },

            body: JSON.stringify({
              question:
                finalQuestion
            })
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Unable to process your question."
        );
      }

      setResult(data);

    } catch (error) {

      console.error(
        "AI Assistant error:",
        error
      );

      setError(
        error.message ||
        "Unable to connect to FinPilot backend."
      );

    } finally {

      setLoading(false);
    }
  };


  /* =======================================================
     ENTER KEY
  ======================================================= */

  const handleKeyDown = (
    event
  ) => {

    if (
      event.key === "Enter"
    ) {

      askQuestion();
    }
  };


  /* =======================================================
     QUICK QUESTIONS
  ======================================================= */

  const quickQuestions = [

    "Where did I spend the most this month?",

    "Which subscriptions am I paying for?",

    "What payments are upcoming?",

    "What unusual spending do I have?",

    "What is my current balance?",

    "How is my cash flow for the next 30 days?",

    "What are my savings goals?",

    "How much budget do I have?",

    "What expenses increased compared with last month?"
  ];


  /* =======================================================
     STRUCTURED ANALYSIS
  ======================================================= */

  const analysisMeta =
    result
      ? buildAnalysisMeta(result)
      : null;


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <div className="ai-assistant-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="ai-header">

        <div className="ai-title-row">

          <div>

            <div className="ai-eyebrow">
              FINPILOT INTELLIGENCE
            </div>

            <h1>
              AI Financial Assistant
            </h1>

            <p>
              Ask questions about your spending,
              budgets, goals and financial activity.
            </p>

          </div>

          <div className="ai-status">

            <span className="status-dot"></span>

            <span>
              DATA CONNECTED
            </span>

          </div>

        </div>

      </div>


      {/* ===================================================
          QUESTION BOX
      =================================================== */}

      <div className="ai-question-box">

        <div className="question-icon">
          ✦
        </div>

        <input
          type="text"
          value={question}
          onChange={(event) =>
            setQuestion(
              event.target.value
            )
          }
          onKeyDown={
            handleKeyDown
          }
          placeholder="Ask FinPilot: Where did I spend the most this month?"
        />

        <button
          onClick={() =>
            askQuestion()
          }
          disabled={
            loading ||
            !question.trim()
          }
        >

          {loading
            ? "Analyzing..."
            : "Ask FinPilot"}

        </button>

      </div>


      {/* ===================================================
          QUICK QUESTIONS
      =================================================== */}

      <div className="quick-questions">

        <div className="quick-header">

          <div>

            <span className="section-label">
              QUICK ANALYSIS
            </span>

            <h3>
              Try asking FinPilot
            </h3>

          </div>

          <span className="question-count">
            {quickQuestions.length} prompts
          </span>

        </div>


        <div className="quick-question-list">

          {quickQuestions.map(
            (item) => (

              <button
                key={item}
                onClick={() =>
                  askQuestion(item)
                }
              >

                <span>
                  {item}
                </span>

                <span className="arrow">
                  →
                </span>

              </button>

            )
          )}

        </div>

      </div>


      {/* ===================================================
          LOADING
      =================================================== */}

      {loading && (

        <div className="loading-card">

          <div className="loading-orb">
            <div className="loading-spinner"></div>
          </div>

          <div>

            <span className="section-label">
              FINPILOT ANALYSIS
            </span>

            <strong>
              Analyzing your financial data
            </strong>

            <p>
              Checking transactions,
              budgets, goals and spending patterns...
            </p>

          </div>

        </div>

      )}


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (

        <div className="ai-error">

          <div className="error-icon">
            !
          </div>

          <div>

            <strong>
              Unable to analyze
            </strong>

            <p>
              {error}
            </p>

          </div>

        </div>

      )}


      {/* ===================================================
          RESULT
      =================================================== */}

      {result && !loading && (

        <div className="ai-analysis">


          {/* ===============================================
              ANALYSIS HEADER
          =============================================== */}

          <div className="analysis-header">

            <div>

              <span className="analysis-label">
                FINPILOT ANALYSIS
              </span>

              <h2>
                {result.question}
              </h2>

            </div>

            <div className="analysis-live">

              <span></span>

              DATA-BACKED

            </div>

          </div>


          {/* ===============================================
              MAIN ANSWER
          =============================================== */}

          <div className="answer-card">

            <div className="answer-icon">
              💬
            </div>

            <div className="answer-content">

              <div className="answer-top">

                <span className="section-label">
                  ANSWER
                </span>

                <span className="answer-badge">
                  FINPILOT AI
                </span>

              </div>

              <p className="answer-text">
                {result.answer}
              </p>

            </div>

          </div>


          {/* ===============================================
              KEY FINDING + ACTION
          =============================================== */}

          <div className="analysis-grid">


            {/* KEY FINDING */}

            <div className="finding-card">

              <div className="card-top-line">

                <div className="mini-icon finding-icon">
                  ◈
                </div>

                <span className="section-label">
                  KEY FINDING
                </span>

              </div>

              <h3>
                {analysisMeta?.keyFinding}
              </h3>

              <div className="card-footer">
                Based on recorded data
              </div>

            </div>


            {/* SUGGESTED ACTION */}

            <div className="action-card">

              <div className="card-top-line">

                <div className="mini-icon action-icon">
                  ✓
                </div>

                <span className="section-label">
                  SUGGESTED ACTION
                </span>

              </div>

              <h3>
                {analysisMeta?.suggestedAction}
              </h3>

              <div className="card-footer">
                Decision support only
              </div>

            </div>

          </div>


          {/* ===============================================
              SUPPORTING DATA
          =============================================== */}

          <div className="evidence-card">

            <div className="evidence-header">

              <div>

                <span className="section-label">
                  SUPPORTING DATA
                </span>

                <h3>
                  Why FinPilot reached this result
                </h3>

              </div>

              <span className="evidence-badge">

                <span className="evidence-dot"></span>

                Data-backed

              </span>

            </div>


            <div className="evidence-list">

              {analysisMeta?.evidence &&
              analysisMeta.evidence.length > 0 ? (

                analysisMeta.evidence.map(
                  (item, index) => (

                    <div
                      className="evidence-item"
                      key={index}
                    >

                      <div className="evidence-number">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <p>
                        {item}
                      </p>

                    </div>

                  )
                )

              ) : (

                <div className="empty-evidence">

                  <span>
                    No additional supporting
                    information was returned.
                  </span>

                </div>

              )}

            </div>

          </div>


          {/* ===============================================
              DATA SOURCE SUMMARY
          =============================================== */}

          <div className="data-source-bar">

            <div className="source-left">

              <span className="source-icon">
                ◉
              </span>

              <div>

                <strong>
                  Analysis source
                </strong>

                <span>
                  Your FinPilot financial records
                </span>

              </div>

            </div>

            <div className="source-status">

              <span className="source-dot"></span>

              LIVE DATA

            </div>

          </div>


          {/* ===============================================
              DECISION NOTE
          =============================================== */}

          <div className="decision-note">

            <div className="note-icon">
              ℹ
            </div>

            <div>

              <strong>
                Financial decision support
              </strong>

              <p>
                FinPilot provides information
                based on your recorded financial
                data. It does not provide
                investment or financial advice.
              </p>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AIAssistant;