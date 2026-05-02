import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './Checkout.module.css';

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    city: '',
    zip: ''
  });

  const [cartTotal, setCartTotal] = useState(0); 
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  // NEW: Advanced status tracking for the overlay animation
  // States: 'idle' | 'processing' | 'success'
  const [verificationStatus, setVerificationStatus] = useState('idle'); 

  useEffect(() => {
    const fetchCartTotal = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      try {
        const response = await api.get(`/cart/${user.id}`); 
        const cartData = response.data;
        
        const itemsArray = Array.isArray(cartData) ? cartData : (cartData.items || cartData.cartItems || []);
        
        let calculatedTotal = 0;
        itemsArray.forEach(item => {
          const itemPrice = item.product ? item.product.price : item.price;
          calculatedTotal += (itemPrice * item.quantity);
        });
        
        setCartTotal(calculatedTotal);
      } catch (err) {
        console.error("Failed to load cart total:", err);
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchCartTotal();
  }, [user, navigate]);

  const displayRazorpayPopup = async () => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      setError("Razorpay SDK failed to load. Please check your internet connection.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/payment/create-order', { amount: Math.round(cartTotal) });
      const razorpayData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

      const options = {
        key: "rzp_test_SUE8RuhY4Z82bI", 
        amount: razorpayData.amount, 
        currency: "INR",
        name: "TradeVibe", 
        description: "Secure Order Payment",
        order_id: razorpayData.id, 
        
        handler: async function (paymentResponse) {
          // 1. Immediately lock the screen and show the sleek spinner
          setVerificationStatus('processing'); 
          
          try {
            await api.post('/payment/verify', paymentResponse);
            
            const fullAddress = `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.zip}`;
            await api.post(`/orders/create/${user.id}`, { 
              shippingAddress: fullAddress 
            });
            
            // 2. Switch to the beautiful Success Animation
            setVerificationStatus('success');
            
            // 3. Pause for 2 seconds so the user can see it, then redirect!
            setTimeout(() => {
              navigate('/orders'); 
            }, 2000);
            
          } catch (verificationError) {
            console.error("Verification or order saving failed:", verificationError);
            setError("Payment successful, but we encountered an error saving your order. Please contact support.");
            setVerificationStatus('idle'); // Unlock the screen so they can read the error
          }
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || "9999999999" 
        },
        theme: {
          color: "#0F0F0F" 
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error("Payment Ticket Error:", err);
      setError("Failed to create secure payment ticket. Please try again.");
      setIsLoading(false);
    }
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    
    if (cartTotal <= 0) {
      setError("Your cart is empty. Please add items before checking out.");
      return;
    }

    setIsLoading(true);
    setError('');
    displayRazorpayPopup();
  };

  if (isPageLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingPulse}>
          <div className={styles.loaderLine}></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* UPGRADED: Dynamic Full Screen Verification Overlay */}
      {verificationStatus !== 'idle' && (
        <div className={styles.verificationOverlay}>
          <div className={styles.verificationModal}>
            
            {verificationStatus === 'processing' ? (
              <div className={styles.modalContentFade}>
                <div className={styles.sleekSpinner}></div>
                <h2>Securing your payment...</h2>
                <p>Please don't refresh or close this window.</p>
              </div>
            ) : (
              <div className={styles.modalContentFade}>
                <div className={styles.successAnimationBox}>
                  <svg className={styles.checkmarkSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle className={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none" />
                    <path className={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                  </svg>
                </div>
                <h2 style={{ color: '#2B7A4B' }}>Payment Successful</h2>
                <p>Preparing your order dashboard...</p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* --- REST OF THE PAGE REMAINS EXACTLY THE SAME --- */}
      <div className={styles.pageContainer}>
        <div className={styles.headerWrapper}>
          <h1 className={styles.title}>Checkout</h1>
          <p className={styles.subtitle}>Complete your delivery and payment details.</p>
        </div>

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

        <div className={styles.grid}>
          
          <div className={styles.formSection}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <h2>Shipping Address</h2>
              </div>
              
              <form id="checkout-form" onSubmit={handleCheckout} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Street Address</label>
                  <input 
                    type="text" 
                    className={styles.input}
                    placeholder="123 Main Street, Apt 4B" 
                    required 
                    onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                  />
                </div>
                
                <div className={styles.row}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>City</label>
                    <input 
                      type="text" 
                      className={styles.input}
                      placeholder="Mumbai" 
                      required 
                      onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Postal Code</label>
                    <input 
                      type="text" 
                      className={styles.input}
                      placeholder="400001" 
                      required 
                      onChange={(e) => setShippingInfo({...shippingInfo, zip: e.target.value})}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className={styles.summarySection}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <h2>Payment Summary</h2>
              </div>

              <div className={styles.summaryBody}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Cart Subtotal</span>
                  <span className={styles.summaryValue}>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Shipping</span>
                  <span className={styles.summaryHighlight}>Free Delivery</span>
                </div>
                
                <div className={styles.divider}></div>
                
                <div className={styles.totalRow}>
                  <span>Total to Pay</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>

                <button 
                  type="submit" 
                  form="checkout-form"
                  className={styles.submitBtn} 
                  disabled={isLoading || cartTotal <= 0}
                >
                  {isLoading ? (
                    <span className={styles.btnContent}>
                      <div className={styles.miniSpinner}></div>
                      Connecting securely...
                    </span>
                  ) : (
                    <span className={styles.btnContent}>
                      Pay ₹{cartTotal.toFixed(2)} Securely
                    </span>
                  )}
                </button>

                <div className={styles.secureFooter}>
                  <p>Guaranteed safe & secure checkout powered by <strong>Razorpay</strong>.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Checkout;