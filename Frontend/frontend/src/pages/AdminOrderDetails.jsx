import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './AdminDashboard.module.css'; // Reusing your admin styles

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
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order:", error);
      alert("Could not load order details.");
      navigate('/admin/orders');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/orders/${order.id}/status?newStatus=${newStatus}`);
      setOrder({ ...order, status: newStatus });
      alert(`Order #${order.id} marked as ${newStatus}!`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update order status.");
    }
  };

  if (loading) return <h2>Loading Order Data...</h2>;
  if (!order) return <h2>Order Not Found</h2>;

  return (
    <div className={styles.dashboardContainer} style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'none', border: 'none', color: '#2874f0', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px', fontSize: '1rem' }}
      >
        ← Back to Order Console
      </button>

      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ margin: 0 }}>Fulfillment Details: Order #{order.id}</h1>
          <p style={{ margin: '5px 0 0 0', color: '#b0bec5' }}>Placed on: {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        
        {/* Admin Status Controller */}
        <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#212121', fontWeight: 'bold' }}>Update Status:</span>
          <select 
            value={order.status} 
            onChange={(e) => handleStatusChange(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem', fontWeight: 'bold', color: '#2874f0' }}
          >
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className={styles.section} style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* Customer Info Card */}
        <div style={{ flex: 1, minWidth: '300px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '4px', border: '1px solid #eee' }}>
          <h3 style={{ borderBottom: '2px solid #ddd', paddingBottom: '10px', marginTop: 0 }}>Customer Info</h3>
          <p><strong>Name:</strong> {order.user.name}</p>
          <p><strong>Email:</strong> <a href={`mailto:${order.user.email}`} style={{ color: '#2874f0' }}>{order.user.email}</a></p>
          <p><strong>Phone:</strong> {order.user.phone || 'N/A'}</p>
        </div>

        {/* Shipping Card */}
        <div style={{ flex: 1, minWidth: '300px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '4px', border: '1px solid #eee' }}>
          <h3 style={{ borderBottom: '2px solid #ddd', paddingBottom: '10px', marginTop: 0 }}>Shipping Destination</h3>
          <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>{order.shippingAddress || <span style={{color: 'red'}}>No Address Provided</span>}</p>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Manufacturing Details (Items to Print)</h2>
        
        {order.orderItems && order.orderItems.map((item, index) => (
          <div key={item.id} style={{ display: 'flex', gap: '20px', marginBottom: '30px', paddingBottom: '30px', borderBottom: index !== order.orderItems.length - 1 ? '2px dashed #eee' : 'none' }}>
            
            {/* Base Product Image */}
            <div>
              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#666' }}>Base Product:</p>
              <img src={item.product.image} alt={item.product.name} style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
            </div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem', color: '#212121' }}>{item.product.name}</h3>
              <p style={{ fontSize: '1.1rem', margin: '0 0 10px 0' }}><strong>Quantity to Print:</strong> <span style={{ color: '#fb641b', fontWeight: 'bold', fontSize: '1.2rem' }}>{item.quantity}</span></p>
              
              {/* User's Exact Selections */}
              <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px', border: '1px solid #e0e0e0', marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#2874f0' }}>Customer Choices:</h4>
                {item.selectedOptions ? (
                  <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '1rem', color: '#333', whiteSpace: 'pre-wrap' }}>
                    {/* Format the JSON to look nice for the admin */}
                    {JSON.stringify(JSON.parse(item.selectedOptions), null, 2)}
                  </pre>
                ) : (
                  <p style={{ margin: 0 }}>No options selected.</p>
                )}
              </div>
              
              {/* Custom Text */}
              {item.customText && (
                <div style={{ backgroundColor: '#fff3e0', padding: '15px', borderRadius: '4px', border: '1px solid #ffe0b2', marginBottom: '15px' }}>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#e65100' }}>Custom Text to Print:</p>
                  <p style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'monospace' }}>"{item.customText}"</p>
                </div>
              )}
            </div>

            {/* Custom Uploaded Design Image (The most important part for the Admin!) */}
            {item.designImage && (
              <div style={{ width: '250px', backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '4px', border: '1px solid #c8e6c9', textAlign: 'center' }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32' }}>Uploaded Custom Design:</p>
                <img src={item.designImage} alt="User Design" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #a5d6a7', backgroundColor: 'white' }} />
                <a 
                  href={item.designImage} 
                  download={`Order_${order.id}_Item_${item.id}_Design`}
                  style={{ display: 'inline-block', marginTop: '15px', backgroundColor: '#2e7d32', color: 'white', padding: '8px 15px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}
                >
                  Download Design
                </a>
              </div>
            )}
            
          </div>
        ))}
        
        <div style={{ textAlign: 'right', marginTop: '20px', fontSize: '1.5rem' }}>
          <strong>Total Order Revenue: </strong> 
          <span style={{ color: '#388e3c' }}>${order.totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;