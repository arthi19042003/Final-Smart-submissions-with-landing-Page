import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./RecruiterProfile.css";

const RecruiterProfileEdit = () => {
  const { recruiter, getRecruiterProfile, recruiterProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const roleOptions = [
    "Sr. Developers",
    "Architects",
    "Developers",
    "Testers",
    "Business Analysts",
    "Infrastructure Professionals",
    "Project Managers",
    "UI Developers",
    "Full Stack Developers",
    "Java/Javascript Engineers",
  ];

  // ✅ Fetch recruiter profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!recruiter?._id) {
          setError("Recruiter not found. Please log in again.");
          setLoading(false);
          return;
        }

        let res;
        try {
          res = await getRecruiterProfile(recruiter._id);
        } catch {
          res = await getRecruiterProfile();
        }

        if (res && res.success && res.recruiter) {
          setProfile({
            ...res.recruiter,
            ratecards:
              res.recruiter.ratecards?.length > 0
                ? res.recruiter.ratecards
                : [{ role: "", lpa: "" }],
            majorskillsarea: res.recruiter.majorskillsarea || [],
          });
        } else {
          setError("Profile not found.");
        }
      } catch (err) {
        console.error("Error fetching recruiter profile:", err);
        setError("Failed to load recruiter profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [recruiter, getRecruiterProfile]);

  // ✅ Handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle checkbox skills
  const handleCheckboxChange = (value) => {
    setProfile((prev) => {
      const updated = prev.majorskillsarea.includes(value)
        ? prev.majorskillsarea.filter((skill) => skill !== value)
        : [...prev.majorskillsarea, value];
      return { ...prev, majorskillsarea: updated };
    });
  };

  // ✅ Ratecard modifications
  const handleRatecardChange = (index, field, value) => {
    const updated = [...profile.ratecards];
    updated[index][field] = value;
    setProfile((prev) => ({ ...prev, ratecards: updated }));
  };

  const addRatecard = () => {
    setProfile((prev) => ({
      ...prev,
      ratecards: [...prev.ratecards, { role: "", lpa: "" }],
    }));
  };

  const removeRatecard = (index) => {
    const updated = [...profile.ratecards];
    updated.splice(index, 1);
    setProfile((prev) => ({ ...prev, ratecards: updated }));
  };

  // ✅ Save updated profile
  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const allowedFields = [
        "address",
        "majorskillsarea",
        "resumeskills",
        "partnerships",
        "companywebsite",
        "companyphone",
        "companyAddress",
        "location",
        "companycertifications",
        "dunsnumber",
        "numberofemployees",
        "ratecards",
      ];

      const filtered = Object.keys(profile)
        .filter((k) => allowedFields.includes(k))
        .reduce((obj, key) => {
          obj[key] = profile[key];
          return obj;
        }, {});

      const res = await recruiterProfile(filtered);

      if (res?.success) {
        setMessage("✅ Profile updated successfully!");
        setTimeout(() => navigate("/recruiter/profile/view"), 1500);
      } else {
        setError(res?.error || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="loading-text">Loading recruiter profile...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!profile) return null;

  return (
    <div className="recruiter-profile-page">
      <div className="recruiter-profile-card">
        <h2 className="recruiter-profile-title">Edit Recruiter Profile</h2>

        <form onSubmit={handleSave} className="recruiter-profile-form">
          {/* Address */}
          <div className="form-group">
            <label htmlFor="address">Address*</label>
            <input
              type="text"
              id="address"
              name="address"
              value={profile.address || ""}
              onChange={handleChange}
            />
          </div>

          {/* Major Skills Area */}
          <div className="form-group">
            <label>Major Skills Area*</label>
            <div className="skills-grid">
              {["Development", "Testing", "Operations", "Business Analyst"].map((skill) => {
                const isChecked = profile.majorskillsarea?.includes(skill);
                return (
                  <label key={skill} className={`skill-checkbox ${isChecked ? "checked" : ""}`}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckboxChange(skill)}
                    />
                    <span>{skill}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Other input fields */}
          {[
            { id: "resumeskills", label: "Resume Skills" },
            { id: "partnerships", label: "Partnerships" },
            { id: "companywebsite", label: "Company Website" },
            { id: "companyphone", label: "Company Phone" },
            { id: "companyAddress", label: "Company Address" },
            { id: "location", label: "Location" },
            { id: "companycertifications", label: "Company Certifications" },
            { id: "numberofemployees", label: "Number of Employees" },
            { id: "dunsnumber", label: "DUNS Number" },
          ].map((field) => (
            <div className="form-group" key={field.id}>
              <label htmlFor={field.id}>{field.label}</label>
              <input
                type="text"
                id={field.id}
                name={field.id}
                value={profile[field.id] || ""}
                onChange={handleChange}
              />
            </div>
          ))}

          {/* Ratecards Section */}
          <div className="form-group">
            <label>Ratecards with Skills*</label>
            {profile.ratecards.map((ratecard, index) => (
              <div className="ratecard-entry" key={index}>
                <div className="ratecard-row">
                  <select
                    value={ratecard.role}
                    onChange={(e) => handleRatecardChange(index, "role", e.target.value)}
                  >
                    <option value="">Select Role</option>
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="LPA"
                    value={ratecard.lpa || ""}
                    onChange={(e) => handleRatecardChange(index, "lpa", e.target.value)}
                  />
                  {profile.ratecards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRatecard(index)}
                      className="ratecard-entry remove-btn"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="button" onClick={addRatecard} className="recruiter-profile-btn save">
              + Add Ratecard
            </button>
          </div>

          {message && <p className="success-text">{message}</p>}
          {error && <p className="error-text">{error}</p>}

          <div className="button-group">
            <button type="submit" disabled={saving} className="recruiter-profile-btn save">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/recruiter/profile/view")}
              className="recruiter-profile-btn cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecruiterProfileEdit;
