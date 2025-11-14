// client/src/pages/CreatePosition.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Profile.css'; // Reuse profile styling for the form

const CreatePosition = () => {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    project: '',
    organization: '',
    skills: '',
    description: '',
    // ✅ FIX: Changed 'open' to 'Open' (Capitalized) to match backend Schema
    status: 'Open', 
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Ensure skills are sent as an array
      const skillsArray = formData.skills 
        ? formData.skills.split(',').map(s => s.trim()).filter(s => s) 
        : [];
        
      const postData = { ...formData, skills: skillsArray };

      await api.post('/positions', postData);
      
      setMessage({ type: 'success', text: 'Position created successfully!' });
      setTimeout(() => {
        navigate('/hiring-manager/open-positions');
      }, 1500);

    } catch (error) {
      console.error("Create Position Error:", error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create position',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page-bg">
      <div className="profile-container">
        <h1>Create New Position</h1>

        <form onSubmit={handleSubmit}>
          <div className="card">
            <h2>Position Details</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Department *</label>
                <input type="text" name="department" value={formData.department} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Project</label>
                    <input type="text" name="project" value={formData.project} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Organization</label>
                    <input type="text" name="organization" value={formData.organization} onChange={handleChange} />
                </div>
            </div>

            <div className="form-group">
              <label>Skills (comma-separated)</label>
              <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g., React, Node.js, MongoDB" />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Job responsibilities, requirements..."
              />
            </div>
          </div>

          {message.text && (
            <div className={`form-message ${message.type}`}>
              {message.text}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Position"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePosition;