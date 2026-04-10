import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus, X } from 'lucide-react';
import KanbanCard from './KanbanCard';

const COLUMN_STYLES = {
  'Todo':        { accent: '#8b8b9e', bg: 'rgba(139,139,158,0.06)' },
  'In Progress': { accent: '#7c6aff', bg: 'rgba(124,106,255,0.06)' },
  'Review':      { accent: '#f59e0b', bg: 'rgba(245,158,11,0.06)'  },
  'Done':        { accent: '#22c55e', bg: 'rgba(34,197,94,0.06)'   },
};

export default function KanbanColumn({ column, cards, onCreateCard, onUpdateCard, onDeleteCard, userRole, members }) {
  const [addingCard, setAddingCard] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const style = COLUMN_STYLES[column] || { accent: 'var(--accent)', bg: 'var(--accent-dim)' };
  const canCreate = userRole === 'admin' || userRole === 'manager' || userRole === 'developer';

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    await onCreateCard({ title: newTitle.trim(), status: column, priority: 'medium' });
    setCreating(false);
    setNewTitle('');
    setAddingCard(false);
  };

  return (
    <div style={{
      width: '272px', flexShrink: 0, display: 'flex', flexDirection: 'column',
      background: style.bg, border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
    }}>
      {/* Column header */}
      <div style={{
        padding: '14px 16px 12px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: style.accent }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: '700', letterSpacing: '0.01em' }}>
            {column}
          </span>
          <span style={{
            fontSize: '11px', fontWeight: '600', padding: '1px 6px',
            background: 'var(--bg-overlay)', borderRadius: '20px', color: 'var(--text-muted)',
          }}>
            {cards.length}
          </span>
        </div>
        {canCreate && (
          <button className="btn btn-icon btn-ghost" style={{ padding: '3px' }} onClick={() => setAddingCard(v => !v)}>
            {addingCard ? <X size={13} /> : <Plus size={13} />}
          </button>
        )}
      </div>

      {/* Add card form */}
      {addingCard && (
        <div style={{ padding: '10px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
          <form onSubmit={handleCreate}>
            <input
              className="input" value={newTitle} onChange={e => setNewTitle(e.target.value)}
              placeholder="Card title..." style={{ fontSize: '13px', padding: '7px 10px', marginBottom: '7px' }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '6px' }}>
              <button type="button" className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setAddingCard(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }} disabled={creating}>
                {creating ? <span className="spinner" style={{ width: '12px', height: '12px' }} /> : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cards droppable area */}
      <Droppable droppableId={column}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              padding: '10px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              minHeight: '80px',
              background: snapshot.isDraggingOver ? `${style.accent}10` : 'transparent',
              transition: 'background 0.15s',
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 220px)',
            }}
          >
            {cards.map((card, index) => (
              <KanbanCard
                key={card._id}
                card={card}
                index={index}
                onUpdate={onUpdateCard}
                onDelete={onDeleteCard}
                userRole={userRole}
                members={members}
              />
            ))}
            {provided.placeholder}
            {cards.length === 0 && !snapshot.isDraggingOver && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '12px' }}>
                Drop cards here
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
