const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sanitizeUser = (user) => {
    const plainUser = user.toObject ? user.toObject() : { ...user };
    delete plainUser.password;
    delete plainUser.__v;
    return plainUser;
};

const allowedRoles = ['Admin', 'Agente'];

const createToken = (user) => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET no está configurado.');
    }

    return jwt.sign(
        {
            id: user._id.toString(),
            email: user.email,
            role: user.role || user.rol,
            status: user.status || user.estado
        },
        secret,
        { expiresIn: '7d' }
    );
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail }).select('+password role status');

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const currentRole = user.role || user.rol;
        if (!allowedRoles.includes(currentRole)) {
            return res.status(403).json({ message: 'El usuario no tiene un rol permitido.' });
        }

        const userStatus = user.status || user.estado || 'Activo';
        if (userStatus === 'Inactivo') {
            return res.status(403).json({ message: 'Tu cuenta está inactiva.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Contraseña incorrecta.' });
        }

        const token = createToken(user);

        return res.status(200).json({
            message: 'Login exitoso.',
            token,
            user: sanitizeUser(user)
        });
    } catch (error) {
        return res.status(500).json({ message: 'No se pudo iniciar sesión.' });
    }
};

const me = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -__v');

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        return res.status(200).json({
            user: sanitizeUser(user)
        });
    } catch (error) {
        return res.status(500).json({ message: 'No se pudo obtener la sesión actual.' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Ambas contraseñas son obligatorias.' });
        }

        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Contraseña actual incorrecta.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        return res.status(500).json({ message: 'Error interno del servidor al cambiar la contraseña.' });
    }
};

module.exports = {
    login,
    me,
    changePassword
};