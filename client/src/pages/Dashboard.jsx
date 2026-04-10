import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, FolderKanban, Users, Calendar } from 'lucide-react';
import { ProjectCardSkeleton } from '../components/UI/SkeletonLoader';
import toast from 'react-hot-toast';

const PROJECT_COLORS = ['#6c63ff','#3b82f6','#22c55e','#f59e0b','#ef4444','#ec4899','#14b8a6'];

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', color: '#6c63ff' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    projectAPI.getAll()
      .then(({ data }) => setProjects(data))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  const createProject = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await projectAPI.create(form);
      setProjects(p => [data.project, ...p]);
      setShowCreate(false);
      setForm({ title: '', description: '', color: '#6c63ff' });
      toast.success('Project created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Dashboard</h1>
          <p style={s.sub}>Welcome back, <strong>{user?.name}</strong></p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn-primary" style={s.createBtn} onClick={() => setShowCreate(true)}>
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {showCreate && (
        <div style={s.modalOverlay} onClick={() => setShowCreate(false)}>
          <div style={s.modal} className="scale-in" onClick={e => e.stopPropagation()}>
            <h2 style={s.modalTitle}>New Project</h2>
            <form onSubmit={createProject} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={s.label}>Project name</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Mobile App Redesign" required />
              </div>
              <div>
                <label style={s.label}>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="What's this project about?" rows={3} style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label style={s.label}>Color</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {PROJECT_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm({...form, color: c})}
                      style={{ width: 28, height: 28, borderRadius: 8, background: c, border: form.color === c ? '3px solid var(--text)' : '3px solid transparent', cursor: 'pointer' }} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={s.grid}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div style={s.empty}>
          <FolderKanban size={40} color="var(--text3)" />
          <p style={{ color: 'var(--text2)', marginTop: 12 }}>No projects yet</p>
          {user?.role === 'admin' && <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setShowCreate(true)}><Plus size={14} /> Create your first project</button>}
        </div>
      ) : (
        <div style={s.grid}>
          {projects.map((p, i) => (
            <Link key={p._id} to={`/projects/${p._id}`} style={{ textDecoration: 'none' }}>
              <div style={{ ...s.card, animationDelay: `${i * 50}ms` }} className="fade-in">
                <div style={{ ...s.cardAccent, background: p.color }} />
                <div style={s.cardBody}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ ...s.cardIcon, background: p.color + '22', color: p.color }}>
                      <FolderKanban size={16} />
                    </div>
                    <h3 style={s.cardTitle}>{p.title}</h3>
                  </div>
                  {p.description && <p style={s.cardDesc}>{p.description}</p>}
                  <div style={s.cardMeta}>
                    <span style={s.metaItem}><Users size={12} /> {p.members?.length || 0} members</span>
                    <span style={s.metaItem}><Calendar size={12} /> {new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { padding: 32, maxWidth: 1200, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 },
  title: { fontSize: 26, fontWeight: 600, marginBottom: 4 },
  sub: { color: 'var(--text2)' },
  createBtn: { display: 'flex', alignItems: 'center', gap: 8 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', transition: 'border-color 0.15s, transform 0.15s', cursor: 'pointer' },
  cardAccent: { height: 4 },
  cardBody: { padding: 20 },
  cardIcon: { width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontWeight: 600, fontSize: 15, color: 'var(--text)' },
  cardDesc: { color: 'var(--text2)', fontSize: 13, marginBottom: 14, lineHeight: 1.5 },
  cardMeta: { display: 'flex', gap: 14, color: 'var(--text3)', fontSize: 12 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 4 },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' },
  modal: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 480 },
  modalTitle: { fontSize: 18, fontWeight: 600, marginBottom: 20 },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text2)', marginBottom: 6 },
};
