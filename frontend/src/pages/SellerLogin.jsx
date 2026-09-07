import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./SellerLogin.css";

const SellerLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      // Only seller can login here
      if (user.role !== "seller") {
        setError("This login is only for sellers.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/seller/dashboard");

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Seller login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seller-login-page">

      <div className="seller-login-card">

        <div className="seller-login-header">
          <h1>
            Shop<span>Ease</span>
          </h1>

          <h2>Seller Login</h2>

          <p>Login to manage your products</p>
        </div>

        {error && (
          <div className="seller-login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="seller-login-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="seller-login-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="seller-login-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <div className="seller-register-link">
          Don't have a seller account?{" "}
          <Link to="/seller/register">
            Register
          </Link>
        </div>

        <div className="seller-user-login">
          <Link to="/login">
            ← Back to User Login
          </Link>
        </div>

      </div>

    </div>
  );
};

export default SellerLogin;