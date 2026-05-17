const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/', scheduleController.addScheduleItem);
router.get('/class/:class_id', scheduleController.getClassSchedule);
router.get('/teacher/:teacher_id', scheduleController.getTeacherSchedule);

module.exports = router;
