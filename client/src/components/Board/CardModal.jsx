import { useState } from 'react';
import { cardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { X, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const PRIORITIES = ['low', 'medium', 'high'];

export default function CardModal({ card, members, boardId, onClose, onUpdate, onDelete, socket }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: card.title,
    description: card.description || '',
    priority: card.priority || 'medium',
    assignee: card.assignee?._id || '',
    tags: card.tags?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);

  const canEdit = user?.role !== 'developer' || card.assignee?._id === user?.id;
  const canDelete = user?.role === 'admin' || user?.role === 'manager';

  const save = async () => {
    setSaving(true);
    try {
      const updates = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        assignee: form.assignee || null,
      };
      const { data } = await cardAPI.update(card._id, updates);
      if (socket) socket.emit('card:update', { boardId, cardId: card._id, updates });
      onUpdate(data);
      toast.success('Card updated');
      onClose();
    } catch {
      toast.error('Failed to update card');
    } finally {
      setSaving(false);
    }
  };

  const deleteCard = async () => {
    if (!confirm('Delete this card?')) return;
    try {
      await cardAPI.delete(card._id);
      if (socket) socket.emit('card:deleted', { boardId, cardId: card._id });
      onDelete(card._id);
      toast.success('Card deleted');
      onClose();
    } catch {
      toast.error('Failed to delete card');
    }
  };

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} className="scale-in" onClick={e => e.stopPropagation()}>
        <div style={s.header}>
          <input
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
            style={s.titleInput}
            disabled={!canEdit}
          />
          <button onClick={onClose} className="btn-ghost" style={{ padding: 6 }}><X size={16} /></button>
        </div>

        <div style={s.body}>
          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} disabled={!canEdit}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Assignee</label>
              <select value={form.assignee} onChange={e => setForm({...form, assignee: e.target.value})} disabled={!canEdit}>
                <option value="">Unassigned</option>
                {members?.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              rows={5}
              placeholder="Add a description..."
              style={{ resize: 'vertical' }}
              disabled={!canEdit}
            />
          </div>

          <div style={s.field}>
            <label style={s.label}><Tag size={12} style={{ display: 'inline', marginRight: 4 }} />Tags (comma separated)</label>
            <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="bug, frontend, urgent" disabled={!canEdit} />
          </div>

          <div style={s.meta}>
            <span>Status: <strong style={{ color: 'var(--accent2)' }}>{card.status}</strong></span>
            <span>Created: {new Date(card.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div style={s.footer}>
          {canDelete && (
            <button className="btn-danger" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={deleteCard}>
              <Trash2 size={14} /> Delete
            </button>
          )}
          <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            {canEdit && <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' },
  modal: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' },
  header: { display: 'flex', alignItems: 'center', gap: 10, padding: '20px 20px 0' },
  titleInput: { flex: 1, background: 'transparent', border: 'none', fontSize: 17, fontWeight: 600, color: 'var(--text)', padding: 0, boxShadow: 'none' },
  body: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 500, color: 'var(--text2)' },
  meta: { display: 'flex', gap: 16, fontSize: 12, color: 'var(--text3)', paddingTop: 4 },
  footer: { display: 'flex', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid var(--border)' },
};
