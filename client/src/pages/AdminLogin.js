import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "../styles/Login.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email) newErrors.email = true;
    if (!password) newErrors.password = true;
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password, role: "admin" });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <h2 style={{ color: "#dc2626" }}>Admin Login</h2>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Email<span className="mandatory">*</span></label>
            <input
              type="email"
              className={errors.email ? "error" : ""}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: false }); }}
              placeholder="admin@smartsubmissions.com"
            />
          </div>

          <div className="form-group">
            <label>Password<span className="mandatory">*</span></label>
            <input
              type="password"
              className={errors.password ? "error" : ""}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: false }); }}
              placeholder="Enter password"
            />
          </div>

          <button type="submit" disabled={loading} style={{ background: "#dc2626", border: "1px solid #dc2626" }}>
            {loading ? "Verifying..." : "Login to Admin Panel"}
          </button>
        </form>

        <p><Link to="/">Back to Home</Link></p>
      </div>
    </div>
  );
}