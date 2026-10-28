const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const protect = require('../middleware/authMiddleware');
const createUploadMiddleware = require('../middleware/uploadMiddleware');
const uploadFile = createUploadMiddleware('file');

router.use(protect);

router.get('/student/:studentId', assignmentController.getAssignmentsForStudent);
router.post('/submit', uploadFile, assignmentController.submitAssignment);
router.post('/create', uploadFile, assignmentController.createAssignment);
router.get('/submissions', assignmentController.getAllSubmissions);
router.get('/class/:classId', assignmentController.getAssignmentsByClass);
router.post('/submissions/:id/grade', assignmentController.gradeSubmission);
router.delete('/:id', assignmentController.deleteAssignment);
router.put('/status/:id', assignmentController.updateAssignmentStatus);

module.exports = router;
