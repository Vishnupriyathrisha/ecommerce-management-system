import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="admin-layout">

      {/* Sidebar */}
      <aside className="admin-sidebar">

        {/* Logo */}
        <div className="admin-logo">
          Shop<span>Ease</span>
          <small>Admin Panel</small>
        </div>

        {/* Navigation */}
        <nav className="admin-nav">

          <NavLink to="/admin/dashboard">
            📊 Dashboard
          </NavLink>

          <NavLink to="/admin/products">
            🛍️ Products
          </NavLink>

          <NavLink to="/admin/products/add">
            ➕ Add Product
          </NavLink>

          <NavLink to="/admin/orders">
            📦 Orders
          </NavLink>

          <NavLink to="/admin/coupons">
             🎟️ Coupons
          </NavLink> 
          
          <NavLink to="/admin/buyers">
            👤 Buyers
          </NavLink>

          <NavLink to="/admin/sellers">
            🏪 Sellers
           </NavLink>
  
            <NavLink to="/admin/support-tickets">
               💬 Support Tickets
            </NavLink>

          <NavLink to="/notifications">
            🔔 Notifications
          </NavLink>

          <NavLink to="/profile">
            👤 Profile
          </NavLink>

        </nav>

        {/* Logout */}
        <button
          className="admin-logout"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>

      </aside>

      {/* Page Content */}
      <main className="admin-content">
        <Outlet />
      </main>

    </div>
  );
};

export default AdminLayout;
