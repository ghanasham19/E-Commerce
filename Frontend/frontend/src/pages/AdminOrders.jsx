import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './AdminDashboard.module.css';

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: Tab Tracking State
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
    } else {
      fetchAllOrders();
    }
  }, [user, navigate]);

  const fetchAllOrders = async () => {
    try {
      const response = await api.get('/orders/all');
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status?newStatus=${newStatus}`);
      setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
    } catch (error) {
      alert("Failed to update order status.");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to permanently delete Order #${orderId}?`)) return;
    try {
      await api.delete(`/orders/${orderId}`);
      setOrders(orders.filter(order => order.id !== orderId));
    } catch (error) {
      alert("Failed to delete the order.");
    }
  };

  // NEW: Dynamically filter orders based on the clicked tab!
  const filteredOrders = activeTab === 'All' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  if (loading) return <h2>Loading all orders...</h2>;

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1>Order Management Console</h1>
        <p>Review, fulfill, and manage customer orders.</p>
      </div>

      <div className={styles.section}>
        
        {/* NEW: PROFESSIONAL TAB BAR */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                backgroundColor: activeTab === tab ? '#2874f0' : 'transparent',
                color: activeTab === tab ? 'white' : '#666',
                border: activeTab === tab ? 'none' : '1px solid #ccc',
                padding: '8px 20px',
                borderRadius: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 className={styles.sectionTitle} style={{ borderBottom: 'none', margin: 0, padding: 0 }}>
            {activeTab} Orders ({filteredOrders.length})
          </h2>
        </div>
        
        {filteredOrders.length === 0 ? (
          <p style={{ color: '#878787', marginTop: '20px' }}>No orders found in the "{activeTab}" category.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f4f9', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px' }}>Order ID</th>
                <th style={{ padding: '12px' }}>Customer</th>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Total</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>#{order.id}</td>
                  <td style={{ padding: '12px' }}>{order.user.name}</td>
                  <td style={{ padding: '12px' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px', color: '#388e3c', fontWeight: 'bold' }}>₹{order.totalPrice.toFixed(2)}</td>
                  
                  <td style={{ padding: '12px' }}>
                    <select 
                      value={order.status} 
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  
                  <td style={{ padding: '12px', display: 'flex', gap: '10px' }}>
                    <button onClick={() => navigate(`/admin/orders/${order.id}`)} style={{ backgroundColor: '#2874f0', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Details</button>
                    <button onClick={() => handleDeleteOrder(order.id)} style={{ backgroundColor: 'transparent', color: '#ff4d4f', border: '1px solid #ff4d4f', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;