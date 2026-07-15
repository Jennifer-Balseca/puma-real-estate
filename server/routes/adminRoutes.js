const express = require('express');
const { listUsers, registerAgent, updateAgent, deactivateUser, getActiveAgents, getDashboardStats, resetAgentPassword } = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAdmin);

router.get('/users', listUsers);
router.get('/agents', getActiveAgents);
router.get('/dashboard-stats', getDashboardStats);
router.post('/users/register', registerAgent);
router.post('/users', registerAgent);
router.patch('/users/:id', updateAgent);
router.patch('/users/:id/status', deactivateUser);
router.post('/users/:id/reset-password', resetAgentPassword);

module.exports = router;