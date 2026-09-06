import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AttendanceModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('');
  const [attended, setAttended] = useState(0);
  const [total, setTotal] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name,
      attended: parseInt(attended, 10) || 0,
      total: parseInt(total, 10) || 0
    });
    setName('');
    setAttended(0);
    setTotal(0);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>Add New Academic Subject</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Subject Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Operating Systems, Machine Learning"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Classes Attended</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={attended}
                onChange={(e) => setAttended(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Conducted</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
