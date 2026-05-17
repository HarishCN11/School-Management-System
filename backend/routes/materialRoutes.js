const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
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

router.get('/student/:studentId', materialController.getMaterialsForStudent);
router.get('/class/:classId', materialController.getMaterialsByClass);
router.post('/upload', upload.single('file'), materialController.uploadMaterial);
router.delete('/:id', materialController.deleteMaterial);

module.exports = router;
