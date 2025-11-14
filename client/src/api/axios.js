// src/api/axios.js
import axios from "axios";

// Create an axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api", // ✅ Backend base URL
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Add a request interceptor to dynamically include Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Get JWT from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Remove header if no token (avoids sending empty Authorization)
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
