import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './Orders.module.css';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchOrders();
    }
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await api.get(`/orders/user/${user.id}`);
      
      // SAFETY CHECK: Ensure response.data is an array before sorting to prevent crashes
      if (Array.isArray(response.data)) {
        const sortedOrders = response.data.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : 0;
          const dateB = b.createdAt ? new Date(b.createdAt) : 0;
          return dateB - dateA;
        });
        setOrders(sortedOrders);
      } else {
        setOrders([]);
      }
      
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]); // Prevent crash on error
    } finally {
      setLoading(false);
    }
  };

  // Maps backend status to a specific CSS class for the glowing dot
  const getStatusDotClass = (status) => {
    const lowerStatus = status?.toLowerCase() || '';
    if (lowerStatus === 'shipped') return styles.dotShipped;
    if (lowerStatus === 'delivered') return styles.dotDelivered;
    if (lowerStatus === 'cancelled') return styles.dotCancelled;
    return styles.dotProcessing; 
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingPulse}>
          <div className={styles.loaderLine}></div>
          <div className={styles.loaderLine}></div>
          <div className={styles.loaderLine}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerWrapper}>
        <h1 className={styles.title}>Purchases</h1>
        <p className={styles.subtitle}>Track, return, or buy again.</p>
      </div>
      
      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyGlow}></div>
          <h3 className={styles.emptyTitle}>Your bag is empty</h3>
          <p className={styles.emptyText}>Discover our latest collections and find something you love.</p>
          <button onClick={() => navigate('/')} className={styles.shopNowBtn}>
            Explore Products
          </button>
        </div>
      ) : (
        <div className={styles.orderList}>
          {/* List Headers (Hidden on mobile) */}
          <div className={styles.listHeader}>
            <span>Items</span>
            <span>Order Info</span>
            <span>Status</span>
            <span>Total</span>
            <span>Details</span>
          </div>

          {orders.map((order) => (
            <div key={order.id} className={styles.orderRow}>
              
              {/* 1. Overlapping Images */}
              <div className={styles.cellImages}>
                <div className={styles.imageGallery}>
                  {order.orderItems && order.orderItems.slice(0, 3).map((item) => (
                    <div key={item.id} className={styles.imageWrapper}>
                      <img 
                        src={item.product?.image} 
                        alt={item.product?.name || 'Product'} 
                        className={styles.thumbnail} 
                      />
                    </div>
                  ))}
                  {order.orderItems && order.orderItems.length > 3 && (
                    <div className={styles.moreItemsBadge}>
                      +{order.orderItems.length - 3}
                    </div>
                  )}
                </div>
              </div>
              
              {/* 2. Order ID & Date */}
              <div className={styles.cellInfo}>
                <span className={styles.label}>Order ID</span>
                {/* FIX: Converts numeric ID to string and pads it with leading zeros for a premium look */}
                <span className={styles.dataPrimary}>#{String(order.id).padStart(5, '0')}</span>
                <span className={styles.dataSecondary}>
                  {order.createdAt 
                    ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                    : 'Unknown Date'}
                </span>
              </div>

              {/* 3. Minimalist Status Indicator */}
              <div className={styles.cellStatus}>
                <span className={styles.label}>Status</span>
                <div className={styles.statusWrapper}>
                  <div className={`${styles.statusDot} ${getStatusDotClass(order.status)}`}></div>
                  <span className={styles.statusText}>{order.status || 'Processing'}</span>
                </div>
              </div>

              {/* 4. Price */}
              <div className={styles.cellPrice}>
                <span className={styles.label}>Amount</span>
                {/* FIX: Safe check for totalPrice to prevent crashes if backend sends null */}
                <span className={styles.priceData}>
                  ₹{order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}
                </span>
              </div>

              {/* 5. Action Button */}
              <div className={styles.cellAction}>
                <button 
                  onClick={() => navigate(`/order/${order.id}`)}
                  className={styles.viewBtn}
                  aria-label="View Order"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;