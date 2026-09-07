import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./AdminSupportTickets.css";

const AdminSupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState("");
  const [error, setError] = useState("");

  // ================================
  // FETCH SUPPORT TICKETS
  // ================================
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/support-tickets");

      setTickets(response.data.tickets || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load support tickets"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // FETCH SELLERS
  // ================================
  const fetchSellers = async () => {
    try {
      const response = await api.get("/admin/sellers");

      const sellerList = response.data.sellers || [];

      // Only active sellers
      setSellers(
        sellerList.filter((seller) => !seller.isBlocked)
      );
    } catch (error) {
      console.error("Failed to load sellers:", error);
    }
  };

  // ================================
  // INITIAL LOAD
  // ================================
  useEffect(() => {
    fetchTickets();
    fetchSellers();
  }, []);

  // ================================
  // ASSIGN TICKET
  // ================================
  const handleAssign = async (ticketId, sellerId) => {
    if (!sellerId) {
      return;
    }

    try {
      setAssigning(ticketId);
      setError("");

      await api.put(
        `/admin/support-tickets/${ticketId}/assign`,
        {
          assignedTo: sellerId,
        }
      );

      // Refresh ticket list
      await fetchTickets();

      alert("Ticket assigned to seller successfully!");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to assign ticket"
      );
    } finally {
      setAssigning("");
    }
  };

  // ================================
  // LOADING
  // ================================
  if (loading) {
    return (
      <div className="admin-tickets-loading">
        Loading support tickets...
      </div>
    );
  }

  // ================================
  // UI
  // ================================
  return (
    <div className="admin-support-tickets">

      {/* HEADER */}
      <div className="tickets-header">
        <div>
          <h1>Support Tickets</h1>
          <p>
            Manage buyer and seller support requests
          </p>
        </div>

        <button
          className="tickets-refresh-btn"
          onClick={fetchTickets}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="tickets-error">
          {error}
        </div>
      )}

      {/* EMPTY */}
      {tickets.length === 0 ? (
        <div className="tickets-empty">
          <div className="empty-icon">🎫</div>

          <h3>No Support Tickets</h3>

          <p>
            No support requests found.
          </p>
        </div>
      ) : (

        /* TABLE */
        <div className="tickets-table-wrapper">

          <table className="tickets-table">

            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {tickets.map((ticket) => (

                <tr key={ticket._id}>

                  {/* USER */}
                  <td>
                    {ticket.user?.name ||
                      "Unknown"}
                  </td>

                  {/* EMAIL */}
                  <td>
                    {ticket.user?.email ||
                      "-"}
                  </td>

                  {/* ROLE */}
                  <td>
                    {ticket.user?.role ||
                      "-"}
                  </td>

                  {/* SUBJECT */}
                  <td>
                    {ticket.subject ||
                      "-"}
                  </td>

                  {/* STATUS */}
                  <td>
                    <span
                      className={`ticket-status ${
                        ticket.status?.toLowerCase()
                      }`}
                    >
                      {ticket.status ||
                        "OPEN"}
                    </span>
                  </td>

                  {/* ASSIGN SELLER */}
                  <td>

                    <div className="assign-section">

                      <select
                        value={
                          ticket.assignedTo?._id ||
                          ""
                        }
                        onChange={(e) =>
                          handleAssign(
                            ticket._id,
                            e.target.value
                          )
                        }
                        disabled={
                          assigning ===
                          ticket._id
                        }
                      >

                        <option value="">
                          Select Seller
                        </option>

                        {sellers.map(
                          (seller) => (

                            <option
                              key={seller._id}
                              value={seller._id}
                            >
                              {seller.name}
                            </option>

                          )
                        )}

                      </select>

                      {assigning ===
                        ticket._id && (
                        <small>
                          Assigning...
                        </small>
                      )}

                      {/* CURRENT ASSIGNED USER */}
                      {ticket.assignedTo && (
                        <span className="assigned-user">
                          Assigned:{" "}
                          {ticket.assignedTo.name}
                        </span>
                      )}

                    </div>

                  </td>

                  {/* OPEN CHAT */}
                  <td>

                    <Link
                      to={`/admin/support-tickets/${ticket._id}`}
                      className="open-chat-btn"
                    >
                        💬 Open Chat
                     </Link>

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

export default AdminSupportTickets;