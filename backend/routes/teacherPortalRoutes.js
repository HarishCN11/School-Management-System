const express = require('express');
const router = express.Router();
const teacherPortalController = require('../controllers/teacherPortalController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/managed-class', teacherPortalController.getManagedClassDetails);
router.get('/my-items', teacherPortalController.getTeacherOwnItems);
router.get('/my-subjects', teacherPortalController.getMySubjects);

module.exports = router;
