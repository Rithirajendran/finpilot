import React, { useState } from "react";
import "./AIAssistant.css";

const API_URL =
  "https://janeen-boric-nontangibly.ngrok-free.dev";

function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const askAssistant = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    const userMessage = {
      type: "user",
      text: trimmedQuestion,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/ai/ask`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            question: trimmedQuestion,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to get answer"
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          type: "assistant",
          text: data.answer,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((previous) => [
        ...previous,
        {
          type: "assistant",
          text:
            "Sorry, I couldn't process that question right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    askAssistant();
  };

  const handleSuggestion = (text) => {
    setQuestion(text);
  };

  return (
    <div className="ai-assistant-page">

      <div className="ai-header">
        <div>
          <h1>AI Finance Assistant</h1>

          <p>
            Ask questions about your personal
            spending and financial activity.
          </p>
        </div>
      </div>

      <div className="ai-chat-card">

        <div className="ai-chat-area">

          {messages.length === 0 && (
            <div className="ai-welcome">

              <div className="ai-icon">
                ✦
              </div>

              <h2>
                How can I help with your finances?
              </h2>

              <p>
                Ask me about your spending, income,
                balance, categories, or subscriptions.
              </p>

              <div className="suggestion-list">

                <button
                  onClick={() =>
                    handleSuggestion(
                      "Where did I spend the most?"
                    )
                  }
                >
                  Where did I spend the most?
                </button>

                <button
                  onClick={() =>
                    handleSuggestion(
                      "What subscriptions am I paying for?"
                    )
                  }
                >
                  What subscriptions am I paying for?
                </button>

                <button
                  onClick={() =>
                    handleSuggestion(
                      "What is my balance?"
                    )
                  }
                >
                  What is my balance?
                </button>

                <button
                  onClick={() =>
                    handleSuggestion(
                      "How much did I spend?"
                    )
                  }
                >
                  How much did I spend?
                </button>

              </div>

            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`chat-message ${
                message.type === "user"
                  ? "user-message"
                  : "assistant-message"
              }`}
            >

              <div className="message-label">
                {message.type === "user"
                  ? "You"
                  : "FinPilot"}
              </div>

              <div className="message-bubble">
                {message.text}
              </div>

            </div>
          ))}

          {loading && (
            <div className="chat-message assistant-message">

              <div className="message-label">
                FinPilot
              </div>

              <div className="message-bubble loading-bubble">
                Analyzing your financial data...
              </div>

            </div>
          )}

        </div>

        <form
          className="ai-input-area"
          onSubmit={handleSubmit}
        >

          <input
            type="text"
            placeholder="Ask something about your finances..."
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            disabled={loading}
          />

          <button
            type="submit"
            disabled={
              loading || !question.trim()
            }
          >
            {loading ? "..." : "Ask"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default AIAssistant;