const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const protect = require('../middleware/authMiddleware'); // Import the default exported middleware function

// Protect routes so only logged in users (or admins) can post/delete
// For now, using protect for creation/deletion
const multer = require('multer');
const path = require('path');

// Configure Multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append extension
    }
});

const upload = multer({ storage: storage });

router.get('/', announcementController.getAllAnnouncements);
router.post('/', protect, upload.single('file'), announcementController.createAnnouncement);
router.delete('/:id', protect, announcementController.deleteAnnouncement);

module.exports = router;
