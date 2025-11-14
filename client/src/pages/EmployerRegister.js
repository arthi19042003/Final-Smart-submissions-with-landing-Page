import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import "../styles/Login.css"; 

const EmployerRegister = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    hiringManagerFirstName: '',
    hiringManagerLastName: '',
    email: '',
    hiringManagerPhone: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // ✅ For field validation

  const { register, logout } = useAuth(); 
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors(p => ({ ...p, [name]: null }));
  };

  // ✅ Validation function
  const validate = () => {
    const newErrors = {};
    if (!formData.companyName) newErrors.companyName = "Company Name is required";
    if (!formData.hiringManagerFirstName) newErrors.hiringManagerFirstName = "First Name is required";
    if (!formData.hiringManagerLastName) newErrors.hiringManagerLastName = "Last Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm Password is required";
    
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return; // ✅ Run validation

    setLoading(true);

    const employerData = {
      companyName: formData.companyName.trim(),
      hiringManagerFirstName: formData.hiringManagerFirstName.trim(),
      hiringManagerLastName: formData.hiringManagerLastName.trim(),
      email: formData.email.trim(),
      hiringManagerPhone: formData.hiringManagerPhone.trim(),
      password: formData.password,
      role: "employer" 
    };

    const result = await register(employerData);
    setLoading(false);

    if (result.success) {
      logout();
      navigate('/login/employer', { 
        state: { message: 'Registration successful! Please log in.' } 
      });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page-container"> 
      <div className="auth-card"> 
        <h2>Employer Signup</h2>

        {/* --- THIS IS THE FIX --- */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Company Name<span className="mandatory">*</span></label>
            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required className={errors.companyName ? "error" : ""} />
          </div>

          <div className="form-group">
            <label>Manager First Name<span className="mandatory">*</span></label>
            <input type="text" name="hiringManagerFirstName" value={formData.hiringManagerFirstName} onChange={handleChange} required className={errors.hiringManagerFirstName ? "error" : ""} />
          </div>

          <div className="form-group">
            <label>Manager Last Name<span className="mandatory">*</span></label>
            <input type="text" name="hiringManagerLastName" value={formData.hiringManagerLastName} onChange={handleChange} required className={errors.hiringManagerLastName ? "error" : ""} />
          </div>

          <div className="form-group">
            <label>Email<span className="mandatory">*</span></label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className={errors.email ? "error" : ""} />
          </div>

          <div className="form-group">
            <label>Phone (optional)</label>
            <input type="tel" name="hiringManagerPhone" value={formData.hiringManagerPhone} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Password<span className="mandatory">*</span></label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required className={errors.password ? "error" : ""} />
          </div>

          <div className="form-group">
            <label>Confirm Password<span className="mandatory">*</span></label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className={errors.confirmPassword ? "error" : ""} />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Signing Up...' : 'Signup'}
          </button>
        </form>

        <p>
          Already registered? <Link to="/login/employer">Login here</Link>
        </p>
        <p>
          Are you a candidate? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default EmployerRegister;