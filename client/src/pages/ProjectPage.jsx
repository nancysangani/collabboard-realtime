import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Layout/Navbar';
import KanbanBoard from '../components/Board/KanbanBoard';
import { ArrowLeft, UserPlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const avatarColor = (name = '') => {
  const colors = ['#7c6aff','#22c55e','#3b82f6','#f59e0b','#ef4444','#ec4899'];
  return colors[(name.charCodeAt(0) || 0) % colors.length];
};

function InviteModal({ projectId, onClose, onInvited }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/projects/${projectId}/members`, { email: email.trim() });
      toast.success(data.message);
      onInvited(data.members);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 className="modal-title" style={{ margin: 0 }}>Add member</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={15} /></button>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Enter the email address of a registered user to add them to this project.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="label">User email</label>
            <input
              className="input" type="email" placeholder="pqr@gmail.com"
              value={email} onChange={e => setEmail(e.target.value)}
              autoFocus required
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
              {loading ? <span className="spinner" style={{ width: '14px', height: '14px' }} /> : 'Add member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  const canInvite = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    projectAPI.getOne(id)
      .then(({ data }) => {
        setProject({ ...data.project, userRole: user?.role });
        setBoards(data.boards);
        if (data.boards.length > 0) setActiveBoard(data.boards[0]);
      })
      .catch(() => toast.error('Failed to load project'))
      .finally(() => setLoading(false));
  }, [id, user?.role]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 56px)' }}>
          <span className="spinner" style={{ width: '32px', height: '32px' }} />
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{
        padding: '16px 24px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
      }}>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => navigate('/')}>
          <ArrowLeft size={15} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: project.color }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: '800' }}>
            {project.title}
          </h2>
        </div>

        {boards.length > 1 && (
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-overlay)', borderRadius: 'var(--radius-md)', padding: '3px' }}>
            {boards.map(b => (
              <button key={b._id} onClick={() => setActiveBoard(b)} style={{
                padding: '5px 12px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                background: activeBoard?._id === b._id ? 'var(--bg-elevated)' : 'transparent',
                color: activeBoard?._id === b._id ? 'var(--text-primary)' : 'var(--text-muted)',
                fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: '500', transition: 'all 0.15s',
              }}>
                {b.name}
              </button>
            ))}
          </div>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Members avatars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex' }}>
              {project.members?.slice(0, 5).map((m, i) => (
                <div key={m._id} className="avatar avatar-sm" title={`${m.name} (${m.role})`} style={{
                  background: avatarColor(m.name), color: '#fff',
                  marginLeft: i > 0 ? '-8px' : 0,
                  border: '2px solid var(--bg-surface)', zIndex: 5 - i,
                }}>
                  {m.name?.[0]}
                </div>
              ))}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {project.members?.length} member{project.members?.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Invite button — admin/manager only */}
          {canInvite && (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowInvite(true)}>
              <UserPlus size={13} /> Add member
            </button>
          )}
        </div>
      </div>

      {activeBoard ? (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <KanbanBoard project={project} board={activeBoard} members={project.members} />
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <p>No boards in this project</p>
        </div>
      )}

      {showInvite && (
        <InviteModal
          projectId={id}
          onClose={() => setShowInvite(false)}
          onInvited={(members) => setProject(p => ({ ...p, members }))}
        />
      )}
    </div>
  );
}
