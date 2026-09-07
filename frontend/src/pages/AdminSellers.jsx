import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminUsers.css";

const AdminSellers = () => {
  const navigate = useNavigate();

  const [sellers, setSellers] = useState([]);
  const [sellerStats, setSellerStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    fetchSellers();
    fetchSellerStats();
  }, []);

  // ================================
  // Fetch All Sellers
  // ================================
  const fetchSellers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/sellers");

      setSellers(response.data.sellers || []);
    } catch (error) {
      console.error("Fetch Sellers Error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load sellers"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // Fetch Seller Sales Statistics
  // ================================
  const fetchSellerStats = async () => {
    try {
      const response = await api.get(
        "/orders/admin/seller-sales"
      );

      setSellerStats(response.data.sellers || []);
    } catch (error) {
      console.error("Seller Stats Error:", error);
    }
  };

  // ================================
  // Refresh
  // ================================
  const handleRefresh = () => {
    fetchSellers();
    fetchSellerStats();
  };

  // ================================
  // Block / Unblock Seller
  // ================================
  const handleToggleBlock = async (sellerId) => {
    try {
      setActionLoading(sellerId);
      setError("");

      const response = await api.put(
        `/admin/users/${sellerId}/toggle-block`
      );

      const updatedSeller = response.data.user;

      setSellers((prevSellers) =>
        prevSellers.map((seller) =>
          seller._id === sellerId
            ? {
                ...seller,
                isBlocked: updatedSeller.isBlocked,
              }
            : seller
        )
      );
    } catch (error) {
      console.error("Toggle Seller Error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to update seller status"
      );
    } finally {
      setActionLoading("");
    }
  };

  // ================================
  // View Seller Products
  // ================================
  const handleViewProducts = (sellerId) => {
    navigate(`/admin/sellers/${sellerId}/products`);
  };

  // ================================
  // View Seller Orders
  // ================================
  const handleViewOrders = (sellerId) => {
    navigate(`/admin/sellers/${sellerId}/orders`);
  };

  // ================================
  // Loading
  // ================================
  if (loading) {
    return (
      <div className="admin-users-loading">
        Loading sellers...
      </div>
    );
  }

  return (
    <div className="admin-sellers">

      {/* ================================
          HEADER
      ================================= */}
      <div className="users-header">
        <div>
          <h1>Sellers</h1>

          <p>
            Manage all sellers and monitor their sales
          </p>
        </div>

        <button
          className="users-refresh-btn"
          onClick={handleRefresh}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ================================
          ERROR MESSAGE
      ================================= */}
      {error && (
        <div className="users-error-message">
          {error}
        </div>
      )}

      {/* ================================
          NO SELLERS
      ================================= */}
      {sellers.length === 0 ? (
        <div className="users-empty">

          <div className="empty-icon">
            👥
          </div>

          <h3>
            No Sellers Found
          </h3>

          <p>
            There are no sellers available.
          </p>

        </div>
      ) : (

        /* ================================
           SELLERS TABLE
        ================================= */
        <div className="users-table-wrapper">

          <table className="users-table">

            <thead>
              <tr>

                <th>
                  Seller
                </th>

                <th>
                  Email
                </th>

                <th>
                  Phone
                </th>

                <th>
                  Joined Date
                </th>

                <th>
                  Status
                </th>

                <th>
                  Orders
                </th>

                <th>
                  Items Sold
                </th>

                <th>
                  Total Sales
                </th>

                <th>
                  View Orders
                </th>

                <th>
                  Products
                </th>

                <th>
                  Action
                </th>

              </tr>
            </thead>

            <tbody>

              {sellers.map((seller) => {

                // Find statistics for current seller
                const stats = sellerStats.find(
                  (item) =>
                    item.sellerId === seller._id
                );

                return (
                  <tr key={seller._id}>

                    {/* Seller */}
                    <td>
                      <div className="user-name-cell">

                        <div className="user-table-avatar">
                          {seller.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <span>
                          {seller.name}
                        </span>

                      </div>
                    </td>

                    {/* Email */}
                    <td>
                      {seller.email}
                    </td>

                    {/* Phone */}
                    <td>
                      {seller.phone || "-"}
                    </td>

                    {/* Joined Date */}
                    <td>
                      {seller.createdAt
                        ? new Date(
                            seller.createdAt
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={`user-status ${
                          seller.isBlocked
                            ? "blocked"
                            : "active"
                        }`}
                      >
                        {seller.isBlocked
                          ? "Blocked"
                          : "Active"}
                      </span>
                    </td>

                    {/* Orders */}
                    <td>
                      <strong>
                        {stats?.orders || 0}
                      </strong>
                    </td>

                    {/* Items Sold */}
                    <td>
                      <strong>
                        {stats?.items || 0}
                      </strong>
                    </td>

                    {/* Total Sales */}
                    <td>
                      <strong>
                        ₹
                        {Number(
                          stats?.sales || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </td>

                    {/* View Orders */}
                    <td>
                      <button
                        className="view-orders-btn"
                        onClick={() =>
                          handleViewOrders(
                            seller._id
                          )
                        }
                      >
                        📦 View Orders
                      </button>
                    </td>

                    {/* View Products */}
                    <td>
                      <button
                        className="view-products-btn"
                        onClick={() =>
                          handleViewProducts(
                            seller._id
                          )
                        }
                      >
                        🛍️ View Products
                      </button>
                    </td>

                    {/* Block / Unblock */}
                    <td>
                      <button
                        className={`block-btn ${
                          seller.isBlocked
                            ? "unblock"
                            : "block"
                        }`}
                        disabled={
                          actionLoading ===
                          seller._id
                        }
                        onClick={() =>
                          handleToggleBlock(
                            seller._id
                          )
                        }
                      >
                        {actionLoading ===
                        seller._id
                          ? "Updating..."
                          : seller.isBlocked
                          ? "Unblock"
                          : "Block"}
                      </button>
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
};

export default AdminSellers;
