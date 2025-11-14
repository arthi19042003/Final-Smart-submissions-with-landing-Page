import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import "../styles/Login.css"; 

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
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
    if (!formData.firstName) newErrors.firstName = "First Name is required";
    if (!formData.lastName) newErrors.lastName = "Last Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone) newErrors.phone = "Phone is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
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
    
    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      state: formData.state,
      password: formData.password,
      role: 'candidate'
    });
    
    setLoading(false);

    if (result.success) {
      logout(); 
      navigate('/login', { 
        state: { message: 'Registration successful! Please log in.' } 
      });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card" style={{ maxWidth: "600px" }}>
        <h2>Candidate Register</h2>

        {/* --- THIS IS THE FIX --- */}
        <form onSubmit={handleSubmit} noValidate>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>First Name<span className="mandatory">*</span></label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className={errors.firstName ? "error" : ""} />
            </div>
            <div className="form-group">
              <label>Last Name<span className="mandatory">*</span></label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className={errors.lastName ? "error" : ""} />
            </div>
          </div>
          
          <div className="form-group">
            <label>Email<span className="mandatory">*</span></label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className={errors.email ? "error" : ""} />
          </div>
          
          <div className="form-group">
            <label>Phone<span className="mandatory">*</span></label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className={errors.phone ? "error" : ""} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>City<span className="mandatory">*</span></label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} required className={errors.city ? "error" : ""} />
            </div>
            <div className="form-group">
              <label>State<span className="mandatory">*</span></label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} required className={errors.state ? "error" : ""} />
            </div>
          </div>

          <div className="form-group">
            <label>Password<span className="mandatory">*</span></label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required className={errors.password ? "error" : ""} />
          </div>

          <div className="form-group">
            <label>Confirm Password<span className="mandatory">*</span></label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className={errors.confirmPassword ? "error" : ""} />
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p>Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
};

export default Register;