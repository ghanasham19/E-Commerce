import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import styles from './Navbar.module.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Helps us know when the user changes pages
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  // State to hold the real cart count
  const [cartCount, setCartCount] = useState(0);

  // Fetch the cart count whenever the page loads or changes
  useEffect(() => {
    // Only fetch the cart if a normal user is logged in
    if (user && user.role !== 'ADMIN') {
      fetchCartCount();
    }
  }, [location, user]); // Re-runs every time the URL (location) changes

  const fetchCartCount = async () => {
    try {
      // Fetching the cart for the logged-in user
      const response = await api.get(`/cart/${user.id}`);
      if (response.data && response.data.cartItems) {
        // Add up the total quantity of all items in the cart
        const totalItems = response.data.cartItems.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
      }
    } catch (error) {
      console.error("Could not fetch cart count:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <nav className={styles.navbar}>
      {/* BRANDING & LOGO */}
      <Link to="/" className={styles.logo}>
        {/* Grabs the logo directly from your public folder! */}
        <img 
          src="/logo.png" 
          alt="TradeVibe Logo" 
          className={styles.logoImage} 
        />
        Trade<span className={styles.logoSpan}>Vibe</span>
      </Link>
      
      <ul className={styles.navLinks}>
        <li><Link to="/" className={styles.navItem}>Home</Link></li>
        
        {user ? (
          <>
            {user.role === 'ADMIN' ? (
              <>
                <li><Link to="/admin" className={styles.navItem}>Dashboard</Link></li>
                <li><Link to="/admin/orders" className={styles.navItem}>Orders</Link></li>
              </>
            ) : (
              <li><Link to="/orders" className={styles.navItem}>My Orders</Link></li>
            )}
            
            {/* DYNAMIC Cart Icon */}
            {user.role !== 'ADMIN' && (
              <li>
                <Link to="/cart" className={styles.cartContainer}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  {/* Shows the red dot only if there are items in the cart */}
                  {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
                </Link>
              </li>
            )}
            
            {/* User Avatar & Logout */}
            <li className={styles.userSection}>
              <div className={styles.avatar}>
                {getInitial(user.name)}
              </div>
              <span className={styles.greeting}>{user.name.split(' ')[0]}</span>
              
              <button onClick={handleLogout} className={styles.logoutBtn} title="Logout">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </li>
          </>
        ) : (
          <>
            {/* Logged Out Cart Icon */}
            <li>
              <Link to="/cart" className={styles.cartContainer}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </Link>
            </li>
            <li><Link to="/login" className={styles.loginBtn}>Sign In</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;