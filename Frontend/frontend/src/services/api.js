import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', 
});

// 1. REQUEST INTERCEPTOR: Slaps the token on every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. RESPONSE INTERCEPTOR: The "Bouncer" that catches expired tokens
api.interceptors.response.use(
  (response) => {
    // If the response is successful, just pass it through normally
    return response;
  },
  (error) => {
    // Catch 401 (Unauthorized) or 403 (Forbidden) errors from the backend
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("Token expired or invalid. Auto-logging out user.");
      
      // Clear the dead token and user data from the browser memory
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Force redirect the user back to the login screen
      window.location.href = '/login?expired=true';
    }
    
    return Promise.reject(error);
  }
);

export default api;