import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Notifications.css";

const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/notifications");

      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      if (error.response?.status === 401) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.role === "seller") {
    navigate("/seller/login");
  } else {
    navigate("/login");
  }

  return;
}

      setError(
        error.response?.data?.message ||
          "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark one as read
  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setUnreadCount((prev) =>
        prev > 0 ? prev - 1 : 0
      );
    } catch (error) {
      console.error(
        "Mark as read error:",
        error
      );
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Mark all as read error:",
        error
      );
    }
  };

  // Delete notification
  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);

      setNotifications((prev) =>
        prev.filter(
          (notification) =>
            notification._id !== id
        )
      );

      const deletedNotification =
        notifications.find(
          (notification) =>
            notification._id === id
        );

      if (
        deletedNotification &&
        !deletedNotification.isRead
      ) {
        setUnreadCount((prev) =>
          prev > 0 ? prev - 1 : 0
        );
      }
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "ORDER_PLACED":
        return "🛍️";

      case "NEW_ORDER":
        return "🛒";

      case "ORDER_CONFIRMED":
        return "✅";

      case "ORDER_SHIPPED":
        return "📦";

      case "OUT_FOR_DELIVERY":
        return "🚚";

      case "ORDER_DELIVERED":
        return "🎉";

      case "ORDER_CANCELLED":
        return "❌";

      case "LOW_STOCK":
        return "⚠️";

      default:
        return "🔔";
    }
  };

  if (loading) {
    return (
      <div className="notification-message">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="notifications-page">

      <div className="notifications-container">

        {/* Header */}

        <div className="notifications-header">

          <div>
            <h1>Notifications</h1>

            <p>
              {unreadCount > 0
                ? `${unreadCount} unread notification${
                    unreadCount > 1 ? "s" : ""
                  }`
                : "You're all caught up!"}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              className="mark-all-btn"
              onClick={handleMarkAllAsRead}
            >
              ✓ Mark all as read
            </button>
          )}

        </div>

        {/* Error */}

        {error && (
          <div className="notification-error">
            {error}
          </div>
        )}

        {/* Empty */}

        {notifications.length === 0 ? (
          <div className="empty-notifications">

            <div className="empty-icon">
              🔔
            </div>

            <h2>No Notifications</h2>

            <p>
              You don't have any notifications yet.
            </p>

          </div>
        ) : (
          <div className="notifications-list">

            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-card ${
                  !notification.isRead
                    ? "unread"
                    : ""
                }`}
              >

                <div className="notification-icon">
                  {getIcon(notification.type)}
                </div>

                <div className="notification-content">

                  <h3>
                    {notification.title}
                  </h3>

                  <p>
                    {notification.message}
                  </p>

                  <span>
                    {new Date(
                      notification.createdAt
                    ).toLocaleString()}
                  </span>

                </div>

                <div className="notification-actions">

                  {!notification.isRead && (
                    <button
                      className="read-btn"
                      onClick={() =>
                        handleMarkAsRead(
                          notification._id
                        )
                      }
                    >
                      ✓
                    </button>
                  )}

                  <button
                    className="delete-notification-btn"
                    onClick={() =>
                      handleDelete(
                        notification._id
                      )
                    }
                  >
                    🗑️
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
};

export default Notifications;