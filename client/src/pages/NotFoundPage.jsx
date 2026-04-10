import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.icon}>
          <AlertCircle size={64} color="#ef4444" />
        </div>
        <h1 style={s.title}>404</h1>
        <h2 style={s.subtitle}>Project not found</h2>
        <p style={s.message}>
          The project you're looking for doesn't exist or has been deleted.
        </p>

        <div style={s.actions}>
          <button className="btn-primary" onClick={() => navigate('/')} style={s.button}>
            <Home size={16} /> Go to Dashboard
          </button>
          <button className="btn-ghost" onClick={() => navigate(-1)} style={s.button}>
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>

        <div style={s.suggestions}>
          <p style={s.suggestionsTitle}>What you can do:</p>
          <ul style={s.list}>
            <li>Check if the project URL is correct</li>
            <li>Return to the dashboard and try again</li>
            <li>Contact your workspace admin if you think this is a mistake</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: 16,
  },
  container: {
    textAlign: 'center',
    maxWidth: 500,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 64,
    fontWeight: 700,
    margin: '0 0 8px 0',
    background: 'linear-gradient(135deg, var(--accent2), var(--accent))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 600,
    margin: '0 0 12px 0',
    color: 'var(--text)',
  },
  message: {
    fontSize: 14,
    color: 'var(--text2)',
    marginBottom: 28,
    lineHeight: 1.6,
  },
  actions: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 32,
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  suggestions: {
    padding: 16,
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text)',
    marginBottom: 10,
    margin: '0 0 10px 0',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
};
