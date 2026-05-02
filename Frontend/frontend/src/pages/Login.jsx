import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import styles from './Auth.module.css'; // Importing the shared CSS

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for better UX

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Call the secure backend
      const response = await api.post('/users/login', credentials);
      
      // NEW SECURE LOGIC: Catch both the Token and the User Data
      const { token, user } = response.data;
      
      // Save them separately in the browser's local storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Send Admin to dashboard, normal users to home
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
      
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password. Please try again.");
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
          <h2 className={styles.title}>Welcome back</h2>
          <p className={styles.subtitle}>Please enter your details to sign in.</p>
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
        
        <form onSubmit={handleLogin} className={styles.form}>
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
          
          <button 
            type="submit" 
            className={styles.submitBtn} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p className={styles.switchText}>
          Don't have an account? <Link to="/Signup" className={styles.switchLink}>Register Here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;