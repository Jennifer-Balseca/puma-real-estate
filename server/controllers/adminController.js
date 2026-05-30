const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

const sanitizeUser = (user) => {
    const plainUser = user.toObject ? user.toObject() : { ...user };
    delete plainUser.password;
    delete plainUser.__v;
    return plainUser;
};

const listUsers = async (req, res) => {
    try {
        const { role, status } = req.query;
        const filters = {};

        if (role) {
            filters.role = role;
        }

        if (status) {
            filters.status = status;
        }

        const users = await User.find(filters)
            .sort({ createdAt: -1 })
            .select('-password -__v');

        return res.status(200).json({
            message: 'Usuarios obtenidos correctamente.',
            total: users.length,
            users
        });
    } catch (error) {
        return res.status(500).json({ message: 'No se pudo listar los usuarios.' });
    }
};

const registerAgent = async (req, res) => {
    try {
        const { name, email, password, role = 'Agente' } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios.' });
        }

        if (!['Agente', 'Admin'].includes(role)) {
            return res.status(400).json({ message: 'El rol seleccionado no es válido.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(409).json({ message: 'Ya existe un usuario con ese email.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role,
            status: 'Activo'
        });

        return res.status(201).json({
            message: 'Agente creado correctamente.',
            user: sanitizeUser(user)
        });
    } catch (error) {
        return res.status(500).json({ message: 'No se pudo crear el agente.' });
    }
};

const updateAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role, status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'El identificador no es válido.' });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        if (name !== undefined) {
            const trimmedName = String(name).trim();

            if (!trimmedName) {
                return res.status(400).json({ message: 'El nombre no puede estar vacío.' });
            }

            user.name = trimmedName;
        }

        if (email !== undefined) {
            const normalizedEmail = String(email).trim().toLowerCase();

            if (!normalizedEmail) {
                return res.status(400).json({ message: 'El correo no puede estar vacío.' });
            }

            const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: id } });

            if (existingUser) {
                return res.status(409).json({ message: 'Ya existe un usuario con ese email.' });
            }

            user.email = normalizedEmail;
        }

        if (password !== undefined && String(password).trim()) {
            user.password = await bcrypt.hash(String(password), 10);
        }

        if (role !== undefined) {
            if (!['Admin', 'Agente'].includes(role)) {
                return res.status(400).json({ message: 'El rol seleccionado no es válido.' });
            }

            user.role = role;
        }

        if (status !== undefined) {
            if (!['Activo', 'Inactivo'].includes(status)) {
                return res.status(400).json({ message: 'El estado seleccionado no es válido.' });
            }

            user.status = status;
        }

        await user.save();

        return res.status(200).json({
            message: 'Agente actualizado correctamente.',
            user: sanitizeUser(user)
        });
    } catch (error) {
        return res.status(500).json({ message: 'No se pudo actualizar el agente.' });
    }
};

const deactivateUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'El identificador no es válido.' });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        if ((user.role || user.rol) !== 'Agente') {
            return res.status(400).json({ message: 'Solo se pueden desactivar agentes.' });
        }

        user.status = 'Inactivo';
        await user.save();

        return res.status(200).json({
            message: 'Usuario desactivado correctamente.',
            user: sanitizeUser(user)
        });
    } catch (error) {
        return res.status(500).json({ message: 'No se pudo desactivar el usuario.' });
    }
};

module.exports = {
    listUsers,
    registerAgent,
    updateAgent,
    deactivateUser
};