import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // 1. If they are not logged in at all, kick them to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If the page requires Admin, but the user is a normal USER, kick them to Home
  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  // 3. If they pass the checks, let them see the page!
  return children;
};

export default ProtectedRoute;