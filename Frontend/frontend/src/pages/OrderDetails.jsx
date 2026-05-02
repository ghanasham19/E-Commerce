import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './OrderDetails.module.css';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSingleOrder();
  }, [id]);

  const fetchSingleOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error("Error fetching order:", error);
      alert("Could not load order details.");
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDotClass = (status) => {
    const lowerStatus = status?.toLowerCase() || '';
    if (lowerStatus === 'shipped') return styles.dotShipped;
    if (lowerStatus === 'delivered') return styles.dotDelivered;
    if (lowerStatus === 'cancelled') return styles.dotCancelled;
    return styles.dotProcessing; 
  };

  // Helper to cleanly display options if they were saved as a JSON string
  const formatOptions = (optionsStr) => {
    if (!optionsStr) return null;
    try {
      const parsed = JSON.parse(optionsStr);
      return Object.entries(parsed).map(([key, value]) => `${key}: ${value}`).join(' | ');
    } catch (e) {
      return optionsStr; // If it's already a plain string, just return it
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

  if (!order) return <div className={styles.pageContainer}><h2>Order Not Found</h2></div>;

  return (
    <div className={styles.pageContainer}>
      
      {/* Sleek Back Navigation */}
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Orders
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>Order #{String(order.id).padStart(5, '0')}</h1>
        <p className={styles.subtitle}>
          Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className={styles.grid}>
        {/* LEFT COLUMN: The Items */}
        <div className={styles.itemsSection}>
          <h3 className={styles.sectionTitle}>Items in your order</h3>
          
          <div className={styles.itemList}>
            {order.orderItems && order.orderItems.map((item) => (
              <div key={item.id} className={styles.itemCard}>
                
                <div className={styles.itemImageWrapper}>
                  <img src={item.product?.image} alt={item.product?.name} className={styles.itemImage} />
                </div>
                
                <div className={styles.itemDetails}>
                  <div className={styles.itemHeader}>
                    <h4 className={styles.itemName}>{item.product?.name}</h4>
                    <span className={styles.itemPrice}>₹{(item.product?.price * item.quantity).toFixed(2)}</span>
                  </div>
                  
                  <p className={styles.itemMeta}>Qty: {item.quantity} &times; ₹{item.product?.price.toFixed(2)}</p>
                  
                  {/* Customizations Section */}
                  {(item.selectedOptions || item.customText || item.designImage) && (
                    <div className={styles.customizationsBox}>
                      {item.selectedOptions && (
                        <p className={styles.customRow}>
                          <span className={styles.customLabel}>Options:</span> {formatOptions(item.selectedOptions)}
                        </p>
                      )}
                      
                      {item.customText && (
                        <p className={styles.customRow}>
                          <span className={styles.customLabel}>Printed Text:</span> "{item.customText}"
                        </p>
                      )}
                      
                      {item.designImage && (
                        <div className={styles.customRowImage}>
                          <span className={styles.customLabel}>Uploaded Design:</span>
                          <img src={item.designImage} alt="Custom User Design" className={styles.userDesignThumbnail} />
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary & Info */}
        <div className={styles.summarySection}>
          
          {/* Status Box */}
          <div className={styles.summaryCard}>
            <h3 className={styles.cardTitle}>Status</h3>
            <div className={styles.statusWrapper}>
              <div className={`${styles.statusDot} ${getStatusDotClass(order.status)}`}></div>
              <span className={styles.statusText}>{order.status || 'Processing'}</span>
            </div>
          </div>

          {/* Shipping Address Box */}
          <div className={styles.summaryCard}>
            <h3 className={styles.cardTitle}>Shipping Details</h3>
            <p className={styles.shippingAddress}>
              {order.shippingAddress ? order.shippingAddress : 'No address provided for this order.'}
            </p>
          </div>

          {/* Payment Summary Box */}
          <div className={styles.summaryCard}>
            <h3 className={styles.cardTitle}>Payment Summary</h3>
            <div className={styles.paymentRow}>
              <span>Subtotal</span>
              <span>₹{order.totalPrice.toFixed(2)}</span>
            </div>
            <div className={styles.paymentRow}>
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className={styles.divider}></div>
            <div className={`${styles.paymentRow} ${styles.totalRow}`}>
              <span>Total</span>
              <span>₹{order.totalPrice.toFixed(2)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetails;