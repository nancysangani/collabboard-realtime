import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#7c6aff','#22c55e','#3b82f6','#f59e0b','#ef4444','#ec4899'];

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'developer' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = mode === 'login'
        ? await authAPI.login({ email: form.email, password: form.password })
        : await authAPI.register(form);
      login(data.token, data.user);
      toast.success(`Welcome${mode === 'register' ? ', ' + data.user.name : ' back'}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: '24px',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(124,106,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,106,255,0.03) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', gap: '5px', marginBottom: '16px' }}>
            {COLORS.map((c, i) => (
              <div key={i} style={{
                width: '10px', height: i === 2 ? '28px' : i === 1 || i === 3 ? '20px' : '14px',
                background: c, borderRadius: '3px', alignSelf: 'flex-end',
              }} />
            ))}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            CollabBoard
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '14px' }}>
            Real-time project management
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-xl)', padding: '32px',
          boxShadow: '0 0 60px rgba(124,106,255,0.06)',
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', background: 'var(--bg-overlay)',
            borderRadius: 'var(--radius-md)', padding: '3px', marginBottom: '28px',
          }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '7px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: mode === m ? 'var(--bg-elevated)' : 'transparent',
                color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '500',
                transition: 'all 0.15s',
              }}>
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'register' && (
              <div>
                <label className="label">Full name</label>
                <input className="input" placeholder="Alex Johnson" value={form.name} onChange={set('name')} required />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="alex@company.com" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required />
            </div>
            {mode === 'register' && (
              <div>
                <label className="label">Role</label>
                <select className="input" value={form.role} onChange={set('role')}>
                  <option value="developer">Developer</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: '4px', fontSize: '14px' }}>
              {loading ? <span className="spinner" style={{ width: '16px', height: '16px' }} /> : (mode === 'login' ? 'Sign in' : 'Create account')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
