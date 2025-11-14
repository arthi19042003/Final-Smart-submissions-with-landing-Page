import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios"; // Using the configured axios instance

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start loading until we verify token

  useEffect(() => {
    // Check for existing token in localStorage on app load
    const token = localStorage.getItem("token");
    if (token) {
      // Set token for all future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Fetch user profile to verify token
      api.get("/profile")
        .then(res => {
          if (res.data && res.data.user) {
             setUser(res.data.user);
          } else {
             // Token might be invalid
             localStorage.removeItem("token");
             delete api.defaults.headers.common['Authorization'];
          }
        })
        .catch(() => {
          // Error fetching profile, likely invalid token
          localStorage.removeItem("token");
          delete api.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false); // No token, not loading
    }
  }, []);

  // Login function (as used in Login.js)
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password, role: "candidate" });
      if (res.data.success && res.data.token) {
        localStorage.setItem("token", res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, error: "Invalid response from server" };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Login failed" };
    }
  };

  // Register function
  const register = async (emailOrData, password) => {
    let registrationData;

    if (typeof emailOrData === 'string') {
      // Candidate registration
      registrationData = { email: emailOrData, password: password, role: 'candidate' };
    } else {
      // Employer or Manager registration
      registrationData = { ...emailOrData };
    }

    try {
      const res = await api.post("/auth/register", registrationData);
      if (res.data.success && res.data.token) {
        localStorage.setItem("token", res.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, error: "Invalid response from server" };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Registration failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };
  
  // This function is used by HiringManagerLogin, EmployerLogin
  const manuallySetUser = (userData) => {
    setUser(userData);
  };
  
  // This function is used by Profile.js
  const updateUser = (newUserData) => {
     setUser(prevUser => ({...prevUser, ...newUserData}));
  }

  // ✅ NEW: Function to update the profile (used by RecruiterProfile/RecruiterProfileEdit)
  const recruiterProfile = async (profileData) => {
    try {
      // Use the general /api/profile route to update
      const res = await api.put("/profile", profileData); 
      if (res.data && res.data.success && res.data.user) {
        setUser(res.data.user); // Update the user in context
        return { success: true, user: res.data.user };
      }
      return { success: false, error: "Invalid response from server" };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || "Profile update failed" };
    }
  };

  // ✅ NEW: Function to get the profile (used by RecruiterProfileEdit/RecruiterProfileView)
  const getRecruiterProfile = async () => {
     try {
      // Use the general /api/profile route to fetch
      const res = await api.get("/profile"); 
      if (res.data && res.data.user) {
        setUser(res.data.user);
        // The components expect { success: true, recruiter: ... }
        return { success: true, recruiter: res.data.user };
      }
      return { success: false, error: "Profile not found" };
    } catch (err) {
       return { success: false, error: err.response?.data?.message || "Failed to fetch profile" };
    }
  };

  const value = {
    user,
    recruiter: user, // ✅ ADDED: Alias user as recruiter for components that use this
    setUser: manuallySetUser,
    updateUser,
    loading,
    login,
    register,
    logout,
    recruiterProfile, // ✅ ADDED: The missing function from the error
    getRecruiterProfile, // ✅ ADDED: The other missing function
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};