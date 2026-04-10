import { useState, useEffect, useCallback } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import Column from './Column';
import { projectAPI, cardAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function KanbanBoard({ board, projectId, members, socket }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!board) return;
    setLoading(true);
    projectAPI.getCards(projectId, board._id)
      .then(({ data }) => setCards(data))
      .catch(() => toast.error('Failed to load cards'))
      .finally(() => setLoading(false));
  }, [board?._id, projectId]);

  useEffect(() => {
    if (!socket || !board) return;

    socket.emit('board:join', { boardId: board._id, user: { name: 'teammate' } });

    const onMoved = ({ cardId, status, order }) =>
      setCards(prev => prev.map(c => c._id === cardId ? { ...c, status, order } : c));
    const onUpdated = (updated) =>
      setCards(prev => prev.map(c => c._id === updated._id ? updated : c));
    const onCreated = (card) => {
      setCards(prev => [...prev, card]);
      toast('New card added', { icon: '📋' });
    };
    const onDeleted = ({ cardId }) =>
      setCards(prev => prev.filter(c => c._id !== cardId));
    const onJoined = ({ user }) =>
      toast(`${user?.name || 'Someone'} joined`, { icon: '👋' });

    socket.on('card:moved', onMoved);
    socket.on('card:updated', onUpdated);
    socket.on('card:created', onCreated);
    socket.on('card:deleted', onDeleted);
    socket.on('user:joined', onJoined);

    return () => {
      socket.emit('board:leave', { boardId: board._id });
      socket.off('card:moved', onMoved);
      socket.off('card:updated', onUpdated);
      socket.off('card:created', onCreated);
      socket.off('card:deleted', onDeleted);
      socket.off('user:joined', onJoined);
    };
  }, [socket, board?._id]);

  const onDragEnd = useCallback(async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;

    setCards(prev => {
      const updated = prev.map(c =>
        c._id === draggableId ? { ...c, status: newStatus, order: destination.index } : c
      );
      return updated;
    });

    try {
      await cardAPI.update(draggableId, { status: newStatus, order: destination.index });
      if (socket) socket.emit('card:move', { boardId: board._id, cardId: draggableId, status: newStatus, order: destination.index });
    } catch {
      toast.error('Failed to move card');
    }
  }, [socket, board?._id]);

  const handleCardCreate = (card) => setCards(prev => [...prev, card]);
  const handleCardUpdate = (updated) => setCards(prev => prev.map(c => c._id === updated._id ? updated : c));
  const handleCardDelete = (id) => setCards(prev => prev.filter(c => c._id !== id));

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text3)' }}>
      Loading board...
    </div>
  );

  const columns = board?.columns || ['Todo', 'In Progress', 'Review', 'Done'];

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: '4px 0 16px', minHeight: 400 }}>
        {columns.map(col => (
          <Column
            key={col}
            column={col}
            cards={cards.filter(c => c.status === col).sort((a, b) => a.order - b.order)}
            members={members}
            boardId={board._id}
            projectId={projectId}
            onCardCreate={handleCardCreate}
            onCardUpdate={handleCardUpdate}
            onCardDelete={handleCardDelete}
            socket={socket}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
