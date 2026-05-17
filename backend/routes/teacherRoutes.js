const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', teacherController.getAllTeachers);
router.post('/profile', teacherController.createTeacherProfile);
router.put('/:id', teacherController.updateTeacher);
router.delete('/:id', teacherController.deleteTeacher);

module.exports = router;
