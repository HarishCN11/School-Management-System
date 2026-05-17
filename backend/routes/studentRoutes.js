const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const verifyToken = require('../middleware/authMiddleware');

// Protect all routes
router.use(verifyToken);

router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);
router.post('/profile', studentController.createStudentProfile);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
