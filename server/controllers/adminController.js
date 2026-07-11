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

const getActiveAgents = async (req, res) => {
  try {
      const agents = await User.find({ role: 'Agente', status: 'Activo' }).select('name email');
      return res.status(200).json(agents);
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
            const parsedDate = new Date(date);
            if (!isNaN(parsedDate.getTime())) {
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

        // 1. Historial de Leads según Periodo (Diario, Semanal, Mensual) - 7 unidades traseras
        let monthlyStats = [];

        if (period === 'daily') {
            const dailyMap = {};
            const weekdayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            
            for (let i = 6; i >= 0; i--) {
                const d = new Date(refDate);
                d.setDate(refDate.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const label = `${d.getDate()} ${weekdayNames[d.getDay()]}`;
                dailyMap[dateStr] = { label, count: 0 };
            }
            
            const startOfRange = new Date(refDate);
            startOfRange.setDate(refDate.getDate() - 6);
            startOfRange.setHours(0, 0, 0, 0);
            
            const endOfRange = new Date(refDate);
            endOfRange.setHours(23, 59, 59, 999);

            const dailyStatsRaw = await VisitRequest.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startOfRange, $lte: endOfRange }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                }
            ]);

            dailyStatsRaw.forEach(item => {
                if (dailyMap[item._id]) {
                    dailyMap[item._id].count = item.count;
                }
            });
            monthlyStats = Object.values(dailyMap);

        } else if (period === 'weekly') {
            let startRange = new Date(refDate);
            startRange.setDate(refDate.getDate() - 42); // Por defecto 6 semanas atrás
            let endRange = new Date(refDate);

            if (req.query.startDate && req.query.endDate) {
                const parsedStart = new Date(req.query.startDate);
                const parsedEnd = new Date(req.query.endDate);
                if (!isNaN(parsedStart.getTime()) && !isNaN(parsedEnd.getTime())) {
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
                startRange = new Date(endRange.getTime() - 42 * 24 * 60 * 60 * 1000);
            }

            const durationMs = endRange.getTime() - startRange.getTime();
            const intervalMs = durationMs > 0 ? durationMs / 7 : 24 * 60 * 60 * 1000;

            for (let i = 0; i < 7; i++) {
                const start = new Date(startRange.getTime() + i * intervalMs);
                start.setHours(0, 0, 0, 0);

                const end = new Date(startRange.getTime() + (i + 1) * intervalMs);
                end.setHours(23, 59, 59, 999);

                const count = await VisitRequest.countDocuments({
                    createdAt: { $gte: start, $lte: end }
                });

                const label = `${start.getDate()}/${start.getMonth() + 1}-${end.getDate()}/${end.getMonth() + 1}`;
                monthlyStats.push({ label, count });
            }

        } else {
            // 'monthly' (default)
            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            for (let i = 6; i >= 0; i--) {
                const targetDate = new Date(refDate);
                targetDate.setMonth(refDate.getMonth() - i);
                
                const start = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1, 0, 0, 0, 0);
                const end = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);

                const count = await VisitRequest.countDocuments({
                    createdAt: { $gte: start, $lte: end }
                });

                const label = monthNames[start.getMonth()];
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
                            { $and: [ { $ne: ["$property.ubicacion.sector", ""] }, { $ne: ["$property.ubicacion.sector", null] } ] },
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
                $limit: 5
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

module.exports = {
    listUsers,
    registerAgent,
    updateAgent,
    deactivateUser,
    getActiveAgents,
    getDashboardStats
};