import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './Auth.module.css'; // Reusing your shared CSS

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any old errors before trying again
    
    try {
      // FIX: Updated the endpoint from /auth/register to /users/register to match Spring Boot
      await api.post('/users/register', formData);
      
      alert('Registration successful! Please log in.');
      navigate('/login'); // Redirect to login page
      
    } catch (err) {
      console.error("Registration Error:", err);
      // Upgrade: Display the exact error message the backend sends (like "Email already registered")
      if (err.response && err.response.data) {
        setError(typeof err.response.data === 'string' ? err.response.data : "Registration failed.");
      } else {
        setError('Cannot connect to the server. Please ensure the backend is running.');
      }
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.title}>Create Account</h2>
        
        {/* Error message display */}
        {error && <p className={styles.errorMessage} style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input type="text" name="name" required onChange={handleChange} />
          </div>
          
          <div className={styles.formGroup}>
            <label>Email Address</label>
            <input type="email" name="email" required onChange={handleChange} />
          </div>
          
          <div className={styles.formGroup}>
            <label>Password</label>
            <input type="password" name="password" required onChange={handleChange} />
          </div>

          <div className={styles.formGroup}>
            <label>Phone Number</label>
            <input type="text" name="phone" required onChange={handleChange} />
          </div>
          
          <button type="submit" className={styles.submitBtn}>Sign Up</button>
        </form>
        
        <p className={styles.switchText}>
          Already have an account? <Link to="/login" className={styles.switchLink}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;