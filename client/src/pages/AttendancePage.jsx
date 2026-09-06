import React, { useState, useEffect } from 'react';
import { fetchApi } from '../services/api';
import AttendanceModal from '../components/AttendanceModal';
import { Plus, BookOpenCheck, AlertTriangle, CheckCircle, XCircle, Trash2 } from 'lucide-react';

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/attendance');
      setAttendance(res.attendance || []);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleAddSubject = async (subjectData) => {
    try {
      await fetchApi('/attendance/subject', {
        method: 'POST',
        body: JSON.stringify(subjectData)
      });
      setIsModalOpen(false);
      loadAttendance();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMarkAttendance = async (id, markClass) => {
    try {
      await fetchApi(`/attendance/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ markClass })
      });
      loadAttendance();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject and its attendance record?')) return;
    try {
      await fetchApi(`/attendance/subject/${subjectId}`, { method: 'DELETE' });
      loadAttendance();
    } catch (err) {
      alert(err.message);
    }
  };

  const lowAttendanceSubjects = attendance.filter((a) => a.isLow);

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Attendance Tracker</h1>
          <p className="page-subtitle">Monitor class attendance, calculate minimum criteria %, and prevent debarment.</p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add New Subject
        </button>
      </div>

      {/* Warning Banner if below 75% */}
      {lowAttendanceSubjects.length > 0 && (
        <div className="alert-warning">
          <AlertTriangle size={22} color="var(--accent-rose)" />
          <div>
            <strong style={{ color: '#fff' }}>Shortage Warning!</strong>
            <div>
              You have {lowAttendanceSubjects.length} subject(s) below the required 75% threshold: {' '}
              {lowAttendanceSubjects.map(s => `${s.subject_name} (${s.percentage}%)`).join(', ')}.
            </div>
          </div>
        </div>
      )}

      {/* Subject Attendance Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading attendance data...</div>
      ) : attendance.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <BookOpenCheck size={40} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No subjects registered yet</h3>
          <p style={{ marginTop: '0.5rem' }}>Click "Add New Subject" to begin tracking academic attendance.</p>
        </div>
      ) : (
        <div className="grid-3">
          {attendance.map((item) => {
            const pct = item.percentage;
            const isWarning = item.isLow;
            const progressColor = isWarning ? 'var(--accent-rose)' : pct >= 85 ? 'var(--accent-emerald)' : 'var(--accent-amber)';

            return (
              <div key={item.id} className="glass-card glass-card-glow" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>{item.subject_name}</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {item.attended} / {item.total} classes attended
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteSubject(item.subject_id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      title="Delete Subject"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Percentage Indicator */}
                  <div style={{ margin: '1.25rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Attendance Rate</span>
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: progressColor }}>
                        {pct}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, pct)}%`,
                        height: '100%',
                        background: progressColor,
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>

                  {isWarning && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1rem' }}>
                      <AlertTriangle size={14} /> Below 75% threshold. Attend next classes!
                    </div>
                  )}
                </div>

                {/* Quick Class Increment Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-glass)' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, borderColor: 'rgba(16, 185, 129, 0.3)', color: 'var(--accent-emerald)' }}
                    onClick={() => handleMarkAttendance(item.id, 'present')}
                  >
                    <CheckCircle size={15} /> Attended (+1)
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, borderColor: 'rgba(244, 63, 94, 0.3)', color: 'var(--accent-rose)' }}
                    onClick={() => handleMarkAttendance(item.id, 'absent')}
                  >
                    <XCircle size={15} /> Missed (+1)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AttendanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddSubject}
      />
    </div>
  );
}
