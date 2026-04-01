import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './Checkout.module.css';

// 1. Helper function to load the Razorpay script into the browser
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

  const [cartTotal, setCartTotal] = useState(0); // Holds the real price
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 2. Fetch the cart items and calculate the total when the page loads
// 2. Fetch the cart items and calculate the total when the page loads
  useEffect(() => {
    const fetchCartTotal = async () => {
      if (!user) return;
      try {
        const response = await api.get(`/cart/${user.id}`); 
        console.log("Raw Cart Data from Backend:", response.data); // Let's peek at the data!
        
        const cartData = response.data;
        
        // FIX: If cartData is an array, use it. If it's an object, look for the list inside 'items' or 'cartItems'
        const itemsArray = Array.isArray(cartData) ? cartData : (cartData.items || cartData.cartItems || []);
        
        let calculatedTotal = 0;
        
        // Now we can safely loop over the array
        itemsArray.forEach(item => {
          const itemPrice = item.product ? item.product.price : item.price;
          calculatedTotal += (itemPrice * item.quantity);
        });
        
        setCartTotal(calculatedTotal);
      } catch (err) {
        console.error("Failed to load cart total:", err);
      }
    };

    fetchCartTotal();
  }, [user]);

  // 3. The main Razorpay integration function
  const displayRazorpayPopup = async () => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      setError("Razorpay SDK failed to load. Are you online?");
      setIsLoading(false);
      return;
    }

    try {
      // Ask Spring Boot for the secure payment ticket with the REAL total!
      const response = await api.post('/payment/create-order', { amount: Math.round(cartTotal) });
      const razorpayData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

      // Configure the Popup Window
      const options = {
        key: "rzp_test_SUE8RuhY4Z82bI", 
        amount: razorpayData.amount, // Amount is in paise
        currency: "INR",
        name: "Custom Print Shop", 
        description: "Secure Order Payment",
        order_id: razorpayData.id, 
        
        // THIS RUNS ONLY IF PAYMENT IS SUCCESSFUL ON THE POPUP
        handler: async function (paymentResponse) {
          console.log("PAYMENT SUCCESS, VERIFYING...", paymentResponse);
          
          try {
            // STEP 1: Verify the cryptographic signature
            await api.post('/payment/verify', paymentResponse);
            
            // STEP 2: Save the actual order to MySQL & clear the cart
            const fullAddress = `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.zip}`;
            await api.post(`/orders/create/${user.id}`, { 
              shippingAddress: fullAddress 
            });
            
            alert("Payment Verified & Order Placed Successfully!");
            navigate('/orders'); 
            
          } catch (verificationError) {
            console.error("Verification or order saving failed:", verificationError);
            alert("Payment was successful, but there was an error saving your order. Please contact support.");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || "9999999999" 
        },
        theme: {
          color: "#2874f0" 
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error("Payment Ticket Error:", err);
      setError("Failed to create secure payment ticket. Please check the backend connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    
    // Prevent checkout if the cart is empty or failed to load
    if (cartTotal <= 0) {
      setError("Your cart is empty or the total could not be calculated.");
      return;
    }

    setIsLoading(true);
    setError('');
    
    // Trigger the popup flow
    displayRazorpayPopup();
  };

  return (
    <div className={styles.checkoutWrapper}>
      <div className={styles.checkoutCard}>
        <div className={styles.header}>
          1. Delivery Address & Payment
        </div>
        
        <form onSubmit={handleCheckout}>
          <div className={styles.formGroup}>
            <label>Full Shipping Address</label>
            <input 
              type="text" 
              placeholder="e.g., 123 Main Street, Apt 4B" 
              required 
              onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>City</label>
              <input 
                type="text" 
                placeholder="City" 
                required 
                onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
              />
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label>ZIP / Postal Code</label>
              <input 
                type="text" 
                placeholder="Postal Code" 
                required 
                onChange={(e) => setShippingInfo({...shippingInfo, zip: e.target.value})}
              />
            </div>
          </div>
          
          {/* Button dynamically shows the real total price! */}
          <button 
            type="submit" 
            className={styles.submitBtn} 
            disabled={isLoading || cartTotal <= 0}
          >
            {isLoading 
              ? "Opening Secure Gateway..." 
              : `PROCEED TO SECURE PAYMENT (₹${cartTotal})`}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', fontWeight: 'bold', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <p className={styles.secureText} style={{ marginTop: '20px', textAlign: 'center' }}>
          🔒 Safe and Secure Payments. Powered by Razorpay.
        </p>
      </div>
    </div>
  );
};

export default Checkout;