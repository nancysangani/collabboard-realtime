import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../src/context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <span className="spinner" style={{ width: '32px', height: '32px' }} />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}
