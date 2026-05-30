const jwt = require('jsonwebtoken');
const User = require('../models/User');

const normalizeRole = (role) => {
    if (!role) {
        return '';
    }

    return String(role).trim().toLowerCase();
};

const authMiddleware = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No autorizado. Falta el token.' });
        }

        const token = authorization.split(' ')[1];
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            return res.status(500).json({ message: 'JWT_SECRET no está configurado.' });
        }

        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Token inválido o usuario no existe.' });
        }

        const userStatus = user.status || user.estado || 'Activo';
        if (userStatus === 'Inactivo') {
            return res.status(403).json({ message: 'Tu cuenta está inactiva.' });
        }

        req.user = {
            id: user._id,
            email: user.email,
            role: user.role || user.rol,
            status: userStatus
        };

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

const requireAdmin = (req, res, next) => {
    const role = normalizeRole(req.user?.role);

    if (role !== 'admin') {
        return res.status(403).json({ message: 'No tienes permisos para realizar esta acción.' });
    }

    next();
};

module.exports = {
    authMiddleware,
    requireAdmin
};