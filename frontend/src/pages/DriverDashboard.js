import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const STATUS_COLORS = {
  pending: '#f39c12', assigned: '#3498db', picked: '#9b59b6', delivered: '#27ae60',
};

const NEXT_STATUS = { assigned: 'picked', picked: 'delivered' };

export default function DriverDashboard() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/orders/me/orders', { params });
      setOrders(data.data.orders);
      setPagination(data.data.pagination);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to load orders', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchOrders(1); }, [fetchOrders]);

  const handleUpdateStatus = async (orderId, currentStatus) => {
    const nextStatus = NEXT_STATUS[currentStatus];
    if (!nextStatus) return;
    setUpdating(orderId);
    setMessage({ text: '', type: '' });
    try {
      await api.put('/orders/status', { orderId, status: nextStatus });
      setMessage({ text: `Order #${orderId} updated to "${nextStatus}"`, type: 'success' });
      fetchOrders(pagination.page);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Update failed', type: 'error' });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>My Deliveries</h2>
        <select style={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="assigned">Assigned</option>
          <option value="picked">Picked</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {message.text && (
        <p style={{ ...styles.msg, color: message.type === 'error' ? '#e74c3c' : '#27ae60' }}>
          {message.text}
        </p>
      )}

      {loading ? (
        <p style={styles.loading}>Loading...</p>
      ) : orders.length === 0 ? (
        <p style={styles.empty}>No orders found.</p>
      ) : (
        <div style={styles.grid}>
          {orders.map((o) => (
            <div key={o.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.orderId}>Order #{o.id}</span>
                <span style={{ ...styles.badge, background: STATUS_COLORS[o.status] }}>{o.status}</span>
              </div>
              <div style={styles.cardBody}>
                <p style={styles.label}>Customer</p>
                <p style={styles.value}>{o.customer?.name}</p>
                <p style={styles.label}>Pickup</p>
                <p style={styles.value}>{o.pickup_address}</p>
                <p style={styles.label}>Delivery</p>
                <p style={styles.value}>{o.delivery_address}</p>
                <p style={styles.label}>Assigned At</p>
                <p style={styles.value}>{new Date(o.assigned_at).toLocaleString()}</p>
              </div>
              {NEXT_STATUS[o.status] && (
                <button
                  style={styles.updateBtn}
                  onClick={() => handleUpdateStatus(o.id, o.status)}
                  disabled={updating === o.id}
                >
                  {updating === o.id ? 'Updating...' : `Mark as ${NEXT_STATUS[o.status]}`}
                </button>
              )}
              {o.status === 'delivered' && (
                <p style={styles.delivered}>✅ Delivered</p>
              )}
            </div>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div style={styles.pagination}>
          <button style={styles.pageBtn} disabled={pagination.currentPage <= 1} onClick={() => fetchOrders(pagination.currentPage - 1)}>← Prev</button>
          <span style={styles.pageInfo}>Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total)</span>
          <button style={styles.pageBtn} disabled={pagination.currentPage >= pagination.totalPages} onClick={() => fetchOrders(pagination.currentPage + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { margin: 0, color: '#1a1a2e' },
  select: { padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' },
  card: { background: '#fff', borderRadius: '8px', boxShadow: '0 1px 6px rgba(0,0,0,0.08)', overflow: 'hidden' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8f9fa', borderBottom: '1px solid #eee' },
  orderId: { fontWeight: '700', color: '#1a1a2e' },
  badge: { padding: '3px 10px', borderRadius: '12px', color: '#fff', fontSize: '0.8rem', fontWeight: '600' },
  cardBody: { padding: '16px' },
  label: { margin: '0 0 2px', fontSize: '0.75rem', color: '#999', fontWeight: '600', textTransform: 'uppercase' },
  value: { margin: '0 0 10px', fontSize: '0.9rem', color: '#333' },
  updateBtn: { display: 'block', width: '100%', padding: '10px', background: '#3498db', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' },
  delivered: { textAlign: 'center', padding: '10px', color: '#27ae60', fontWeight: '600', margin: 0 },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' },
  pageBtn: { padding: '8px 16px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  pageInfo: { fontSize: '0.9rem', color: '#666' },
  msg: { marginBottom: '16px', fontWeight: '500' },
  loading: { textAlign: 'center', color: '#666', padding: '40px' },
  empty: { textAlign: 'center', color: '#999', padding: '40px' },
};
