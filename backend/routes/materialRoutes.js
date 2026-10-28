const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const protect = require('../middleware/authMiddleware');
const createUploadMiddleware = require('../middleware/uploadMiddleware');
const uploadFile = createUploadMiddleware('file');

router.use(protect);

router.get('/student/:studentId', materialController.getMaterialsForStudent);
router.get('/class/:classId', materialController.getMaterialsByClass);
router.post('/upload', uploadFile, materialController.uploadMaterial);
router.delete('/:id', materialController.deleteMaterial);

module.exports = router;
