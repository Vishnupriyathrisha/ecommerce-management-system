import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./CreateSupportTicket.css";

const CreateSupportTicket = () => {
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      setError("Subject and message are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/support-tickets", {
        subject,
        message,
      });

      const ticket = response.data.ticket;

      alert("Support ticket created successfully!");

      navigate(`/support-tickets/${ticket._id}`);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create support ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-support-page">

      <div className="create-support-card">

        <div className="create-support-header">
          <h1>Create Support Ticket</h1>
          <p>
            Tell us your issue and our support team will help you.
          </p>
        </div>

        {error && (
          <div className="create-support-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Subject</label>

            <input
              type="text"
              placeholder="Enter your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Message</label>

            <textarea
              rows="7"
              placeholder="Describe your issue..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="create-support-actions">

            <button
              type="button"
              className="back-btn"
              onClick={() => navigate("/support-tickets")}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-ticket-btn"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Ticket"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default CreateSupportTicket;