import React, { useState, useEffect } from "react";
import api from '../api/axios'; 
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

  const formatDate = (dateString) => {
     if (!dateString) return 'N/A';
     try {
       return new Date(dateString).toLocaleDateString("en-GB", {
         weekday: "short", day: "2-digit", month: "short", year: "numeric",
       });
     } catch (e) { return 'Invalid Date'; }
  };

  const formatTime = (dateString) => {
     if (!dateString) return '';
     try {
       return new Date(dateString).toLocaleTimeString([], {
         hour: "2-digit", minute: "2-digit", hour12: true 
       });
     } catch (e) { return ''; }
  };

   const getModeClass = (mode) => {
     if (!mode) return 'online'; 
     const lowerMode = mode.toLowerCase();
     if (lowerMode.includes('onsite') || lowerMode.includes('offline')) return 'onsite';
     return 'online'; 
   };

  if (loading) {
    return <div className="interviews-container"><p className="empty">Loading interviews...</p></div>;
  }

   if (error) {
     return <div className="interviews-container"><p className="error">{error}</p></div>;
   }

  return (
    <div className="interviews-container">
      <h2>Scheduled Interviews</h2>
      <p className="subtitle">View and manage upcoming interview sessions</p>

      {interviews.length === 0 ? (
        <p className="empty">No interviews scheduled yet.</p>
      ) : (
        <div className="interview-list">
          {interviews.map((interview) => (
            <div key={interview._id} className="interview-card">
              <div className="interview-header">
                {/* ✅ FIXED: Use candidateFirstName and candidateLastName */}
                <h3>
                  {interview.candidateFirstName && interview.candidateLastName 
                    ? `${interview.candidateFirstName} ${interview.candidateLastName}`
                    : 'Unknown Candidate'}
                </h3>
                 {/* ✅ FIXED: Use jobPosition instead of positionTitle */}
                 {interview.jobPosition && <span className="role">{interview.jobPosition}</span>}
              </div>
              <div className="interview-details">
                <p>
                  <strong>Date:</strong>{" "}
                  {formatDate(interview.date)}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {formatTime(interview.date)}
                </p>
                <p>
                  <strong>Interviewer:</strong> {interview.interviewerName || 'N/A'}
                </p>
                <p>
                  <strong>Type/Mode:</strong>{" "}
                  {/* ✅ FIXED: Use interviewMode instead of type */}
                  <span className={`mode ${getModeClass(interview.interviewMode)}`}>
                    {interview.interviewMode || 'Online'} 
                  </span>
                </p>
                {interview.status && <p><strong>Status:</strong> {interview.status}</p>}
                {interview.result && <p><strong>Result:</strong> {interview.result}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Interviews;