import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./SellerDashboard.css";

const SellerDashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    sales: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchSellerStats();
  }, []);

  const fetchSellerStats = async () => {
    try {
      setLoading(true);
      setError("");

      // Seller own products
      const productResponse = await api.get(
        "/products/seller/my-products"
      );

      const products = productResponse.data.products || [];

      // Seller orders & sales
      const salesResponse = await api.get(
        "/orders/seller/sales"
      );

      const salesData = salesResponse.data;

      setStats({
        products: products.length,
        orders: salesData.totalOrders || 0,
        sales: salesData.totalSales || 0,
      });
    } catch (error) {
      console.error("Seller Dashboard Error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load seller dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="seller-dashboard-loading">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="seller-dashboard-error">
        {error}
      </div>
    );
  }

  return (
    <div className="seller-dashboard">

      {/* Header */}
      <div className="seller-dashboard-header">
        <div>
          <h1>Seller Dashboard</h1>
          <p>
            Welcome back, {user?.name || "Seller"} 👋
          </p>
        </div>

        <button
          className="seller-refresh-btn"
          onClick={fetchSellerStats}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="seller-stats-grid">

        <div className="seller-stat-card">
          <div className="seller-stat-icon">
            🛍️
          </div>

          <div>
            <p>My Products</p>
            <h2>{stats.products}</h2>
          </div>
        </div>

        <div className="seller-stat-card">
          <div className="seller-stat-icon">
            📦
          </div>

          <div>
            <p>My Orders</p>
            <h2>{stats.orders}</h2>
          </div>
        </div>

        <div className="seller-stat-card">
          <div className="seller-stat-icon">
            ₹
          </div>

          <div>
            <p>Total Sales</p>
            <h2>₹{stats.sales}</h2>
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="seller-actions">

        <h2>Quick Actions</h2>

        <div className="seller-action-grid">

          <Link
            to="/seller/products"
            className="seller-action-card"
          >
            <span>🛍️</span>
            <div>
              <h3>My Products</h3>
              <p>View and manage your products</p>
            </div>
          </Link>

          <Link
            to="/seller/products/add"
            className="seller-action-card"
          >
            <span>➕</span>
            <div>
              <h3>Add Product</h3>
              <p>Add a new product to your store</p>
            </div>
          </Link>

          <Link
            to="/seller/orders"
            className="seller-action-card"
          >
            <span>📦</span>
            <div>
              <h3>My Orders</h3>
              <p>View and manage customer orders</p>
            </div>
          </Link>

        </div>

      </div>

    </div>
  );
};

export default SellerDashboard;