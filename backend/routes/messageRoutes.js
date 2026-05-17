const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);

router.post('/send', messageController.sendMessage);
router.get('/teacher', messageController.getTeacherAdminMessages);
router.get('/admin', messageController.getAdminMessages);
router.put('/read/:id', messageController.markAsRead);

module.exports = router;
