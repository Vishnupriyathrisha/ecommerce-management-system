import { useEffect, useRef, useState } from "react";
import {
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import { io } from "socket.io-client";
import api from "../services/api";
import "./SupportTicketDetails.css";

const SupportTicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [selectedReceiver, setSelectedReceiver] = useState("");

  // ======================================================
  // CURRENT USER
  // ======================================================

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const token = localStorage.getItem("token");

  const currentUserId =
    currentUser?._id || currentUser?.id;

  // ======================================================
  // DETECT USER / ADMIN / SELLER CHAT
  // ======================================================

  const isAdminChat = location.pathname.startsWith(
    "/admin/support-tickets"
  );

  const isSellerChat = location.pathname.startsWith(
    "/seller/support-tickets"
  );

  const backPath = isAdminChat
    ? "/admin/support-tickets"
    : isSellerChat
    ? "/seller/support-tickets"
    : "/support-tickets";

  // ======================================================
  // GET PARTICIPANTS
  // ======================================================

  const getParticipants = () => {
    if (!ticket) return [];

    const participants = [];

    // ------------------------------------------------------
    // Participants array
    // ------------------------------------------------------

    if (Array.isArray(ticket.participants)) {
      ticket.participants.forEach((participant) => {
        if (!participant?._id) return;

        const alreadyExists = participants.some(
          (user) =>
            user._id.toString() ===
            participant._id.toString()
        );

        if (!alreadyExists) {
          participants.push({
            _id: participant._id,
            name: participant.name || "User",
            email: participant.email || "",
            role: participant.role || "",
          });
        }
      });
    }

    // ------------------------------------------------------
    // Ticket owner fallback
    // ------------------------------------------------------

    if (ticket.user?._id) {
      const alreadyExists = participants.some(
        (user) =>
          user._id.toString() ===
          ticket.user._id.toString()
      );

      if (!alreadyExists) {
        participants.push({
          _id: ticket.user._id,
          name: ticket.user.name || "Buyer",
          email: ticket.user.email || "",
          role: ticket.user.role || "user",
        });
      }
    }

    // ------------------------------------------------------
    // Assigned user fallback
    // ------------------------------------------------------

    if (ticket.assignedTo?._id) {
      const alreadyExists = participants.some(
        (user) =>
          user._id.toString() ===
          ticket.assignedTo._id.toString()
      );

      if (!alreadyExists) {
        participants.push({
          _id: ticket.assignedTo._id,
          name: ticket.assignedTo.name || "Support",
          email: ticket.assignedTo.email || "",
          role: ticket.assignedTo.role || "",
        });
      }
    }

    // ------------------------------------------------------
    // Remove current logged-in user
    // ------------------------------------------------------

    return participants.filter(
      (participant) =>
        participant._id?.toString() !==
        currentUserId?.toString()
    );
  };

  // ======================================================
  // GET PARTICIPANTS FROM FETCHED TICKET
  // ======================================================

  const getTicketParticipantsFromData = (ticketData) => {
    if (!ticketData) return [];

    const participants = [];

    // ------------------------------------------------------
    // Participants array
    // ------------------------------------------------------

    if (Array.isArray(ticketData.participants)) {
      ticketData.participants.forEach((participant) => {
        if (!participant?._id) return;

        const exists = participants.some(
          (item) =>
            item._id.toString() ===
            participant._id.toString()
        );

        if (!exists) {
          participants.push({
            _id: participant._id,
            name: participant.name || "User",
            email: participant.email || "",
            role: participant.role || "",
          });
        }
      });
    }

    // ------------------------------------------------------
    // Ticket owner
    // ------------------------------------------------------

    if (ticketData.user?._id) {
      const exists = participants.some(
        (item) =>
          item._id.toString() ===
          ticketData.user._id.toString()
      );

      if (!exists) {
        participants.push({
          _id: ticketData.user._id,
          name: ticketData.user.name || "Buyer",
          email: ticketData.user.email || "",
          role: ticketData.user.role || "user",
        });
      }
    }

    // ------------------------------------------------------
    // Assigned user
    // ------------------------------------------------------

    if (ticketData.assignedTo?._id) {
      const exists = participants.some(
        (item) =>
          item._id.toString() ===
          ticketData.assignedTo._id.toString()
      );

      if (!exists) {
        participants.push({
          _id: ticketData.assignedTo._id,
          name: ticketData.assignedTo.name || "Support",
          email: ticketData.assignedTo.email || "",
          role: ticketData.assignedTo.role || "",
        });
      }
    }

    return participants;
  };

  // ======================================================
  // SCROLL TO BOTTOM
  // ======================================================

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  };

  // ======================================================
  // MARK MESSAGES AS READ
  // ======================================================

  const markMessagesAsRead = async () => {
    try {
      await api.put(
        `/support-tickets/${id}/messages/read`
      );
    } catch (error) {
      console.error(
        "Failed to mark messages as read:",
        error.response?.data?.message ||
          error.message
      );
    }
  };

  // ======================================================
  // FETCH TICKET + MESSAGES
  // ======================================================

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError("");

      // ----------------------------------------------------
      // Fetch ticket
      // ----------------------------------------------------

      const ticketResponse = await api.get(
        `/support-tickets/${id}`
      );

      const fetchedTicket =
        ticketResponse.data.ticket;

      setTicket(fetchedTicket);

      // ----------------------------------------------------
      // Select default receiver
      // ----------------------------------------------------

      const availableParticipants =
        getTicketParticipantsFromData(
          fetchedTicket
        );

      const otherParticipants =
        availableParticipants.filter(
          (participant) =>
            participant._id?.toString() !==
            currentUserId?.toString()
        );

      if (otherParticipants.length === 1) {
        setSelectedReceiver(
          otherParticipants[0]._id
        );
      } else if (
        fetchedTicket?.assignedTo?._id &&
        fetchedTicket.assignedTo._id.toString() !==
          currentUserId?.toString()
      ) {
        setSelectedReceiver(
          fetchedTicket.assignedTo._id
        );
      } else {
        setSelectedReceiver("");
      }

      // ----------------------------------------------------
      // Fetch messages
      // ----------------------------------------------------

      const messagesResponse = await api.get(
        `/support-tickets/${id}/messages`
      );

      const fetchedMessages =
        messagesResponse.data.messages || [];

      setMessages(fetchedMessages);

      scrollToBottom();

      // ----------------------------------------------------
      // Mark incoming messages as read
      // ----------------------------------------------------

      await markMessagesAsRead();
    } catch (error) {
      console.error(
        "Fetch support ticket error:",
        error
      );

      if (error.response?.status === 401) {
        navigate(
          isSellerChat ? "/seller/login" : "/login"
        );
        return;
      }

      setError(
        error.response?.data?.message ||
          "Failed to load support ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // SOCKET CONNECTION
  // ======================================================

  useEffect(() => {
    if (!token || !id) return;

    const socket = io("http://localhost:5000", {
      auth: {
        token,
      },
    });

    socketRef.current = socket;

    // ------------------------------------------------------
    // Socket connected
    // ------------------------------------------------------

    socket.on("connect", () => {
      console.log(
        "Socket connected:",
        socket.id
      );

      socket.emit("join_ticket", id);
    });

    // ------------------------------------------------------
    // Socket connection error
    // ------------------------------------------------------

    socket.on("connect_error", (error) => {
      console.error(
        "Socket connection error:",
        error.message
      );
    });

    // ======================================================
    // NEW MESSAGE
    // ======================================================

    socket.on("new_message", (newMessage) => {
      setMessages((previousMessages) => {
        const exists = previousMessages.some(
          (msg) =>
            msg._id?.toString() ===
            newMessage._id?.toString()
        );

        if (exists) {
          return previousMessages;
        }

        return [
          ...previousMessages,
          newMessage,
        ];
      });

      scrollToBottom();

      // ----------------------------------------------------
      // If current user is receiver
      // ----------------------------------------------------

      const receiverId =
        newMessage.receiver?._id ||
        newMessage.receiver?.id ||
        newMessage.receiver;

      if (
        receiverId?.toString() ===
        currentUserId?.toString()
      ) {
        markMessagesAsRead();
      }
    });

    // ======================================================
    // MESSAGES READ
    // ======================================================

    socket.on("messages_read", (data) => {
      if (
        data.ticketId?.toString() !==
        id.toString()
      ) {
        return;
      }

      const readMessageIds =
        data.messageIds || [];

      setMessages((previousMessages) =>
        previousMessages.map((msg) =>
          readMessageIds.some(
            (readId) =>
              readId.toString() ===
              msg._id?.toString()
          )
            ? {
                ...msg,
                isRead: true,
              }
            : msg
        )
      );
    });

    // ======================================================
    // CLEANUP
    // ======================================================

    return () => {
      socket.emit("leave_ticket", id);

      socket.disconnect();

      socketRef.current = null;
    };
  }, [id, token]);

  // ======================================================
  // FETCH WHEN PAGE OPENS
  // ======================================================

  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id]);

  // ======================================================
  // SCROLL WHEN MESSAGES CHANGE
  // ======================================================

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ======================================================
  // SEND MESSAGE
  // ======================================================

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (
      !message.trim() ||
      !ticket ||
      sending
    ) {
      return;
    }

    // ----------------------------------------------------
    // Receiver required
    // ----------------------------------------------------

    if (
      participants.length > 0 &&
      !selectedReceiver
    ) {
      alert("Please select a participant");
      return;
    }

    try {
      setSending(true);

      const requestData = {
        message: message.trim(),
      };

      // ----------------------------------------------------
      // Add receiver
      // ----------------------------------------------------

      if (selectedReceiver) {
        requestData.receiverId =
          selectedReceiver;
      }

      // ----------------------------------------------------
      // Send API request
      // ----------------------------------------------------

      const response = await api.post(
        `/support-tickets/${id}/messages`,
        requestData
      );

      const sentMessage =
        response.data.chatMessage;

      // ----------------------------------------------------
      // Add sent message immediately
      // ----------------------------------------------------

      setMessages((previousMessages) => {
        const exists = previousMessages.some(
          (msg) =>
            msg._id?.toString() ===
            sentMessage._id?.toString()
        );

        if (exists) {
          return previousMessages;
        }

        return [
          ...previousMessages,
          sentMessage,
        ];
      });

      setMessage("");

      scrollToBottom();
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to send message"
      );
    } finally {
      setSending(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="chat-loading">
        Loading support chat...
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div className="chat-error-page">
        <p>{error}</p>

        <button
          onClick={() => navigate(backPath)}
        >
          Back to Tickets
        </button>
      </div>
    );
  }

  // ======================================================
  // TICKET NOT FOUND
  // ======================================================

  if (!ticket) {
    return (
      <div className="chat-error-page">
        <p>
          Support ticket not found.
        </p>

        <button
          onClick={() => navigate(backPath)}
        >
          Back to Tickets
        </button>
      </div>
    );
  }

  // ======================================================
  // PARTICIPANTS
  // ======================================================

  const participants = getParticipants();

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="support-chat-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="support-chat-header">

        <button
          className="back-chat-btn"
          onClick={() => navigate(backPath)}
        >
          ← Back
        </button>

        <div className="chat-ticket-info">

          <h1>{ticket.subject}</h1>

          <span
            className={`chat-status ${
              ticket.status?.toLowerCase() || ""
            }`}
          >
            {ticket.status}
          </span>

        </div>

      </div>

      {/* ==================================================
          CHAT CONTAINER
      ================================================== */}

      <div className="support-chat-container">

        {/* ==================================================
            PARTICIPANT SELECTOR
        ================================================== */}

        {participants.length > 0 && (
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #eee",
              background: "#fff",
            }}
          >
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "6px",
                color: "#333",
              }}
            >
              Chat With
            </label>

            {participants.length === 1 ? (
              <div
                style={{
                  padding: "9px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "7px",
                  maxWidth: "350px",
                  color: "#333",
                  background: "#fafafa",
                }}
              >
                {participants[0].name} (
                {participants[0].role})
              </div>
            ) : (
              <select
                value={selectedReceiver}
                onChange={(e) =>
                  setSelectedReceiver(
                    e.target.value
                  )
                }
                disabled={sending}
                style={{
                  width: "100%",
                  maxWidth: "350px",
                  padding: "9px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "7px",
                  background: "#fff",
                  color: "#333",
                  outline: "none",
                }}
              >
                <option value="">
                  Select participant
                </option>

                {participants.map(
                  (participant) => (
                    <option
                      key={participant._id}
                      value={participant._id}
                    >
                      {participant.name} (
                      {participant.role})
                    </option>
                  )
                )}
              </select>
            )}
          </div>
        )}

        {/* ==================================================
            MESSAGES
        ================================================== */}

        <div className="chat-messages">

          {/* ------------------------------------------------
              ORIGINAL TICKET MESSAGE
          ------------------------------------------------ */}

          <div className="chat-original-message">

            <div className="original-label">
              Ticket Message
            </div>

            <p>
              {ticket.message}
            </p>

            <small>
              {ticket.createdAt
                ? new Date(
                    ticket.createdAt
                  ).toLocaleString("en-IN")
                : ""}
            </small>

          </div>

          {/* ------------------------------------------------
              CHAT MESSAGES
          ------------------------------------------------ */}

          {messages.length === 0 ? (
            <div className="no-chat-messages">
              No replies yet.
              <br />
              Send a message to start the
              conversation.
            </div>
          ) : (
            messages.map((msg) => {

              // ------------------------------------------------
              // Sender ID
              // ------------------------------------------------

              const senderId =
                msg.sender?._id ||
                msg.sender?.id ||
                msg.sender;

              // ------------------------------------------------
              // Is current user's message?
              // ------------------------------------------------

              const isMine =
                senderId?.toString() ===
                currentUserId?.toString();

              return (
                <div
                  key={msg._id}
                  className={`chat-message ${
                    isMine
                      ? "mine"
                      : "theirs"
                  }`}
                >

                  <div className="message-bubble">

                    {/* ------------------------------------------
                        SENDER NAME
                    ------------------------------------------ */}

                    {!isMine && (
                      <div className="sender-name">
                        {msg.sender?.name ||
                          "Support"}

                        {msg.sender?.role && (
                          <span
                            style={{
                              marginLeft: "5px",
                              fontSize: "10px",
                              opacity: 0.7,
                            }}
                          >
                            (
                            {
                              msg.sender.role
                            }
                            )
                          </span>
                        )}
                      </div>
                    )}

                    {/* ------------------------------------------
                        MESSAGE
                    ------------------------------------------ */}

                    <p>
                      {msg.message}
                    </p>

                    {/* ------------------------------------------
                        TIME + TICK
                    ------------------------------------------ */}

                    <div className="message-meta">

                      <span>
                        {msg.createdAt
                          ? new Date(
                              msg.createdAt
                            ).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : ""}
                      </span>

                      {isMine && (
                        <span
                          className={`message-ticks ${
                            msg.isRead
                              ? "read"
                              : ""
                          }`}
                        >
                          {msg.isRead
                            ? "✓✓"
                            : "✓"}
                        </span>
                      )}

                    </div>

                  </div>

                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />

        </div>

        {/* ==================================================
            SEND BOX
        ================================================== */}

        <form
          className="chat-input-area"
          onSubmit={handleSendMessage}
        >

          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            disabled={
              sending ||
              (participants.length > 0 &&
                !selectedReceiver)
            }
          />

          <button
            type="submit"
            disabled={
              sending ||
              !message.trim() ||
              (participants.length > 0 &&
                !selectedReceiver)
            }
          >
            {sending ? "..." : "Send"}
          </button>

        </form>

      </div>
    </div>
  );
};

export default SupportTicketDetails;