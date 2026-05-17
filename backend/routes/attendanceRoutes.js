const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/', attendanceController.markAttendance);
router.get('/class/:class_id/date/:date', attendanceController.getAttendanceByClassAndDate);

module.exports = router;
