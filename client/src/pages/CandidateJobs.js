import React, { useEffect, useState } from "react";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import "./CandidateJobs.css";

const CandidateJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(null);
  const [applyingId, setApplyingId] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [jobsRes, resumeRes, submissionsRes] = await Promise.all([
          api.get("/positions/open").catch(err => {
            console.error("Failed to fetch jobs:", err);
            toast.error("Failed to load available jobs.");
            return { data: [] }; 
          }),
          api.get("/resume/active").catch(() => {
            return { data: null };
          }),
          api.get("/submissions/my-submissions").catch(err => {
            console.error("Failed to fetch submissions:", err);
            return { data: [] }; 
          })
        ]);

        setJobs(jobsRes.data);
        setResume(resumeRes.data);
        
        const appliedIds = new Set(submissionsRes.data.map(sub => sub.jobId));
        setAppliedJobIds(appliedIds);

      } catch (err) {
        console.error("Error loading page data:", err);
        toast.error("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApply = async (job) => {
    if (!resume) {
      toast.error("Please upload and set an active resume in the 'Resume' tab first!");
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

  if (loading) return <div className="jobs-container"><p className="loading">Loading jobs...</p></div>;

  return (
    <div className="jobs-container">
      <Toaster position="top-right" />
      <h2>Available Positions</h2>
      <p className="subtitle">Browse and apply for open roles</p>

      {!resume && (
        <div className="alert-warning">
          ⚠️ You need an active resume to apply. <a href="/resume">Upload one here</a>.
        </div>
      )}

      <div className="jobs-grid">
        {jobs.length === 0 ? (
          <p className="empty">No open positions found at the moment.</p>
        ) : (
          jobs.map((job) => (
            <div key={job._id} className="job-card">
              <div className="job-header">
                <h3>{job.title}</h3>
                <span className="dept-tag">{job.department || "General"}</span>
              </div>
              
              <div className="job-details">
                <p><strong>Location:</strong> {job.location || "Remote"}</p>
                <p><strong>Skills:</strong> {job.requiredSkills?.join(", ") || "N/A"}</p>
                {job.description && <p className="job-desc">{job.description}</p>}
              </div>

              <button 
                className="btn-apply" 
                onClick={() => handleApply(job)}
                disabled={!resume || applyingId === job._id || appliedJobIds.has(job._id)}
              >
                {applyingId === job._id 
                  ? "Applying..." 
                  : appliedJobIds.has(job._id) 
                  ? "✓ Applied" 
                  : "Apply Now"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CandidateJobs;