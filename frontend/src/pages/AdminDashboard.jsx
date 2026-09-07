import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dashboard/stats");

      setStats(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-error">
        {error}
      </div>
    );
  }

  return (
    <div className="admin-dashboard">

      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Overview of your e-commerce store</p>
        </div>

        <button
          className="refresh-btn"
          onClick={fetchDashboardStats}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Statistics Cards */}

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div>
            <p>Total Users</p>
            <h2>{stats.totalUsers}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛍️</div>
          <div>
            <p>Total Products</p>
            <h2>{stats.totalProducts}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div>
            <p>Total Orders</p>
            <h2>{stats.totalOrders}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">₹</div>
          <div>
            <p>Total Sales</p>
            <h2>₹{stats.totalSales}</h2>
          </div>
        </div>

      </div>

      {/* Order Statistics */}

      <div className="order-stats">

        <div className="order-stat-card">
          <span className="order-icon">⏳</span>
          <div>
            <p>Pending Orders</p>
            <h3>{stats.pendingOrders}</h3>
          </div>
        </div>

        <div className="order-stat-card">
          <span className="order-icon">✅</span>
          <div>
            <p>Delivered Orders</p>
            <h3>{stats.deliveredOrders}</h3>
          </div>
        </div>

        <div className="order-stat-card">
          <span className="order-icon">❌</span>
          <div>
            <p>Cancelled Orders</p>
            <h3>{stats.cancelledOrders}</h3>
          </div>
        </div>

      </div>

      {/* Recent Orders */}

      <div className="recent-orders">

        <div className="section-title">
          <h2>Recent Orders</h2>
        </div>

        {stats.recentOrders?.length === 0 ? (
          <div className="empty-orders">
            No recent orders found.
          </div>
        ) : (
          <div className="orders-table-wrapper">

            <table className="orders-table">

              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order._id}>

                    <td>
                      #{order._id.slice(-6).toUpperCase()}
                    </td>

                    <td>
                      {order.user?.name || "Unknown"}
                    </td>

                    <td>
                      {order.user?.email || "-"}
                    </td>

                    <td>
                      ₹{order.totalAmount}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${order.orderStatus?.toLowerCase()}`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString()}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
};

export default AdminDashboard;

