const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Property = require('../models/Property');
const VisitRequest = require('../models/visitRequest');

const sanitizeUser = (user) => {
    const plainUser = user.toObject ? user.toObject() : { ...user };
    delete plainUser.password;
    delete plainUser.__v;
    return plainUser;
};

const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = String(dateStr).split('-');
    if (parts.length !== 3) {
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    }
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? null : d;
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

        const io = req.app && req.app.get && req.app.get('io');
        if (io) io.emit('agent:updated');

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

        const io = req.app && req.app.get && req.app.get('io');
        if (io) io.emit('agent:updated');
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

        const io = req.app && req.app.get && req.app.get('io');
        if (io) io.emit('agent:updated');

        return res.status(200).json({
            message: 'Usuario desactivado correctamente.',
            user: sanitizeUser(user)
        });
    } catch (error) {
        return res.status(500).json({ message: 'No se pudo desactivar el usuario.' });
    }
};

const getActiveAgents = async (req, res) => {
    try {
        const { date, timeSlot } = req.query;

        const agents = await User.find({ role: 'Agente', status: 'Activo' }).select('name email');

        let agentsResult = agents.map(a => a.toObject ? a.toObject() : { ...a });

        if (date && timeSlot) {
            const targetDate = new Date(date);
            const startOfDay = new Date(targetDate);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(targetDate);
            endOfDay.setUTCHours(23, 59, 59, 999);

            const busyVisits = await VisitRequest.find({
                status: 'in-process',
                preferredDate: { $gte: startOfDay, $lte: endOfDay },
                timeSlot: timeSlot,
                assignedAgentId: { $in: agents.map(a => a._id) }
            }).select('assignedAgentId');

            const busyAgentIds = new Set(busyVisits.map(v => v.assignedAgentId.toString()));

            agentsResult = agentsResult.map(agent => ({
                ...agent,
                isBusy: busyAgentIds.has(agent._id.toString())
            }));
        }

        return res.status(200).json(agentsResult);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener agentes.' });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const { period = 'monthly', date } = req.query;

        // Parsear y validar fecha de referencia (no puede ser a futuro)
        let refDate = new Date();
        if (date) {
            const parsedDate = parseLocalDate(date);
            if (parsedDate) {
                refDate = parsedDate;
            }
        }

        const today = new Date();
        if (refDate > today) {
            refDate = today;
        }

        const pendingCount = await VisitRequest.countDocuments({ status: 'pending' });
        const inProcessCount = await VisitRequest.countDocuments({ status: 'in-process' });
        const finishedCount = await VisitRequest.countDocuments({ status: 'finished' });
        const cancelledCount = await VisitRequest.countDocuments({ status: 'cancelled' });

        // 1. Historial de Leads según Periodo (Diario, Semanal, Mensual)
        let monthlyStats = [];

        if (period === 'daily') {
            const startOfDay = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate(), 0, 0, 0, 0);
            const endOfDay = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate(), 23, 59, 59, 999);

            // Una sola consulta para el día entero
            const dailyVisits = await VisitRequest.find({
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            }, 'createdAt');

            for (let i = 0; i < 8; i++) {
                const startHour = i * 3;
                const endHour = startHour + 2;

                const count = dailyVisits.filter(v => {
                    const h = v.createdAt.getHours();
                    return h >= startHour && h <= endHour;
                }).length;

                const label = `${String(startHour).padStart(2, '0')}-${String(endHour + 1).padStart(2, '0')}h`;
                monthlyStats.push({ label, count });
            }

        } else if (period === 'weekly') {
            let startRange = new Date(refDate);
            startRange.setDate(refDate.getDate() - 6); // Por defecto 7 días atrás (la última semana)
            let endRange = new Date(refDate);

            if (req.query.startDate && req.query.endDate) {
                const parsedStart = parseLocalDate(req.query.startDate);
                const parsedEnd = parseLocalDate(req.query.endDate);
                if (parsedStart && parsedEnd) {
                    startRange = parsedStart;
                    endRange = parsedEnd;
                }
            }
            // Validar que el fin no sea a futuro
            const today = new Date();
            if (endRange > today) {
                endRange = today;
            }
            if (startRange > endRange) {
                startRange = new Date(endRange.getTime() - 6 * 24 * 60 * 60 * 1000);
            }

            const startRangeOfDay = new Date(startRange);
            startRangeOfDay.setHours(0, 0, 0, 0);
            const endRangeOfDay = new Date(endRange);
            endRangeOfDay.setHours(23, 59, 59, 999);
            // Una sola consulta para el rango semanal completo
            const weeklyVisits = await VisitRequest.find({
                createdAt: { $gte: startRangeOfDay, $lte: endRangeOfDay }
            }, 'createdAt');
            // Agrupar día por día de la semana seleccionada
            const weekdayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            const diffTime = Math.abs(endRange - startRange);
            const diffDays = Math.min(Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1, 31); // Limitar a 31 días máximo por seguridad visual

            for (let i = 0; i < diffDays; i++) {
                const currentDay = new Date(startRange.getTime() + i * 24 * 60 * 60 * 1000);
                const dayLabel = currentDay.getDate();
                const monthLabelVal = currentDay.getMonth();
                const yearLabelVal = currentDay.getFullYear();

                const count = weeklyVisits.filter(v => {
                    const d = v.createdAt;
                    return d.getDate() === dayLabel && d.getMonth() === monthLabelVal && d.getFullYear() === yearLabelVal;
                }).length;

                const label = `${dayLabel} ${weekdayNames[currentDay.getDay()]}`;
                monthlyStats.push({ label, count });
            }

        } else {
            // 'monthly' (agrupar por semanas naturales de lunes a domingo del mes seleccionado)
            const year = refDate.getFullYear();
            const month = refDate.getMonth();
            const lastDay = new Date(year, month + 1, 0).getDate();
            const monthNamesLower = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
            const monthLabel = monthNamesLower[month];

            // Delimitar semanas naturales de Lunes a Domingo
            const weeks = [];
            let currentWeek = { start: 1, end: null };

            for (let d = 1; d <= lastDay; d++) {
                const dateObj = new Date(year, month, d);
                const dayOfWeek = dateObj.getDay(); // 0 = Domingo, 1 = Lunes, etc.

                if (dayOfWeek === 0 || d === lastDay) {
                    currentWeek.end = d;
                    weeks.push({ ...currentWeek });
                    if (d < lastDay) {
                        currentWeek = { start: d + 1, end: null };
                    }
                }
            }

            const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
            const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
            // Una sola consulta para el mes completo
            const monthlyVisits = await VisitRequest.find({
                createdAt: { $gte: startOfMonth, $lte: endOfMonth }
            }, 'createdAt');

            for (let w = 0; w < weeks.length; w++) {
                const range = weeks[w];
                const count = monthlyVisits.filter(v => {
                    const d = v.createdAt.getDate();
                    return d >= range.start && d <= range.end;
                }).length;

                const label = `Sem ${w + 1} (${range.start}-${range.end} ${monthLabel})`;
                monthlyStats.push({ label, count });
            }
        }
        // 2. Zonas de Alta Demanda (Sectores con más solicitudes)
        const sectorStats = await VisitRequest.aggregate([
            {
                $lookup: {
                    from: "properties",
                    localField: "propertyId",
                    foreignField: "_id",
                    as: "property"
                }
            },
            {
                $unwind: "$property"
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $and: [{ $ne: ["$property.ubicacion.sector", ""] }, { $ne: ["$property.ubicacion.sector", null] }] },
                            "$property.ubicacion.sector",
                            "$property.ubicacion.ciudad"
                        ]
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 5
            }
        ]);
        // 3. Rendimiento de Agentes (Visitas atendidas y completadas)
        const agentPerformance = await VisitRequest.aggregate([
            {
                $match: {
                    assignedAgentId: { $ne: null }
                }
            },
            {
                $group: {
                    _id: "$assignedAgentId",
                    totalVisits: { $sum: 1 },
                    completedVisits: {
                        $sum: { $cond: [{ $eq: ["$status", "finished"] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "agent"
                }
            },
            {
                $unwind: "$agent"
            },
            {
                $project: {
                    name: "$agent.name",
                    email: "$agent.email",
                    totalVisits: 1,
                    completedVisits: 1
                }
            },
            {
                $sort: { completedVisits: -1, totalVisits: -1 }
            },
            {
                $limit: 5
            }
        ]);
        // 4. Propiedades más Populares (Por solicitudes de visita)
        const popularProperties = await VisitRequest.aggregate([
            {
                $group: {
                    _id: "$propertyId",
                    visitCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "properties",
                    localField: "_id",
                    foreignField: "_id",
                    as: "property"
                }
            },
            {
                $unwind: "$property"
            },
            {
                $project: {
                    titulo: "$property.titulo",
                    precio: "$property.precio",
                    tipo: "$property.tipo",
                    visitCount: 1
                }
            },
            {
                $sort: { visitCount: -1 }
            },
            {
                $limit: 100
            }
        ]);

        // Listado de visitas recientes
        const visits = await VisitRequest.find()
            .populate('propertyId', 'titulo precio ubicacion')
            .populate('assignedAgentId', 'name email role status')
            .sort({ createdAt: -1 })
            .limit(20);

        return res.status(200).json({
            stats: {
                pending: pendingCount,
                inProcess: inProcessCount,
                finished: finishedCount,
                cancelled: cancelledCount
            },
            monthlyStats,
            sectorStats,
            agentPerformance,
            popularProperties,
            visits
        });
    } catch (error) {
        console.error('Error al obtener estadísticas del dashboard:', error);
        return res.status(500).json({ message: 'Error al obtener las estadísticas del dashboard.' });
    }
};

const resetAgentPassword = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Agente no encontrado.' });
        }

        // Generar clave provisional de 8 caracteres
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        let tempPassword = 'Puma';
        for (let i = 0; i < 4; i++) {
            tempPassword += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        for (let i = 0; i < 2; i++) {
            tempPassword += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(tempPassword, salt);
        await user.save();

        const io = req.app && req.app.get && req.app.get('io');
        if (io) io.emit('agent:updated');

        return res.status(200).json({
            message: 'Contraseña provisional restablecida con éxito.',
            tempPassword
        });
    } catch (error) {
        console.error('Error al restablecer contraseña de agente:', error);
        return res.status(500).json({ message: 'Error interno del servidor al restablecer contraseña.' });
    }
};

module.exports = {
    listUsers,
    registerAgent,
    updateAgent,
    deactivateUser,
    getActiveAgents,
    getDashboardStats,
    resetAgentPassword
};