import { query, get, run } from '../db/database.js';

export const getAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const records = await query(
      `SELECT a.*, s.name as subject_name 
       FROM attendance a
       JOIN subjects s ON a.subject_id = s.id
       WHERE a.user_id = ?
       ORDER BY s.name ASC`,
      [userId]
    );

    const formattedRecords = records.map((record) => {
      const percentage = record.total > 0 ? ((record.attended / record.total) * 100).toFixed(1) : 0;
      return {
        ...record,
        percentage: parseFloat(percentage),
        isLow: record.total > 0 && parseFloat(percentage) < 75
      };
    });

    return res.json({ attendance: formattedRecords });
  } catch (error) {
    console.error('Get attendance error:', error);
    return res.status(500).json({ error: 'Failed to retrieve attendance records.' });
  }
};

export const addSubject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, attended = 0, total = 0 } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Subject name is required.' });
    }

    const sResult = await run('INSERT INTO subjects (user_id, name) VALUES (?, ?)', [userId, name.trim()]);
    const subjectId = sResult.id;

    await run('INSERT INTO attendance (user_id, subject_id, attended, total) VALUES (?, ?, ?, ?)', [
      userId,
      subjectId,
      parseInt(attended, 10),
      parseInt(total, 10)
    ]);

    const record = await get(
      `SELECT a.*, s.name as subject_name 
       FROM attendance a
       JOIN subjects s ON a.subject_id = s.id
       WHERE a.subject_id = ? AND a.user_id = ?`,
      [subjectId, userId]
    );

    const percentage = record.total > 0 ? ((record.attended / record.total) * 100).toFixed(1) : 0;
    return res.status(201).json({
      message: 'Subject and attendance initialized.',
      attendanceRecord: {
        ...record,
        percentage: parseFloat(percentage),
        isLow: record.total > 0 && parseFloat(percentage) < 75
      }
    });
  } catch (error) {
    console.error('Add subject error:', error);
    return res.status(500).json({ error: 'Failed to add subject.' });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const attendanceId = req.params.id;
    const { attended, total, markClass } = req.body;

    const record = await get('SELECT * FROM attendance WHERE id = ? AND user_id = ?', [attendanceId, userId]);
    if (!record) {
      return res.status(404).json({ error: 'Attendance record not found.' });
    }

    let newAttended = record.attended;
    let newTotal = record.total;

    if (markClass === 'present') {
      newAttended += 1;
      newTotal += 1;
    } else if (markClass === 'absent') {
      newTotal += 1;
    } else {
      if (attended !== undefined) newAttended = Math.max(0, parseInt(attended, 10));
      if (total !== undefined) newTotal = Math.max(0, parseInt(total, 10));
    }

    await run(
      'UPDATE attendance SET attended = ?, total = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [newAttended, newTotal, attendanceId, userId]
    );

    const updated = await get(
      `SELECT a.*, s.name as subject_name 
       FROM attendance a
       JOIN subjects s ON a.subject_id = s.id
       WHERE a.id = ?`,
      [attendanceId]
    );

    const percentage = updated.total > 0 ? ((updated.attended / updated.total) * 100).toFixed(1) : 0;

    return res.json({
      message: 'Attendance updated successfully.',
      attendanceRecord: {
        ...updated,
        percentage: parseFloat(percentage),
        isLow: updated.total > 0 && parseFloat(percentage) < 75
      }
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    return res.status(500).json({ error: 'Failed to update attendance.' });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const userId = req.user.id;
    const subjectId = req.params.subjectId;

    await run('DELETE FROM subjects WHERE id = ? AND user_id = ?', [subjectId, userId]);
    return res.json({ message: 'Subject deleted successfully.', subjectId });
  } catch (error) {
    console.error('Delete subject error:', error);
    return res.status(500).json({ error: 'Failed to delete subject.' });
  }
};
