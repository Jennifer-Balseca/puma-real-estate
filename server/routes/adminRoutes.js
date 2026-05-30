const express = require('express');
const { listUsers, registerAgent, updateAgent, deactivateUser } = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAdmin);

router.get('/users', listUsers);
router.post('/users/register', registerAgent);
router.post('/users', registerAgent);
router.patch('/users/:id', updateAgent);
router.patch('/users/:id/status', deactivateUser);

module.exports = router;