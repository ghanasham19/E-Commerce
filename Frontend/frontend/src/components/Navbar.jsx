import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import styles from './Navbar.module.css';
import { useWishlist } from '../context/WishlistContext'; // --- NEW: Import Context ---

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // --- NEW: Get wishlist data ---
  const { wishlist } = useWishlist();
  const likedCount = wishlist ? wishlist.length : 0;
  
  const profileRef = useRef(null);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      fetchCartCount();
    }
  }, [location, user]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCartCount = async () => {
    try {
      const response = await api.get(`/cart/${user.id}`);
      if (response.data && response.data.cartItems) {
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navInner}>
        {/* BRANDING & LOGO */}
        <Link to="/" className={styles.logo}>
          <img 
            src="/logo.png" 
            alt="ThreadVibe Logo" 
            className={styles.logoImage} 
          />
          <div className={styles.brandContainer}>
            <span className={styles.brandText}>
              Thread<span className={styles.logoSpan}>Vibe</span>
            </span>
            <span className={styles.brandSubtitle}>PRINTING & GIFTS</span>
          </div>
        </Link>

        {/* MOBILE MENU TOGGLE */}
        <button className={styles.hamburger} onClick={toggleMobileMenu} aria-label="Toggle menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isMobileMenuOpen ? (
              <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>
            ) : (
              <><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></>
            )}
          </svg>
        </button>

        {/* NAVIGATION LINKS */}
        <div className={`${styles.navContainer} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
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
                
                {user.role !== 'ADMIN' && (
                  <>
                    {/* --- NEW: Wishlist / Liked Icon --- */}
                    <li>
                      <Link to="/wishlist" className={styles.cartContainer} title="Liked Items">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        {likedCount > 0 && <span className={styles.cartBadge}>{likedCount}</span>}
                      </Link>
                    </li>

                    {/* DYNAMIC Cart Icon */}
                    <li>
                      <Link to="/cart" className={styles.cartContainer} title="Cart">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                          <line x1="3" y1="6" x2="21" y2="6"></line>
                          <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
                      </Link>
                    </li>
                  </>
                )}
                
                {/* User Avatar & Dropdown */}
                <li className={styles.userSection} ref={profileRef}>
                  <button className={styles.profileToggle} onClick={() => setIsProfileOpen(!isProfileOpen)}>
                    <div className={styles.avatar}>{getInitial(user.name)}</div>
                    <span className={styles.greeting}>{user.name.split(' ')[0]}</span>
                    <svg className={`${styles.chevron} ${isProfileOpen ? styles.chevronUp : ''}`} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  {isProfileOpen && (
                    <div className={styles.profileDropdown}>
                      <div className={styles.dropdownHeader}>
                        <p className={styles.dropdownName}>{user.name}</p>
                        <p className={styles.dropdownEmail}>{user.email}</p>
                      </div>
                      <div className={styles.dropdownDivider}></div>
                      <button onClick={handleLogout} className={styles.logoutBtn}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  )}
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/cart" className={styles.cartContainer}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;