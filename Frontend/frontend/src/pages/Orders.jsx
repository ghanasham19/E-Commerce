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
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === 'Shipped') return styles.statusShipped;
    if (status === 'Delivered') return styles.statusDelivered;
    return styles.status; // Default processing
  };

  if (loading) return <h2>Loading your orders...</h2>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>My Order History</h2>
      
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
orders.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <span>Order #{order.id}</span>
              <span className={getStatusClass(order.status)}>{order.status}</span>
            </div>
            
            {/* NEW: Display tiny preview images of what they bought */}
            <div style={{ display: 'flex', gap: '10px', margin: '15px 0' }}>
              {order.orderItems && order.orderItems.map(item => (
                <img 
                  key={item.id} 
                  src={item.product.image} 
                  alt={item.product.name} 
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              ))}
            </div>

            <p><strong>Total Price:</strong> ₹{order.totalPrice.toFixed(2)}</p>
            <p style={{ color: '#757575', marginTop: '5px', marginBottom: '15px' }}>
              Ordered on: {new Date(order.createdAt).toLocaleDateString()}
            </p>

            {/* NEW: Button to go to the new Details Page */}
            <button 
              onClick={() => navigate(`/order/${order.id}`)}
              style={{ backgroundColor: '#2874f0', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '2px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              View Full Order Details
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;