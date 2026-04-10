import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { LayoutDashboard, FolderKanban, LogOut, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <aside style={s.aside}>
      <div style={s.logo}>
        <div style={s.logoIcon}>C</div>
        <span style={s.logoText}>CollabBoard</span>
      </div>

      <nav style={s.nav}>
        <NavLink to="/" end style={({ isActive }) => ({ ...s.link, ...(isActive ? s.linkActive : {}) })}>
          <LayoutDashboard size={16} />
          Dashboard
        </NavLink>
        <NavLink to="/projects" style={({ isActive }) => ({ ...s.link, ...(isActive ? s.linkActive : {}) })}>
          <FolderKanban size={16} />
          Projects
        </NavLink>
      </nav>

      <div style={s.bottom}>
        <div style={s.connBadge}>
          {connected
            ? <><Wifi size={12} color="var(--green)" /><span style={{ color: 'var(--green)' }}>Live</span></>
            : <><WifiOff size={12} color="var(--text3)" /><span style={{ color: 'var(--text3)' }}>Offline</span></>
          }
        </div>
        <div style={s.user}>
          <div style={s.avatar}>{initials}</div>
          <div style={s.userInfo}>
            <div style={s.userName}>{user?.name}</div>
            <span className={`badge badge-${user?.role}`}>{user?.role}</span>
          </div>
          <button onClick={handleLogout} className="btn-ghost" style={{ padding: 6 }} title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}

const s = {
  aside: { width: 220, minHeight: '100vh', background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '20px 12px', flexShrink: 0 },
  logo: { display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px', marginBottom: 28 },
  logoIcon: { width: 30, height: 30, background: 'var(--accent)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#fff', flexShrink: 0 },
  logoText: { fontWeight: 600, fontSize: 16 },
  nav: { display: 'flex', flexDirection: 'column', gap: 2, flex: 1 },
  link: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, color: 'var(--text2)', textDecoration: 'none', fontWeight: 500, transition: 'all 0.15s' },
  linkActive: { background: 'var(--accent-bg)', color: 'var(--accent2)' },
  bottom: { display: 'flex', flexDirection: 'column', gap: 10 },
  connBadge: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: 'var(--bg3)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--mono)' },
  user: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px', background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)' },
  avatar: { width: 30, height: 30, borderRadius: 8, background: 'var(--accent-bg)', color: 'var(--accent2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12, flexShrink: 0 },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
};
