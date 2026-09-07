import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import "./SupportTickets.css";

const SupportTickets = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================================
  // CHECK WHETHER CURRENT USER IS SELLER
  // ==================================================
  const isSeller = location.pathname.startsWith(
    "/seller/support-tickets"
  );

  // ==================================================
  // SET CORRECT SUPPORT BASE PATH
  // ==================================================
  const supportBasePath = isSeller
    ? "/seller/support-tickets"
    : "/support-tickets";

  // ==================================================
  // FETCH SUPPORT TICKETS
  // ==================================================
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/support-tickets/my-tickets"
      );

      setTickets(response.data.tickets || []);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate(
          isSeller
            ? "/seller/login"
            : "/login"
        );
        return;
      }

      setError(
        error.response?.data?.message ||
          "Failed to load support tickets"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // INITIAL LOAD
  // ==================================================
  useEffect(() => {
    fetchTickets();
  }, []);

  // ==================================================
  // LOADING
  // ==================================================
  if (loading) {
    return (
      <div className="support-tickets-message">
        Loading support tickets...
      </div>
    );
  }

  // ==================================================
  // UI
  // ==================================================
  return (
    <div className="support-tickets-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="support-tickets-header">

        <div>
          <h1>Support Tickets</h1>

          <p>
            {isSeller
              ? "Get help from our admin support team"
              : "Get help from our support team"}
          </p>
        </div>

        <Link
          to={`${supportBasePath}/create`}
          className="create-ticket-btn"
        >
          + Create Ticket
        </Link>

      </div>


      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="support-tickets-error">
          {error}
        </div>
      )}


      {/* =========================
          EMPTY STATE
      ========================= */}

      {tickets.length === 0 ? (

        <div className="support-tickets-empty">

          <div className="empty-ticket-icon">
            🎫
          </div>

          <h2>No Support Tickets</h2>

          <p>
            You haven't created any support tickets yet.
          </p>

          <Link
            to={`${supportBasePath}/create`}
            className="create-ticket-empty-btn"
          >
            Create Your First Ticket
          </Link>

        </div>

      ) : (

        /* =========================
           TICKET LIST
        ========================= */

        <div className="support-tickets-list">

          {tickets.map((ticket) => (

            <div
              className="support-ticket-card"
              key={ticket._id}
            >

              {/* =========================
                  CARD TOP
              ========================= */}

              <div className="ticket-card-top">

                <div>

                  <span className="ticket-label">
                    Ticket ID
                  </span>

                  <h3>
                    #{ticket._id
                      .slice(-8)
                      .toUpperCase()}
                  </h3>

                </div>


                <span
                  className={`ticket-status ${
                    ticket.status?.toLowerCase()
                  }`}
                >
                  {ticket.status || "OPEN"}
                </span>

              </div>


              {/* =========================
                  SUBJECT
              ========================= */}

              <h2>
                {ticket.subject}
              </h2>


              {/* =========================
                  MESSAGE
              ========================= */}

              <p className="ticket-message">
                {ticket.message}
              </p>


              {/* =========================
                  ASSIGNED USER
              ========================= */}

              {ticket.assignedTo && (

                <p className="ticket-assigned">

                  Assigned to:{" "}

                  <strong>
                    {ticket.assignedTo.name}
                  </strong>

                  {ticket.assignedTo.role && (
                    <span>
                      {" "}
                      ({ticket.assignedTo.role})
                    </span>
                  )}

                </p>

              )}


              {/* =========================
                  BOTTOM
              ========================= */}

              <div className="ticket-card-bottom">

                <span>
                  {ticket.createdAt
                    ? new Date(
                        ticket.createdAt
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "-"}
                </span>


                <Link
                  to={`${supportBasePath}/${ticket._id}`}
                  className="view-ticket-btn"
                >
                  Open Chat →
                </Link>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
};

export default SupportTickets;