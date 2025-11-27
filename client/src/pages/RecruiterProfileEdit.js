import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./RecruiterProfileEdit.css";

// Standard Country Codes
const countryCodes = [
  { code: "+91", label: "India (+91)" },
  { code: "+1", label: "USA (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+61", label: "Australia (+61)" },
  { code: "+81", label: "Japan (+81)" },
  { code: "+49", label: "Germany (+49)" },
  { code: "+33", label: "France (+33)" },
  { code: "+86", label: "China (+86)" },
  { code: "+971", label: "UAE (+971)" },
];

const RecruiterProfileEdit = () => {
  const { recruiter, getRecruiterProfile, recruiterProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [phoneCode, setPhoneCode] = useState("+91");

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
          // Parse existing phone number to split Code and Number
          let phone = res.recruiter.companyphone || "";
          let code = "+91";
          const foundCode = countryCodes.find((c) => phone.startsWith(c.code));
          
          if (foundCode) {
            code = foundCode.code;
            phone = phone.replace(foundCode.code, "");
          }
          setPhoneCode(code);

          setProfile({
            ...res.recruiter,
            companyphone: phone, // Store only the number part in state
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Standard phone validation (numbers only, max 10)
    if (name === 'companyphone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setProfile((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (value) => {
    setProfile((prev) => {
      const updated = prev.majorskillsarea.includes(value)
        ? prev.majorskillsarea.filter((skill) => skill !== value)
        : [...prev.majorskillsarea, value];
      return { ...prev, majorskillsarea: updated };
    });
  };

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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile) return;

    // Validate phone length
    if (profile.companyphone && profile.companyphone.length !== 10) {
      setError("Company Phone must be exactly 10 digits.");
      return;
    }

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

      // Combine Code and Number before sending
      filtered.companyphone = `${phoneCode}${profile.companyphone}`;

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
    <div className="recruiter-profile-edit-page">
      <div className="recruiter-profile-edit-container">
        <h2>Edit Recruiter Profile</h2>

        <form onSubmit={handleSave} className="recruiter-profile-edit-form">
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

          {/* Other text fields */}
          {[
            { id: "resumeskills", label: "Resume Skills" },
            { id: "partnerships", label: "Partnerships" },
            { id: "companywebsite", label: "Company Website" },
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

          {/* Company Phone with Dropdown */}
          <div className="form-group">
            <label htmlFor="companyphone">Company Phone*</label>
            <div className="phone-group">
              <select 
                className="phone-prefix-select"
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
              >
                {countryCodes.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <input
                type="tel"
                id="companyphone"
                name="companyphone"
                value={profile.companyphone || ""}
                onChange={handleChange}
                placeholder="10-digit number"
                maxLength="10"
              />
            </div>
          </div>

          {[
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
            <label>Ratecards with Skills</label>
            {profile.ratecards.map((ratecard, index) => (
              <div className="recruiter-rate-card-row" key={index}>
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
            ))}
            <button
              type="button"
              onClick={addRatecard}
              className="recruiter-profile-edit-btn save"
              style={{ width: "fit-content", marginTop: "0" }}
            >
              + Add Ratecard
            </button>
          </div>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-text" style={{textAlign: 'center'}}>{error}</p>}

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              type="submit"
              disabled={saving}
              className="recruiter-profile-edit-btn save"
              style={{ flex: 1 }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/recruiter/profile/view")}
              className="recruiter-profile-edit-btn cancel"
              style={{ flex: 1 }}
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