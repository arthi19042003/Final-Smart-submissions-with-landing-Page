import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // ✅ Backend base URL
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Automatically attach JWT token to every request
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");

    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle expired or invalid token globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ Session expired or unauthorized. Redirecting to login...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Optional: only redirect if not already on login/register page
      const currentPath = window.location.pathname;
      if (!["/login", "/register", "/employer-register", "/hiring-manager-login"].includes(currentPath)) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
