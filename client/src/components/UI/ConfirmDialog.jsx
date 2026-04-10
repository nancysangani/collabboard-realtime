import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDanger = false, onConfirm, onCancel, loading = false }) {
  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ ...styles.icon, background: isDanger ? '#fca5a5' : '#bfdbfe', color: isDanger ? '#991b1b' : '#1e40af' }}>
              <AlertTriangle size={20} />
            </div>
            <h2 style={styles.title}>{title}</h2>
          </div>
          <button onClick={onCancel} className="btn-ghost" style={styles.closeBtn} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>
        <p style={styles.message}>{message}</p>
        <div style={styles.actions}>
          <button type="button" className="btn-ghost" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className={isDanger ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Please wait...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 300,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: 28,
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
    margin: 0,
  },
  closeBtn: {
    padding: '4px 8px',
    flexShrink: 0,
  },
  message: {
    fontSize: 14,
    color: 'var(--text2)',
    marginBottom: 24,
    lineHeight: 1.5,
    margin: '0 0 24px 0',
  },
  actions: {
    display: 'flex',
    gap: 12,
    justifyContent: 'flex-end',
  },
};
