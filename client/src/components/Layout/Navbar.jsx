import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Zap } from 'lucide-react';

const avatarColor = (name = '') => {
  const colors = ['#7c6aff','#22c55e','#3b82f6','#f59e0b','#ef4444','#ec4899'];
  return colors[name.charCodeAt(0) % colors.length];
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={{
      height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', borderBottom: '1px solid var(--border)',
      background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
        <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end' }}>
          {['#7c6aff','#22c55e','#3b82f6'].map((c, i) => (
            <div key={i} style={{ width: '6px', height: `${10 + i * 4}px`, background: c, borderRadius: '2px' }} />
          ))}
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '800', letterSpacing: '-0.3px' }}>
          CollabBoard
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: connected ? 'var(--green-dim)' : 'var(--red-dim)', borderRadius: '20px', border: `1px solid ${connected ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: connected ? 'var(--green)' : 'var(--red)' }} />
          <span style={{ fontSize: '11px', fontWeight: '500', color: connected ? 'var(--green)' : 'var(--red)' }}>
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>

        {/* Role badge */}
        <span className={`badge badge-${user?.role}`}>{user?.role}</span>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="avatar avatar-sm" style={{ background: avatarColor(user?.name), color: '#fff' }}>
            {user?.name?.[0]}
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{user?.name}</span>
        </div>

        <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Sign out">
          <LogOut size={15} />
        </button>
      </div>
    </nav>
  );
}
