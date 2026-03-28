import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const STATUS_COLORS = {
  pending: '#f39c12', assigned: '#3498db', picked: '#9b59b6', delivered: '#27ae60',
};

const STATUSES = ['', 'pending', 'assigned', 'picked', 'delivered'];

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 10 };
      if (status) params.status = status;
      const { data } = await api.get('/orders', { params });
      setOrders(data.data.orders);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { fetchOrders(1); }, [fetchOrders]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Orders</h2>
        <select style={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>
          ))}
        </select>
      </div>

      {error && <p style={styles.error}>{error}</p>}
      {loading ? (
        <p style={styles.loading}>Loading...</p>
      ) : orders.length === 0 ? (
        <p style={styles.empty}>No orders found.</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Pickup Address</th>
                <th style={styles.th}>Delivery Address</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Driver</th>
                <th style={styles.th}>Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} style={styles.tr}>
                  <td style={styles.td}>#{o.id}</td>
                  <td style={styles.td}>{o.customer?.name}</td>
                  <td style={styles.td}>{o.pickup_address}</td>
                  <td style={styles.td}>{o.delivery_address}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, background: STATUS_COLORS[o.status] }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={styles.td}>{o.delivery?.driver?.name || '—'}</td>
                  <td style={styles.td}>{new Date(o.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalItems > 0 && (
        <div style={styles.pagination}>
          <button
            style={styles.pageBtn} disabled={pagination.currentPage <= 1}
            onClick={() => fetchOrders(pagination.currentPage - 1)}
          >← Prev</button>
          <span style={styles.pageInfo}>Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total)</span>
          <button
            style={styles.pageBtn} disabled={pagination.currentPage >= pagination.totalPages}
            onClick={() => fetchOrders(pagination.currentPage + 1)}
          >Next →</button>
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
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' },
  thead: { background: '#1a1a2e' },
  th: { padding: '12px 16px', textAlign: 'left', color: '#fff', fontSize: '0.85rem', fontWeight: '600' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '12px 16px', fontSize: '0.9rem', color: '#333' },
  badge: { padding: '3px 10px', borderRadius: '12px', color: '#fff', fontSize: '0.8rem', fontWeight: '600' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '20px' },
  pageBtn: { padding: '8px 16px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  pageInfo: { fontSize: '0.9rem', color: '#666' },
  error: { color: '#e74c3c', marginBottom: '12px' },
  loading: { textAlign: 'center', color: '#666', padding: '40px' },
  empty: { textAlign: 'center', color: '#999', padding: '40px' },
};
