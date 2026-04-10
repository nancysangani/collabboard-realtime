import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Layout/Navbar';
import { Plus, Folder, Trash2, Users, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const PROJECT_COLORS = ['#7c6aff','#22c55e','#3b82f6','#f59e0b','#ef4444','#ec4899','#14b8a6'];

function CreateProjectModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ title: '', description: '', color: PROJECT_COLORS[0] });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await onCreate(form);
    setLoading(false);
    if (result) onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">New project</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Project name</label>
            <input className="input" placeholder="e.g. Mobile App Redesign" value={form.title} onChange={set('title')} required autoFocus />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" placeholder="What is this project about?" value={form.description} onChange={set('description')} />
          </div>
          <div>
            <label className="label">Color</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {PROJECT_COLORS.map(c => (
                <button type="button" key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{
                  width: '28px', height: '28px', borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                  outline: form.color === c ? `3px solid ${c}` : 'none', outlineOffset: '2px', transition: 'outline 0.1s',
                }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
              {loading ? <span className="spinner" style={{ width: '14px', height: '14px' }} /> : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProjectCard({ project, onDelete, onClick }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div onClick={onClick} style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '20px', cursor: 'pointer',
      transition: 'all 0.15s', position: 'relative', overflow: 'hidden',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Color stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: project.color, borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: `${project.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Folder size={16} color={project.color} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '700', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {project.title}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {project.description || 'No description'}
            </p>
          </div>
        </div>
        {isAdmin && (
          <button className="btn btn-icon btn-ghost" onClick={e => { e.stopPropagation(); onDelete(project._id); }} style={{ flexShrink: 0 }}>
            <Trash2 size={13} color="var(--text-muted)" />
          </button>
        )}
      </div>

      <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '12px' }}>
          <Users size={12} />
          <span>{project.members?.length || 0} members</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '12px' }}>
          <Calendar size={12} />
          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    projectAPI.getAll().then(({ data }) => { setProjects(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleCreate = async (form) => {
    try {
      const { data } = await projectAPI.create(form);
      setProjects(p => [data.project, ...p]);
      toast.success('Project created!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
      return false;
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its boards?')) return;
    try {
      await projectAPI.delete(id);
      setProjects(p => p.filter(pr => pr._id !== id));
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              Your projects
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          {user?.role === 'admin' && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <Plus size={15} /> New project
            </button>
          )}
        </div>

        {/* Projects grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height: '140px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <p style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--text-secondary)' }}>No projects yet</p>
            <p>{user?.role === 'admin' ? 'Create your first project to get started.' : 'Ask an admin to add you to a project.'}</p>
          </div>
        ) : (
          <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {projects.map(p => (
              <ProjectCard key={p._id} project={p} onDelete={handleDelete} onClick={() => navigate(`/project/${p._id}`)} />
            ))}
          </div>
        )}
      </div>

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
    </div>
  );
}
