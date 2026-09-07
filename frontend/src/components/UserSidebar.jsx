import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./UserSidebar.css";

const UserSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const isSeller = user?.role === "seller";

  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate(isSeller ? "/seller/login" : "/login");
  };

  const handleMenuClick = () => {
    if (window.innerWidth <= 900) {
      setSidebarOpen(false);
    }
  };

  // Fetch unread notifications
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/notifications");

      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Unread notification error:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    // Refresh unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <aside
      className={`user-sidebar ${
        sidebarOpen ? "sidebar-open" : ""
      }`}
    >
      {/* Logo */}
      <div className="user-sidebar-logo">
        <div className="user-logo-icon">
          S
        </div>

        <div>
          <h2>
            Shop<span>Ease</span>
          </h2>

          <small>
            {isSeller ? "SELLER PANEL" : "USER PANEL"}
          </small>
        </div>
      </div>

      {/* Profile */}
      <div className="user-sidebar-profile">
        <div className="user-avatar">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>

        <div>
          <strong>{user?.name || "User"}</strong>

          <small>{user?.email || ""}</small>
        </div>
      </div>

      {/* Navigation */}
      <nav className="user-sidebar-nav">

        {isSeller ? (
          <>
            {/* Seller Dashboard */}
            <NavLink
              to="/seller/dashboard"
              onClick={handleMenuClick}
            >
              <span>🏠</span>
              Dashboard
            </NavLink>

            {/* My Products */}
            <NavLink
              to="/seller/products"
              onClick={handleMenuClick}
            >
              <span>🛍️</span>
              My Products
            </NavLink>

            {/* Add Product */}
            <NavLink
              to="/seller/products/add"
              onClick={handleMenuClick}
            >
              <span>➕</span>
              Add Product
            </NavLink>

            {/* Orders */}
            <NavLink
              to="/seller/orders"
              onClick={handleMenuClick}
            >
              <span>📦</span>
              Orders
            </NavLink>

               {/* Support Tickets */}
              <NavLink
                to="/seller/support-tickets"
                    onClick={handleMenuClick}
                  >
                 <span>💬</span>
                   Support Tickets
               </NavLink>

            {/* Notifications */}
            <NavLink
              to="/seller/notifications"
                onClick={handleMenuClick}
              >
                <span>🔔</span>
                 Notifications

             {unreadCount > 0 && (
            <span className="notification-badge">
               {unreadCount > 99 ? "99+" : unreadCount}
               </span>
                 )}
              </NavLink>
          </>
        ) : (
          <>
            {/* User Dashboard */}
            <NavLink
              to="/user/dashboard"
              onClick={handleMenuClick}
            >
              <span>🏠</span>
              Dashboard
            </NavLink>

            {/* Products */}
            <NavLink
              to="/products"
              onClick={handleMenuClick}
            >
              <span>🛍️</span>
              Products
            </NavLink>

            {/* Cart */}
            <NavLink
              to="/cart"
              onClick={handleMenuClick}
            >
              <span>🛒</span>
              Cart
            </NavLink>

            {/* Wishlist */}
            <NavLink
              to="/wishlist"
              onClick={handleMenuClick}
            >
              <span>❤️</span>
              Wishlist
            </NavLink>

            {/* Orders */}
            <NavLink
              to="/orders"
              onClick={handleMenuClick}
            >
              <span>📦</span>
              My Orders
            </NavLink>

               {/* Support Tickets */}
                <NavLink
                 to="/support-tickets"
                  onClick={handleMenuClick}
                  >
               <span>💬</span>
                  Support Tickets
              </NavLink>
              
            {/* Notifications */}
           <NavLink
             to="/notifications"
             onClick={handleMenuClick}
            >
                 <span>🔔</span>
                  Notifications

            {unreadCount > 0 && (
              <span className="notification-badge">
             {unreadCount > 99 ? "99+" : unreadCount}
            </span>
                )}
            </NavLink>

            {/* Profile */}
            <NavLink
              to="/profile"
              onClick={handleMenuClick}
            >
              <span>👤</span>
              Profile
            </NavLink>
          </>
        )}

      </nav>

      {/* Logout */}
      <button
        className="user-sidebar-logout"
        onClick={handleLogout}
      >
        <span>🚪</span>
        Logout
      </button>
    </aside>
  );
};

export default UserSidebar;