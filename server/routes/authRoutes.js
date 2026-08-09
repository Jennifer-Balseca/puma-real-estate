const express = require('express');
const { login, me, changePassword } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // LÍMITE ALTO TEMPORAL PARA PRUEBAS
    message: { message: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.body.email ? req.body.email.toLowerCase().trim() : 'unknown_email';
    }
});

const router = express.Router();

router.post('/login', loginRateLimiter, login);
router.get('/me', authMiddleware, me);
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;
// Forzar reinicio de nodemon para limpiar el bloqueo de IP