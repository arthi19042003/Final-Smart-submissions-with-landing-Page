// src/api/profile.js
import api from "./axios";

// Fetch user profile
export const fetchProfile = async () => {
  const res = await api.get("/profile");
  return res.data;
};

// Update user profile
export const updateProfile = async (profileData) => {
  const res = await api.put("/profile", profileData);
  return res.data;
};

// Add experience
export const addExperience = async (expData) => {
  const res = await api.post("/profile/experience", expData);
  return res.data;
};

// Update experience
export const updateExperience = async (id, expData) => {
  const res = await api.put(`/profile/experience/${id}`, expData);
  return res.data;
};

// Delete experience
export const deleteExperience = async (id) => {
  const res = await api.delete(`/profile/experience/${id}`);
  return res.data;
};

// Add education
export const addEducation = async (eduData) => {
  const res = await api.post("/profile/education", eduData);
  return res.data;
};

// Update education
export const updateEducation = async (id, eduData) => {
  const res = await api.put(`/profile/education/${id}`, eduData);
  return res.data;
};

// Delete education
export const deleteEducation = async (id) => {
  const res = await api.delete(`/profile/education/${id}`);
  return res.data;
};
