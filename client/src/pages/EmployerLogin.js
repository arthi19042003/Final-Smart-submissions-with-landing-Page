import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios"; // ✅ Use api instance
import "../styles/Login.css"; 

export default function EmployerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Added loading state
  const [errors, setErrors] = useState({}); // ✅ For field validation
  
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const location = useLocation();
  const message = location.state?.message;
  
  // ✅ Validation function
  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); 
    if (!validate()) return; // ✅ Run validation
    
    setLoading(true); // ✅ Set loading
    try {
      const res = await api.post("/auth/login", { // ✅ Use api instance
        email,
        password,
        role: "employer",
      });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        navigate("/employer/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check credentials.");
      console.error(err);
    } finally {
      setLoading(false); // ✅ Unset loading
    }
  };

  return (
    <div className="auth-page-container"> 
      <div className="auth-card"> 
        <h2>Employer Login</h2>

        {message && (
          <div className="success" style={{ textAlign: 'center', marginBottom: '15px' }}>
            {message}
          </div>
        )}

        {/* --- THIS IS THE FIX --- */}
        <form onSubmit={handleLogin} noValidate>
          <div className="form-group">
            <label>Email<span className="mandatory">*</span></label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(p => ({...p, email: null}));
              }} 
              placeholder="Email" 
              required 
              className={errors.email ? "error" : ""} // ✅ Apply error class
            />
          </div>
          <div className="form-group">
            <label>Password<span className="mandatory">*</span></label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(p => ({...p, password: null}));
              }} 
              placeholder="Password" 
              required 
              className={errors.password ? "error" : ""} // ✅ Apply error class
            />
          </div>
          
          {error && <div className="error">{error}</div>} 
          
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p>
          Need an employer account? <Link to="/register/employer">Register here</Link>
        </p>
      </div>
    </div>
  );
}