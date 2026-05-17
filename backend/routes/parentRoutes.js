const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);
router.get('/', parentController.getAllParents);
router.post('/profile', parentController.createParentProfile);
router.put('/:id', parentController.updateParent);
router.delete('/:id', parentController.deleteParent);

module.exports = router;
