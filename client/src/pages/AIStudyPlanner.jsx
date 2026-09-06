import React, { useState, useEffect } from 'react';
import { fetchApi } from '../services/api';
import { Sparkles, Calendar, BookOpen, Clock, CheckCircle2, History, ArrowRight } from 'lucide-react';

export default function AIStudyPlanner() {
  const [examDate, setExamDate] = useState('');
  const [subjects, setSubjects] = useState('Data Structures & Algorithms, Computer Networks, Operating Systems');
  const [chapters, setChapters] = useState('Binary Trees, Dynamic Programming, TCP/IP, Process Synchronization');
  const [dailyHours, setDailyHours] = useState(4);
  const [title, setTitle] = useState('');

  const [currentPlan, setCurrentPlan] = useState(null);
  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSavedPlans = async () => {
    try {
      const res = await fetchApi('/ai/study-plans');
      setSavedPlans(res.studyPlans || []);
      if (res.studyPlans && res.studyPlans.length > 0 && !currentPlan) {
        setCurrentPlan(res.studyPlans[0].plan_json);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSavedPlans();
    // Default exam date to 14 days from now
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setExamDate(d.toISOString().split('T')[0]);
  }, []);

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetchApi('/ai/study-plan', {
        method: 'POST',
        body: JSON.stringify({
          examDate,
          subjects,
          chapters,
          dailyHours,
          title: title || `Study Plan for ${examDate}`
        })
      });
      setCurrentPlan(res.studyPlan.plan_json);
      loadSavedPlans();
    } catch (err) {
      setError(err.message || 'Failed to generate AI study plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">
          <Sparkles color="var(--accent-purple)" /> AI Study Planner
        </h1>
        <p className="page-subtitle">
          Generate an intelligent, personalized study roadmap tailored to your upcoming exam date and available hours.
        </p>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Form Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card glass-card-glow">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Exam Details</h3>

            {error && (
              <div style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleGeneratePlan}>
              <div className="form-group">
                <label className="form-label">Plan Title (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mid-Sem CS Exam Prep"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Exam Target Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subjects (comma-separated) *</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  placeholder="e.g. Operating Systems, Computer Networks"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Key Chapters / Topics</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={chapters}
                  onChange={(e) => setChapters(e.target.value)}
                  placeholder="e.g. Dynamic Programming, Virtual Memory"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Available Study Time (Hours/Day)</label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  className="form-input"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '0.85rem' }}
              >
                {loading ? 'Generating AI Plan...' : '✨ Generate AI Roadmap'}
              </button>
            </form>
          </div>

          {/* Plan History List */}
          {savedPlans.length > 0 && (
            <div className="glass-card">
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={16} /> Saved AI Plans
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {savedPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setCurrentPlan(plan.plan_json)}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-glass)',
                      color: '#fff',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{plan.title}</span>
                    <ArrowRight size={14} color="var(--text-muted)" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Results Display Column */}
        <div>
          {loading ? (
            <div className="glass-card" style={{ textAlignment: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <Sparkles size={36} color="var(--accent-purple)" className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
              <h3>AI Counselor is analyzing syllabus and generating schedule...</h3>
            </div>
          ) : !currentPlan ? (
            <div className="glass-card" style={{ textAlignment: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
              <h3>No AI study plan selected yet</h3>
              <p style={{ marginTop: '0.5rem' }}>Fill in your exam details on the left to generate your custom roadmap.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Summary Header */}
              <div className="glass-card glass-card-glow">
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--accent-purple)', fontWeight: 700, letterSpacing: '0.05em' }}>
                  AI Generated Study Strategy
                </div>
                <h2 style={{ fontSize: '1.4rem', margin: '0.4rem 0' }}>{currentPlan.summary}</h2>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  <span>⏳ Days Left: <strong style={{ color: '#fff' }}>{currentPlan.daysRemaining} days</strong></span>
                  <span>⏱️ Daily Target: <strong style={{ color: '#fff' }}>{currentPlan.recommendedDailyHours} hrs/day</strong></span>
                </div>
              </div>

              {/* Milestone Preparation Phases */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>📅 Strategic Preparation Phases</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {currentPlan.phases?.map((phase, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '1rem 1.25rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: `4px solid ${idx === 0 ? 'var(--primary)' : idx === 1 ? 'var(--accent-purple)' : 'var(--accent-emerald)'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '1rem', color: '#fff' }}>{phase.phaseName}</h4>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.08)', padding: '2px 8px', borderRadius: '4px' }}>
                          {phase.duration}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.4rem 0 0.75rem 0' }}>
                        {phase.focus}
                      </p>
                      <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.83rem', color: '#e5e7eb' }}>
                        {phase.tasks?.map((t, tIdx) => (
                          <li key={tIdx} style={{ marginBottom: '0.25rem' }}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject Hour Allocation */}
              {currentPlan.subjectBreakdown && (
                <div className="glass-card">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>📚 Subject Time Allocation</h3>
                  <div className="grid-2">
                    {currentPlan.subjectBreakdown.map((sb, idx) => (
                      <div key={idx} style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{sb.subject}</span>
                          <span className={`badge badge-${sb.priority?.toLowerCase() || 'medium'}`}>{sb.priority}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', marginTop: '0.5rem', fontWeight: 600 }}>
                          Suggested Time: {sb.allocatedHours} Hours
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Retention Tips */}
              {currentPlan.tips && (
                <div className="glass-card" style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>💡 High-Yield Study Recommendations</h3>
                  <ul style={{ paddingLeft: '1.2rem', fontSize: '0.88rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {currentPlan.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
