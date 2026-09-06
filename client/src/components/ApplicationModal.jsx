import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ApplicationModal({ isOpen, onClose, onSave, application = null }) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('Applied');
  const [appliedAt, setAppliedAt] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (application) {
      setCompany(application.company || '');
      setRole(application.role || '');
      setStatus(application.status || 'Applied');
      setAppliedAt(application.applied_at || '');
      setNotes(application.notes || '');
    } else {
      setCompany('');
      setRole('');
      setStatus('Applied');
      setAppliedAt(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [application, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      company,
      role,
      status,
      applied_at: appliedAt,
      notes
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>{application ? 'Edit Job Application' : 'Add New Job Application'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Company Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Google, Microsoft, Atlassian, Stripe"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role / Position *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Software Engineer Intern, Frontend Developer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Application Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Applied">📩 Applied</option>
                <option value="Assessment">📝 Assessment / OA</option>
                <option value="Interview">🤝 Interview Round</option>
                <option value="Offer">🎉 Offer Received</option>
                <option value="Rejected">❌ Rejected</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Application Date</label>
              <input
                type="date"
                className="form-input"
                value={appliedAt}
                onChange={(e) => setAppliedAt(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes & Next Actions</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Referred by Jane on LinkedIn. Technical interview scheduled for next Tuesday..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {application ? 'Save Changes' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
