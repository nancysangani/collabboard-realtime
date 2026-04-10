import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { AlertCircle } from 'lucide-react';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const handle = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (touched[name]) validateField(name, value);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    if (name === 'email') {
      if (!value.trim()) newErrors.email = 'Email is required';
      else if (!validateEmail(value)) newErrors.email = 'Invalid email format';
      else delete newErrors.email;
    }
    if (name === 'password') {
      if (!value) newErrors.password = 'Password is required';
      else delete newErrors.password;
    }
    setErrors(newErrors);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(form.email)) newErrors.email = 'Invalid email format';
    if (!form.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    validateField(name, form[name]);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.message;
      if (message?.includes('not found') || err.response?.status === 401) {
        setErrors({ email: 'No account found with this email' });
      } else if (message?.includes('password') || err.response?.status === 401) {
        setErrors({ password: 'Incorrect password' });
      }
      toast.error(message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page} role="main" aria-label="Login page">
      <div style={styles.card} className="scale-in">
        <div style={styles.logo}>
          <div style={styles.logoIcon} aria-label="CollabBoard">C</div>
          <span style={styles.logoText}>CollabBoard</span>
        </div>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.sub}>Sign in to your workspace</p>
        <form onSubmit={submit} style={styles.form} aria-label="Login form">
          <div style={styles.field}>
            <label htmlFor="login-email" style={styles.label}>Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handle}
              onBlur={handleBlur}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              style={{
                ...styles.input,
                borderColor: errors.email ? 'var(--red)' : 'var(--border)',
                backgroundColor: errors.email ? 'rgba(239, 68, 68, 0.08)' : 'transparent'
              }}
              required
            />
            {errors.email && (
              <div style={styles.errorMsg} id="email-error" role="alert">
                <AlertCircle size={14} /> {errors.email}
              </div>
            )}
          </div>
          <div style={styles.field}>
            <label htmlFor="login-password" style={styles.label}>Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handle}
              onBlur={handleBlur}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              style={{
                ...styles.input,
                borderColor: errors.password ? 'var(--red)' : 'var(--border)',
                backgroundColor: errors.password ? 'rgba(239, 68, 68, 0.08)' : 'transparent'
              }}
              required
            />
            {errors.password && (
              <div style={styles.errorMsg} id="password-error" role="alert">
                <AlertCircle size={14} /> {errors.password}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div style={styles.footer}>
          <div>
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--accent2)', textDecoration: 'none' }} aria-label="Create a new account">Create one</Link>
          </div>
          <div style={{ marginTop: 12 }}>
            <Link to="/forgot-password" style={{ color: 'var(--accent2)', textDecoration: 'none', fontSize: 13 }} aria-label="Reset your password">Forgot password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 16 },
  card: { width: '100%', maxWidth: 400, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 40 },
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 },
  logoIcon: { width: 36, height: 36, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: '#fff' },
  logoText: { fontWeight: 600, fontSize: 18, color: 'var(--text)' },
  title: { fontSize: 24, fontWeight: 600, marginBottom: 6 },
  sub: { color: 'var(--text2)', marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: 'var(--text2)' },
  input: { padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, transition: 'all 0.2s' },
  errorMsg: { fontSize: 12, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 },
  footer: { marginTop: 24, textAlign: 'center', color: 'var(--text2)', fontSize: 13 },
};
