import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { User, Flag } from 'lucide-react';
import CardModal from './CardModal';

export default function KanbanCard({ card, index, members, boardId, onUpdate, onDelete, socket }) {
  const [open, setOpen] = useState(false);

  const initials = card.assignee?.name
    ?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || null;

  return (
    <>
      <Draggable draggableId={card._id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{ ...s.card, ...(snapshot.isDragging ? s.dragging : {}), ...provided.draggableProps.style }}
            onClick={() => setOpen(true)}
          >
            {card.tags?.length > 0 && (
              <div style={s.tags}>
                {card.tags.map(tag => (
                  <span key={tag} style={s.tag}>{tag}</span>
                ))}
              </div>
            )}
            <p style={s.title}>{card.title}</p>
            {card.description && <p style={s.desc}>{card.description.slice(0, 80)}{card.description.length > 80 ? '…' : ''}</p>}
            <div style={s.footer}>
              <span className={`badge badge-${card.priority}`} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Flag size={9} />{card.priority}
              </span>
              {initials && (
                <div style={s.avatar} title={card.assignee?.name}>{initials}</div>
              )}
              {!initials && (
                <div style={s.avatarEmpty} title="Unassigned"><User size={11} /></div>
              )}
            </div>
          </div>
        )}
      </Draggable>

      {open && (
        <CardModal
          card={card}
          members={members}
          boardId={boardId}
          onClose={() => setOpen(false)}
          onUpdate={onUpdate}
          onDelete={onDelete}
          socket={socket}
        />
      )}
    </>
  );
}

const s = {
  card: { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 8, cursor: 'pointer', transition: 'border-color 0.15s, transform 0.1s', userSelect: 'none' },
  dragging: { border: '1px solid var(--accent)', boxShadow: '0 8px 30px rgba(0,0,0,0.4)', transform: 'rotate(1.5deg)' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
  tag: { fontSize: 10, background: 'var(--accent-bg)', color: 'var(--accent2)', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--mono)' },
  title: { fontWeight: 500, marginBottom: 6, fontSize: 13, lineHeight: 1.4 },
  desc: { fontSize: 12, color: 'var(--text2)', marginBottom: 10, lineHeight: 1.5 },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  avatar: { width: 24, height: 24, borderRadius: 6, background: 'var(--accent-bg)', color: 'var(--accent2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600 },
  avatarEmpty: { width: 24, height: 24, borderRadius: 6, background: 'var(--bg4)', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};
