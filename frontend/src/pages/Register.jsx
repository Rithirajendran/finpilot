import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const API_URL =
  "https://janeen-boric-nontangibly.ngrok-free.dev";


function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  const handleRegister = async (event) => {

    event.preventDefault();

    setError("");


    if (
      !name.trim() ||
      !email.trim() ||
      !password.trim()
    ) {

      setError(
        "Please fill in all fields."
      );

      return;
    }


    if (password.length < 6) {

      setError(
        "Password must contain at least 6 characters."
      );

      return;
    }


    if (password !== confirmPassword) {

      setError(
        "Passwords do not match."
      );

      return;
    }


    setLoading(true);


    try {

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true"
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password: password
          })
        }
      );


      const data = await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Registration failed."
        );
      }


      alert(
        "Account created successfully. Please login."
      );


      navigate("/login");

    } catch (error) {

      setError(
        error.message ||
        "Unable to create account."
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
            Create Account
          </h1>

          <p>
            Create your secure FinPilot
            finance account.
          </p>

        </div>


        {error && (

          <div className="login-error">
            {error}
          </div>

        )}


        <form onSubmit={handleRegister}>

          <div className="form-group">

            <label>
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
            />

          </div>


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
            />

          </div>


          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />

          </div>


          <div className="form-group">

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
            />

          </div>


          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >

            {loading
              ? "Creating account..."
              : "Create Account"}

          </button>

        </form>


        <div className="register-link">

          Already have an account?

          <Link to="/login">
            Sign In
          </Link>

        </div>

      </div>

    </div>

  );
}


export default Register;