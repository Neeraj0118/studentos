import React, { useEffect, useState } from 'react';
import { fetchApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  CheckSquare, 
  BookOpenCheck, 
  Briefcase, 
  Sparkles, 
  AlertTriangle, 
  ArrowUpRight, 
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';

export default function Dashboard({ setActiveTab }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await fetchApi('/dashboard/stats');
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      await fetchApi(`/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      loadDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sparkles className="animate-spin" size={24} color="var(--primary)" /> Loading StudentOS Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">
            Welcome back, <span className="gradient-text">{user?.name || 'Student'}</span> 👋
          </h1>
          <p className="page-subtitle">Here is your daily academic and placement summary for today.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setActiveTab('ai-planner')}>
            <Sparkles size={16} color="var(--accent-purple)" /> Plan Study Session
          </button>
          <button className="btn btn-primary" onClick={() => setActiveTab('tasks')}>
            + Add New Task
          </button>
        </div>
      </div>

      {/* Low Attendance Alert */}
      {stats?.attendance?.lowAttendanceCount > 0 && (
        <div className="alert-warning">
          <AlertTriangle size={22} color="var(--accent-rose)" />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Attendance Warning!</strong>
            <div style={{ fontSize: '0.85rem' }}>
              You have {stats.attendance.lowAttendanceCount} subject(s) with attendance below 75%. Check your attendance tracker to prevent shortages.
            </div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => setActiveTab('attendance')}>
            View Subjects
          </button>
        </div>
      )}

      {/* Analytics Summary Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {/* Card 1: Tasks */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Tasks & Assignments</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckSquare size={20} color="var(--primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
            {stats?.tasks?.pending || 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {stats?.tasks?.total || 0} pending</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCircle2 size={14} /> {stats?.tasks?.completed || 0} tasks completed
          </div>
        </div>

        {/* Card 2: Attendance */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Overall Attendance</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpenCheck size={20} color="var(--accent-emerald)" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stats?.attendance?.overallPercentage < 75 ? 'var(--accent-rose)' : '#fff' }}>
            {stats?.attendance?.overallPercentage || 0}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Across {stats?.attendance?.totalSubjects || 0} registered subjects
          </div>
        </div>

        {/* Card 3: Job Applications */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Job Applications</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={20} color="var(--accent-cyan)" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
            {stats?.applications?.total || 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>applied</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginTop: '0.5rem' }}>
            {stats?.applications?.interview || 0} interview(s) • {stats?.applications?.offer || 0} offer(s)
          </div>
        </div>

        {/* Card 4: AI Study Planner */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>AI Resume & Planner</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} color="var(--accent-purple)" />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
            {stats?.latestResumeAnalysis ? `${stats.latestResumeAnalysis.result_json.matchScore}% Match` : 'No Analysis'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {stats?.latestStudyPlan ? `Active Plan: ${stats.latestStudyPlan.title}` : 'Generate AI Study Schedule'}
          </div>
        </div>
      </div>

      {/* Main Grid: Tasks & Applications */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Left Column: Upcoming Tasks */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--primary)" /> Upcoming Deadlines & Tasks
            </h3>
            <button
              onClick={() => setActiveTab('tasks')}
              style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              View All <ChevronRight size={16} />
            </button>
          </div>

          {stats?.tasks?.upcoming?.length === 0 ? (
            <div style={{ textAlignment: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              🎉 All tasks are up to date! No pending assignments.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats?.tasks?.upcoming?.map((task) => (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => handleToggleTask(task.id, task.status)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                        {task.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', marginTop: '0.2rem' }}>
                        {task.subject_name && <span>📚 {task.subject_name}</span>}
                        {task.due_date && <span>📅 {task.due_date}</span>}
                      </div>
                    </div>
                  </div>

                  <span className={`badge badge-${task.priority}`}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Placement Tracker Quick Glance */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={18} color="var(--accent-cyan)" /> Recent Job Applications
            </h3>
            <button
              onClick={() => setActiveTab('placement')}
              style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              Manage Apps <ChevronRight size={16} />
            </button>
          </div>

          {stats?.applications?.recent?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No job applications added yet. Start tracking your placement journey!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats?.applications?.recent?.map((app) => (
                <div
                  key={app.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{app.company}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.role} • Applied {app.applied_at}</div>
                  </div>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '9999px',
                    background: app.status === 'Offer' ? 'rgba(16, 185, 129, 0.2)' : app.status === 'Interview' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    color: app.status === 'Offer' ? 'var(--accent-emerald)' : app.status === 'Interview' ? 'var(--primary)' : '#fff'
                  }}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Features Shortcut Banner */}
      <div className="glass-card glass-card-glow" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles color="var(--accent-purple)" /> Boost Your Placement Preparation with AI
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '700px' }}>
            Generate structured exam study plans or analyze your resume against target job descriptions to identify missing skills and improvement tips.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setActiveTab('ai-planner')}>
            AI Study Planner
          </button>
          <button className="btn btn-primary" onClick={() => setActiveTab('ai-resume')}>
            AI Resume Analyzer
          </button>
        </div>
      </div>
    </div>
  );
}
