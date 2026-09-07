import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link
          to="/"
          className="navbar-logo"
          onClick={closeMenu}
        >
          Shop<span>Ease</span>
        </Link>

        {/* Menu */}
        <div className={`nav-menu ${menuOpen ? "active" : ""}`}>

          <Link to="/" onClick={closeMenu}>
            Home
          </Link>

          <Link to="/products" onClick={closeMenu}>
            Products
          </Link>

          <Link to="/cart" onClick={closeMenu}>
            🛒 Cart
          </Link>

          {token ? (
            <>
              <Link to="/wishlist" onClick={closeMenu}>
                ❤️ Wishlist
              </Link>

              <Link to="/orders" onClick={closeMenu}>
                📦 My Orders
              </Link>

              <Link to="/notifications" onClick={closeMenu}>
                🔔 Notifications
              </Link>

              <Link
                to="/profile"
                onClick={closeMenu}
              >
                👤 {user?.name || "Profile"}
              </Link>

              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="login-btn"
              onClick={closeMenu}
            >
              Login
            </Link>
          )}

        </div>

        {/* Mobile Menu Button */}
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

      </div>
    </nav>
  );
};

export default Navbar;

