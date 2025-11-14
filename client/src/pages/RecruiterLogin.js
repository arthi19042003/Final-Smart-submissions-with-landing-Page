import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios"; 
import "../styles/Login.css"; 

export default function RecruiterLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    
    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        role: "recruiter", 
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        navigate("/dashboard"); 
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check credentials.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h2>Recruiter Login</h2>

        {message && (
          <div className="success" style={{ textAlign: 'center', marginBottom: '15px' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleLogin}>
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
          Need a recruiter account?{" "}
          <Link to="/register/recruiter">Register here</Link>
        </p>
      </div>
    </div>
  );
}