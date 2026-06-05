const mongoose = require('mongoose');
const Property = require('../models/Property');

const normalizeRole = (role) => String(role ?? '').trim().toLowerCase();

const getPropertyOwnerId = (property) => {
    if (!property) {
        return null;
    }

    return property.createdBy || property.agente || null;
};

const authorizeProperty = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'El identificador no es válido.' });
        }

        const property = await Property.findById(id);

        if (!property) {
            return res.status(404).json({ message: 'Propiedad no encontrada.' });
        }

        if (!property.createdBy && property.agente) {
            property.set('createdBy', property.agente);
        }

        const role = normalizeRole(req.user?.role);
        const ownerId = String(getPropertyOwnerId(property));
        const currentUserId = String(req.user?.id);

        if (role === 'admin' || ownerId === currentUserId) {
            req.property = property;
            return next();
        }

        return res.status(403).json({ message: 'No tienes permisos para modificar esta propiedad.' });
    } catch (error) {
        return res.status(500).json({ message: 'No se pudo verificar el acceso a la propiedad.' });
    }
};

module.exports = {
    authorizeProperty,
    getPropertyOwnerId,
};