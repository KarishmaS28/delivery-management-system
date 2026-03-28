import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>🚚 DeliveryMS</span>
      <div style={styles.links}>
        {user?.role === 'customer' && (
          <>
            <Link to="/orders" style={styles.link}>My Orders</Link>
            <Link to="/create-order" style={styles.link}>New Order</Link>
          </>
        )}
        {user?.role === 'admin' && (
          <>
            <Link to="/orders" style={styles.link}>All Orders</Link>
            <Link to="/assign-driver" style={styles.link}>Assign Driver</Link>
          </>
        )}
        {user?.role === 'driver' && (
          <Link to="/driver-dashboard" style={styles.link}>My Deliveries</Link>
        )}
        {user && (
          <span style={styles.userInfo}>
            {user.name} ({user.role})
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </span>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', background: '#1a1a2e', color: '#fff' },
  brand: { fontSize: '1.2rem', fontWeight: 'bold' },
  links: { display: 'flex', alignItems: 'center', gap: '16px' },
  link: { color: '#a0c4ff', textDecoration: 'none', fontSize: '0.95rem' },
  userInfo: { color: '#ccc', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' },
  logoutBtn: { background: '#e74c3c', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' },
};
