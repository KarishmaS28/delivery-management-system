import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateOrder from './pages/CreateOrder';
import OrdersList from './pages/OrdersList';
import AssignDriver from './pages/AssignDriver';
import DriverDashboard from './pages/DriverDashboard';

function AppRoutes() {
  const { user } = useAuth();
  const defaultPath = user
    ? user.role === 'driver' ? '/driver-dashboard' : '/orders'
    : '/login';

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={user ? <Navigate to={defaultPath} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={defaultPath} /> : <Register />} />

        <Route path="/orders" element={
          <ProtectedRoute roles={['customer', 'admin']}>
            <OrdersList />
          </ProtectedRoute>
        } />
        <Route path="/create-order" element={
          <ProtectedRoute roles={['customer']}>
            <CreateOrder />
          </ProtectedRoute>
        } />
        <Route path="/assign-driver" element={
          <ProtectedRoute roles={['admin']}>
            <AssignDriver />
          </ProtectedRoute>
        } />
        <Route path="/driver-dashboard" element={
          <ProtectedRoute roles={['driver']}>
            <DriverDashboard />
          </ProtectedRoute>
        } />

        <Route path="/unauthorized" element={
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <h2>403 - Access Denied</h2>
            <p>You don't have permission to view this page.</p>
          </div>
        } />
        <Route path="*" element={<Navigate to={defaultPath} />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ minHeight: '100vh', background: '#f4f6f9', fontFamily: 'system-ui, sans-serif' }}>
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
