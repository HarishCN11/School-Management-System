const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const protect = require('../middleware/authMiddleware'); // Import the default exported middleware function
const createUploadMiddleware = require('../middleware/uploadMiddleware');
const uploadFile = createUploadMiddleware('file');

router.get('/', announcementController.getAllAnnouncements);
router.post('/', protect, uploadFile, announcementController.createAnnouncement);
router.delete('/:id', protect, announcementController.deleteAnnouncement);

module.exports = router;
