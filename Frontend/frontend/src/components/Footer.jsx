import { useState } from 'react';
import styles from './Footer.module.css'; 

const Footer = () => {
  // Simple state to control the Terms modal visibility
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          {/* Column 1: Brand Identity */}
          <div className={styles.footerColumn}>
            <h3 className={styles.brandTitle}>
              Thread<span className={styles.brandHighlight}>Vibe</span>
            </h3>
            <p className={styles.brandDescription}>
              Your ultimate destination for modern fashion. Discover the latest trends with premium quality and unmatched style.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className={styles.footerColumn}>
            <h4 className={styles.columnTitle}>Quick Links</h4>
            <ul className={styles.linkList}>
              <li><a href="/" className={styles.footerLink}>Home</a></li>
              <li><a href="/Signup" className={styles.footerLink}>Register</a></li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className={styles.footerColumn}>
            <h4 className={styles.columnTitle}>Customer Service</h4>
            <ul className={styles.linkList}>
              {/* Redirects directly to email client */}
              <li><a href="mailto:threadvibe4@gmail.com?subject=Customer Feedback" className={styles.footerLink}>Feed Back</a></li>
              
              {/* Opens the local modal instead of changing route */}
              <li>
                <button 
                  onClick={() => setIsTermsOpen(true)} 
                  className={styles.modalTriggerBtn}
                >
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Socials */}
          <div className={styles.footerColumn}>
            <h4 className={styles.columnTitle}>Contact Us</h4>
            <address className={styles.address}>
              Dattwadi, Uruli Kanchan<br />
              Pune, Maharashtra 412202<br />
              India
            </address>
            
            {/* Social & Contact Icons */}
            <div className={styles.socialContainer}>
              {/* Instagram */}
              <a href="https://www.instagram.com/threadvibe_printing.4?igsh=dGNtMnBuN2s1Yzl6" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              
              {/* WhatsApp */}
              <a href="https://wa.me/917249262095" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="WhatsApp">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </a>

              {/* Email (Fixed mailto protocol) */}
{/* Email (Updated to open Gmail Compose in browser automatically) */}
            <a 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=threadvibe4@gmail.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.socialLink} 
              aria-label="Email"
              title="threadvibe4@gmail.com"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Section */}
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} Thread Vibe. All rights reserved.
          </p>
        </div>
      </footer>

      {/* --- TERMS AND CONDITIONS MODAL --- */}
      {isTermsOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsTermsOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Terms & Conditions</h2>
              <button className={styles.closeBtn} onClick={() => setIsTermsOpen(false)}>
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              <h3>1. General Information</h3>
              <p>Welcome to Thread Vibe. By accessing and placing an order with Thread Vibe, you confirm that you are in agreement with and bound by the terms of service contained below.</p>
              
              <h3>2. Products & Pricing</h3>
              <p>All products are subject to availability. We reserve the right to modify or discontinue any product without notice. Prices for our products are subject to change without notice.</p>
              
              <h3>3. Shipping & Delivery</h3>
              <p>Delivery times are estimates and commence from the date of shipping, rather than the date of order. We are not responsible for any delays caused by destination customs clearance processes.</p>
              
              <h3>4. Returns & Refunds</h3>
              <p>Items can be returned within 7 days of receipt of delivery using the Online Returns Center. It can take up to 15 days for an item to reach us once you return it. Once the item is received at our fulfillment center, it takes 2 business days for the refund to be processed.</p>

              <h3>5. User Accounts</h3>
              <p>You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;