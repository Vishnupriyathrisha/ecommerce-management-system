import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./SellerRegister.css";

const SellerRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await api.post(
        "/auth/register-seller",
        formData
      );

      setSuccess(
        response.data.message || "Seller registered successfully"
      );

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Seller registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seller-register-page">
      <div className="seller-register-card">

        <div className="seller-register-header">
          <h1>Shop<span>Ease</span></h1>
          <h2>Seller Registration</h2>
          <p>Create your seller account</p>
        </div>

        {error && (
          <div className="seller-register-error">
            {error}
          </div>
        )}

        {success && (
          <div className="seller-register-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="seller-form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="seller-form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="seller-form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              minLength="6"
              required
            />
          </div>

          <div className="seller-form-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="seller-form-group">
            <label>Address</label>
            <textarea
              name="address"
              placeholder="Enter your address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <button
            type="submit"
            className="seller-register-btn"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Seller Account"}
          </button>

        </form>

        <div className="seller-login-link">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </div>

      </div>
    </div>
  );
};

export default SellerRegister;