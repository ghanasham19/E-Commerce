import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './AdminOrders.module.css'; 

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
      const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching all orders:", error);
    } finally {
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
    if (!window.confirm(`Are you absolutely sure you want to permanently delete Order #${String(orderId).padStart(5, '0')}?`)) return;
    try {
      await api.delete(`/orders/${orderId}`);
      setOrders(orders.filter(order => order.id !== orderId));
    } catch (error) {
      alert("Failed to delete the order.");
    }
  };

  const timeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  // NEW: Helper to calculate the exact count for ANY tab
  const getTabCount = (tabName) => {
    if (tabName === 'All') return orders.length;
    return orders.filter(order => order.status === tabName).length;
  };

  const filteredOrders = activeTab === 'All' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

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

  return (
    <div className={styles.adminContainer}>
      
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Order Management</h1>
          <p className={styles.subtitle}>Review, fulfill, and manage customer orders.</p>
        </div>
        <div className={styles.metricBadge}>
          <span className={styles.metricValue}>{orders.length}</span>
          <span className={styles.metricLabel}>Total Orders</span>
        </div>
      </div>

      <div className={styles.dashboardCard}>
        
        {/* UPGRADED: Tabs now show permanent counts */}
        <div className={styles.tabContainer}>
          {tabs.map(tab => {
            const count = getTabCount(tab);
            return (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${styles.tabBtn} ${activeTab === tab ? styles.activeTab : ''}`}
              >
                {tab}
                <span className={styles.tabCount}>{count}</span>
              </button>
            );
          })}
        </div>
        
        {filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <h3>No {activeTab} Orders</h3>
            <p>There are currently no orders in this category.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Timeline</th>
                  <th>Total</th>
                  <th>Update Status</th>
                  <th className={styles.textRight}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className={styles.dataRow}>
                    <td className={styles.fontBold}>#{String(order.id).padStart(5, '0')}</td>
                    <td>
                      <div className={styles.customerCell}>
                        <div className={styles.customerAvatar}>
                          {order.user?.name ? order.user.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <span>{order.user?.name || 'Guest'}</span>
                      </div>
                    </td>
                    
                    <td>
                      <div className={styles.dateWrapper}>
                        <span className={styles.timeAgoText}>{timeAgo(order.createdAt)}</span>
                        <span className={styles.exactDateText}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                        </span>
                      </div>
                    </td>

                    <td className={styles.priceCell}>₹{order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}</td>
                    
                    <td>
                      <div className={styles.selectWrapper}>
                        <select 
                          value={order.status || 'Processing'} 
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`${styles.statusSelect} ${styles[`status${order.status || 'Processing'}`]}`}
                        >
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <svg className={styles.selectArrow} width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1 1 5 5 9 1"></polyline>
                        </svg>
                      </div>
                    </td>
                    
                    <td>
                      <div className={styles.actionGroup}>
                        <button 
                          onClick={() => navigate(`/admin/orders/${order.id}`)} 
                          className={styles.iconBtn}
                          title="View Details"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteOrder(order.id)} 
                          className={`${styles.iconBtn} ${styles.deleteBtn}`}
                          title="Delete Order"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;