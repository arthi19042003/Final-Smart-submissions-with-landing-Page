// client/src/pages/Profile.js
import React, { useState, useEffect } from "react";
import api from "../api/axios"; // ✅ Use configured axios
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

// Reusable component for Experience/Education items
const ProfileItem = ({ item, onRemove, onUpdate, type }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(item);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleUpdate = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="profile-item-editor">
        {type === 'exp' && (
          <>
            <input name="position" value={formData.position} onChange={handleChange} placeholder="Position *" />
            <input name="company" value={formData.company} onChange={handleChange} placeholder="Company *" />
          </>
        )}
        {type === 'edu' && (
          <>
            <input name="institution" value={formData.institution} onChange={handleChange} placeholder="Institution *" />
            <input name="degree" value={formData.degree} onChange={handleChange} placeholder="Degree *" />
            <input name="field" value={formData.field} onChange={handleChange} placeholder="Field of Study *" />
          </>
        )}
        <input name="startDate" type="date" value={formData.startDate?.split('T')[0] || ''} onChange={handleChange} />
        {!formData.current && (
          <input name="endDate" type="date" value={formData.endDate?.split('T')[0] || ''} onChange={handleChange} />
        )}
        <label><input name="current" type="checkbox" checked={formData.current} onChange={handleChange} /> Current</label>
        {type === 'exp' && (
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" />
        )}
        <button onClick={handleUpdate} className="btn-save-item">Save</button>
        <button onClick={() => setIsEditing(false)} className="btn-cancel-item">Cancel</button>
      </div>
    );
  }

  return (
    <div className="profile-item">
      <div>
        {type === 'exp' && <h4>{item.position} at {item.company}</h4>}
        {type === 'edu' && <h4>{item.degree} in {item.field}</h4>}
        {type === 'edu' && <p>{item.institution}</p>}
        <p className="item-dates">
          {new Date(item.startDate).toLocaleDateString()} - {item.current ? 'Present' : new Date(item.endDate).toLocaleDateString()}
        </p>
        {type === 'exp' && <p>{item.description}</p>}
      </div>
      <div>
        <button onClick={() => setIsEditing(true)} className="btn-edit-item">Edit</button>
        <button onClick={() => onRemove(item._id)} className="btn-delete-item">Delete</button>
      </div>
    </div>
  );
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    bio: "",
    skills: [],
  });
  const [skillInput, setSkillInput] = useState("");
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  
  const [newExp, setNewExp] = useState({ company: '', position: '', startDate: '', endDate: '', description: '', current: false });
  const [newEdu, setNewEdu] = useState({ institution: '', degree: '', field: '', startDate: '', endDate: '', current: false });
  const [showExpForm, setShowExpForm] = useState(false);
  const [showEduForm, setShowEduForm] = useState(false);

  useEffect(() => {
    // ✅ FIX: Safety check using optional chaining to prevent crash
    if (user?.profile) {
      setFormData({
        firstName: user.profile.firstName || "",
        lastName: user.profile.lastName || "",
        phone: user.profile.phone || "",
        address: user.profile.address || "",
        city: user.profile.city || "",
        state: user.profile.state || "",
        zipCode: user.profile.zipCode || "",
        bio: user.profile.bio || "",
        skills: user.profile.skills || [],
      });
      setExperience(user.profile.experience || []);
      setEducation(user.profile.education || []);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First Name is required.";
    if (!formData.lastName) newErrors.lastName = "Last Name is required.";
    if (!formData.phone) newErrors.phone = "Phone is required.";
    if (!formData.city) newErrors.city = "City is required.";
    if (!formData.state) newErrors.state = "State is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSubForm = (type, data) => {
    const newErrors = {};
    if (type === 'exp') {
      if (!data.position) newErrors.newExp_position = "Position is required.";
      if (!data.company) newErrors.newExp_company = "Company is required.";
      if (!data.startDate) newErrors.newExp_startDate = "Start Date is required.";
    }
    if (type === 'edu') {
      if (!data.institution) newErrors.newEdu_institution = "Institution is required.";
      if (!data.degree) newErrors.newEdu_degree = "Degree is required.";
      if (!data.field) newErrors.newEdu_field = "Field is required.";
      if (!data.startDate) newErrors.newEdu_startDate = "Start Date is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!validateForm()) {
      setMessage({ type: "error", text: "Please fill all mandatory fields." });
      return;
    }

    setLoading(true);
    try {
      const response = await api.put("/profile", formData);
      updateUser(response.data.user);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  // --- Experience Handlers ---
  const handleAddExperience = async () => {
    // ✅ FIX: Ensure user exists before allowing adding
    if (!user) {
        alert("User data loading. Please wait.");
        return;
    }
    if (!validateSubForm('exp', newExp)) return;
    try {
      const res = await api.post('/profile/experience', newExp);
      setExperience(res.data.experience);
      setNewExp({ company: '', position: '', startDate: '', endDate: '', description: '', current: false });
      setShowExpForm(false);
    } catch (err) { console.error(err); }
  };

  const handleUpdateExperience = async (expData) => {
     try {
      const res = await api.put(`/profile/experience/${expData._id}`, expData);
      setExperience(res.data.experience);
    } catch (err) { console.error(err); }
  };

  const handleDeleteExperience = async (id) => {
    try {
      const res = await api.delete(`/profile/experience/${id}`);
      setExperience(res.data.experience);
    } catch (err) { console.error(err); }
  };

  // --- Education Handlers ---
   const handleAddEducation = async () => {
    // ✅ FIX: Ensure user exists
    if (!user) {
        alert("User data loading. Please wait.");
        return;
    }
    if (!validateSubForm('edu', newEdu)) return;
    try {
      const res = await api.post('/profile/education', newEdu);
      setEducation(res.data.education);
      setNewEdu({ institution: '', degree: '', field: '', startDate: '', endDate: '', current: false });
      setShowEduForm(false);
    } catch (err) { console.error(err); }
  };

   const handleUpdateEducation = async (eduData) => {
     try {
      const res = await api.put(`/profile/education/${eduData._id}`, eduData);
      setEducation(res.data.education);
    } catch (err) { console.error(err); }
  };

  const handleDeleteEducation = async (id) => {
    try {
      const res = await api.delete(`/profile/education/${id}`);
      setEducation(res.data.education);
    } catch (err) { console.error(err); }
  };

  // ✅ FIX: Render loading state if user is not loaded yet
  if (!user) {
    return (
        <div className="profile-page-bg">
            <div className="profile-container" style={{textAlign: "center", paddingTop: "50px"}}>
                <p>Loading profile...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="profile-page-bg">
      <div className="profile-container">
        <h1 className="profile-heading">Edit Profile</h1>

        {/* Personal Info Form */}
        <form onSubmit={handleSubmit}>
          <div className="card">
            <h2>Personal Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>First Name<span className="mandatory">*</span></label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className={errors.firstName ? "error" : ""} />
              </div>
              <div className="form-group">
                <label>Last Name<span className="mandatory">*</span></label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className={errors.lastName ? "error" : ""} />
              </div>
            </div>
            <div className="form-group">
              <label>Phone<span className="mandatory">*</span></label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={errors.phone ? "error" : ""} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City<span className="mandatory">*</span></label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className={errors.city ? "error" : ""} />
              </div>
              <div className="form-group">
                <label>State<span className="mandatory">*</span></label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} className={errors.state ? "error" : ""} />
              </div>
              <div className="form-group">
                <label>Zip Code</label>
                <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..." />
            </div>
          </div>

          {/* Skills Section */}
          <div className="card">
            <h2>Skills</h2>
            <div className="skills-input">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                placeholder="Add a skill"
              />
              <button type="button" onClick={handleAddSkill} className="add-skill-btn">Add</button>
            </div>
            <div className="skills-list">
              {formData.skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                  <button type="button" onClick={() => handleRemoveSkill(skill)} className="skill-remove">×</button>
                </span>
              ))}
            </div>
          </div>

          {message.text && (
            <div className={`form-message ${message.type}`}>
              {message.text}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Save Personal Info"}
          </button>
        </form>

        {/* Experience Section */}
        <div className="card">
          <div className="section-header">
            <h2>Work Experience</h2>
            <button onClick={() => setShowExpForm(!showExpForm)} className="btn-add-section">
              {showExpForm ? 'Cancel' : '+ Add Experience'}
            </button>
          </div>
          {showExpForm && (
            <div className="profile-item-editor">
              <input name="position" value={newExp.position} onChange={(e) => setNewExp(p => ({ ...p, position: e.target.value }))} placeholder="Position *" className={errors.newExp_position ? "error" : ""} />
              {errors.newExp_position && <span className="error-text">{errors.newExp_position}</span>}
              
              <input name="company" value={newExp.company} onChange={(e) => setNewExp(p => ({ ...p, company: e.target.value }))} placeholder="Company *" className={errors.newExp_company ? "error" : ""} />
              {errors.newExp_company && <span className="error-text">{errors.newExp_company}</span>}

              <label>Start Date<span className="mandatory">*</span></label>
              <input name="startDate" type="date" value={newExp.startDate} onChange={(e) => setNewExp(p => ({ ...p, startDate: e.target.value }))} className={errors.newExp_startDate ? "error" : ""} />
              {errors.newExp_startDate && <span className="error-text">{errors.newExp_startDate}</span>}

              {!newExp.current && (
                <>
                  <label>End Date</label>
                  <input name="endDate" type="date" value={newExp.endDate} onChange={(e) => setNewExp(p => ({ ...p, endDate: e.target.value }))} />
                </>
              )}
              <label><input name="current" type="checkbox" checked={newExp.current} onChange={(e) => setNewExp(p => ({ ...p, current: e.target.checked }))} /> Current</label>
              
              <textarea name="description" value={newExp.description} onChange={(e) => setNewExp(p => ({ ...p, description: e.target.value }))} placeholder="Description" />
              
              <button onClick={handleAddExperience} className="btn-save-item">Save</button>
            </div>
          )}
          <div className="profile-item-list">
            {experience.map(exp => (
              <ProfileItem key={exp._id} item={exp} type="exp" onRemove={handleDeleteExperience} onUpdate={handleUpdateExperience} />
            ))}
          </div>
        </div>

        {/* Education Section */}
        <div className="card">
          <div className="section-header">
            <h2>Education</h2>
            <button onClick={() => setShowEduForm(!showEduForm)} className="btn-add-section">
              {showEduForm ? 'Cancel' : '+ Add Education'}
            </button>
          </div>
           {showEduForm && (
            <div className="profile-item-editor">
              <input name="institution" value={newEdu.institution} onChange={(e) => setNewEdu(p => ({ ...p, institution: e.target.value }))} placeholder="Institution *" className={errors.newEdu_institution ? "error" : ""} />
              {errors.newEdu_institution && <span className="error-text">{errors.newEdu_institution}</span>}

              <input name="degree" value={newEdu.degree} onChange={(e) => setNewEdu(p => ({ ...p, degree: e.target.value }))} placeholder="Degree *" className={errors.newEdu_degree ? "error" : ""} />
              {errors.newEdu_degree && <span className="error-text">{errors.newEdu_degree}</span>}

              <input name="field" value={newEdu.field} onChange={(e) => setNewEdu(p => ({ ...p, field: e.target.value }))} placeholder="Field of Study *" className={errors.newEdu_field ? "error" : ""} />
              {errors.newEdu_field && <span className="error-text">{errors.newEdu_field}</span>}

              <label>Start Date<span className="mandatory">*</span></label>
              <input name="startDate" type="date" value={newEdu.startDate} onChange={(e) => setNewEdu(p => ({ ...p, startDate: e.target.value }))} className={errors.newEdu_startDate ? "error" : ""} />
              {errors.newEdu_startDate && <span className="error-text">{errors.newEdu_startDate}</span>}

              {!newEdu.current && (
                <>
                  <label>End Date</label>
                  <input name="endDate" type="date" value={newEdu.endDate} onChange={(e) => setNewEdu(p => ({ ...p, endDate: e.target.value }))} />
                </>
              )}
              <label><input name="current" type="checkbox" checked={newEdu.current} onChange={(e) => setNewEdu(p => ({ ...p, current: e.target.checked }))} /> Current</label>
              <button onClick={handleAddEducation} className="btn-save-item">Save</button>
            </div>
          )}
          <div className="profile-item-list">
            {education.map(edu => (
              <ProfileItem key={edu._id} item={edu} type="edu" onRemove={handleDeleteEducation} onUpdate={handleUpdateEducation} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;