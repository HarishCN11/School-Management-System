const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/', inventoryController.getAllInventory);
router.post('/', inventoryController.createInventory);
router.put('/:id', inventoryController.updateInventory);
router.delete('/:id', inventoryController.deleteInventory);

// Allocations
router.get('/allocations', inventoryController.getAllocations);
router.post('/allocate', inventoryController.allocateToClass);
router.get('/class/:classId', inventoryController.getClassInventory);

module.exports = router;
