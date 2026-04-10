import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus, X } from 'lucide-react';
import KanbanCard from './KanbanCard';
import { cardAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Column({ column, cards, members, boardId, projectId, onCardCreate, onCardUpdate, onCardDelete, socket }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const createCard = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const { data } = await cardAPI.create({ title: title.trim(), status: column, boardId });
      onCardCreate(data);
      if (socket) socket.emit('card:created', { boardId, card: data });
      setTitle('');
      setAdding(false);
      toast.success('Card created');
    } catch {
      toast.error('Failed to create card');
    } finally {
      setLoading(false);
    }
  };

  const COLUMN_COLORS = {
    'Todo': '#6c63ff',
    'In Progress': '#f59e0b',
    'Review': '#3b82f6',
    'Done': '#22c55e',
  };
  const color = COLUMN_COLORS[column] || '#6c63ff';

  return (
    <div style={s.column}>
      <div style={s.header}>
        <div style={s.titleRow}>
          <div style={{ ...s.dot, background: color }} />
          <span style={s.colTitle}>{column}</span>
          <span style={s.count}>{cards.length}</span>
        </div>
        <button className="btn-ghost" style={s.addBtn} onClick={() => setAdding(a => !a)}>
          <Plus size={14} />
        </button>
      </div>

      {adding && (
        <form onSubmit={createCard} style={s.addForm} className="fade-in">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Card title..."
            autoFocus
            style={{ marginBottom: 8 }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="submit" className="btn-primary" style={{ flex: 1, padding: '7px 0', fontSize: 13 }} disabled={loading}>
              {loading ? '...' : 'Add'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => { setAdding(false); setTitle(''); }} style={{ padding: '7px 10px' }}>
              <X size={13} />
            </button>
          </div>
        </form>
      )}

      <Droppable droppableId={column}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ ...s.list, ...(snapshot.isDraggingOver ? s.dragOver : {}) }}
          >
            {cards.map((card, index) => (
              <KanbanCard
                key={card._id}
                card={card}
                index={index}
                members={members}
                boardId={boardId}
                onUpdate={onCardUpdate}
                onDelete={onCardDelete}
                socket={socket}
              />
            ))}
            {provided.placeholder}
            {cards.length === 0 && !snapshot.isDraggingOver && (
              <div style={s.empty}>Drop cards here</div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

const s = {
  column: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: 280, minWidth: 280, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 160px)' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 14px 10px' },
  titleRow: { display: 'flex', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: '50%' },
  colTitle: { fontWeight: 600, fontSize: 13 },
  count: { background: 'var(--bg4)', color: 'var(--text2)', borderRadius: 5, padding: '1px 7px', fontSize: 11, fontFamily: 'var(--mono)' },
  addBtn: { padding: '4px 6px', borderRadius: 6 },
  addForm: { padding: '0 12px 12px' },
  list: { flex: 1, padding: '4px 12px 12px', overflowY: 'auto', transition: 'background 0.15s', minHeight: 60 },
  dragOver: { background: 'var(--accent-bg)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' },
  empty: { textAlign: 'center', color: 'var(--text3)', fontSize: 12, padding: '20px 0', fontStyle: 'italic' },
};
