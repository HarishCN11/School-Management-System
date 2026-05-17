const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post('/register', authController.register);
router.post('/login', authController.login);

// Password Reset
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPasswordWithTemp);

// Profile Management
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, upload.single('profile_photo'), authController.updateProfile);
router.post('/admin-reset-password', verifyToken, authController.adminResetUserPassword);
router.delete('/:id', verifyToken, authController.deleteUser);

module.exports = router;
