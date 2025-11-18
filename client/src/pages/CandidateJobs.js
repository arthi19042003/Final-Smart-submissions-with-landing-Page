import React, { useEffect, useState } from "react";
import api from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { useLocation, Link } from "react-router-dom"; // ✅ Import Link
import { useAuth } from "../context/AuthContext"; // ✅ Import useAuth
import "./CandidateJobs.css";

const CandidateJobs = () => {
  const [jobs, setJobs] = useState([]); // All jobs from API
  const [filteredJobs, setFilteredJobs] = useState([]); // Jobs to display
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(null);
  const [applyingId, setApplyingId] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  const { user } = useAuth(); // ✅ Get the user from context
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Always fetch public jobs
        const jobsPromise = api.get("/positions/open").catch(err => {
          console.error("Failed to fetch jobs:", err);
          toast.error("Failed to load available jobs.");
          return { data: [] }; 
        });

        // 2. ✅ Conditionally fetch user-specific data
        let resumePromise = Promise.resolve({ data: null });
        let submissionsPromise = Promise.resolve({ data: [] });

        if (user) { // Only fetch if user is logged in
          resumePromise = api.get("/resume/active").catch(() => ({ data: null }));
          submissionsPromise = api.get("/submissions/my-submissions").catch(err => {
            console.error("Failed to fetch submissions:", err);
            return { data: [] }; 
          });
        }

        // 3. Await all promises
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
        toast.error("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]); // ✅ Add 'user' as a dependency

  // This useEffect (for filtering) is correct from the previous step
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
      const skills = (job.requiredSkills || []).join(' ').toLowerCase();
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
    // This function will only be called if the user is logged in
    // because the button will be disabled, but we double-check.
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

  if (loading) return <div className="jobs-container"><p className="loading">Loading jobs...</p></div>;

  return (
    <div className="jobs-container">
      <Toaster position="top-right" />
      <h2>Available Positions</h2>
      <p className="subtitle">Browse and apply for open roles</p>

      {/* ✅ Show resume warning only if logged in and no resume */}
      {user && !resume && (
        <div className="alert-warning">
          ⚠️ You need an active resume to apply. <Link to="/resume">Upload one here</Link>.
        </div>
      )}
      
      {/* ✅ Show login prompt if not logged in */}
      {!user && (
         <div className="alert-warning">
          <Link to="/login">Log in</Link> or <Link to="/register">register</Link> to apply for jobs.
        </div>
      )}

      <div className="jobs-grid">
        {filteredJobs.length === 0 ? (
          <p className="empty">No positions found matching your search.</p>
        ) : (
          filteredJobs.map((job) => (
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
                // ✅ FIX: Disable button if user is not logged in OR has no resume
                disabled={!user || !resume || applyingId === job._id || appliedJobIds.has(job._id)}
              >
                {applyingId === job._id 
                  ? "Applying..." 
                  : appliedJobIds.has(job._id) 
                  ? "✓ Applied"
                  : !user
                  ? "Log in to Apply" // ✅ New text for logged-out users
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