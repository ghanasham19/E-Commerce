import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './Auth.module.css'; 

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for better UX

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setIsSubmitting(true);
    
    try {
      await api.post('/users/register', formData);
      alert('Registration successful! Please log in.');
      navigate('/login'); 
    } catch (err) {
      console.error("Registration Error:", err);
      if (err.response && err.response.data) {
        setError(typeof err.response.data === 'string' ? err.response.data : "Registration failed.");
      } else {
        setError('Cannot connect to the server. Please ensure the backend is running.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <h1 className={styles.brandName}>TradeVibe</h1>
          <h2 className={styles.title}>Create your account</h2>
          <p className={styles.subtitle}>Join us to start shopping premium collections.</p>
        </div>
        
        {/* Error message display */}
        {error && (
          <div className={styles.errorAlert}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Full Name</label>
            <input 
              type="text" 
              name="name" 
              required 
              onChange={handleChange} 
              className={styles.input}
              placeholder="John Doe"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <input 
              type="email" 
              name="email" 
              required 
              onChange={handleChange} 
              className={styles.input}
              placeholder="you@example.com"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input 
              type="password" 
              name="password" 
              required 
              onChange={handleChange} 
              className={styles.input}
              placeholder="••••••••"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              required 
              onChange={handleChange} 
              className={styles.input}
              placeholder="+91 98765 43210"
            />
          </div>
          
          <button 
            type="submit" 
            className={styles.submitBtn} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        
        <p className={styles.switchText}>
          Already have an account? <Link to="/login" className={styles.switchLink}>Log in here</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;