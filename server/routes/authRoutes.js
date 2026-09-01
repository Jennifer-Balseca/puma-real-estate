const express = require('express');
const { login, me, changePassword } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// 1. Límite por IP 
const loginIpRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10,
    message: { message: 'Demasiados intentos desde esta red. Intenta de nuevo en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// 2. Límite por Correo 
const loginEmailRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, 
    message: { message: 'Demasiados intentos para esta cuenta. Intenta de nuevo en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.body.email ? req.body.email.toLowerCase().trim() : 'unknown_email';
    }
});

const router = express.Router();

router.post('/login', loginIpRateLimiter, loginEmailRateLimiter, login);
router.get('/me', authMiddleware, me);
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;
