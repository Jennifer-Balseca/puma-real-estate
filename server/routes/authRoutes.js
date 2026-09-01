const express = require('express');
const { login, me, changePassword } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Límite por Correo 
const loginEmailRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, 
    message: { message: 'Demasiados intentos para esta cuenta. Intenta de nuevo en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
        return req.body.email ? req.body.email.toLowerCase().trim() : 'unknown_email';
    }
});

const router = express.Router();

router.post('/login', loginEmailRateLimiter, login);
router.get('/me', authMiddleware, me);
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;
