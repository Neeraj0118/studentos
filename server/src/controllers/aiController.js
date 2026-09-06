import { generateStudyPlan, analyzeResume } from '../services/aiService.js';
import { query, get, run } from '../db/database.js';

export const createStudyPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { examDate, subjects, chapters, dailyHours, title } = req.body;

    if (!examDate || !subjects) {
      return res.status(400).json({ error: 'Exam date and subjects are required.' });
    }

    const planResult = await generateStudyPlan({
      examDate,
      subjects,
      chapters: chapters || '',
      dailyHours: parseFloat(dailyHours) || 4
    });

    const planTitle = title || `Study Plan for Exam (${examDate})`;

    const dbResult = await run(
      'INSERT INTO study_plans (user_id, title, exam_date, plan_json) VALUES (?, ?, ?, ?)',
      [userId, planTitle, examDate, JSON.stringify(planResult)]
    );

    const savedPlan = await get('SELECT * FROM study_plans WHERE id = ?', [dbResult.id]);

    return res.status(201).json({
      message: 'Study plan generated and saved successfully.',
      studyPlan: {
        ...savedPlan,
        plan_json: JSON.parse(savedPlan.plan_json)
      }
    });
  } catch (error) {
    console.error('Study plan error:', error);
    return res.status(500).json({ error: 'Failed to generate study plan.' });
  }
};

export const getStudyPlans = async (req, res) => {
  try {
    const userId = req.user.id;
    const plans = await query('SELECT * FROM study_plans WHERE user_id = ? ORDER BY created_at DESC', [userId]);

    const formatted = plans.map(p => ({
      ...p,
      plan_json: JSON.parse(p.plan_json)
    }));

    return res.json({ studyPlans: formatted });
  } catch (error) {
    console.error('Get study plans error:', error);
    return res.status(500).json({ error: 'Failed to retrieve study plans.' });
  }
};

export const createResumeAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;
    const { resumeText, jobDescription, jobTitle } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: 'Resume text and job description are required for analysis.' });
    }

    const analysisResult = await analyzeResume({
      resumeText,
      jobDescription,
      jobTitle: jobTitle || 'Target Position'
    });

    const dbResult = await run(
      'INSERT INTO resume_analyses (user_id, job_title, match_score, result_json) VALUES (?, ?, ?, ?)',
      [userId, analysisResult.jobTitle, analysisResult.matchScore, JSON.stringify(analysisResult)]
    );

    const savedAnalysis = await get('SELECT * FROM resume_analyses WHERE id = ?', [dbResult.id]);

    return res.status(201).json({
      message: 'Resume analyzed successfully.',
      analysis: {
        ...savedAnalysis,
        result_json: JSON.parse(savedAnalysis.result_json)
      }
    });
  } catch (error) {
    console.error('Resume analysis error:', error);
    return res.status(500).json({ error: 'Failed to analyze resume.' });
  }
};

export const getResumeAnalyses = async (req, res) => {
  try {
    const userId = req.user.id;
    const list = await query('SELECT * FROM resume_analyses WHERE user_id = ? ORDER BY created_at DESC', [userId]);

    const formatted = list.map(a => ({
      ...a,
      result_json: JSON.parse(a.result_json)
    }));

    return res.json({ analyses: formatted });
  } catch (error) {
    console.error('Get resume analyses error:', error);
    return res.status(500).json({ error: 'Failed to retrieve resume analyses.' });
  }
};
