// client/src/pages/Interviews.js
import React, { useState, useEffect } from "react";
import api from '../api/axios'; // Import the configured axios instance
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
        // ✅ FIX: Changed from "/manager/interviews" to "/interviews"
        // This now correctly calls the /api/interviews endpoint
        const response = await api.get("/interviews"); 
        
        // Note: This endpoint currently returns ALL interviews.
        // For a real-world scenario, you would update server/routes/interviewRoutes.js
        // to filter by req.userId to only return interviews for the logged-in candidate.
        setInterviews(response.data);
      } catch (err) {
        console.error("Error fetching interviews:", err);
        setError("Failed to load interviews. Please try again later.");
        setInterviews([]); // Clear data on error
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  // --- Helper function to format date ---
  const formatDate = (dateString) => {
     if (!dateString) return 'N/A';
     try {
       return new Date(dateString).toLocaleDateString("en-GB", {
         weekday: "short", day: "2-digit", month: "short", year: "numeric",
       });
     } catch (e) { return 'Invalid Date'; }
  };

  // --- Helper function to format time ---
  const formatTime = (dateString) => {
     if (!dateString) return '';
     try {
       return new Date(dateString).toLocaleTimeString([], {
         hour: "2-digit", minute: "2-digit", hour12: true // Use AM/PM
       });
     } catch (e) { return ''; }
  };

   // --- Helper function to get mode class ---
   // Assumes 'type' field indicates mode (e.g., "Technical", "HR", "Online", "Onsite")
   // Adjust logic based on your actual data structure in Interview model
   const getModeClass = (type) => {
     if (!type) return 'online'; // Default
     const lowerType = type.toLowerCase();
     if (lowerType.includes('onsite')) return 'onsite';
     // Add more specific checks if needed
     return 'online'; // Default for Technical, HR, Online etc.
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
            // Use _id from MongoDB as key
            <div key={interview._id} className="interview-card">
              <div className="interview-header">
                 {/* Use candidateName from transformed data */}
                <h3>{interview.candidateName || interview.candidate?.firstName || 'Unknown Candidate'}</h3>
                 {/* Display Position Title if available */}
                 {interview.positionTitle && <span className="role">{interview.positionTitle}</span>}
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
                 {/* Use interviewerName from transformed data or model */}
                <p>
                  <strong>Interviewer:</strong> {interview.interviewerName || 'N/A'}
                </p>
                <p>
                  <strong>Type/Mode:</strong>{" "}
                  {/* Use 'type' from Interview model */}
                  <span className={`mode ${getModeClass(interview.type)}`}>
                    {interview.type || 'N/A'} {/* Display the type */}
                  </span>
                </p>
                {/* Display status if available in your model/data */}
                {interview.status && <p><strong>Status:</strong> {interview.status}</p>}
                {/* Display result if available */}
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