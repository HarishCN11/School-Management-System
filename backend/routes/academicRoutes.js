const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);

// Classes Routes
router.get('/classes', academicController.getAllClasses);
router.post('/classes', academicController.createClass);
router.put('/classes/:id', academicController.updateClass);
router.delete('/classes/:id', academicController.deleteClass);

// Subjects Routes
router.get('/subjects', academicController.getAllSubjects);
router.post('/subjects', academicController.createSubject);
router.put('/subjects/:id', academicController.updateSubject);
router.delete('/subjects/:id', academicController.deleteSubject);

// Stats Routes
router.get('/stats', academicController.getDashboardStats);
router.get('/stats/teacher/:teacherId', academicController.getTeacherStats);
router.get('/stats/student/:studentId', academicController.getStudentStats);

module.exports = router;
