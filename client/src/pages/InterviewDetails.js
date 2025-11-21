import React, { useEffect, useState } from "react";
import { FaStar, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaSearch, FaFilter } from "react-icons/fa"; 
import { useNavigate, useParams } from "react-router-dom"; 
import { Modal, Button } from "react-bootstrap"; 
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
  const [loading, setLoading] = useState(false);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Delete Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  const navigate = useNavigate();
  const { id } = useParams(); 

  const stars = [1, 2, 3, 4, 5];

  const fetchInterviews = async () => {
    try {
      const { data } = await api.get("/interviews");
      setInterviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching interviews:", err);
      setInterviews([]);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      api.get("/interviews")
        .then(res => {
            const found = res.data.find(i => i._id === id);
            if(found) populateForm(found);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus]);

  const populateForm = (item) => {
    setForm({
      ...item,
      date: item.date || "", 
      rating: Number(item.rating || 0),
      notifyManager: item.notifyManager || false,
    });
    setEditingId(item._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, rating: Number(form.rating) };

      if (id) {
        await api.put(`/interviews/${id}`, payload);
        setMessage("✅ Interview updated successfully");
      } else {
        await api.post("/interviews", payload);
        setMessage("✅ Interview added successfully");
      }
      
      await fetchInterviews();
      resetForm();

      setTimeout(() => {
          navigate("/hiring-manager/schedule"); 
          setMessage("");
      }, 1500);

    } catch (err) {
      console.error(err);
      setMessage("❌ Error while saving. Try again.");
    }
  };

  const handleEdit = (item) => {
    navigate(`/hiring-manager/schedule/${item._id}`);
  };

  const handleDeleteClick = (itemId) => {
    setDeleteId(itemId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      await api.delete(`/interviews/${deleteId}`);
      setMessage("🗑️ Interview deleted");
      await fetchInterviews();
    } catch (err) {
      console.error(err);
      setMessage("❌ Error deleting record");
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
      setTimeout(() => setMessage(""), 2000);
    }
  };

  // --- Filter Logic ---
  const filteredData = interviews.filter((it) => {
    const searchValue = search.trim().toLowerCase();
    
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

  // --- Pagination Logic ---
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  if (loading) return <div className="page interviewer-bg"><p style={{textAlign:'center', paddingTop:'50px'}}>Loading...</p></div>;

  return (
    <div className="page interviewer-bg">
      <div className="card form-card">
        <h2 className="form-title">{id ? "Update Interview" : "Schedule Interview"}</h2>

        <form onSubmit={handleSubmit}>
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

          <h3 className="section-label">Interview Details</h3>
          <div className="grid-2">
            <div className="form-field">
              <label>Interviewer Name <span>*</span></label>
              <input name="interviewerName" value={form.interviewerName} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <label>Interview Date & Time <span>*</span></label>
              <input 
                type="text" 
                name="date" 
                value={form.date} 
                onChange={handleChange} 
                placeholder="e.g. 21-11-2025 10:30 AM"
                required 
              />
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

          {message && <div className="msg-box" style={{ padding: '10px', textAlign:'center', background: message.includes('Error') ? '#fee2e2' : '#dcfce7', color: message.includes('Error') ? 'red' : 'green', borderRadius: '8px', marginTop: '10px' }}>{message}</div>}
          
          <button type="submit" className="purple-btn full">
            {id ? "Update Interview" : "Save Interview"}
          </button>
        </form>
      </div>

      {/* Records Section */}
      <div className="card records-card">
        <h3 className="section-label">Interview Records</h3>

        <div className="search-row">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input 
              placeholder="Search Candidate / Position" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>

          <div className="filter-wrapper">
            <FaFilter className="filter-icon" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option>Pending</option>
              <option>Scheduled</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        <div className="table-header">
          <span>Candidate</span>
          <span>Date & Time</span>
          <span>Position</span>
          <span>Status</span>
          <span>Result</span>
          <span>Rating</span>
          <span>Actions</span>
        </div>

        {paginatedData.length === 0 ? (
          <p className="no-records" style={{textAlign: "center", padding: "20px", color: "#666"}}>No records found.</p>
        ) : (
          paginatedData.map((it) => (
            <div className="table-row" key={it._id}>
              <span>{it.candidateFirstName || ""} {it.candidateLastName || ""}</span>
              <span>{it.date || "N/A"}</span>
              <span>{it.jobPosition || "N/A"}</span>
              
              {/* ✅ Updated: Plain text status, no badges */}
              <span>{it.status || "Pending"}</span>
              
              {/* ✅ Updated: Plain text result, no badges */}
              <span>{it.result || "Pending"}</span>
              
              <span>⭐ {Number(it.rating || 0)}</span>

              <div className="row-actions">
                <FaEdit className="icon" onClick={() => handleEdit(it)} />
                <FaTrash className="icon delete" onClick={() => handleDeleteClick(it._id)} />
              </div>
            </div>
          ))
        )}

        {totalItems > 0 && ( 
            <div className="d-flex justify-content-center py-4 border-top bg-light rounded-bottom" style={{ marginTop: '15px', paddingTop: '20px' }}>
                <div 
                  className="d-flex align-items-center justify-content-between bg-white border rounded shadow-sm p-1" 
                  style={{ minWidth: '250px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: '1px solid #eee', borderRadius: '8px', padding: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
                >
                    <button 
                        className="btn btn-light d-flex align-items-center justify-content-center border-0"
                        onClick={handlePrev} 
                        disabled={currentPage === 1}
                        style={{ width: '32px', height: '32px', padding: 0, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <FaChevronLeft size={14} color={currentPage === 1 ? "#ccc" : "#333"} />
                    </button>

                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#666', margin: '0 15px', whiteSpace: 'nowrap' }}>
                        Page {currentPage} of {totalPages}
                    </span>

                    <button 
                        className="btn btn-light d-flex align-items-center justify-content-center border-0"
                        onClick={handleNext} 
                        disabled={currentPage === totalPages}
                        style={{ width: '32px', height: '32px', padding: 0, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <FaChevronRight size={14} color={currentPage === totalPages ? "#ccc" : "#333"} />
                    </button>
                </div>
            </div>
        )}
      </div>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this interview record? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default InterviewDetails;