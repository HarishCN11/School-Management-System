const express = require('express');
const router = express.Router();
const principalController = require('../controllers/principalController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);
router.get('/stats', principalController.getDashboardStats);
router.get('/students-parents', principalController.getStudentsWithParents);
router.get('/', principalController.getAllPrincipals);
router.post('/profile', principalController.createPrincipalProfile);
router.put('/:id', principalController.updatePrincipal);
router.delete('/:id', principalController.deletePrincipal);

module.exports = router;
