import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css"; 

export default function HiringManagerRegister() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", companyName: "", email: "", phone: "", password: "", confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // ✅ For field validation
  
  const navigate = useNavigate();
  const { register, logout } = useAuth(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({...form, [name]: value });
    if (errors[name]) setErrors(p => ({ ...p, [name]: null }));
  };

  // ✅ Validation function
  const validate = () => {
    const newErrors = {};
    if (!form.firstName) newErrors.firstName = "First Name is required";
    if (!form.lastName) newErrors.lastName = "Last Name is required";
    if (!form.companyName) newErrors.companyName = "Company Name is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!form.phone) newErrors.phone = "Phone is required";
    if (!form.password) newErrors.password = "Password is required";
    if (!form.confirmPassword) newErrors.confirmPassword = "Confirm Password is required";
    
    if (form.password && form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return; // ✅ Run validation
    
    setLoading(true);
    
    const result = await register({
      firstName: form.firstName,
      lastName: form.lastName,
      companyName: form.companyName,
      email: form.email,
      phone: form.phone,
      password: form.password,
      role: "hiringManager" 
    });
    
    setLoading(false);

    if (result.success) {
      logout(); 
      navigate("/login/hiring-manager", { 
        state: { message: "Registration successful! Please log in." } 
      });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page-container"> 
      <div className="auth-card"> 
        <h2>Hiring Manager - Register</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name<span className="mandatory">*</span></label>
            <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" required className={errors.firstName ? "error" : ""} />
          </div>
          <div className="form-group">
            <label>Last Name<span className="mandatory">*</span></label>
            <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" required className={errors.lastName ? "error" : ""} />
          </div>
          <div className="form-group">
            <label>Company<span className="mandatory">*</span></label>
            <input name="companyName" value={form.companyName} onChange={handleChange} placeholder="Company" required className={errors.companyName ? "error" : ""} />
          </div>
          <div className="form-group">
            <label>Email<span className="mandatory">*</span></label>
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required className={errors.email ? "error" : ""} />
          </div>
          <div className="form-group">
            <label>Phone<span className="mandatory">*</span></label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" required className={errors.phone ? "error" : ""} />
          </div>
          <div className="form-group">
            <label>Password<span className="mandatory">*</span></label>
            <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" required className={errors.password ? "error" : ""} />
          </div>
          <div className="form-group">
            <label>Confirm Password<span className="mandatory">*</span></label>
            <input name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password" type="password" required className={errors.confirmPassword ? "error" : ""} />
          </div>
          
          {error && <div className="error">{error}</div>}
          
          <button type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
        </form>
         <p>
          Already have an account? <Link to="/login/hiring-manager">Login here</Link>
        </p>
      </div>
    </div>
  );
}