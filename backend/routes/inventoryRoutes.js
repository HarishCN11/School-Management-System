const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

router.use(verifyToken);
router.get('/', inventoryController.getAllInventory);
router.post('/', authorizeRoles('admin'), inventoryController.createInventory);
router.put('/:id', authorizeRoles('admin'), inventoryController.updateInventory);
router.delete('/:id', authorizeRoles('admin'), inventoryController.deleteInventory);

// Allocations
router.get('/allocations', inventoryController.getAllocations);
router.post('/allocate', authorizeRoles('admin'), inventoryController.allocateToClass);
router.get('/class/:classId', inventoryController.getClassInventory);

module.exports = router;
