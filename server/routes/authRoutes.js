const express = require('express');
const { login, me, changePassword } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.get('/me', authMiddleware, me);
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;