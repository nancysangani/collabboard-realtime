import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <button onClick={() => navigate('/')} className="btn-ghost" style={s.backBtn}>
            <ArrowLeft size={16} /> Back
          </button>
          <div style={s.icon}>
            <Lock size={32} color="#7c6aff" />
          </div>
          <h1 style={s.title}>Change Your Password</h1>
          <p style={s.sub}>You're logged in. Go to your settings to change your password.</p>
          <button className="btn-primary" onClick={() => navigate('/settings/password')} style={s.button}>
            <Lock size={16} /> Change Password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <button onClick={() => navigate('/login')} className="btn-ghost" style={s.backBtn}>
          <ArrowLeft size={16} /> Back to Login
        </button>
        <div style={s.icon}>
          <Mail size={32} color="#7c6aff" />
        </div>
        <h1 style={s.title}>Forgot Password?</h1>
        <p style={s.sub}>We're here to help! Here are your options:</p>

        <div style={s.options}>
          <div style={s.option}>
            <div style={s.optionIcon}>1</div>
            <div>
              <h3 style={s.optionTitle}>Create a new account</h3>
              <p style={s.optionDesc}>If you forgot your password and don't have access to your email, you can create a new account with a different email.</p>
              <Link to="/register" style={s.link}>Create new account →</Link>
            </div>
          </div>

          <div style={s.option}>
            <div style={s.optionIcon}>2</div>
            <div>
              <h3 style={s.optionTitle}>Contact support</h3>
              <p style={s.optionDesc}>Reach out to your workspace administrator to reset your password or regain access to your account.</p>
              <a href="mailto:support@collabboard.com" style={s.link}>Email support →</a>
            </div>
          </div>

          <div style={s.option}>
            <div style={s.optionIcon}>3</div>
            <div>
              <h3 style={s.optionTitle}>Try logging in again</h3>
              <p style={s.optionDesc}>Make sure you're using the correct email and password. Check for caps lock or typos.</p>
              <Link to="/login" style={s.link}>Back to login →</Link>
            </div>
          </div>
        </div>

        <div style={s.info}>
          <p style={s.infoText}>💡 <strong>Pro tip:</strong> Consider using a password manager to store and manage your passwords securely.</p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 16 },
  card: { width: '100%', maxWidth: 500, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 40 },
  backBtn: { marginBottom: 24, padding: '6px 0' },
  icon: { textAlign: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 600, textAlign: 'center', marginBottom: 8 },
  sub: { color: 'var(--text2)', textAlign: 'center', marginBottom: 32, fontSize: 14 },
  button: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  options: { display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 28 },
  option: { display: 'flex', gap: 12, alignItems: 'flex-start' },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'var(--accent-bg)',
    color: 'var(--accent2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: 14,
    flexShrink: 0,
  },
  optionTitle: { fontSize: 14, fontWeight: 600, marginBottom: 4, color: 'var(--text)' },
  optionDesc: { fontSize: 13, color: 'var(--text2)', marginBottom: 8, lineHeight: 1.5 },
  link: { fontSize: 13, color: 'var(--accent2)', textDecoration: 'none', fontWeight: 500 },
  info: { padding: 12, background: 'rgba(124, 106, 255, 0.08)', borderRadius: 8, border: '1px solid rgba(124, 106, 255, 0.2)' },
  infoText: { fontSize: 13, color: 'var(--text2)', margin: 0, lineHeight: 1.5 },
};
