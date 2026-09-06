import React, { useState, useEffect } from 'react';
import { fetchApi } from '../services/api';
import ApplicationModal from '../components/ApplicationModal';
import { Plus, Briefcase, Search, Trash2, Edit, Send, Code, Users, Award, XCircle, FileText } from 'lucide-react';

export default function PlacementPage() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ total: 0, Applied: 0, Assessment: 0, Interview: 0, Offer: 0, Rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/applications');
      setApplications(res.applications || []);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleSaveApplication = async (appData) => {
    try {
      if (editingApp) {
        await fetchApi(`/applications/${editingApp.id}`, {
          method: 'PATCH',
          body: JSON.stringify(appData)
        });
      } else {
        await fetchApi('/applications', {
          method: 'POST',
          body: JSON.stringify(appData)
        });
      }
      setIsModalOpen(false);
      setEditingApp(null);
      loadApplications();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm('Delete this job application tracking record?')) return;
    try {
      await fetchApi(`/applications/${id}`, { method: 'DELETE' });
      loadApplications();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.company.toLowerCase().includes(search.toLowerCase()) || 
                          app.role.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Applied': return <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>📩 Applied</span>;
      case 'Assessment': return <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>📝 Assessment</span>;
      case 'Interview': return <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-purple)', border: '1px solid rgba(168, 85, 247, 0.3)' }}>🤝 Interview</span>;
      case 'Offer': return <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>🎉 Offer</span>;
      case 'Rejected': return <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>❌ Rejected</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Placement & Job Tracker</h1>
          <p className="page-subtitle">Manage campus placement drives, off-campus job applications, and interview pipelines.</p>
        </div>

        <button className="btn btn-primary" onClick={() => { setEditingApp(null); setIsModalOpen(true); }}>
          <Plus size={18} /> Add Application
        </button>
      </div>

      {/* Pipeline Funnel Stats */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)' }}>
            <Send size={24} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Applied</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.Applied}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)' }}>
            <Code size={24} color="var(--accent-amber)" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assessments (OA)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.Assessment}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)' }}>
            <Users size={24} color="var(--accent-purple)" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Interviews</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.Interview}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)' }}>
            <Award size={24} color="var(--accent-emerald)" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Offers</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{stats.Offer}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by company or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['all', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected'].map((status) => (
              <button
                key={status}
                className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? `All (${applications.length})` : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading applications...</div>
      ) : filteredApps.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <Briefcase size={40} color="var(--accent-cyan)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No applications tracked yet</h3>
          <p style={{ marginTop: '0.5rem' }}>Click "Add Application" to record your company applications.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredApps.map((app) => (
            <div key={app.id} className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>{app.company}</h3>
                  {getStatusBadge(app.status)}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {app.role} • <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>Applied on {app.applied_at}</span>
                </div>
                {app.notes && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.03)', padding: '0.4rem 0.75rem', borderRadius: '6px' }}>
                    <FileText size={14} color="var(--primary)" /> {app.notes}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  onClick={() => { setEditingApp(app); setIsModalOpen(true); }}
                  className="btn btn-secondary btn-sm"
                  title="Edit Application"
                >
                  <Edit size={14} /> Edit
                </button>

                <button
                  onClick={() => handleDeleteApplication(app.id)}
                  className="btn btn-danger btn-sm"
                  title="Delete Application"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingApp(null); }}
        onSave={handleSaveApplication}
        application={editingApp}
      />
    </div>
  );
}
