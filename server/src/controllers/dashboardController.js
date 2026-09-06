import { query, get } from '../db/database.js';

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Task metrics
    const pendingTasks = await query(
      `SELECT t.*, s.name as subject_name 
       FROM tasks t 
       LEFT JOIN subjects s ON t.subject_id = s.id 
       WHERE t.user_id = ? AND t.status != 'completed' 
       ORDER BY t.due_date ASC LIMIT 5`,
      [userId]
    );

    const taskCounts = await get(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
       FROM tasks WHERE user_id = ?`,
      [userId]
    );

    // 2. Attendance metrics
    const attendanceRecords = await query(
      `SELECT a.*, s.name as subject_name 
       FROM attendance a
       JOIN subjects s ON a.subject_id = s.id
       WHERE a.user_id = ?`,
      [userId]
    );

    let totalAttendedSum = 0;
    let totalClassesSum = 0;
    let lowAttendanceCount = 0;

    const attendanceWithPct = attendanceRecords.map(r => {
      totalAttendedSum += r.attended;
      totalClassesSum += r.total;
      const pct = r.total > 0 ? (r.attended / r.total) * 100 : 0;
      if (r.total > 0 && pct < 75) lowAttendanceCount++;
      return { ...r, percentage: parseFloat(pct.toFixed(1)) };
    });

    const overallAttendancePct = totalClassesSum > 0 ? parseFloat(((totalAttendedSum / totalClassesSum) * 100).toFixed(1)) : 0;

    // 3. Applications metrics
    const applications = await query(
      'SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [userId]
    );

    const appCounts = await get(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Applied' THEN 1 ELSE 0 END) as applied,
        SUM(CASE WHEN status = 'Assessment' THEN 1 ELSE 0 END) as assessment,
        SUM(CASE WHEN status = 'Interview' THEN 1 ELSE 0 END) as interview,
        SUM(CASE WHEN status = 'Offer' THEN 1 ELSE 0 END) as offer,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected
       FROM applications WHERE user_id = ?`,
      [userId]
    );

    // 4. Latest AI study plan & latest resume score
    const latestPlanRecord = await get(
      'SELECT * FROM study_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    const latestResumeRecord = await get(
      'SELECT * FROM resume_analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    return res.json({
      tasks: {
        total: taskCounts.total || 0,
        completed: taskCounts.completed || 0,
        pending: taskCounts.pending || 0,
        upcoming: pendingTasks
      },
      attendance: {
        overallPercentage: overallAttendancePct,
        totalSubjects: attendanceRecords.length,
        lowAttendanceCount,
        records: attendanceWithPct
      },
      applications: {
        total: appCounts.total || 0,
        applied: appCounts.applied || 0,
        assessment: appCounts.assessment || 0,
        interview: appCounts.interview || 0,
        offer: appCounts.offer || 0,
        rejected: appCounts.rejected || 0,
        recent: applications
      },
      latestStudyPlan: latestPlanRecord ? { ...latestPlanRecord, plan_json: JSON.parse(latestPlanRecord.plan_json) } : null,
      latestResumeAnalysis: latestResumeRecord ? { ...latestResumeRecord, result_json: JSON.parse(latestResumeRecord.result_json) } : null
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ error: 'Failed to retrieve dashboard statistics.' });
  }
};
