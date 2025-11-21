import React, { useState, useEffect } from "react";
import api from '../api/axios'; 
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUserTie, 
  FaVideo, 
  FaMapMarkerAlt, 
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle
} from "react-icons/fa";
import "./Interviews.css";

const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInterviews = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get("/interviews"); 
        setInterviews(response.data);
      } catch (err) {
        console.error("Error fetching interviews:", err);
        setError("Failed to load interviews. Please try again later.");
        setInterviews([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  // --- NEW: Helper to parse multiple date formats ---
  const parseDateHelper = (dateStr) => {
    if (!dateStr) return null;

    // 1. Try standard parsing (for ISO strings like 2025-11-21T10:30:00)
    const standardDate = new Date(dateStr);
    if (!isNaN(standardDate.getTime())) {
      return standardDate;
    }

    // 2. Handle custom format "DD-MM-YYYY HH:mm" or "DD-MM-YYYY HH:mmam/pm"
    // Example input: "22-11-2025 10:30am"
    try {
      // Remove am/pm for splitting, handle spaces
      const cleanStr = dateStr.toLowerCase().replace(/(am|pm)/g, '').trim();
      const [datePart, timePart] = cleanStr.split(' ');

      if (!datePart) return null;

      const [day, month, year] = datePart.split('-');
      
      let hours = 0;
      let minutes = 0;

      if (timePart) {
        const [h, m] = timePart.split(':');
        hours = parseInt(h, 10);
        minutes = parseInt(m, 10);

        // Handle AM/PM logic manually if present in original string
        if (dateStr.toLowerCase().includes('pm') && hours < 12) hours += 12;
        if (dateStr.toLowerCase().includes('am') && hours === 12) hours = 0;
      }

      // Create date: Year, Month (0-indexed), Day, Hours, Minutes
      const customDate = new Date(year, parseInt(month, 10) - 1, day, hours, minutes);
      
      return isNaN(customDate.getTime()) ? null : customDate;
    } catch (e) {
      console.error("Date parse error", e);
      return null;
    }
  };

  const formatDate = (dateString) => {
     const dateObj = parseDateHelper(dateString);
     if (!dateObj) return 'N/A';
     
     return dateObj.toLocaleDateString("en-US", {
       weekday: "short", month: "short", day: "numeric", year: "numeric"
     });
  };

  const formatTime = (dateString) => {
     const dateObj = parseDateHelper(dateString);
     if (!dateObj) return '';

     return dateObj.toLocaleTimeString([], {
       hour: "2-digit", minute: "2-digit"
     });
  };

   const getModeIcon = (mode) => {
     const lower = (mode || '').toLowerCase();
     if (lower.includes('onsite') || lower.includes('offline')) return <FaMapMarkerAlt />;
     return <FaVideo />;
   };
   
   const getStatusIcon = (status) => {
      const lower = (status || '').toLowerCase();
      if (lower === 'completed') return <FaCheckCircle className="text-success" />;
      if (lower === 'cancelled') return <FaTimesCircle className="text-danger" />;
      return <FaHourglassHalf className="text-warning" />;
   };

  if (loading) {
    return <div className="interviews-container"><div className="loading-spinner"></div><p className="loading-text">Loading your schedule...</p></div>;
  }

   if (error) {
     return <div className="interviews-container"><p className="error-message">{error}</p></div>;
   }

  return (
    <div className="interviews-page-wrapper">
      <div className="interviews-container">
        <div className="interviews-header">
            <h2>Scheduled Interviews</h2>
            <p className="subtitle">View and manage your upcoming interview sessions</p>
        </div>

        {interviews.length === 0 ? (
          <div className="empty-state">
            <img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" alt="No Interviews" width="80" style={{opacity:0.5, marginBottom: '15px'}} />
            <p>No interviews scheduled yet.</p>
          </div>
        ) : (
          <div className="interview-grid">
            {interviews.map((interview) => (
              <div key={interview._id} className="interview-card">
                
                <div className="card-header-row">
                  <div className="candidate-info">
                    <h3>
                      {interview.candidateFirstName} {interview.candidateLastName}
                    </h3>
                    {interview.jobPosition && <span className="role-badge">{interview.jobPosition}</span>}
                  </div>
                </div>

                <div className="card-body-grid">
                  <div className="info-item">
                    <FaCalendarAlt className="info-icon" />
                    <div>
                      <span className="label">Date</span>
                      {/* Updated Date Function */}
                      <span className="value">{formatDate(interview.date)}</span>
                    </div>
                  </div>

                  <div className="info-item">
                    <FaClock className="info-icon" />
                    <div>
                      <span className="label">Time</span>
                      {/* Updated Time Function */}
                      <span className="value">{formatTime(interview.date)}</span>
                    </div>
                  </div>

                  <div className="info-item full-width">
                    <FaUserTie className="info-icon" />
                    <div>
                      <span className="label">Interviewer</span>
                      <span className="value">{interview.interviewerName || 'TBD'}</span>
                    </div>
                  </div>
                  
                  <div className="info-item full-width">
                    <span className="mode-icon-wrapper">{getModeIcon(interview.interviewMode)}</span>
                    <div>
                      <span className="label">Mode</span>
                      <span className="value">{interview.interviewMode || 'Online'}</span>
                    </div>
                  </div>
                </div>

                <div className="card-footer-row">
                  <div className="status-group">
                    <span className="label">Status:</span>
                    <span className={`status-pill ${interview.status?.toLowerCase()}`}>
                      {getStatusIcon(interview.status)} {interview.status}
                    </span>
                  </div>
                  
                  {interview.result && interview.result !== 'Pending' && (
                    <div className="result-group">
                        <span className={`result-tag ${interview.result.toLowerCase()}`}>
                            {interview.result}
                        </span>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Interviews;