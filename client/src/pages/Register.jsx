import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { AlertCircle, Check, X } from 'lucide-react';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' };
  if (score <= 2) return { score, label: 'Fair', color: '#f59e0b' };
  if (score <= 3) return { score, label: 'Good', color: '#eab308' };
  return { score, label: 'Strong', color: '#22c55e' };
};

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'developer' });
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
    if (name === 'name') {
      if (!value.trim()) newErrors.name = 'Name is required';
      else if (value.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
      else delete newErrors.name;
    }
    if (name === 'email') {
      if (!value.trim()) newErrors.email = 'Email is required';
      else if (!validateEmail(value)) newErrors.email = 'Invalid email format';
      else delete newErrors.email;
    }
    if (name === 'password') {
      if (!value) newErrors.password = 'Password is required';
      else if (value.length < 6) newErrors.password = 'Password must be at least 6 characters';
      else delete newErrors.password;
    }
    setErrors(newErrors);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    else if (form.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(form.email)) newErrors.email = 'Invalid email format';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
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
      const { data } = await authAPI.register(form);
      login(data.token, data.user);
      toast.success(`Welcome, ${data.user.name}!`);
      navigate('/');
    } catch (err) {
      if (err.response?.data?.message?.includes('already registered')) {
        setErrors({ email: 'Email already registered' });
      }
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(form.password);

  return (
    <div style={styles.page} role="main" aria-label="Registration page">
      <div style={styles.card} className="scale-in">
        <div style={styles.logo}>
          <div style={styles.logoIcon} aria-label="CollabBoard">C</div>
          <span style={styles.logoText}>CollabBoard</span>
        </div>
        <h1 style={styles.title}>Create account</h1>
        <p style={styles.sub}>Join your team workspace</p>
        <form onSubmit={submit} style={styles.form} aria-label="Registration form">
          <div style={styles.field}>
            <label htmlFor="reg-name" style={styles.label}>Full name</label>
            <input
              id="reg-name"
              name="name"
              placeholder="Jane Smith"
              value={form.name}
              onChange={handle}
              onBlur={handleBlur}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              style={{
                ...styles.input,
                borderColor: errors.name ? 'var(--red)' : 'var(--border)',
                backgroundColor: errors.name ? 'rgba(239, 68, 68, 0.08)' : 'transparent'
              }}
              required
            />
            {errors.name && (
              <div style={styles.errorMsg} id="name-error" role="alert">
                <AlertCircle size={14} /> {errors.name}
              </div>
            )}
          </div>
          <div style={styles.field}>
            <label htmlFor="reg-email" style={styles.label}>Email</label>
            <input
              id="reg-email"
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
            <label htmlFor="reg-password" style={styles.label}>Password</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={handle}
              onBlur={handleBlur}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : "password-strength"}
              style={{
                ...styles.input,
                borderColor: errors.password ? 'var(--red)' : 'var(--border)',
                backgroundColor: errors.password ? 'rgba(239, 68, 68, 0.08)' : 'transparent'
              }}
              required
              minLength={6}
            />
            {errors.password && (
              <div style={styles.errorMsg} id="password-error" role="alert">
                <AlertCircle size={14} /> {errors.password}
              </div>
            )}
            {form.password && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }} id="password-strength" role="status" aria-live="polite">
                <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      background: passwordStrength.color,
                      transition: 'width 0.3s'
                    }}
                  />
                </div>
                <span style={{ fontSize: 12, color: passwordStrength.color, fontWeight: 500 }} aria-label={`Password strength: ${passwordStrength.label}`}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>
          <div style={styles.field}>
            <label htmlFor="reg-role" style={styles.label}>Role</label>
            <select
              id="reg-role"
              name="role"
              value={form.role}
              onChange={handle}
              style={styles.input}
              aria-label="Select your role"
            >
              <option value="developer">Developer</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent2)', textDecoration: 'none' }} aria-label="Sign in to your existing account">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 16 },
  card: { width: '100%', maxWidth: 400, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 40 },
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 },
  logoIcon: { width: 36, height: 36, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, color: '#fff' },
  logoText: { fontWeight: 600, fontSize: 18 },
  title: { fontSize: 24, fontWeight: 600, marginBottom: 6 },
  sub: { color: 'var(--text2)', marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: 'var(--text2)' },
  input: { padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, transition: 'all 0.2s' },
  errorMsg: { fontSize: 12, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 },
  footer: { marginTop: 24, textAlign: 'center', color: 'var(--text2)', fontSize: 13 },
};
