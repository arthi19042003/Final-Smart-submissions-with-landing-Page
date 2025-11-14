import React, { useState, useEffect } from 'react';
// ✅ Keep using your configured api instance
import api from '../api/axios'; 
import './ResumeUpload.css';

const ResumeUpload = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      // ✅ Ensure token is attached if api interceptor fails
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await api.get('/resume', config); 
      setResumes(response.data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Frontend validation
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      setMessage({ type: 'error', text: 'Only PDF, DOC & DOCX allowed' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File must be under 5MB' });
      return;
    }

    setSelectedFile(file);
    setMessage({ type: '', text: '' });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Select a file first' });
      return;
    }

    const formData = new FormData();
    formData.append('resume', selectedFile);
    formData.append('title', title || 'My Resume');

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // ✅ FIX: Explicitly set multipart/form-data header
      await api.post('/resume/upload', formData, {
        headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}` // Ensure token is sent
        }
      });

      setMessage({ type: 'success', text: 'Resume uploaded successfully ✅' });
      setSelectedFile(null);
      setTitle('');
      fetchResumes();
      
      // Clear the file input
      const fileInput = document.getElementById('resume-file');
      if (fileInput) fileInput.value = "";

    } catch (error) {
      console.error("Upload error:", error);
      
      if (error.response) {
        // Server responded with a status code
        if (error.response.status === 401) {
            setMessage({ type: 'error', text: 'Session expired. Please log in.' });
        } else if (error.response.status === 400) {
            setMessage({ type: 'error', text: error.response.data.message || 'Invalid file format.' });
        } else {
            setMessage({ type: 'error', text: 'Server error. Try again later.' });
        }
      } else {
        setMessage({ type: 'error', text: 'Network error. Check your connection.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetActive = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/resume/active/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Set as active ✅' });
      fetchResumes();
    } catch {
      setMessage({ type: 'error', text: 'Failed to set active' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resume?")) return;

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/resume/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Deleted ✅' });
      fetchResumes();
    } catch {
      setMessage({ type: 'error', text: 'Delete failed' });
    }
  };

  const formatSize = (b) => (b / 1024 / 1024).toFixed(2) + " MB";

  return (
    <div className="resume-bg">
      <div className="resume-container">
        
        <h2 className="resume-header">Resume Management</h2>

        <div className="resume-card">
          <h3 className="section-title">Upload Resume</h3>

          <form onSubmit={handleUpload}>
            <input
              type="text"
              placeholder="Resume Title (Optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
            />

            <input
              id="resume-file"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="input"
            />

            {message.text && (
              <p className={message.type === 'success' ? "success" : "error"}>
                {message.text}
              </p>
            )}

            <button className="btn-primary" disabled={loading}>
              {loading ? "Uploading..." : "Upload Resume"}
            </button>
          </form>
        </div>

        <div className="resume-card">
          <h3 className="section-title">Your Resumes</h3>

          {resumes.length === 0 ? (
            <p className="empty">No resumes uploaded</p>
          ) : (
            resumes.map(res => (
              <div key={res._id} className={`resume-item ${res.isActive ? "active" : ""}`}>
                <div>
                  <strong>{res.title}</strong>
                  <p>{res.fileName} • {formatSize(res.fileSize)}</p>
                </div>

                <div className="actions">
                  {!res.isActive && (
                    <button onClick={() => handleSetActive(res._id)} className="btn-secondary">
                      Set Active
                    </button>
                  )}
                  <button onClick={() => handleDelete(res._id)} className="btn-danger">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default ResumeUpload;