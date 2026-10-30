const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

router.get('/admin', verifyToken, authorizeRoles('admin'), statsController.getAdminStats);

module.exports = router;
