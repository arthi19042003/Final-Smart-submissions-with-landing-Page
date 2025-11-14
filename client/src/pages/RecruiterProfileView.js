import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./RecruiterProfileView.css";

const RecruiterProfileView = () => {
  const { recruiter, getRecruiterProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      if (recruiter?._id) {
        const res = await getRecruiterProfile(recruiter._id);
        if (res.success) setProfile(res.recruiter);
      }
    };
    loadProfile();
  }, [recruiter, getRecruiterProfile]);

  if (!profile)
    return (
      <div className="recruiter-profile-view-page text-center">
        <p className="loading-text">Loading profile...</p>
      </div>
    );

  return (
    <div className="recruiter-profile-view-page">
      <div className="recruiter-profile-card">
        <h2 className="recruiter-profile-title">Recruiter Profile</h2>

        <div className="recruiter-profile-info">
          <ProfileField label="Address" value={profile.address} />
          <ProfileField
            label="Major Skills Area"
            value={
              Array.isArray(profile.majorskillsarea)
                ? profile.majorskillsarea.join(", ")
                : profile.majorskillsarea
            }
          />
          <ProfileField label="Resume Skills" value={profile.resumeskills} />
          <ProfileField label="Partnerships" value={profile.partnerships} />
          <ProfileField label="Company Website" value={profile.companywebsite} />
          <ProfileField label="Company Phone" value={profile.companyphone} />
          <ProfileField label="Company Address" value={profile.companyAddress} />
          <ProfileField label="Location" value={profile.location} />
          <ProfileField
            label="Company Certifications"
            value={profile.companycertifications}
          />
          <ProfileField label="DUNS Number" value={profile.dunsnumber} />
          <ProfileField
            label="Number of Employees"
            value={profile.numberofemployees}
          />

          <div className="form-group">
            <label>Ratecards:</label>
            {profile.ratecards && profile.ratecards.length > 0 ? (
              <ul className="ratecard-list">
                {profile.ratecards.map((card, i) => (
                  <li key={i}>
                    <strong>{card.role}</strong> — {card.lpa} LPA
                  </li>
                ))}
              </ul>
            ) : (
              <p>—</p>
            )}
          </div>
        </div>

        <div className="actions text-center">
          <button
            onClick={() => navigate("/recruiter/profile/edit")}
            className="button"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ Helper subcomponent for readability
const ProfileField = ({ label, value }) => (
  <div className="form-group">
    <label>{label}:</label>
    <p>{value || "—"}</p>
  </div>
);

export default RecruiterProfileView;
