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
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
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

  // Helper to safely parse JSON options to prevent page crashes
  const formatOptions = (optionsStr) => {
    if (!optionsStr) return null;
    try {
      const parsed = JSON.parse(optionsStr);
      return Object.entries(parsed).map(([key, val]) => `${key}: ${val}`).join(' | ');
    } catch (e) {
      return optionsStr;
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingPulse}>
          <div className={styles.loaderLine}></div>
          <div className={styles.loaderLine}></div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.emptyState}>
          <div className={styles.emptyGlow}></div>
          <h2 className={styles.emptyTitle}>Your bag is empty</h2>
          <p className={styles.emptyText}>Looks like you haven't added anything to your cart yet.</p>
          <button onClick={() => navigate('/')} className={styles.primaryBtn}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Calculate the total dynamically
  const cartTotal = cart.cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerWrapper}>
        <h1 className={styles.title}>Shopping Bag</h1>
        <p className={styles.subtitle}>{cart.cartItems.length} items in your bag</p>
      </div>

      <div className={styles.grid}>
        
        {/* Left Column: Cart Items */}
        <div className={styles.itemsSection}>
          {cart.cartItems.map((item) => (
            <div key={item.id} className={styles.cartItemCard}>
              
              <div className={styles.imageWrapper}>
                <img src={item.product.image} alt={item.product.name} className={styles.itemImage} />
              </div>
              
              <div className={styles.itemDetails}>
                <div className={styles.itemHeader}>
                  <h3 className={styles.itemName}>{item.product.name}</h3>
                  <span className={styles.itemPrice}>₹{item.product.price.toFixed(2)}</span>
                </div>

                <div className={styles.itemMetaGroup}>
                  {item.selectedOptions && (
                    <p className={styles.itemMeta}>
                      <span className={styles.metaLabel}>Options:</span> {formatOptions(item.selectedOptions)}
                    </p>
                  )}
                  
                  {item.customText && (
                    <p className={styles.itemMeta}>
                      <span className={styles.metaLabel}>Text:</span> "{item.customText}"
                    </p>
                  )}

                  {item.designImage && (
                    <div className={styles.itemMetaImage}>
                      <span className={styles.metaLabel}>Design:</span>
                      <img src={item.designImage} alt="Custom upload" className={styles.customThumbnail} />
                    </div>
                  )}
                </div>

                <div className={styles.itemActions}>
                  <button className={styles.removeBtn} onClick={() => handleRemoveItem(item.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Price Summary */}
        <div className={styles.summarySection}>
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>
            
            <div className={styles.summaryBody}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Estimated Delivery</span>
                <span className={styles.freeText}>Free</span>
              </div>
              
              <div className={styles.divider}></div>
              
              <div className={styles.totalRow}>
                <span>Total</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>

              <button className={styles.checkoutBtn} onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;