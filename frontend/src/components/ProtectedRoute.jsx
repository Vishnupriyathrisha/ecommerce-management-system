import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ role }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role check
  if (role && user.role !== role) {
    // Admin
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    // Seller
    if (user.role === "seller") {
      return <Navigate to="/seller/dashboard" replace />;
    }

    // Normal User
    return <Navigate to="/user/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;