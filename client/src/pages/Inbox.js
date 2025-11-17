import React, { useEffect, useState } from "react";
import api from "../api/axios"; 
import "./Inbox.css";

const Inbox = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/inbox"); 
        setMessages(response.data || []);
      } catch (err) {
        console.error("Error fetching messages:", err);
        if (err.response && err.response.status === 401) {
          setError("Unauthorized: Please log in again.");
        } else {
          setError("Failed to load messages. Please try again later.");
        }
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const toggleReadStatus = async (id) => {
    const original = [...messages];
    const msg = messages.find((m) => m._id === id);
    if (!msg) return;

    const currentStatus = msg.status?.toLowerCase() || "read";
    const newStatus = currentStatus === "read" ? "unread" : "read";

    setMessages(
      messages.map((m) =>
        m._id === id ? { ...m, status: newStatus } : m
      )
    );

    try {
      await api.put(`/inbox/${id}/status`, { status: newStatus });
    } catch (err) {
      console.error("Error updating message status:", err);
      setError("Failed to update message status on server.");
      setMessages(original);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <div className="inbox-container">
        <p className="loading">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="inbox-container">
      <h2>Inbox</h2>
      <p className="subtitle">Stay updated with your recruiting activity</p>

      {error && <p className="error">{error}</p>}

      {messages.length === 0 && !error ? (
        <p className="empty">No messages yet.</p>
      ) : (
        <div className="message-list">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`message-card ${
                msg.status?.toLowerCase() === "unread" ? "unread" : ""
              } clickable`}
              onClick={() => toggleReadStatus(msg._id)}
            >
              <div className="message-header">
                <h4>{msg.subject || "No Subject"}</h4>
                <span className="message-date">{formatDate(msg.createdAt)}</span>
              </div>

              <p className="message-sender">
                From: {msg.from || "Unknown Sender"}
              </p>
              <p className="message-text">{msg.message || "No content"}</p>

              <span
                className={`status-tag ${
                  msg.status?.toLowerCase() === "unread"
                    ? "status-unread"
                    : "status-read"
                }`}
              >
                {msg.status || "read"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inbox;