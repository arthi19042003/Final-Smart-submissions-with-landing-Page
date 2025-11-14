import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; 
import '../styles/Login.css'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // ✅ For field validation

  const navigate = useNavigate();
  const { login } = useAuth(); 

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return; // ✅ Run validation

    setLoading(true);

    try {
      const result = await login(email, password); 
      
      if (result.success) {
        navigate('/dashboard'); 
      } else {
        setLoading(false);
        setError(result.error || 'Login failed. Please check your credentials.');
      }

    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="auth-page-container"> 
      <div className="auth-card"> 
        <h2>Candidate Login</h2>

        {message && (
          <div className="success">
            {message}
          </div>
        )}

        {/* --- THIS IS THE FIX --- */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email<span className="mandatory">*</span></label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(p => ({...p, email: null}));
              }}
              required
              className={errors.email ? "error" : ""} // ✅ Apply error class
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password<span className="mandatory">*</span></label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors(p => ({...p, password: null}));
              }}
              required
              className={errors.password ? "error" : ""} // ✅ Apply error class
            />
          </div>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p>
          Don't have an account?{' '}
          <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;