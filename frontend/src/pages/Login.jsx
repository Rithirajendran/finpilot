import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const API_URL =
  "https://janeen-boric-nontangibly.ngrok-free.dev";


function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  const handleLogin = async (event) => {

    event.preventDefault();

    setError("");


    if (!email.trim() || !password.trim()) {

      setError(
        "Please enter your email and password."
      );

      return;
    }


    setLoading(true);


    try {

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true"
          },

          body: JSON.stringify({
            email: email.trim(),
            password: password
          })
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Login failed."
        );
      }


      localStorage.setItem(
        "finpilot_token",
        data.access_token
      );


      localStorage.setItem(
        "finpilot_user",
        JSON.stringify(data.user)
      );


      navigate("/dashboard");

    } catch (error) {

      setError(
        error.message ||
        "Unable to connect to FinPilot."
      );

    } finally {

      setLoading(false);

    }
  };


  return (

    <div className="login-page">

      <div className="login-glow glow-one"></div>

      <div className="login-glow glow-two"></div>


      <div className="login-card">

        <div className="login-logo">
          ✦
        </div>


        <div className="login-header">

          <span className="login-label">
            FINPILOT
          </span>

          <h1>
            Welcome Back
          </h1>

          <p>
            Sign in to access your personal
            finance dashboard.
          </p>

        </div>


        {error && (

          <div className="login-error">

            {error}

          </div>

        )}


        <form onSubmit={handleLogin}>


          <div className="form-group">

            <label>
              Email Address
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
            />

          </div>


          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              autoComplete="current-password"
            />

          </div>


          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >

            {loading
              ? "Signing in..."
              : "Sign In"}

          </button>


        </form>


        <div className="register-link">

          Don't have an account?

          <Link to="/register">
            Create Account
          </Link>

        </div>


        <div className="login-note">

          🔒 Your financial data stays within
          your FinPilot account.

        </div>

      </div>

    </div>

  );
}


export default Login;