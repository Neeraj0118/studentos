import React, { useState, useEffect } from 'react';
import { fetchApi } from '../services/api';
import TaskModal from '../components/TaskModal';
import { Plus, Search, Filter, Trash2, Edit, CheckCircle2, Circle, Calendar, BookOpen } from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, completed
  const [priorityFilter, setPriorityFilter] = useState('all');

  const loadData = async () => {
    try {
      setLoading(true);
      const [taskRes, attRes] = await Promise.all([
        fetchApi('/tasks'),
        fetchApi('/attendance')
      ]);
      setTasks(taskRes.tasks || []);
      setSubjects(attRes.attendance || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await fetchApi(`/tasks/${editingTask.id}`, {
          method: 'PATCH',
          body: JSON.stringify(taskData)
        });
      } else {
        await fetchApi('/tasks', {
          method: 'POST',
          body: JSON.stringify(taskData)
        });
      }
      setIsModalOpen(false);
      setEditingTask(null);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
      await fetchApi(`/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await fetchApi(`/tasks/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' ? true : t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' ? true : t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Assignments & Tasks</h1>
          <p className="page-subtitle">Track deadlines, prioritize homework, and organize your academic workload.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
        >
          <Plus size={18} /> Add New Task
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search assignments or topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('all')}
            >
              All ({tasks.length})
            </button>
            <button
              className={`btn btn-sm ${statusFilter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('pending')}
            >
              Pending ({tasks.filter(t => t.status === 'pending').length})
            </button>
            <button
              className={`btn btn-sm ${statusFilter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('completed')}
            >
              Completed ({tasks.filter(t => t.status === 'completed').length})
            </button>
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Task Cards List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading assignments...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <h3>No tasks found matching your filters</h3>
          <p style={{ marginTop: '0.5rem' }}>Click "Add New Task" above to create an assignment.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="glass-card"
              style={{
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                borderLeft: `4px solid ${task.priority === 'high' ? 'var(--accent-rose)' : task.priority === 'medium' ? 'var(--accent-amber)' : 'var(--accent-cyan)'}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                <button
                  onClick={() => handleToggleStatus(task)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '2px' }}
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 size={22} color="var(--accent-emerald)" />
                  ) : (
                    <Circle size={22} color="var(--text-muted)" />
                  )}
                </button>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#fff',
                    textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                    opacity: task.status === 'completed' ? 0.7 : 1
                  }}>
                    {task.title}
                  </div>

                  {task.description && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {task.description}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.65rem', fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                    {task.subject_name && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <BookOpen size={13} color="var(--primary)" /> {task.subject_name}
                      </span>
                    )}
                    {task.due_date && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={13} color="var(--accent-amber)" /> Due: {task.due_date}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className={`badge badge-${task.priority}`}>
                  {task.priority.toUpperCase()}
                </span>

                <button
                  onClick={() => { setEditingTask(task); setIsModalOpen(true); }}
                  className="btn btn-secondary btn-sm"
                  title="Edit Task"
                >
                  <Edit size={14} />
                </button>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="btn btn-danger btn-sm"
                  title="Delete Task"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        task={editingTask}
        subjects={subjects}
      />
    </div>
  );
}
