import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
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
      await register(form);
      navigate('/login');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (key, type = 'text', placeholder) => (
    <>
      <input
        style={{ ...styles.input, ...(errors[key] ? styles.inputError : {}) }}
        type={type} placeholder={placeholder}
        value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
      {errors[key] && <p style={styles.fieldError}>{errors[key]}</p>}
    </>
  );

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        {serverError && <p style={styles.error}>{serverError}</p>}
        <form onSubmit={handleSubmit}>
          {field('name', 'text', 'Full Name')}
          {field('email', 'email', 'Email')}
          {field('password', 'password', 'Password (min 6 chars)')}
          <select
            style={styles.input} value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="customer">Customer</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p style={styles.footer}>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' },
  card: { background: '#fff', padding: '32px', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '380px' },
  title: { textAlign: 'center', marginBottom: '20px', color: '#1a1a2e' },
  input: { display: 'block', width: '100%', padding: '10px', marginBottom: '4px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '0.95rem' },
  inputError: { borderColor: '#e74c3c' },
  btn: { width: '100%', padding: '10px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', marginTop: '8px' },
  error: { color: '#e74c3c', marginBottom: '12px', fontSize: '0.9rem' },
  fieldError: { color: '#e74c3c', fontSize: '0.8rem', marginBottom: '8px', marginTop: '0' },
  footer: { textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' },
};
