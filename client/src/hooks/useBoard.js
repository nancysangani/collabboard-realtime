import { useState, useEffect, useCallback, useRef } from 'react';
import { projectAPI, cardAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useBoard = (projectId, boardId) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const { user } = useAuth();
  const boardIdRef = useRef(boardId);

  useEffect(() => { boardIdRef.current = boardId; }, [boardId]);

  // Load cards from API
  const fetchCards = useCallback(async () => {
    if (!projectId || !boardId) return;
    try {
      setLoading(true);
      const { data } = await projectAPI.getCards(projectId, boardId);
      setCards(data);
    } catch (err) {
      toast.error('Failed to load cards');
    } finally {
      setLoading(false);
    }
  }, [projectId, boardId]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  // Socket: join room and listen for events
  useEffect(() => {
    if (!socket || !boardId) return;
    socket.emit('board:join', { boardId, user });

    socket.on('card:moved', ({ cardId, status, order }) => {
      setCards(prev => prev.map(c => c._id === cardId ? { ...c, status, order } : c));
    });
    socket.on('card:updated', (updatedCard) => {
      setCards(prev => prev.map(c => c._id === updatedCard._id ? updatedCard : c));
    });
    socket.on('card:created', (newCard) => {
      setCards(prev => [...prev, newCard]);
    });
    socket.on('card:deleted', ({ cardId }) => {
      setCards(prev => prev.filter(c => c._id !== cardId));
    });
    socket.on('cards:reordered', ({ cards: reordered }) => {
      setCards(prev => {
        const map = new Map(reordered.map(r => [r._id, r]));
        return prev.map(c => map.has(c._id) ? { ...c, ...map.get(c._id) } : c);
      });
    });

    return () => {
      socket.emit('board:leave', { boardId });
      socket.off('card:moved');
      socket.off('card:updated');
      socket.off('card:created');
      socket.off('card:deleted');
      socket.off('cards:reordered');
    };
  }, [socket, boardId, user]);

  // Create card
  const createCard = useCallback(async (cardData) => {
    try {
      const { data } = await cardAPI.create({ ...cardData, boardId });
      setCards(prev => [...prev, data]);
      socket?.emit('card:created', { boardId, card: data });
      toast.success('Card created');
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create card');
    }
  }, [boardId, socket]);

  // Update card
  const updateCard = useCallback(async (cardId, updates) => {
    try {
      const { data } = await cardAPI.update(cardId, updates);
      setCards(prev => prev.map(c => c._id === cardId ? data : c));
      socket?.emit('card:update', { boardId, cardId, updates: data });
      return data;
    } catch (err) {
      toast.error('Failed to update card');
    }
  }, [boardId, socket]);

  // Delete card
  const deleteCard = useCallback(async (cardId) => {
    try {
      await cardAPI.delete(cardId);
      setCards(prev => prev.filter(c => c._id !== cardId));
      socket?.emit('card:deleted', { boardId, cardId });
      toast.success('Card deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Not authorized');
    }
  }, [boardId, socket]);

  // Move card (drag & drop)
  const moveCard = useCallback(async (cardId, newStatus, newOrder) => {
    setCards(prev => prev.map(c => c._id === cardId ? { ...c, status: newStatus, order: newOrder } : c));
    socket?.emit('card:move', { boardId, cardId, status: newStatus, order: newOrder });
    await cardAPI.update(cardId, { status: newStatus, order: newOrder });
  }, [boardId, socket]);

  return { cards, loading, createCard, updateCard, deleteCard, moveCard, refetch: fetchCards };
};
