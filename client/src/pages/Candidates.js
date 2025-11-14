import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // 1. Make sure useNavigate and Link are imported
import axios from 'axios';
import './Candidates.css'; // Assuming you have a CSS file

const Candidates = () => {
  // Use state to hold all form data in one object
  const [formData, setFormData] = useState({
    firstName: 'Ram', // Pre-filled from your screenshot
    lastName: 'R',   // Pre-filled from your screenshot
    email: 'ram@gmail.com', // Pre-filled from your screenshot
    phone: '1234567890',  // Pre-filled from your screenshot
    city: 'Chennai',    // Pre-filled from your screenshot
    state: 'Tamilnadu', // Pre-filled from your screenshot
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // 2. Initialize the navigate function

  // A single handler to update our state object
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // 3. Client-side password check
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return; // Stop the submission
    }

    setLoading(true);

    try {
      // 4. Create a data object to send (without confirmPassword)
      const dataToSubmit = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        state: formData.state,
        password: formData.password,
      };
      
      // 5. Send the registration request to your backend
      await axios.post('/api/auth/register', dataToSubmit); // Make sure this URL is correct
      
      // --- THIS IS THE KEY CHANGE ---
      // 6. (REMOVED) We DO NOT log the user in (e.g., no localStorage.setItem)
      
      setLoading(false);

      // 7. (CHANGED) We redirect to the /login page with a success message
      navigate('/login', {
        state: { message: 'Registration successful! Please log in.' },
      });
      // -----------------------------

    } catch (err) {
      // 8. Handle errors from the backend (like "User already exists")
      setLoading(false);
      setError(err.response && err.response.data.message
        ? err.response.data.message
        : err.message
      );
    }
  };

  // Helper for rendering form fields
  const renderInput = (name, label, type = 'text') => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        required
      />
    </div>
  );

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Candidate Register</h2>

        {/* This structure assumes your CSS handles the 2-column layout */}
        <div className="form-row">
          {renderInput('firstName', 'First Name')}
          {renderInput('lastName', 'Last Name')}
        </div>
        
        {renderInput('email', 'Email', 'email')}
        {renderInput('phone', 'Phone', 'tel')}
        
        <div className="form-row">
          {renderInput('city', 'City')}
          {renderInput('state', 'State')}
        </div>
        
        {renderInput('password', 'Password', 'password')}
        {renderInput('confirmPassword', 'Confirm Password', 'password')}

        {/* 9. This is where the error message appears */}
        {error && (
          <div className="error-message-box">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="register-button">
          {loading ? 'Registering...' : 'Register'}
        </button>

        <div className="login-link">
          Already have an account?{' '}
          {/* 10. Use <Link> for internal navigation */}
          <Link to="/login">Login here</Link>
        </div>
      </form>
    </div>
  );
};

export default Candidates;