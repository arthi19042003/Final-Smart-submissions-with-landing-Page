import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "../styles/Login.css"; 

export default function HiringManagerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); 
  
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const location = useLocation();
  const message = location.state?.message;

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!validate()) return; 
    
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { 
        email, 
        password, 
        role: "hiringManager" 
      }); 
      
      const { data } = res; 
      localStorage.setItem("token", data.token);
      setUser(data.user); 
      navigate("/hiring-manager/dashboard");
    } catch (error) {
      setErr(error?.response?.data?.message || "Login failed");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container"> 
      <div className="auth-card"> 
        <h2>Hiring Manager Login</h2>
        
        {message && (
          <div className="success" style={{ textAlign: 'center', marginBottom: '15px' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email<span className="mandatory">*</span></label>
            <input 
              value={email} 
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(p => ({...p, email: null}));
              }} 
              placeholder="Email" 
              required 
              className={errors.email ? "error" : ""} 
            />
          </div>
          <div className="form-group">
            <label>Password<span className="mandatory">*</span></label>
            <input 
              value={password} 
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(p => ({...p, password: null}));
              }} 
              placeholder="Password" 
              type="password" 
              required 
              className={errors.password ? "error" : ""} 
            />
          </div>
          
          {/* Added Forgot Password link */}
          <div style={{ textAlign: "right", marginBottom: "10px" }}>
            <Link to="/forgot-password" style={{ fontSize: "14px", color: "#6d28d9" }}>Forgot Password?</Link>
          </div>
          
          {err && <div className="error">{err}</div>}
          
          <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        </form>
        <p>
          Need a manager account? <Link to="/register/hiring-manager">Register here</Link>
        </p>
      </div>
    </div>
  );
}