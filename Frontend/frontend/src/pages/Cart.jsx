import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './Cart.module.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchCart();
    }
  }, [user, navigate]);

  const fetchCart = async () => {
    try {
      const response = await api.get(`/cart/${user.id}`);
      setCart(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setLoading(false);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      await api.delete(`/cart/remove/${cartItemId}`);
      // Refresh the cart from the backend so the total price recalculates perfectly
      fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Failed to remove item.");
    }
  };

  if (loading) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Loading your cart...</h2>;

  if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h2>Your Cart is Empty!</h2>
        <p style={{ color: '#878787', marginBottom: '20px' }}>Add items to it now.</p>
        <button 
          onClick={() => navigate('/')} 
          style={{ backgroundColor: '#2874f0', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '2px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Shop Now
        </button>
      </div>
    );
  }

  // Calculate the total dynamically just to be safe
  const cartTotal = cart.cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  return (
    <div className={styles.cartContainer}>
      
      {/* Left Column: Cart Items */}
      <div className={styles.itemsSection}>
        <div className={styles.cartHeader}>
          My Cart ({cart.cartItems.length})
        </div>

        {cart.cartItems.map((item) => (
          <div key={item.id} className={styles.cartItem}>
            <img src={item.product.image} alt={item.product.name} className={styles.itemImage} />
            
            <div className={styles.itemDetails}>
              <h3 className={styles.itemName}>{item.product.name}</h3>
              <p className={styles.itemPrice}>₹{item.product.price.toFixed(2)}</p>
              
              {/* Display Dynamic Selections */}
              {item.selectedOptions && (
                <p className={styles.itemMeta}>
                  <strong>Options:</strong> {
                    Object.entries(JSON.parse(item.selectedOptions))
                      .map(([key, val]) => `${key}: ${val}`).join(' | ')
                  }
                </p>
              )}
              
              {/* Display Custom Text */}
              {item.customText && (
                <p className={styles.itemMeta}><strong>Custom Text:</strong> "{item.customText}"</p>
              )}

              {/* Display Custom Uploaded Design Thumbnail */}
              {item.designImage && (
                <div style={{ marginTop: '10px' }}>
                  <p className={styles.itemMeta}><strong>Your Design:</strong></p>
                  <img src={item.designImage} alt="Custom upload" style={{ height: '40px', borderRadius: '2px', border: '1px solid #e0e0e0' }} />
                </div>
              )}

              <button className={styles.removeBtn} onClick={() => handleRemoveItem(item.id)}>
                REMOVE
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Right Column: Price Summary */}
      <div className={styles.summarySection}>
        <div className={styles.summaryHeader}>Price Details</div>
        
        <div className={styles.summaryBody}>
          <div className={styles.summaryRow}>
            <span>Price ({cart.cartItems.length} items)</span>
            <span>₹{cartTotal.toFixed(2)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Delivery Charges</span>
            <span style={{ color: '#388e3c' }}>Free</span>
          </div>
          
          <div className={styles.summaryTotal}>
            <span>Total Amount</span>
            <span>₹{cartTotal.toFixed(2)}</span>
          </div>

          <button className={styles.checkoutBtn} onClick={() => navigate('/checkout')}>
            PLACE ORDER
          </button>
        </div>
      </div>

    </div>
  );
};

export default Cart;