// client/src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Ensure role is always lowercase and defaults to 'candidate' if no user
  const role = (user?.role || 'candidate').toLowerCase();

  return (
    // ✅ CHANGED: className="custom-navbar" to avoid Bootstrap conflict
    <nav className="custom-navbar">
      <div className="navbar-container">
        <HashLink smooth to={user ? '/dashboard' : '/#top'} className="navbar-logo">
          Smart Submissions
        </HashLink>

        <div className="navbar-menu">
          {!user ? (
            <>
              {/* Logged-out links */}
              <HashLink smooth to="/#top" className="navbar-link">Home</HashLink>
              <HashLink smooth to="/#features" className="navbar-link">Features</HashLink>
              <HashLink smooth to="/#pricing" className="navbar-link">Sign Up</HashLink>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register/employer" className="navbar-btn">Post Job</Link>
            </>
          ) : (
            <>
              {/* Role-based links */}
              {role === 'candidate' && (
                <>
                  <Link to="/dashboard" className="navbar-link">Dashboard</Link>
                  <Link to="/candidate/jobs" className="navbar-link">Jobs</Link>
                  <Link to="/profile" className="navbar-link">Profile</Link>
                  <Link to="/resume" className="navbar-link">Resume</Link>
                  <Link to="/interviews" className="navbar-link">Interviews</Link>
                </>
              )}

              {role === 'employer' && (
                <>
                  <Link to="/employer/dashboard" className="navbar-link">Dashboard</Link>
                  <Link to="/employer/profile" className="navbar-link">Profile</Link>
                  <Link to="/positions/new" className="navbar-link">Post Job</Link>
                </>
              )}

              {role === 'hiringmanager' && (
                <>
                  <Link to="/hiring-manager/dashboard" className="navbar-link">Dashboard</Link>
                  {/* Links removed as requested to clean up UI */}
                </>
              )}
              
              {role === 'recruiter' && ( 
                <>
                  <Link to="/recruiter/dashboard" className="navbar-link">Dashboard</Link>
                  <Link to="/recruiter/profile" className="navbar-link">Profile</Link>
                  <Link to="/recruiter/submit-resume" className="navbar-link">Submit Resume</Link>
                  <Link to="/recruiter/submission-status" className="navbar-link">Status</Link>
                </>
              )}

              <button onClick={handleLogout} className="navbar-btn">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}