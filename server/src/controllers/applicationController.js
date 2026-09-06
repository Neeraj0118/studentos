import { query, get, run } from '../db/database.js';

export const getApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const applications = await query(
      'SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // Compute conversion / pipeline statistics
    const stats = {
      total: applications.length,
      Applied: applications.filter(a => a.status === 'Applied').length,
      Assessment: applications.filter(a => a.status === 'Assessment').length,
      Interview: applications.filter(a => a.status === 'Interview').length,
      Offer: applications.filter(a => a.status === 'Offer').length,
      Rejected: applications.filter(a => a.status === 'Rejected').length,
    };

    return res.json({ applications, stats });
  } catch (error) {
    console.error('Get applications error:', error);
    return res.status(500).json({ error: 'Failed to retrieve job applications.' });
  }
};

export const createApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { company, role, status = 'Applied', applied_at, notes } = req.body;

    if (!company || !role) {
      return res.status(400).json({ error: 'Company name and role are required.' });
    }

    const todayDate = new Date().toISOString().split('T')[0];

    const result = await run(
      `INSERT INTO applications (user_id, company, role, status, applied_at, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, company.trim(), role.trim(), status, applied_at || todayDate, notes || '']
    );

    const createdApp = await get('SELECT * FROM applications WHERE id = ?', [result.id]);

    return res.status(201).json({ message: 'Application added successfully.', application: createdApp });
  } catch (error) {
    console.error('Create application error:', error);
    return res.status(500).json({ error: 'Failed to add job application.' });
  }
};

export const updateApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const appId = req.params.id;
    const { company, role, status, applied_at, notes } = req.body;

    const existingApp = await get('SELECT * FROM applications WHERE id = ? AND user_id = ?', [appId, userId]);
    if (!existingApp) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    const updatedCompany = company !== undefined ? company : existingApp.company;
    const updatedRole = role !== undefined ? role : existingApp.role;
    const updatedStatus = status !== undefined ? status : existingApp.status;
    const updatedAppliedAt = applied_at !== undefined ? applied_at : existingApp.applied_at;
    const updatedNotes = notes !== undefined ? notes : existingApp.notes;

    await run(
      `UPDATE applications 
       SET company = ?, role = ?, status = ?, applied_at = ?, notes = ? 
       WHERE id = ? AND user_id = ?`,
      [updatedCompany, updatedRole, updatedStatus, updatedAppliedAt, updatedNotes, appId, userId]
    );

    const updatedApp = await get('SELECT * FROM applications WHERE id = ?', [appId]);

    return res.json({ message: 'Application updated successfully.', application: updatedApp });
  } catch (error) {
    console.error('Update application error:', error);
    return res.status(500).json({ error: 'Failed to update application.' });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const appId = req.params.id;

    const existingApp = await get('SELECT * FROM applications WHERE id = ? AND user_id = ?', [appId, userId]);
    if (!existingApp) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    await run('DELETE FROM applications WHERE id = ? AND user_id = ?', [appId, userId]);
    return res.json({ message: 'Application deleted successfully.', id: appId });
  } catch (error) {
    console.error('Delete application error:', error);
    return res.status(500).json({ error: 'Failed to delete application.' });
  }
};
