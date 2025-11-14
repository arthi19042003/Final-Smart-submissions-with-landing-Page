// client/src/pages/Onboarding.js
import React, { useState, useEffect } from "react";
import api from "../api/axios"; // Import configured axios
import "./Onboarding.css";

const Onboarding = () => {
  const [onboardingList, setOnboardingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOnboardingData = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get("/onboarding"); // Fetch from API
        setOnboardingList(response.data);
      } catch (err) {
        console.error("Error fetching onboarding data:", err);
        setError("Failed to load onboarding data. Please try again later.");
        setOnboardingList([]); // Clear data on error
      } finally {
        setLoading(false);
      }
    };
    fetchOnboardingData();
  }, []);

  // --- Helper function to format date ---
  const formatDate = (dateString) => {
     if (!dateString) return 'N/A';
     try {
       return new Date(dateString).toLocaleDateString("en-GB", {
         day: "2-digit", month: "short", year: "numeric",
       });
     } catch (e) { return 'Invalid Date'; }
  };

   // --- Helper function to get status class ---
  const getStatusClass = (status) => {
    if (!status) return 'initiated'; // Default class
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("progress")) return 'progress'; // Example, adjust as needed
    if (lowerStatus.includes("completed")) return 'completed';
    if (lowerStatus.includes("pending")) return 'pending'; // Example
    if (lowerStatus.includes("initiated")) return 'initiated';
    return 'initiated'; // Default fallback
  };

  if (loading) {
    return <div className="onboarding-container"><p className="loading">Loading onboarding data...</p></div>;
  }

  if (error) {
     return <div className="onboarding-container"><p className="error">{error}</p></div>;
  }

  return (
    <div className="onboarding-container">
      <h2>Onboarding Candidates</h2>
      <p className="subtitle">
        Track the onboarding process of newly hired candidates
      </p>

      {onboardingList.length === 0 ? (
        <p className="empty">No candidates currently in onboarding.</p>
      ) : (
        <div className="onboarding-grid">
          {onboardingList.map((entry) => (
            // Use _id from MongoDB as key
            <div key={entry._id} className="onboarding-card">
              <div className="card-header">
                {/* Use populated candidate name */}
                <h3>{entry.candidate?.name || 'Unknown Candidate'}</h3>
                {/* Use status from API */}
                <span className={`status ${getStatusClass(entry.status)}`}>
                  {entry.status || 'Initiated'} {/* Default status */}
                </span>
              </div>
              {/* Use fields from Onboarding model */}
              <p><strong>Start Date:</strong> {formatDate(entry.startDate)}</p>
              <p><strong>Documents Completed:</strong> {entry.documentsCompleted ? 'Yes' : 'No'}</p>
              {/* Removed Mentor, Department, Tasks, Notes as they aren't in the final Onboarding model */}
              {/* <p><strong>Department:</strong> {entry.department || 'N/A'}</p> */}
              {/* <p><strong>Mentor:</strong> {entry.mentor || 'Not Assigned'}</p> */}
              {/* {entry.notes && <p><strong>Notes:</strong> {entry.notes}</p>} */}
              {/* Task rendering removed as it's not in the final model */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Onboarding;