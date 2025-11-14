import React, { useEffect, useState } from "react";
import "./SubmissionStatus.css";
// ✅ FIX: Removed unused 'Spinner' and 'Alert' from react-bootstrap
import api from "../api/axios";

const filterFields = {
  submissionId: "Submission ID",
  candidateName: "Candidate Name",
  email: "Email",
  phone: "Phone",
  hiringManager: "Hiring Manager",
  company: "Company",
};

const initialFilters = Object.keys(filterFields).reduce((acc, key) => {
  acc[key] = "";
  return acc;
}, {});

const SubmissionStatus = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setMessage("");

      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v.trim() !== "")
      );

      // Fetch from /submissions endpoint
      const res = await api.get("/submissions", { params: activeFilters });

      const sorted = res.data.sort((a, b) => {
        // Sort by createdAt
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setSubmissions(sorted);
      setMessage(res.data.length === 0 ? "ℹ️ No submissions found." : "");
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setMessage("❌ Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSubmissions();
  };

  const handleView = async (id) => {
    // Note: This logic needs to be updated to point to the correct resume download route
    alert("View function needs to be re-wired.");
  };

  const handleDownload = async (id, filename) => {
    // Note: This logic needs to be updated to point to the correct resume download route
    alert("Download function needs to be re-wired.");
  };

  const handleDelete = async (id) => {
    // Note: This logic needs to be updated to point to the /api/submissions/:id endpoint
    alert("Delete function needs to be re-wired.");
  };

  return (
    <div className="submission-status-page">
      <div className="submission-status-card">
        <h2 className="submission-status-title">My Submissions</h2>

        <form onSubmit={handleSearch} className="submission-status-search">
          {Object.entries(filterFields).map(([key, placeholder]) => (
            <input
              key={key}
              type="text"
              name={key}
              placeholder={placeholder}
              value={filters[key]}
              onChange={handleChange}
              className="submission-status-input"
            />
          ))}
          <button type="submit" className="submission-status-btn">
            Search
          </button>
        </form>

        {/* ✅ FIX: Replaced <Spinner> with a simple div using your existing CSS class */}
        {loading && (
          <div className="submission-status-loading">
            Loading Submissions...
          </div>
        )}

        {/* ✅ FIX: Replaced <Alert> with a div using global .error/.success classes from App.css */}
        {message && (
          <div className={message.startsWith("❌") ? "error" : "success"}>
            {message}
          </div>
        )}

        {submissions.length > 0 && (
          <div className="submission-status-table-wrapper">
            <table className="submission-status-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Company</th>
                  <th>Hiring Manager</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s._id}>
                    <td>{s.candidate?.firstName} {s.candidate?.lastName}</td>
                    <td>{s.candidate?.company}</td>
                    <td>{s.candidate?.hiringManager}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          s.status?.toLowerCase() || ""
                        }`}
                      >
                        {s.status || "Unknown"}
                      </span>
                    </td>
                    <td className="submission-status-actions">
                      <button
                        className="submission-status-view"
                        onClick={() => handleView(s._id)}
                      >
                        View
                      </button>
                      <button
                        className="submission-status-download"
                        onClick={() => handleDownload(s._id, s.fileName)}
                      >
                        Download
                      </button>
                      <button
                        className="submission-status-delete"
                        onClick={() => handleDelete(s._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionStatus;