import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./RecruiterDashboard.css";

const RecruiterDashboard = () => {
  const { recruiter } = useAuth();
  const navigate = useNavigate();

  const cards = [
    {
      title: "Create Profile",
      desc: "Set up your recruiter profile to manage submissions.",
      path: "/recruiter/profile",
      btn: "Create Profile",
    },
    {
      title: "Submit Resume",
      desc: "Upload candidate resumes for review and tracking.",
      path: "/recruiter/submit-resume",
      btn: "Submit Resume",
    },
    {
      title: "Submission Status",
      desc: "Track your submitted resumes and their progress.",
      path: "/recruiter/submission-status",
      btn: "View Status",
    },
  ];

  return (
    <div className="recruiter-dashboard-page">
      <div className="recruiter-dashboard-card-container">
        <h2 className="recruiter-dashboard-title">
          Welcome, {recruiter?.email || "Recruiter"}
        </h2>
        <p className="recruiter-dashboard-subtitle">
          Your Smart Submissions Control Panel
        </p>

        <div className="recruiter-dashboard-grid">
          {cards.map((card, index) => (
            <div key={index} className="dashboard-card">
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
              <button
                className="recruiter-dashboard-btn"
                onClick={() => navigate(card.path)}
              >
                {card.btn}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
