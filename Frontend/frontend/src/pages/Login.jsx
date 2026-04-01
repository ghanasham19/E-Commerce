import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Call the secure backend
      const response = await api.post('/users/login', credentials);
      
      // NEW SECURE LOGIC: Catch both the Token and the User Data
      const { token, user } = response.data;
      
      // Save them separately in the browser's local storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      alert("Login Successful!");
      
      // Send Admin to dashboard, normal users to home
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
      
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', backgroundColor: 'white', borderRadius: '4px' }}>
      <h2 style={{ textAlign: 'center', color: '#2874f0' }}>Secure Login</h2>
      
      {error && <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ fontWeight: 'bold', color: '#666' }}>Email</label>
          <input type="email" name="email" onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
        <div>
          <label style={{ fontWeight: 'bold', color: '#666' }}>Password</label>
          <input type="password" name="password" onChange={handleChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
        <button type="submit" style={{ backgroundColor: '#fb641b', color: 'white', padding: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '2px', fontSize: '1.1rem' }}>
          Login
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Don't have an account? <Link to="/Signup" style={{ color: '#2874f0', fontWeight: 'bold' }}>Register Here</Link>
      </p>
    </div>
  );
};

export default Login;