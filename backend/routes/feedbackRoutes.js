const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);

// Parent routes
router.post('/submit', feedbackController.submitFeedback);
router.get('/parent/my-sent', feedbackController.getParentFeedback);
router.get('/parent/child-stats', feedbackController.getChildStats);

// Teacher routes
router.get('/teacher/my-received', feedbackController.getTeacherFeedback);
router.get('/teacher/student-feedback', feedbackController.getTeacherStudentFeedback);

// Student routes
router.post('/student/submit', feedbackController.submitStudentFeedback);
router.get('/student/teachers', feedbackController.getStudentTeachersForFeedback);

module.exports = router;
