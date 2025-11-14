// client/src/pages/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css'; 

const LandingPage = () => {
  return (
    // ✅ FIX: Added id="top" to the main container
    <div className="landing-container" id="top">
      {/* Header is handled by Navbar */}
      
      {/* Intro Section */}
      <section className="landing-section intro-section">
        <div className="landing-content">
          <h1>Welcome to Smart Submissions</h1>
          <p>The platform that connects top-tier candidates, recruiters, and hiring managers seamlessly.</p>
          <div className="intro-buttons">
            <Link to="/register/employer" className="btn btn-primary">Post a Job</Link>
            <Link to="/register" className="btn btn-secondary">Submit Resume</Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="landing-section" id="how-it-works">
        <h2>How It Works</h2>
        <div className="how-it-works-grid">
          <div className="step-card">
            <h3>1. Sign Up</h3>
            <p>Employers, Recruiters, and Candidates create their profiles in minutes.</p>
          </div>
          <div className="step-card">
            <h3>2. Post & Apply</h3>
            <p>Employers post jobs, and recruiters or candidates submit top-quality resumes.</p>
          </div>
          <div className="step-card">
            <h3>3. Track & Hire</h3>
            <p>Manage the entire hiring pipeline, from interview to onboarding, all in one place.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-section" id="features"> 
        <h2>Features</h2>
        <ul className="features-list">
          <li>Centralized dashboard for all roles.</li>
          <li>Advanced profile management for all user types.</li>
          <li>Real-time submission and interview tracking.</li>
          <li>Streamlined onboarding and PO generation.</li>
          <li>In-app messaging and notifications.</li>
        </ul>
      </section>

      {/* Pricing/Sign Up Section */}
      <section className="landing-section pricing-section" id="pricing">
        <h2>Get Started Today</h2>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Candidates</h3>
            <p>Find your next role. Build your profile and get noticed.</p>
            <Link to="/register" className="btn btn-primary">Sign Up as Candidate</Link>
          </div>
          <div className="pricing-card">
            <h3>Recruiters</h3>
            <p>Manage your submissions and connect with top employers.</p>
            <Link to="/register/recruiter" className="btn btn-primary">Sign Up as Recruiter</Link>
          </div>
          <div className="pricing-card">
            <h3>Employers</h3>
            <p>Post jobs and find the best talent for your team.</p>
            <Link to="/register/employer" className="btn btn-primary">Sign Up as Employer</Link>
          </div>

          {/* ✅ UPDATED CODE: New card for Hiring Manager */}
          <div className="pricing-card">
            <h3>Hiring Managers</h3>
            <p>Manage teams, review candidates, and conduct interviews.</p>
            <Link to="/register/hiring-manager" className="btn btn-primary">Sign Up as Manager</Link>
          </div>

        </div>
      </section>

      {/* Contact Form Section */}
      <section className="landing-section" id="contact">
        <h2>Contact Us</h2>
        <form className="contact-form">
          <input type="email" placeholder="Your Email" />
          <textarea placeholder="Your Message" rows="5"></textarea>
          {/* ✅ FIX: Corrected syntax from "type." to "type=" */}
          <button type="submit" className="btn btn-primary">Send Message</button>
        </form>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2025 Smart Submissions. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;