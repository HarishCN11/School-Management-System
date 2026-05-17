const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/', examController.createExam);
router.post('/results', examController.recordResults);
router.get('/student/:student_id', examController.getStudentResults);
router.get('/exam/:exam_id', examController.getClassExamResults);

module.exports = router;
