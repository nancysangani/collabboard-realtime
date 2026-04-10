import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({});

  const handle = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (touched[name]) validateField(name, value);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    if (name === 'currentPassword' && !value.trim()) {
      newErrors.currentPassword = 'Current password is required';
    } else if (name === 'currentPassword') {
      delete newErrors.currentPassword;
    }
    if (name === 'newPassword') {
      const err = validatePassword(value);
      if (err) newErrors.newPassword = err;
      else delete newErrors.newPassword;
    }
    if (name === 'confirmPassword') {
      if (value !== form.newPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        delete newErrors.confirmPassword;
      }
    }
    setErrors(newErrors);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    validateField(name, form[name]);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.currentPassword.trim()) newErrors.currentPassword = 'Current password is required';
    const err = validatePassword(form.newPassword);
    if (err) newErrors.newPassword = err;
    if (form.newPassword !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess(true);
      toast.success('Password changed successfully!');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      if (err.response?.status === 401) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      }
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.checkmark}>
            <CheckCircle size={48} color="#22c55e" />
          </div>
          <h1 style={s.successTitle}>Password Changed!</h1>
          <p style={s.successMsg}>Your password has been updated successfully.</p>
          <p style={s.redirectMsg}>You'll be redirected to login shortly...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>Change Password</h1>
        <p style={s.sub}>Update your account password</p>

        <form onSubmit={submit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Current Password</label>
            <input
              name="currentPassword"
              type="password"
              placeholder="Enter current password"
              value={form.currentPassword}
              onChange={handle}
              onBlur={handleBlur}
              style={{
                ...s.input,
                borderColor: errors.currentPassword ? 'var(--red)' : 'var(--border)',
                backgroundColor: errors.currentPassword ? 'rgba(239, 68, 68, 0.08)' : 'transparent'
              }}
              required
            />
            {errors.currentPassword && (
              <div style={s.errorMsg}>
                <AlertCircle size={14} /> {errors.currentPassword}
              </div>
            )}
          </div>

          <div style={s.field}>
            <label style={s.label}>New Password</label>
            <input
              name="newPassword"
              type="password"
              placeholder="Min 6 characters"
              value={form.newPassword}
              onChange={handle}
              onBlur={handleBlur}
              style={{
                ...s.input,
                borderColor: errors.newPassword ? 'var(--red)' : 'var(--border)',
                backgroundColor: errors.newPassword ? 'rgba(239, 68, 68, 0.08)' : 'transparent'
              }}
              required
            />
            {errors.newPassword && (
              <div style={s.errorMsg}>
                <AlertCircle size={14} /> {errors.newPassword}
              </div>
            )}
          </div>

          <div style={s.field}>
            <label style={s.label}>Confirm New Password</label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              value={form.confirmPassword}
              onChange={handle}
              onBlur={handleBlur}
              style={{
                ...s.input,
                borderColor: errors.confirmPassword ? 'var(--red)' : 'var(--border)',
                backgroundColor: errors.confirmPassword ? 'rgba(239, 68, 68, 0.08)' : 'transparent'
              }}
              required
            />
            {errors.confirmPassword && (
              <div style={s.errorMsg}>
                <AlertCircle size={14} /> {errors.confirmPassword}
              </div>
            )}
          </div>

          <div style={s.actions}>
            <button type="button" className="btn-ghost" onClick={() => navigate('/')}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 16 },
  card: { width: '100%', maxWidth: 420, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 40 },
  title: { fontSize: 24, fontWeight: 600, marginBottom: 6 },
  sub: { color: 'var(--text2)', marginBottom: 28, fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: 'var(--text2)' },
  input: { padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, transition: 'all 0.2s' },
  errorMsg: { fontSize: 12, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 },
  actions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 },
  checkmark: { textAlign: 'center', marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: 600, marginBottom: 12, textAlign: 'center' },
  successMsg: { color: 'var(--text2)', textAlign: 'center', marginBottom: 8 },
  redirectMsg: { color: 'var(--text3)', textAlign: 'center', fontSize: 13 },
};
