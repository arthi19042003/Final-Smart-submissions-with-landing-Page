import React, { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import "./EmployerProfile.css";

const emptyTeamMember = () => ({ firstName: "", lastName: "", email: "", phone: "", role: "" });

export default function EmployerProfile() {
  const { user } = useAuth(); // must be set (PrivateRoute)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    // company + hiring manager
    companyName: "",
    hiringManagerFirstName: "",
    hiringManagerLastName: "",
    hiringManagerPhone: "",
    // organization
    organization: "",
    department: "",
    costCenter: "",
    preferredCommunicationMode: "Email",
    // company info
    address: "",
    companyWebsite: "",
    companyPhone: "",
    companyAddress: "",
    companyLocation: "",
    // dynamic lists
    projectSponsors: [], // array of strings
    projects: [], // each project { projectName, teamSize (now unused), teamMembers: [ {firstName,..} ] }
  });

  // UI helpers for add form inputs
  const [sponsorInput, setSponsorInput] = useState("");
  const [teamInput, setTeamInput] = useState(emptyTeamMember());
  
  // State to track which member is being edited
  // Format: { project: projectIndex, member: memberIndex }
  const [editingIndex, setEditingIndex] = useState(null);

  const [message, setMessage] = useState({ type: "", text: "" });
  const [errors, setErrors] = useState({}); // ✅ ADDED: State for field errors

  useEffect(() => {
    // load employer profile if user exists
    async function load() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/profile"); 
        const data = res.data?.user?.profile || {};
        const payload = data;
        
        if (payload) {
          // Normalize minimal shape
          setForm(prev => ({
            ...prev,
            companyName: payload.companyName || prev.companyName,
            hiringManagerFirstName: payload.hiringManagerFirstName || prev.hiringManagerFirstName,
            hiringManagerLastName: payload.hiringManagerLastName || prev.hiringManagerLastName,
            hiringManagerPhone: payload.hiringManagerPhone || prev.hiringManagerPhone,
            organization: payload.organization || prev.organization,
            department: payload.department || prev.department,
            costCenter: payload.costCenter || prev.costCenter,
            preferredCommunicationMode: payload.preferredCommunicationMode || prev.preferredCommunicationMode,
            address: payload.address || prev.address,
            companyWebsite: payload.companyWebsite || prev.companyWebsite,
            companyPhone: payload.companyPhone || prev.companyPhone,
            companyAddress: payload.companyAddress || prev.companyAddress,
            companyLocation: payload.companyLocation || prev.companyLocation,
            projectSponsors: Array.isArray(payload.projectSponsors) ? payload.projectSponsors : prev.projectSponsors,
            projects: Array.isArray(payload.projects) ? payload.projects.map(p => ({ ...p, teamMembers: p.teamMembers || [] })) : prev.projects,
          }));
        }
      } catch (err) {
        console.warn("Could not load employer profile:", err?.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // helpers -----------------------------------------------------------------
  
  // ✅ MODIFIED: Clears field-specific error on change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (message.type === "error") setMessage({ type: "", text: "" }); // Clear general error
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null })); // Clear field error
  };

  // Sponsors ----------------------------------------------------------------
  const addSponsor = () => {
    const v = sponsorInput.trim();
    if (!v) return setMessage({ type: "error", text: "Sponsor name cannot be empty" });
    if (form.projectSponsors.includes(v)) {
      setMessage({ type: "error", text: "Sponsor already added" });
      return;
    }
    setForm(f => ({ ...f, projectSponsors: [...f.projectSponsors, v] }));
    setSponsorInput("");
    setMessage({ type: "success", text: "Sponsor added" });
  };
  const removeSponsor = (i) => {
    setForm(f => ({ ...f, projectSponsors: f.projectSponsors.filter((_, idx) => idx !== i) }));
  };

  // Projects & Team Members ------------------------------------------------
  const addProject = () => {
    setForm(f => ({
      ...f,
      projects: [...f.projects, { projectName: "", teamMembers: [], collapsed: false }] 
    }));
  };
  const removeProject = (index) => {
    setForm(f => ({ ...f, projects: f.projects.filter((_, i) => i !== index) }));
  };
  const updateProjectField = (index, field, value) => {
    setForm(f => {
      const projects = [...f.projects];
      projects[index] = { ...projects[index], [field]: value };
      return { ...f, projects };
    });
  };

  // Combined Add/Update Member function
  const handleAddOrUpdateMember = (projectIndex) => {
    const name = teamInput.firstName.trim();
    if (!name) {
        setMessage({ type: "error", text: "Team member first name is required" });
        return;
    }

    // Check if we are in edit mode FOR THIS specific project
    if (editingIndex && editingIndex.project === projectIndex) {
      
      // --- ✅ FIX: IMMUTABLE UPDATE LOGIC ---
      setForm(f => ({
        ...f,
        projects: f.projects.map((project, pIdx) => {
          // Not the project we're editing, return it as-is
          if (pIdx !== projectIndex) {
            return project;
          }

          // This IS the project. Return a new project object...
          return {
            ...project,
            // ...with a new teamMembers array
            teamMembers: project.teamMembers.map((member, mIdx) => {
              // Not the member we're editing, return it as-is
              if (mIdx !== editingIndex.member) {
                return member;
              }
              // This IS the member. Return the new data from teamInput.
              return teamInput; 
            })
          };
        })
      }));
      setMessage({ type: "success", text: "Team member updated" });

    } else {
      
      // --- ✅ FIX: IMMUTABLE ADD LOGIC ---
      setForm(f => ({
        ...f,
        projects: f.projects.map((project, index) => {
          // If this isn't the project we're adding to, return it unchanged.
          if (index !== projectIndex) {
            return project;
          }
          
          // If it *is* the project, return a *new* project object
          return {
            ...project,
            // With a *new* teamMembers array that includes the new member
            teamMembers: [...(project.teamMembers || []), { ...teamInput }]
          };
        })
      }));
      setMessage({ type: "success", text: "Team member added" });
    }

    // Reset form after add or update
    setTeamInput(emptyTeamMember());
    setEditingIndex(null);
  };

  const handleEditMember = (projectIndex, memberIndex, member) => {
    setTeamInput(member);
    setEditingIndex({ project: projectIndex, member: memberIndex });
  };
  
  const handleCancelEdit = () => {
    setTeamInput(emptyTeamMember());
    setEditingIndex(null);
  };

  const removeTeamMember = (projectIndex, memberIndex) => {
    setForm(f => {
      // Create a new projects array
      const newProjects = f.projects.map((project, pIdx) => {
        // Not the project we're editing, return as-is
        if (pIdx !== projectIndex) {
          return project;
        }
        
        // This IS the project, return a new object
        return {
          ...project,
          // With a new teamMembers array that filters out the removed member
          teamMembers: project.teamMembers.filter((_, mIdx) => mIdx !== memberIndex)
        };
      });
      
      return { ...f, projects: newProjects };
    });
    
    // If we were editing the member we just removed, clear the form
    if (editingIndex?.project === projectIndex && editingIndex?.member === memberIndex) {
      handleCancelEdit();
    }
  };

  // Save -------------------------------------------------------------------
  
  // ✅ MODIFIED: This function now sets the 'errors' state
  const validateBeforeSave = () => {
    const newErrors = {};
    const required = [
      "companyName", "hiringManagerFirstName", "hiringManagerLastName", "hiringManagerPhone",
      "companyWebsite", "companyPhone", "companyAddress", "companyLocation",
      "organization", "department"
    ];
    
    let hasError = false;
    for (const k of required) {
      if (!form[k] || !String(form[k]).trim()) {
        newErrors[k] = "This field is required";
        hasError = true;
      }
    }
    
    setErrors(newErrors);
    
    if (hasError) {
       setMessage({ type: "error", text: "Please fill all required fields (marked *)" });
    }
    
    return !hasError; // Return true if valid, false if errors
  };

  const saveProfile = async () => {
    setMessage({ type: "", text: "" }); // Clear previous messages
    if (!validateBeforeSave()) return;
    setSaving(true);
    
    const payload = {
      ...form,
      projects: form.projects.map(({ collapsed, ...rest }) => ({
        ...rest,
        teamSize: rest.teamMembers.length 
      }))
    };

    try {
      await api.put("/profile", payload); 
      setMessage({ type: "success", text: "Profile saved successfully" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err?.response?.data?.message || "Error saving profile" });
    } finally {
      setSaving(false);
    }
  };


  // Render -----------------------------------------------------------------
  if (loading) return <div className="emp-loading">Loading...</div>;

  return (
    <div className="emp-page">
      <div className="emp-inner">
        <h1 className="emp-title">Employer Profile</h1>
        <p className="emp-sub">Manage your company information and projects</p>

        {/* --- Account / Hiring Manager --- */}
        <section className="card">
          <div className="card-header"><span className="side-bar" />Account Information</div>

          <div className="row">
            <label className="lbl">Company Name <span className="req">*</span></label>
            <input name="companyName" value={form.companyName} onChange={handleChange} placeholder="Company Name" className={errors.companyName ? "error" : ""} />
          </div>

          <div className="two-cols">
            <div>
              <label className="lbl">Hiring Manager First Name <span className="req">*</span></label>
              <input name="hiringManagerFirstName" value={form.hiringManagerFirstName} onChange={handleChange} placeholder="First Name" className={errors.hiringManagerFirstName ? "error" : ""} />
            </div>
            <div>
              <label className="lbl">Hiring Manager Last Name <span className="req">*</span></label>
              <input name="hiringManagerLastName" value={form.hiringManagerLastName} onChange={handleChange} placeholder="Last Name" className={errors.hiringManagerLastName ? "error" : ""} />
            </div>
          </div>

          <div className="row">
            <label className="lbl">Hiring Manager Phone <span className="req">*</span></label>
            <input name="hiringManagerPhone" value={form.hiringManagerPhone} onChange={handleChange} placeholder="Phone" className={errors.hiringManagerPhone ? "error" : ""} />
          </div>

          <div className="row">
            <label className="lbl">Login Email</label>
            <input value={user?.email || ""} disabled />
          </div>
        </section>

        {/* --- Company Info --- */}
        <section className="card">
          <div className="card-header"><span className="side-bar" />Company Information</div>

          <div className="row">
            <label className="lbl">Address</label>
            <input name="address" value={form.address} onChange={handleChange} placeholder="Enter primary address" />
          </div>

          <div className="two-cols">
            <div>
              <label className="lbl">Company Website <span className="req">*</span></label>
              <input name="companyWebsite" value={form.companyWebsite} onChange={handleChange} placeholder="https://www.company.com" className={errors.companyWebsite ? "error" : ""} />
            </div>
            <div>
              <label className="lbl">Company Phone <span className="req">*</span></label>
              <input name="companyPhone" value={form.companyPhone} onChange={handleChange} placeholder="(123) 456-7890" className={errors.companyPhone ? "error" : ""} />
            </div>
          </div>

          <div className="two-cols">
            <div>
              <label className="lbl">Company Address <span className="req">*</span></label>
              <input name="companyAddress" value={form.companyAddress} onChange={handleChange} placeholder="Street address" className={errors.companyAddress ? "error" : ""} />
            </div>
            <div>
              <label className="lbl">Company Location <span className="req">*</span></label>
              <input name="companyLocation" value={form.companyLocation} onChange={handleChange} placeholder="City, State, Country" className={errors.companyLocation ? "error" : ""} />
            </div>
          </div>
        </section>

        {/* --- Organization Details --- */}
        <section className="card">
          <div className="card-header"><span className="side-bar" />Organization Details</div>

          <div className="two-cols">
            <div>
              <label className="lbl">Organization <span className="req">*</span></label>
              <input name="organization" value={form.organization} onChange={handleChange} placeholder="Organization name" className={errors.organization ? "error" : ""} />
            </div>
            <div>
              <label className="lbl">Cost Center</label>
              <input name="costCenter" value={form.costCenter} onChange={handleChange} placeholder="Cost center code" />
            </div>
          </div>

          <div className="row">
            <label className="lbl">Department <span className="req">*</span></label>
            <input name="department" value={form.department} onChange={handleChange} placeholder="Department name" className={errors.department ? "error" : ""} />
          </div>

          <div className="row">
            <label className="lbl">Preferred Communication Mode</label>
            <div className="radio-row">
              <label><input type="radio" name="preferredCommunicationMode" value="Email"
                checked={form.preferredCommunicationMode === "Email"} onChange={handleChange} /> Email</label>
              <label><input type="radio" name="preferredCommunicationMode" value="Phone"
                checked={form.preferredCommunicationMode === "Phone"} onChange={handleChange} /> Phone</label>
            </div>
          </div>
        </section>

        {/* --- Project Sponsors --- */}
        <section className="card">
          <div className="card-header"><span className="side-bar" />Project Sponsors</div>

          <div className="two-cols">
            <div>
              <label className="lbl small">Add key stakeholders and sponsors</label>
              <input placeholder="Add sponsor name" value={sponsorInput} onChange={(e) => setSponsorInput(e.target.value)} />
            </div>
            <div style={{ alignSelf: "flex-end" }}>
              <button className="btn small violet" onClick={addSponsor}>Add</button>
            </div>
          </div>

          <div className="sponsor-list">
            {form.projectSponsors.length === 0 && <div className="muted">No sponsors added</div>}
            {form.projectSponsors.map((s, i) => (
              <div key={i} className="pill">
                <span>{s}</span>
                <button onClick={() => removeSponsor(i)} className="pill-remove">×</button>
              </div>
            ))}
          </div>
        </section>

        {/* --- Projects & Members --- */}
        <section className="card">
          <div className="card-header"><span className="side-bar" />Projects</div>

          <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
            <div className="muted">Manage your projects and team members</div>
            <button className="btn small" onClick={addProject}>+ Add Project</button>
          </div>

          {form.projects.length === 0 && (
            <div className="muted">No projects yet. Click “+ Add Project” to create one.</div>
          )}

          {form.projects.map((p, pi) => (
            <div key={pi} className="project-card">
              <div className="project-top">
                {/* ✅✅✅ FIX: Updated title logic */}
                <strong>
                  Project {pi + 1}
                  {p.collapsed ? `: ${p.projectName || 'Untitled'} (Team Size: ${p.teamMembers.length})` : ''}
                </strong>
                <div className="project-top-actions">
                  <button className="btn tiny" onClick={() => updateProjectField(pi, "collapsed", !p.collapsed)}>{p.collapsed ? "Expand" : "Collapse"}</button>
                  <button className="btn danger tiny" onClick={() => removeProject(pi)}>Remove Project</button>
                </div>
              </div>

              {!p.collapsed && (
                <>
                  <div className="two-cols">
                    <div>
                      <label className="lbl">Project Name</label>
                      <input value={p.projectName} onChange={(e) => updateProjectField(pi, "projectName", e.target.value)} placeholder="Enter project name" />
                    </div>
                  </div>

                  <div className="team-section">
                    <div className="team-top">
                      <div><strong>Team Members</strong></div>
                    </div>

                    {/* list members */}
                    <div className="member-list">
                      { (p.teamMembers || []).length === 0 && <div className="muted">No team members</div> }
                      {(p.teamMembers || []).map((m, mi) => (
                        <div className="member-row" key={mi}>
                          <div className="member-info">
                            <div><strong>Member {mi + 1}</strong></div>
                            <div className="two-cols">
                              <input value={m.firstName} readOnly placeholder="First name" />
                              <input value={m.lastName} readOnly placeholder="Last name" />
                            </div>
                            <div className="two-cols">
                              <input value={m.email} readOnly placeholder="Email" />
                              <input value={m.phone} readOnly placeholder="Phone" />
                            </div>
                            <div><input value={m.role} readOnly placeholder="Role" /></div>
                          </div>

                          <div className="member-actions">
                            <button className="btn tiny" onClick={() => handleEditMember(pi, mi, m)}>Edit</button>
                            <button className="btn danger tiny" onClick={() => removeTeamMember(pi, mi)}>Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* add member UI */}
                    <div className="add-member-form">
                      <div className="two-cols">
                        <input placeholder="First name" value={teamInput.firstName} onChange={(e) => setTeamInput(t => ({ ...t, firstName: e.target.value }))} />
                        <input placeholder="Last name" value={teamInput.lastName} onChange={(e) => setTeamInput(t => ({ ...t, lastName: e.target.value }))} />
                      </div>
                      <div className="two-cols">
                        <input placeholder="Email" value={teamInput.email} onChange={(e) => setTeamInput(t => ({ ...t, email: e.target.value }))} />
                        <input placeholder="Phone" value={teamInput.phone} onChange={(e) => setTeamInput(t => ({ ...t, phone: e.target.value }))} />
                      </div>
                      <div className="row">
                        <input placeholder="Role (e.g. Developer)" value={teamInput.role} onChange={(e) => setTeamInput(t => ({ ...t, role: e.target.value }))} />
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn violet" onClick={() => handleAddOrUpdateMember(pi)}>
                            {editingIndex && editingIndex.project === pi ? 'Update Team Member' : '+ Add Team Member'}
                          </button>
                          {/* ✅ FIX: Show Cancel only when editing */}
                          {editingIndex && editingIndex.project === pi && (
                            <button className="btn small" onClick={handleCancelEdit}>Cancel</button>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </>
              )}

            </div>
          ))}
        </section>

        <div style={{ marginTop: 18 }}>
          {message.text && (
            <div className={`emp-alert ${message.type === "error" ? "error" : "success"}`}>
              {message.text}
            </div>
          )}

          <button className="save-btn" onClick={saveProfile} disabled={saving}>
            {saving ? "Saving..." : "Save Employer Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}