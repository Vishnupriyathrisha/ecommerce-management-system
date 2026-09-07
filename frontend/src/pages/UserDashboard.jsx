import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, wishlistRes, cartRes] = await Promise.all([
        api.get("/orders/my-orders"),
        api.get("/wishlist"),
        api.get("/cart"),
      ]);

      setOrders(ordersRes.data.orders || []);

      setWishlistCount(
        wishlistRes.data.wishlist?.length ||
        wishlistRes.data.products?.length ||
        0
      );

      setCartCount(
        cartRes.data.cart?.items?.length ||
        cartRes.data.items?.length ||
        0
      );
    } catch (error) {
      console.error("Dashboard data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = orders.reduce(
  (total, order) => {
    if (order.orderStatus !== "CANCELLED") {
      return total + Number(order.totalAmount || 0);
    }
    return total;
  },
  0
);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="user-dashboard">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <p className="dashboard-label">USER DASHBOARD</p>

          <h1>
            Welcome, {user?.name || "User"} 👋
          </h1>

          <p>
            Manage your orders, wishlist and shopping activity.
          </p>
        </div>

        <Link to="/products" className="shop-now-btn">
          Continue Shopping →
        </Link>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">

        <div className="dashboard-card">
          <div className="card-icon">📦</div>

          <div>
            <span>Total Orders</span>
            <h2>{loading ? "..." : orders.length}</h2>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">❤️</div>

          <div>
            <span>Wishlist Items</span>
            <h2>{loading ? "..." : wishlistCount}</h2>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">🛒</div>

          <div>
            <span>Cart Items</span>
            <h2>{loading ? "..." : cartCount}</h2>
          </div>
        </div>

<div className="dashboard-card">
  <div className="card-icon">💰</div>

  <div>
    <span>Total Spent</span>
    <h2>
      {loading ? "..." : `₹${totalSpent}`}
    </h2>
  </div>
</div>
      </div>

      {/* Quick Actions */}
      <div className="quick-section">

        <h2>Quick Actions</h2>

        <div className="quick-actions">

          <Link to="/products" className="quick-card">
            <span>🛍️</span>
            <div>
              <strong>Browse Products</strong>
              <small>Explore our products</small>
            </div>
          </Link>

          <Link to="/wishlist" className="quick-card">
            <span>❤️</span>
            <div>
              <strong>My Wishlist</strong>
              <small>View saved products</small>
            </div>
          </Link>

          <Link to="/cart" className="quick-card">
            <span>🛒</span>
            <div>
              <strong>My Cart</strong>
              <small>View cart items</small>
            </div>
          </Link>

          <Link to="/profile" className="quick-card">
            <span>👤</span>
            <div>
              <strong>My Profile</strong>
              <small>Manage your profile</small>
            </div>
          </Link>

        </div>

      </div>

      {/* Recent Orders */}
      <div className="recent-orders">

        <div className="section-header">
          <div>
            <h2>Recent Orders</h2>
            <p>Your latest purchases</p>
          </div>

          <Link to="/orders">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="empty-orders">
            Loading orders...
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="empty-orders">
            <div>📦</div>
            <h3>No orders yet</h3>
            <p>Start shopping and your orders will appear here.</p>

            <Link to="/products">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-table">

            <div className="order-row order-heading">
              <span>Order ID</span>
              <span>Date</span>
              <span>Amount</span>
              <span>Status</span>
            </div>

            {recentOrders.map((order) => (
              <Link
                to={`/orders/${order._id}`}
                className="order-row"
                key={order._id}
              >
                <span>
                  #{order._id.slice(-6).toUpperCase()}
                </span>

                <span>
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>

                <span>
                  ₹{order.totalAmount}
                </span>

                <span>
                  <b
                    className={`status ${order.orderStatus?.toLowerCase()}`}
                  >
                    {order.orderStatus}
                  </b>
                </span>
              </Link>
            ))}

          </div>
        )}

      </div>
 
    
    </div>
  );
};

export default UserDashboard;