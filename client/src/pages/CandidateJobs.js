import React, { useEffect, useState } from "react";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { useLocation, Link } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext"; 
import "./CandidateJobs.css";

const CandidateJobs = () => {
  const [jobs, setJobs] = useState([]); 
  const [filteredJobs, setFilteredJobs] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(null);
  const [applyingId, setApplyingId] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  const { user } = useAuth(); 
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Get Jobs
        const jobsPromise = api.get("/positions/open").catch(err => {
          console.error("Failed to fetch jobs:", err);
          toast.error("Failed to load available jobs.");
          return { data: [] }; 
        });

        // 2. Get User Info (if logged in)
        let resumePromise = Promise.resolve({ data: null });
        let submissionsPromise = Promise.resolve({ data: [] });

        if (user) { 
          resumePromise = api.get("/resume/active").catch(() => ({ data: null }));
          submissionsPromise = api.get("/submissions/my-submissions").catch(err => {
            console.error("Failed to fetch submissions:", err);
            return { data: [] }; 
          });
        }

        const [jobsRes, resumeRes, submissionsRes] = await Promise.all([
          jobsPromise,
          resumePromise,
          submissionsPromise
        ]);

        setJobs(jobsRes.data);
        setResume(resumeRes.data);
        
        const appliedIds = new Set(submissionsRes.data.map(sub => sub.jobId));
        setAppliedJobIds(appliedIds);

      } catch (err) {
        console.error("Error loading page data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = (params.get('q') || '').toLowerCase();
    const loc = (params.get('loc') || '').toLowerCase();

    if (jobs.length === 0) {
      setFilteredJobs([]); 
      return;
    }

    if (!query && !loc) {
      setFilteredJobs(jobs);
      return;
    }

    const filtered = jobs.filter(job => {
      const title = (job.title || '').toLowerCase();
      const description = (job.description || '').toLowerCase();
      const skills = Array.isArray(job.requiredSkills) ? job.requiredSkills.join(' ').toLowerCase() : '';
      const jobLocation = (job.location || '').toLowerCase();

      const queryMatch = !query || 
                         title.includes(query) || 
                         description.includes(query) || 
                         skills.includes(query);
      
      const locationMatch = !loc || jobLocation.includes(loc);

      return queryMatch && locationMatch;
    });

    setFilteredJobs(filtered);

  }, [jobs, location.search]);

  const handleApply = async (job) => {
    if (!user || !resume) {
      toast.error("Please log in and upload an active resume to apply.");
      return;
    }

    try {
      setApplyingId(job._id);
      await api.post("/submissions", {
        jobId: job._id,
        positionTitle: job.title,
        resumeUrl: resume.filePath, 
      });

      toast.success(`Successfully applied for ${job.title}!`);
      
      setAppliedJobIds(prev => new Set(prev).add(job._id));

    } catch (err) {
      console.error("Application error:", err);
      toast.error(err.response?.data?.message || "Failed to apply.");
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) return <div className="jobs-container"><p style={{textAlign:'center', fontSize:'1.2rem', color:'#666'}}>Loading available positions...</p></div>;

  return (
    <div className="jobs-container">
      <Toaster position="top-right" />
      
      <div className="jobs-header-section">
        <h2>Available Positions</h2>
        <p className="subtitle">Explore opportunities and find your next career move.</p>
      </div>

      {user && !resume && (
        <div className="alert-warning">
          <span>⚠️ No active resume found.</span> 
          <Link to="/resume">Upload Resume</Link>
        </div>
      )}
      
      {!user && (
         <div className="alert-info">
          <span>Join us to apply!</span>
          <div style={{display:'inline-block', marginLeft:'10px'}}>
            <Link to="/login">Log in</Link> or <Link to="/register">Register</Link>
          </div>
        </div>
      )}

      <div className="jobs-grid">
        {filteredJobs.length === 0 ? (
          <div className="empty-state">
            <p>No positions found matching your search.</p>
            <button onClick={() => window.location.reload()} className="btn-reset">Show All Jobs</button>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div key={job._id} className="job-card">
              <div className="card-content">
                <div className="card-top">
                  <span className="dept-badge">{job.department || "Engineering"}</span>
                  <h3>{job.title}</h3>
                </div>
                
                <div className="card-details">
                  <div className="detail-row">
                    <span className="label">Location:</span>
                    <span className="value">{job.location || "Remote"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Skills:</span>
                    <span className="value">
                      {Array.isArray(job.requiredSkills) 
                        ? job.requiredSkills.join(", ") 
                        : "General"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className={`btn-apply ${appliedJobIds.has(job._id) ? 'applied' : ''}`}
                  onClick={() => handleApply(job)}
                  disabled={!user || !resume || applyingId === job._id || appliedJobIds.has(job._id)}
                >
                  {applyingId === job._id 
                    ? "Sending..." 
                    : appliedJobIds.has(job._id) 
                    ? "✓ Applied"
                    : !user
                    ? "Log in to Apply" 
                    : "Apply Now"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CandidateJobs;