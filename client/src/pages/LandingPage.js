import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import api from '../api/axios'; 
import './LandingPage.css'; 

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [formStatus, setFormStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ type: '', text: '' });
    
    if (!email || !message) {
      setFormStatus({ type: 'error', text: 'Please fill out both email and message fields.' });
      return;
    }

    setLoading(true);

    try {
      await api.post('/contact', {
        email: email,
        message: message,
      });

      setFormStatus({ type: 'success', text: 'Thank you! Your message has been sent successfully!' });
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error("Contact Form Submission Error:", error);
      setFormStatus({ type: 'error', text: error.response?.data?.message || 'Failed to send message. Please try again.' });
    } finally {
      setLoading(false);
    }
  };


  return (
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

          {/* UPDATED CODE: New card for Hiring Manager */}
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
        <form className="contact-form" onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Your Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <textarea 
            placeholder="Your Message" 
            rows="5"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
          
          {/* Display submission status */}
          {formStatus.text && (
            <div className={`form-message ${formStatus.type === 'success' ? 'success' : 'error'}`}>
              {formStatus.text}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send Message'}
          </button>
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