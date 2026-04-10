import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import KanbanBoard from '../components/Board/KanbanBoard';
import ConfirmDialog from '../components/UI/ConfirmDialog';
import NotFoundPage from './NotFoundPage';
import { ArrowLeft, Users, Trash2, FolderKanban, UserPlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

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
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600 }}>Add member</h2>
          <button className="btn-ghost" style={{ padding: 6 }} onClick={onClose}><X size={16} /></button>
        </div>
        <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 20 }}>
          Enter the registered email of the user you want to add to this project.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={s.label}>Email address</label>
            <input
              type="email"
              placeholder="pqr@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [project, setProject] = useState(null);
  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canInvite = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    projectAPI.getOne(id)
      .then(({ data }) => {
        setProject(data.project);
        setBoards(data.boards);
        setActiveBoard(data.boards[0] || null);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error('Failed to load project');
          navigate('/');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const deleteProject = async () => {
    setDeleting(true);
    try {
      await projectAPI.delete(id);
      toast.success('Project deleted');
      navigate('/');
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text3)' }}>
      Loading project...
    </div>
  );

  if (notFound) return <NotFoundPage />;

  if (!project) return null;

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <div style={s.leftHead}>
          <button onClick={() => navigate('/')} className="btn-ghost" style={s.backBtn}>
            <ArrowLeft size={16} />
          </button>
          <div style={{ ...s.projectDot, background: project.color }} />
          <div>
            <h1 style={s.title}>{project.title}</h1>
            {project.description && <p style={s.sub}>{project.description}</p>}
          </div>
        </div>

        <div style={s.rightHead}>
          {/* Member avatars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex' }}>
              {project.members?.slice(0, 5).map((m, i) => (
                <div key={m._id} style={{ ...s.memberAvatar, marginLeft: i > 0 ? -8 : 0, zIndex: 10 - i }} title={`${m.name} (${m.role})`}>
                  {m.name?.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            <span style={s.memberCount}>
              <Users size={13} /> {project.members?.length} member{project.members?.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Add member button — admin/manager only */}
          {canInvite && (
            <button
              className="btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 13 }}
              onClick={() => setShowInvite(true)}
            >
              <UserPlus size={14} /> Add member
            </button>
          )}

          {/* Delete button — admin only */}
          {user?.role === 'admin' && (
            <button
              className="btn-danger"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px' }}
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      </div>

      {boards.length > 1 && (
        <div style={s.boardTabs}>
          {boards.map(b => (
            <button
              key={b._id}
              onClick={() => setActiveBoard(b)}
              style={{ ...s.tab, ...(activeBoard?._id === b._id ? s.tabActive : {}) }}
            >
              <FolderKanban size={13} /> {b.name}
            </button>
          ))}
        </div>
      )}

      {activeBoard ? (
        <div style={s.boardWrap}>
          <KanbanBoard
            board={activeBoard}
            projectId={id}
            members={project.members}
            socket={socket}
            userRole={user?.role}
          />
        </div>
      ) : (
        <div style={s.empty}>
          <FolderKanban size={40} color="var(--text3)" />
          <p style={{ color: 'var(--text2)', marginTop: 12 }}>No boards in this project</p>
        </div>
      )}

      {showInvite && (
        <InviteModal
          projectId={id}
          onClose={() => setShowInvite(false)}
          onInvited={(members) => setProject(p => ({ ...p, members }))}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete project?"
          message={`This will permanently delete "${project?.title}" and all its boards and cards. This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isDanger={true}
          loading={deleting}
          onConfirm={deleteProject}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}

const s = {
  page: { padding: '24px 28px', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  leftHead: { display: 'flex', alignItems: 'center', gap: 12 },
  backBtn: { padding: '6px 8px' },
  projectDot: { width: 12, height: 12, borderRadius: '50%', flexShrink: 0 },
  title: { fontSize: 20, fontWeight: 600 },
  sub: { color: 'var(--text2)', fontSize: 13, marginTop: 2 },
  rightHead: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  memberAvatar: { width: 28, height: 28, borderRadius: 8, background: 'var(--accent-bg)', color: 'var(--accent2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, border: '2px solid var(--bg)' },
  memberCount: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text2)' },
  boardTabs: { display: 'flex', gap: 4, marginBottom: 16 },
  tab: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: 'transparent', color: 'var(--text2)', fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border)', transition: 'all 0.15s' },
  tabActive: { background: 'var(--accent-bg)', color: 'var(--accent2)', borderColor: 'var(--accent)' },
  boardWrap: { flex: 1, overflow: 'auto' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(4px)' },
  modal: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 440 },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: 6 },
};
