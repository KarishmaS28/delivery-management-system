import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const STATUS_COLORS = {
  pending: '#f39c12', assigned: '#3498db', picked: '#9b59b6', delivered: '#27ae60',
};

export default function AssignDriver() {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [selectedDriver, setSelectedDriver] = useState({});
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchDrivers = useCallback(async () => {
    try {
      const res = await api.get('/orders/drivers', { params: { limit: 100 } });
      setDrivers(res.data.data.drivers);
    } catch (err) {
      setMessage({ text: 'Failed to load drivers', type: 'error' });
    }
  }, []);

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/orders', { params: { page, limit: 10, status: 'pending' } });
      setOrders(res.data.data.orders);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to load orders', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(1); fetchDrivers(); }, [fetchOrders, fetchDrivers]);

  const handleAssign = async (orderId) => {
    const selectedName = selectedDriver[orderId];
    const driver = drivers.find((d) => d.name === selectedName);
    if (!driver) { setMessage({ text: 'Please select a valid driver', type: 'error' }); return; }
    setAssigning(orderId);
    setMessage({ text: '', type: '' });
    try {
      await api.put('/orders/assign', { orderId, driverId: driver.id });
      setMessage({ text: `Order #${orderId} assigned successfully`, type: 'success' });
      fetchOrders(pagination.currentPage);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Assignment failed', type: 'error' });
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Assign Drivers to Pending Orders</h2>
      </div>

      {message.text && (
        <p style={{ ...styles.msg, color: message.type === 'error' ? '#e74c3c' : '#27ae60' }}>
          {message.text}
        </p>
      )}

      {loading ? (
        <p style={styles.loading}>Loading...</p>
      ) : orders.length === 0 ? (
        <p style={styles.empty}>No pending orders.</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Pickup</th>
                <th style={styles.th}>Delivery</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Assign Driver</th>
                <th style={styles.th}>Action</th>
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
                    <span style={{ ...styles.badge, background: STATUS_COLORS[o.status] }}>{o.status}</span>
                  </td>
                  <td style={styles.td}>
                    <input
                      style={styles.driverInput}
                      list={`drivers-${o.id}`}
                      placeholder="Search & select driver..."
                      value={selectedDriver[o.id] || ''}
                      onChange={(e) => setSelectedDriver({ ...selectedDriver, [o.id]: e.target.value })}
                    />
                    <datalist id={`drivers-${o.id}`}>
                      {drivers.map((d) => (
                        <option key={d.id} value={d.name} />
                      ))}
                    </datalist>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.assignBtn}
                      onClick={() => handleAssign(o.id)}
                      disabled={assigning === o.id}
                    >
                      {assigning === o.id ? 'Assigning...' : 'Assign'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div style={styles.pagination}>
          <button style={styles.pageBtn} disabled={pagination.currentPage <= 1} onClick={() => fetchOrders(pagination.currentPage - 1)}>← Prev</button>
          <span style={styles.pageInfo}>Page {pagination.currentPage} of {pagination.totalPages}</span>
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
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' },
  thead: { background: '#1a1a2e' },
  th: { padding: '12px 16px', textAlign: 'left', color: '#fff', fontSize: '0.85rem', fontWeight: '600' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '12px 16px', fontSize: '0.9rem', color: '#333' },
  badge: { padding: '3px 10px', borderRadius: '12px', color: '#fff', fontSize: '0.8rem', fontWeight: '600' },
  driverInput: { padding: '6px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem', width: '200px' },
  assignBtn: { padding: '6px 14px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '20px' },
  pageBtn: { padding: '8px 16px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  pageInfo: { fontSize: '0.9rem', color: '#666' },
  msg: { marginBottom: '16px', fontWeight: '500' },
  loading: { textAlign: 'center', color: '#666', padding: '40px' },
  empty: { textAlign: 'center', color: '#999', padding: '40px' },
};
