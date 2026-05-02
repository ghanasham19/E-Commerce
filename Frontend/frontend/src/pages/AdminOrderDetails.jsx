import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './AdminOrderDetails.module.css'; // New dedicated CSS file

const AdminOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error("Error fetching order:", error);
      alert("Could not load order details.");
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/orders/${order.id}/status?newStatus=${newStatus}`);
      setOrder({ ...order, status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update order status.");
    }
  };

  // Helper to cleanly display customer choices without crashing if JSON is malformed
  const formatOptions = (optionsStr) => {
    if (!optionsStr) return null;
    try {
      const parsed = JSON.parse(optionsStr);
      return Object.entries(parsed).map(([key, value]) => (
        <div key={key} className={styles.optionRow}>
          <span className={styles.optionKey}>{key}:</span> 
          <span className={styles.optionValue}>{value}</span>
        </div>
      ));
    } catch (e) {
      return <p className={styles.rawText}>{optionsStr}</p>;
    }
  };

  if (loading) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.loadingPulse}>
          <div className={styles.loaderLine}></div>
          <div className={styles.loaderLine}></div>
        </div>
      </div>
    );
  }

  if (!order) return <div className={styles.adminContainer}><h2>Order Not Found</h2></div>;

  return (
    <div className={styles.adminContainer}>
      
      {/* Sleek Back Navigation */}
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Console
      </button>

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Order #{String(order.id).padStart(5, '0')}</h1>
          <p className={styles.subtitle}>
            Placed on {new Date(order.createdAt).toLocaleString('en-US', { 
              month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
            })}
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        
        {/* LEFT COLUMN: Manufacturing & Items */}
        <div className={styles.mainContent}>
          <h2 className={styles.sectionTitle}>Manufacturing Details</h2>
          
          <div className={styles.itemList}>
            {order.orderItems && order.orderItems.map((item) => (
              <div key={item.id} className={styles.itemCard}>
                
                <div className={styles.itemBasicInfo}>
                  <div className={styles.imageWrapper}>
                    <span className={styles.imageBadge}>Base</span>
                    <img src={item.product?.image} alt={item.product?.name} className={styles.itemImage} />
                  </div>
                  <div className={styles.itemText}>
                    <h3 className={styles.itemName}>{item.product?.name}</h3>
                    <div className={styles.quantityBadge}>
                      Qty to Print: <strong>{item.quantity}</strong>
                    </div>
                  </div>
                </div>

                <div className={styles.customizationsGrid}>
                  
                  {/* Left half: Text & Options */}
                  <div className={styles.customTextSection}>
                    {item.selectedOptions && (
                      <div className={styles.specBox}>
                        <h4 className={styles.specTitle}>Customer Specs</h4>
                        {formatOptions(item.selectedOptions)}
                      </div>
                    )}
                    
                    {item.customText && (
                      <div className={styles.textBox}>
                        <h4 className={styles.textTitle}>Text to Print</h4>
                        <div className={styles.printedText}>"{item.customText}"</div>
                      </div>
                    )}
                  </div>

                  {/* Right half: Artwork Upload */}
                  {item.designImage && (
                    <div className={styles.artworkSection}>
                      <h4 className={styles.artworkTitle}>Customer Artwork</h4>
                      <div className={styles.artworkPreview}>
                        <img src={item.designImage} alt="User Design" />
                      </div>
                      <a 
                        href={item.designImage} 
                        download={`Order_${order.id}_Item_${item.id}_Design`}
                        className={styles.downloadBtn}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download Asset
                      </a>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Admin Controls & Info */}
        <div className={styles.sidebar}>
          
          {/* Status Controller */}
          <div className={styles.controlCard}>
            <div className={styles.cardHeader}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <h2>Fulfillment Status</h2>
            </div>
            <div className={styles.statusUpdater}>
              <select 
                value={order.status || 'Processing'} 
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`${styles.statusSelect} ${styles[`status${order.status || 'Processing'}`]}`}
              >
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Customer Info */}
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <h2>Customer</h2>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Name</span>
              <span className={styles.infoValue}>{order.user?.name || 'Guest'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email</span>
              <a href={`mailto:${order.user?.email}`} className={styles.infoLink}>{order.user?.email || 'N/A'}</a>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Phone</span>
              <span className={styles.infoValue}>{order.user?.phone || 'N/A'}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <h2>Destination</h2>
            </div>
            <p className={styles.addressText}>
              {order.shippingAddress ? order.shippingAddress : <span className={styles.errorText}>No address provided.</span>}
            </p>
          </div>

          {/* Revenue */}
          <div className={styles.revenueCard}>
            <span>Order Revenue</span>
            <span className={styles.revenueTotal}>₹{order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;