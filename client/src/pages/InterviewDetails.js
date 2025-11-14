// client/src/pages/InterviewDetails.js
import React, { useEffect, useState } from "react";
import { FaStar, FaEdit, FaTrash } from "react-icons/fa";
import api from "../api/axios";
import "./InterviewDetails.css";

function InterviewDetails() {
  const initialState = {
    candidateFirstName: "",
    candidateLastName: "",
    interviewerName: "",
    date: "",
    jobPosition: "",
    interviewMode: "Online",
    status: "Pending",
    result: "Pending",
    rating: 0,
    questionsAsked: "",
    notes: "",
    feedback: "",
    notifyManager: false,
  };

  const [form, setForm] = useState(initialState);
  const [interviews, setInterviews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const stars = [1, 2, 3, 4, 5];

  const fetchInterviews = async () => {
    try {
      const { data } = await api.get("/interviews");
      // Ensure data is an array to prevent crashes
      setInterviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching interviews:", err);
      // Fallback to empty array on error
      setInterviews([]);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleStarClick = (val) => {
    setForm((prev) => ({ ...prev, rating: val }));
  };

  const resetForm = () => {
    setForm(initialState);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, rating: Number(form.rating) };

      if (editingId) {
        await api.put(`/interviews/${editingId}`, payload);
        setMessage("✅ Interview updated successfully");
      } else {
        await api.post("/interviews", payload);
        setMessage("✅ Interview added successfully");
      }

      fetchInterviews();
      resetForm();
    } catch (err) {
      console.error(err);
      setMessage("❌ Error while saving. Try again.");
    }
    setTimeout(() => setMessage(""), 2500);
  };

  // ✅ SAFETY FIX: Handle invalid dates gracefully
  const handleEdit = (item) => {
    let formattedDate = "";
    if (item.date) {
      try {
        formattedDate = new Date(item.date).toISOString().split("T")[0];
      } catch (e) {
        console.warn("Invalid date found for interview:", item._id);
      }
    }

    setForm({
      ...item,
      date: formattedDate,
      rating: Number(item.rating || 0),
      notifyManager: item.notifyManager || false,
    });
    setEditingId(item._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this interview?")) return;
    try {
      await api.delete(`/interviews/${id}`);
      setMessage("🗑️ Interview deleted");
      fetchInterviews();
    } catch (err) {
      console.error(err);
      setMessage("❌ Error deleting record");
    }
    setTimeout(() => setMessage(""), 2000);
  };

  // ✅ SAFETY FIX: Prevent crash if fields are undefined/null
  const filteredData = interviews.filter((it) => {
    const searchValue = search.trim().toLowerCase();
    
    // Use default empty strings if data is missing
    const fName = it.candidateFirstName || "";
    const lName = it.candidateLastName || "";
    const pos = it.jobPosition || "";

    const found =
      fName.toLowerCase().includes(searchValue) ||
      lName.toLowerCase().includes(searchValue) ||
      pos.toLowerCase().includes(searchValue);
      
    const statusMatch = filterStatus === "All" || it.status === filterStatus;
    return found && statusMatch;
  });

  return (
    // 🔴 FIXED: Removed 'fade' class to ensure page is visible
    <div className="page interviewer-bg">
      <div className="card form-card">
        <h2 className="form-title">{editingId ? "Update Interview" : "Interviewer Details"}</h2>

        <form onSubmit={handleSubmit}>
          {/* Section: Candidate Info */}
          <h3 className="section-label">Candidate Information</h3>
          <div className="grid-2">
            <div className="form-field">
              <label>Candidate First Name <span>*</span></label>
              <input name="candidateFirstName" value={form.candidateFirstName} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <label>Candidate Last Name <span>*</span></label>
              <input name="candidateLastName" value={form.candidateLastName} onChange={handleChange} required />
            </div>
          </div>

          {/* Section: Interview Details */}
          <h3 className="section-label">Interview Details</h3>
          <div className="grid-2">
            <div className="form-field">
              <label>Interviewer Name <span>*</span></label>
              <input name="interviewerName" value={form.interviewerName} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <label>Interview Date <span>*</span></label>
              <input type="date" name="date" value={form.date} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <label>Job Position <span>*</span></label>
              <input name="jobPosition" value={form.jobPosition} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <label>Interview Mode</label>
              <select name="interviewMode" value={form.interviewMode} onChange={handleChange}>
                <option>Online</option>
                <option>Offline</option>
                <option>Phone</option>
              </select>
            </div>
          </div>

          {/* Section: Evaluation */}
          <h3 className="section-label">Evaluation</h3>
          <div className="grid-2">
            <div className="form-field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option>Pending</option>
                <option>Scheduled</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </div>

            <div className="form-field">
              <label>Result</label>
              <select name="result" value={form.result} onChange={handleChange}>
                <option>Pending</option>
                <option>Pass</option>
                <option>Fail</option>
              </select>
            </div>
          </div>

          {/* Rating */}
          <label>Rating</label>
          <div className="rating-stars">
            {stars.map((s) => (
              <FaStar
                key={s}
                className={`star ${form.rating >= s ? "active" : ""}`}
                onClick={() => handleStarClick(s)}
              />
            ))}
          </div>

          <div className="form-field">
            <label>Questions Asked</label>
            <textarea name="questionsAsked" value={form.questionsAsked} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Feedback</label>
            <textarea name="feedback" value={form.feedback} onChange={handleChange} />
          </div>

          <div className="form-field" style={{ flexDirection: "row", alignItems: "center", gap: "10px", marginTop: "15px" }}>
            <input
              type="checkbox"
              name="notifyManager"
              id="notifyManager"
              checked={form.notifyManager}
              onChange={handleChange}
              style={{ width: "20px", height: "20px", margin: 0, cursor: "pointer" }}
            />
            <label htmlFor="notifyManager" style={{ marginBottom: "0", cursor: "pointer", fontSize: "1rem", color: "#333" }}>
              Notify Hiring Manager
            </label>
          </div>

          {message && <div className="msg-box">{message}</div>}
          
          <button type="submit" className="purple-btn full">
            {editingId ? "Update Interview" : "Save Interview"}
          </button>
        </form>
      </div>

      {/* History table */}
      <div className="card records-card">
        <h3 className="section-label">Interview Records</h3>

        <div className="search-row">
          <input placeholder="Search Candidate / Position" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option>Pending</option>
            <option>Scheduled</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </div>

        <div className="table-header">
          <span>Candidate</span>
          <span>Date</span>
          <span>Position</span>
          <span>Status</span>
          <span>Result</span>
          <span>Rating</span>
          <span>Actions</span>
        </div>

        {filteredData.length === 0 ? (
          <p className="no-records">No records found.</p>
        ) : (
          filteredData.map((it) => (
            <div className="table-row" key={it._id}>
              {/* ✅ Safe Field Access */}
              <span>{it.candidateFirstName || ""} {it.candidateLastName || ""}</span>
              
              {/* ✅ Safe Date Rendering */}
              <span>
                {it.date && !isNaN(new Date(it.date)) 
                  ? new Date(it.date).toLocaleDateString() 
                  : "N/A"}
              </span>
              
              <span>{it.jobPosition || "N/A"}</span>
              <span className={`badge ${it.status?.toLowerCase()}`}>{it.status || "Pending"}</span>
              <span className={`badge ${it.result?.toLowerCase()}`}>{it.result || "Pending"}</span>
              <span>⭐ {Number(it.rating || 0)}</span>

              <div className="row-actions">
                <FaEdit className="icon" onClick={() => handleEdit(it)} />
                <FaTrash className="icon delete" onClick={() => handleDelete(it._id)} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default InterviewDetails;