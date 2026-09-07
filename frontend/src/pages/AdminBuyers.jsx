import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdminUsers.css";

const AdminBuyers = () => {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchBuyers();
  }, []);

  // =================================
  // FETCH BUYERS
  // =================================
  const fetchBuyers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/buyers");

      setBuyers(response.data.buyers || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load buyers"
      );
    } finally {
      setLoading(false);
    }
  };

  // =================================
  // BLOCK / UNBLOCK
  // =================================
  const handleToggleBlock = async (id) => {
    try {
      setUpdatingId(id);
      setError("");

      const response = await api.put(
        `/admin/users/${id}/toggle-block`
      );

      const updatedUser = response.data.user;

      setBuyers((prevBuyers) =>
        prevBuyers.map((buyer) =>
          buyer._id === id
            ? {
                ...buyer,
                isBlocked: updatedUser.isBlocked,
              }
            : buyer
        )
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update buyer status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =================================
  // LOADING
  // =================================
  if (loading) {
    return (
      <div className="admin-users-loading">
        Loading buyers...
      </div>
    );
  }

  // =================================
  // ERROR
  // =================================
  if (error && buyers.length === 0) {
    return (
      <div className="admin-users-error">
        {error}
      </div>
    );
  }

  return (
    <div className="admin-buyers">

      {/* Header */}
      <div className="users-header">
        <div>
          <h1>Buyers</h1>
          <p>Manage all buyers</p>
        </div>

        <button
          className="users-refresh-btn"
          onClick={fetchBuyers}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="users-error-message">
          {error}
        </div>
      )}

      {/* Empty */}
      {buyers.length === 0 ? (
        <div className="users-empty">
          <div className="empty-icon">👥</div>
          <h3>No buyers found</h3>
          <p>There are no registered buyers yet.</p>
        </div>
      ) : (
        <div className="users-table-wrapper">

          <table className="users-table">

            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {buyers.map((buyer) => (
                <tr key={buyer._id}>

                  {/* Name */}
                  <td>
                    <div className="user-name-cell">
                      <div className="user-table-avatar">
                        {buyer.name
                          ?.charAt(0)
                          .toUpperCase() || "U"}
                      </div>

                      <span>{buyer.name}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td>{buyer.email}</td>

                  {/* Phone */}
                  <td>{buyer.phone || "-"}</td>

                  {/* Joined Date */}
                  <td>
                    {buyer.createdAt
                      ? new Date(
                          buyer.createdAt
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  {/* Status */}
                  <td>
                    <span
                      className={`user-status ${
                        buyer.isBlocked
                          ? "blocked"
                          : "active"
                      }`}
                    >
                      {buyer.isBlocked
                        ? "Blocked"
                        : "Active"}
                    </span>
                  </td>

                  {/* Action */}
                  <td>
                    <button
                      className={`block-btn ${
                        buyer.isBlocked
                          ? "unblock"
                          : "block"
                      }`}
                      onClick={() =>
                        handleToggleBlock(buyer._id)
                      }
                      disabled={
                        updatingId === buyer._id
                      }
                    >
                      {updatingId === buyer._id
                        ? "Updating..."
                        : buyer.isBlocked
                        ? "Unblock"
                        : "Block"}
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}

    </div>
  );
};

export default AdminBuyers;