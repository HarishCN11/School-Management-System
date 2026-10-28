const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');
const createUploadMiddleware = require('../middleware/uploadMiddleware');
const uploadProfilePhoto = createUploadMiddleware('profile_photo', 'profiles');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Password Reset
router.post('/forgot-password', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPasswordWithTemp);

// Profile Management
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, uploadProfilePhoto, authController.updateProfile);
router.post('/admin-reset-password', verifyToken, authController.adminResetUserPassword);
router.delete('/:id', verifyToken, authController.deleteUser);

module.exports = router;
