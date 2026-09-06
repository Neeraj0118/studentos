import express from 'express';
import { getAttendance, addSubject, updateAttendance, deleteSubject } from '../controllers/attendanceController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAttendance);
router.post('/subject', addSubject);
router.patch('/:id', updateAttendance);
router.delete('/subject/:subjectId', deleteSubject);

export default router;
