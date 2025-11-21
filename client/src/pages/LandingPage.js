import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiMapPin,
  FiBriefcase,
  FiDollarSign,
  FiBarChart2,
  FiBell,
  FiChevronDown // Import the arrow icon
} from 'react-icons/fi';
import './LandingPage.css';

const LandingPage = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(
      `/candidate/jobs?q=${encodeURIComponent(jobTitle)}&loc=${encodeURIComponent(location)}`
    );
  };

  return (
    <div className="search-page-container" id="top">
      <section className="search-hero-section">
        <h1 className="search-title">Find Your Dream Job</h1>
        <p className="search-subtitle">Search thousands of opportunities with quick apply</p>

        {/* Search Bar */}
        <form className="search-box" onSubmit={handleSearch}>
          <div className="search-input-group">
            <FiBriefcase className="search-icon" />
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          <div className="search-input-group">
            <FiMapPin className="search-icon" />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <button type="submit" className="search-button">
            <FiSearch />
            <span>Search</span>
          </button>
        </form>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="filter-select-wrapper">
            <FiBriefcase className="filter-icon-left" />
            <select className="filter-select">
              <option value="">Job Type</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="remote">Remote</option>
            </select>
            <FiChevronDown className="filter-arrow" />
          </div>

          <div className="filter-select-wrapper">
            <FiBarChart2 className="filter-icon-left" />
            <select className="filter-select">
              <option value="">Experience Level</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
            </select>
            <FiChevronDown className="filter-arrow" />
          </div>

          <div className="filter-select-wrapper">
            <FiDollarSign className="filter-icon-left" />
            <select className="filter-select">
              <option value="">Salary Range</option>
              <option value="50k">50k - 80k</option>
              <option value="80k">80k - 120k</option>
              <option value="120k">120k+</option>
            </select>
            <FiChevronDown className="filter-arrow" />
          </div>

          <button className="job-alerts-btn">
            <FiBell />
            Job Alerts
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;