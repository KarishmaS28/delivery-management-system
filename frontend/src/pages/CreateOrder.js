import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function CreateOrder() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ pickup_address: '', delivery_address: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.pickup_address.trim()) e.pickup_address = 'Pickup address is required';
    if (!form.delivery_address.trim()) e.delivery_address = 'Delivery address is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setServerError('');
    setLoading(true);
    try {
      await api.post('/orders', form);
      navigate('/orders');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create New Order</h2>
        {serverError && <p style={styles.error}>{serverError}</p>}
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Pickup Address</label>
          <textarea
            style={{ ...styles.textarea, ...(errors.pickup_address ? styles.inputError : {}) }}
            placeholder="Enter pickup address"
            value={form.pickup_address}
            onChange={(e) => setForm({ ...form, pickup_address: e.target.value })}
            rows={3}
          />
          {errors.pickup_address && <p style={styles.fieldError}>{errors.pickup_address}</p>}

          <label style={styles.label}>Delivery Address</label>
          <textarea
            style={{ ...styles.textarea, ...(errors.delivery_address ? styles.inputError : {}) }}
            placeholder="Enter delivery address"
            value={form.delivery_address}
            onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
            rows={3}
          />
          {errors.delivery_address && <p style={styles.fieldError}>{errors.delivery_address}</p>}

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Order'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', padding: '40px 16px' },
  card: { background: '#fff', padding: '32px', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '480px' },
  title: { marginBottom: '20px', color: '#1a1a2e' },
  label: { display: 'block', marginBottom: '4px', fontWeight: '600', fontSize: '0.9rem', color: '#444' },
  textarea: { display: 'block', width: '100%', padding: '10px', marginBottom: '4px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '0.95rem', resize: 'vertical' },
  inputError: { borderColor: '#e74c3c' },
  btn: { width: '100%', padding: '10px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', marginTop: '8px' },
  error: { color: '#e74c3c', marginBottom: '12px', fontSize: '0.9rem' },
  fieldError: { color: '#e74c3c', fontSize: '0.8rem', marginBottom: '10px', marginTop: '0' },
};
