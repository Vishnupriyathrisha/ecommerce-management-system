import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setResetToken("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/forgot-password", {
        email,
      });

      setMessage(
        response.data.message || "Password reset token generated"
      );

      // Development purpose
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
      }

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to process forgot password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">

      <div className="forgot-card">

        <div className="forgot-icon">
          🔐
        </div>

        <h1>Forgot Password?</h1>

        <p className="forgot-subtitle">
          Enter your registered email to reset your password.
        </p>

        {error && (
          <div className="forgot-error">
            {error}
          </div>
        )}

        {message && (
          <div className="forgot-success">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : "Send Reset Link"}
          </button>

        </form>

        {resetToken && (
          <div className="reset-token-box">

            <p>Development Reset Token:</p>

            <small>
              {resetToken}
            </small>

            <Link
              to={`/reset-password/${resetToken}`}
              className="reset-link"
            >
              Continue to Reset Password
            </Link>

          </div>
        )}

        <Link
          to="/login"
          className="back-login"
        >
          ← Back to Login
        </Link>

      </div>

    </div>
  );
};

export default ForgotPassword;