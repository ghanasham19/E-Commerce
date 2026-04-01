import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './Orders.module.css';

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
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order:", error);
      alert("Could not load order details.");
      navigate('/orders');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Shipped') return '#fb641b';
    if (status === 'Delivered') return '#388e3c';
    if (status === 'Cancelled') return '#ff4d4f';
    return '#2874f0'; // Processing
  };

  if (loading) return <h2>Loading Order Details...</h2>;
  if (!order) return <h2>Order Not Found</h2>;

  return (
    <div className={styles.container}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'none', border: 'none', color: '#2874f0', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' }}
      >
        ← Back to Orders
      </button>

      <h2 className={styles.title}>Order #{order.id} Summary</h2>
      
      {/* Top Status Banner */}
      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '4px', border: '1px solid #eee', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: '0 0 5px 0', color: '#666' }}>Order Placed</p>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div>
          <p style={{ margin: '0 0 5px 0', color: '#666' }}>Total Amount</p>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#388e3c' }}>${order.totalPrice.toFixed(2)}</p>
        </div>
        <div>
          <p style={{ margin: '0 0 5px 0', color: '#666' }}>Current Status</p>
          <p style={{ margin: 0, fontWeight: 'bold', color: getStatusColor(order.status) }}>{order.status}</p>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Shipping Address</h3>
        <p style={{ lineHeight: '1.5', marginTop: '10px' }}>{order.shippingAddress || 'No address provided.'}</p>
      </div>

      <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Items in this Order</h3>
      
      {/* Map through the items and show everything including custom designs! */}
      {order.orderItems && order.orderItems.map((item) => (
        <div key={item.id} style={{ display: 'flex', gap: '20px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f0f0f0' }}>
          
          {/* Main Product Image */}
          <img src={item.product.image} alt={item.product.name} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
          
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>{item.product.name}</h4>
            <p style={{ margin: '0 0 5px 0' }}><strong>Price:</strong> ${item.product.price.toFixed(2)} x {item.quantity}</p>
            
            {/* Show dynamic user choices */}
            {item.selectedOptions && (
              <p style={{ margin: '0 0 5px 0', color: '#666' }}><strong>Options:</strong> {item.selectedOptions}</p>
            )}
            
            {/* Show custom text if they typed it */}
            {item.customText && (
              <p style={{ margin: '0 0 5px 0', color: '#666' }}><strong>Custom Text:</strong> "{item.customText}"</p>
            )}
            
            {/* Show the Custom Design Image if they uploaded one! */}
            {item.designImage && (
              <div style={{ marginTop: '15px', backgroundColor: '#f4f4f9', padding: '10px', borderRadius: '4px', display: 'inline-block' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem', fontWeight: 'bold' }}>Your Uploaded Design:</p>
                <img src={item.designImage} alt="User Design" style={{ height: '80px', borderRadius: '2px', border: '1px solid #ccc' }} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderDetails;