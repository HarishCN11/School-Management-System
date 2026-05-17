const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/term-report/:studentId', reportsController.getTermReport);
router.get('/student-subjects/:studentId', reportsController.getStudentSubjects);

// Managed Class Reports (Teacher Portal)
router.get('/managed-class', reportsController.getManagedClass);
router.get('/managed-class/students/:classId', reportsController.getClassStudentsForReports);
router.get('/official-marks/:studentId', reportsController.getOfficialMarks);
router.post('/official-update', reportsController.updateOfficialMarks);
router.get('/class-teacher/:studentId', reportsController.getClassTeacher);

module.exports = router;
