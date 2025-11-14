import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ManagerDashboard.css";

const ManagerDashboard = () => {
  const [stats, setStats] = useState({});
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [summaryRes, candidatesRes] = await Promise.all([
          axios.get("/api/manager/summary"),
          axios.get("/api/manager/candidates"),
        ]);
        setStats(summaryRes.data);
        setCandidates(candidatesRes.data);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <p className="loading">Loading dashboard...</p>;

  return (
    <div className="manager-dashboard">
      <h1>Hiring Manager Dashboard</h1>

      {/* --- Summary --- */}
      <div className="summary-grid">
        {[
          { label: "Total", value: stats.totalInterviews, color: "blue" },
          { label: "Upcoming", value: stats.upcoming, color: "orange" },
          { label: "Completed", value: stats.completed, color: "green" },
          { label: "Passed", value: stats.passed, color: "teal" },
          { label: "Failed", value: stats.failed, color: "red" },
          { label: "Pending", value: stats.pending, color: "gray" },
        ].map((item, i) => (
          <div key={i} className={`summary-card ${item.color}`}>
            <h3>{item.label}</h3>
            <p>{item.value}</p>
          </div>
        ))}
      </div>

      {/* --- Candidate Table --- */}
      <div className="candidate-section">
        <h2>Candidate Overview</h2>
        <table className="candidate-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Interviewer</th>
              <th>Date</th>
              <th>Result</th>
              <th>Status</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c._id}>
                <td>{c.candidateName}</td>
                <td>{c.interviewerName}</td>
                <td>{c.date ? new Date(c.date).toLocaleDateString() : "N/A"}</td>
                <td>{c.result}</td>
                <td>{c.status}</td>
                <td>{c.rating || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerDashboard;
