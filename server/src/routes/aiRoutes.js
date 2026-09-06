import express from 'express';
import { createStudyPlan, getStudyPlans, createResumeAnalysis, getResumeAnalyses } from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/study-plan', createStudyPlan);
router.get('/study-plans', getStudyPlans);
router.post('/resume-analyze', createResumeAnalysis);
router.get('/resume-analyses', getResumeAnalyses);

export default router;
