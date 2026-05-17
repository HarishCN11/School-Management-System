const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const protect = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.use(protect);

router.get('/student/:studentId', assignmentController.getAssignmentsForStudent);
router.post('/submit', upload.single('file'), assignmentController.submitAssignment);
router.post('/create', upload.single('file'), assignmentController.createAssignment);
router.get('/submissions', assignmentController.getAllSubmissions);
router.get('/class/:classId', assignmentController.getAssignmentsByClass);
router.post('/submissions/:id/grade', assignmentController.gradeSubmission);
router.delete('/:id', assignmentController.deleteAssignment);
router.put('/status/:id', assignmentController.updateAssignmentStatus);

module.exports = router;
