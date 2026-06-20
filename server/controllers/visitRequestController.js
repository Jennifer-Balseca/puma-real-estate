const mongoose = require('mongoose');
const VisitRequest = require('../models/visitRequest');
const Property = require('../models/Property');
const User = require('../models/User');

const isValidEmail = (email) => {
  return typeof email === 'string' && /\S+@\S+\.\S+/.test(email);
};

const isValidPhone = (phone) => {
  return typeof phone === 'string' && phone.trim().length === 10;
};
//Crear una nueva solicitud de visita
const createVisitRequest = async (req, res) => {
  try {
    const { propertyId, fullName, phone, email, preferredDate, timeSlot, message } = req.body;

    // 1. Validaciones básicas
    if (!propertyId || !mongoose.isValidObjectId(propertyId)) return res.status(400).json({ message: 'propertyId inválido.' });
    if (!fullName || !String(fullName).trim()) return res.status(400).json({ message: 'fullName es obligatorio.' });
    if (!phone || !isValidPhone(phone)) return res.status(400).json({ message: 'phone inválido.' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ message: 'email inválido.' });
    if (!preferredDate || isNaN(Date.parse(preferredDate))) return res.status(400).json({ message: 'preferredDate inválida.' });
    if (!timeSlot || !String(timeSlot).trim()) return res.status(400).json({ message: 'timeSlot es obligatorio.' });

    // 2. Buscar propiedad y validar existencia y disponibilidad 
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Propiedad no encontrada.' });

    if (property.estado !== 'Disponible') {
        return res.status(400).json({ 
            message: `La propiedad no está marcada como Disponible. Estado en BD: ${property.estado}` 
        });
    }

    // 3. Crear la solicitud
    const visit = await VisitRequest.create({
      propertyId,
      fullName: String(fullName).trim(),
      phone: String(phone).trim(),
      email: String(email).trim().toLowerCase(),
      preferredDate: new Date(preferredDate),
      timeSlot: String(timeSlot).trim(),
      message: String(message || ''),
      createdBy: req.user?.id || null
    });


    const populated = await VisitRequest.findById(visit._id).populate('propertyId').populate('assignedAgentId');
    const payloadVisit = populated ? Object.assign({}, populated.toObject(), {
      property: populated.propertyId,
      assignedAgent: populated.assignedAgentId
    }) : visit;

    const io = req.app && req.app.get && req.app.get('io');
    if (io) io.emit('visit:created', { visit: payloadVisit });

    return res.status(201).json({ visit: payloadVisit });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error creando la solicitud de visita.' });
  }
};

const listVisitRequests = async (req, res) => {
  try {
    const { status, assigned } = req.query;
    const q = {};
    if (status) q.status = status;
    if (assigned === 'true') q.assignedAgentId = { $ne: null };
    if (assigned === 'false') q.assignedAgentId = null;

    const visits = await VisitRequest.find(q)
      .populate('propertyId', 'titulo ubicacion precio imagenes estado')
      .populate('assignedAgentId', 'name email status');

    // normalizar nombres para el frontend 
    const normalized = visits.map((v) => {
      const obj = v.toObject();
      obj.property = obj.propertyId || null;
      obj.assignedAgent = obj.assignedAgentId || null;
      return obj;
    });

    return res.json({ visits: normalized });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error listando solicitudes.' });
  }
};

const getVisitRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'ID inválido.' });

    const visit = await VisitRequest.findById(id).populate('propertyId').populate('assignedAgentId', 'name email status');
    if (!visit) return res.status(404).json({ message: 'Solicitud no encontrada.' });

    const obj = visit.toObject();
    obj.property = obj.propertyId || null;
    obj.assignedAgent = obj.assignedAgentId || null;
    return res.json({ visit: obj });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error obteniendo la solicitud.' });
  }
};

// Admin asigna un agente
const assignAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(agentId)) return res.status(400).json({ message: 'ID inválido.' });

    const visit = await VisitRequest.findById(id);
    if (!visit) return res.status(404).json({ message: 'Solicitud no encontrada.' });

    const agent = await User.findById(agentId);
    if (!agent) return res.status(404).json({ message: 'Agente no encontrado.' });

    visit.assignedAgentId = agentId;
    await visit.save();


    const populated = await VisitRequest.findById(visit._id).populate('propertyId').populate('assignedAgentId', 'name email status');
    const payloadVisit = populated ? Object.assign({}, populated.toObject(), {
      property: populated.propertyId,
      assignedAgent: populated.assignedAgentId
    }) : visit;

    const io = req.app && req.app.get && req.app.get('io');
    if (io) io.emit('visit:assigned', { visit: payloadVisit });

    return res.json({ visit: payloadVisit });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error asignando agente.' });
  }
};

// Agent acepta una visita 
const agentAccept = async (req, res) => {
  try {
    const { id } = req.params;
    const agentId = req.user?.id;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'ID inválido.' });

    const visit = await VisitRequest.findById(id);
    if (!visit) return res.status(404).json({ message: 'Solicitud no encontrada.' });

    if (visit.assignedAgentId && String(visit.assignedAgentId) !== String(agentId)) {
      return res.status(403).json({ message: 'Solicitud ya asignada a otro agente.' });
    }

    visit.assignedAgentId = agentId;
    visit.status = 'in-process';
    await visit.save();

    const populated = await VisitRequest.findById(visit._id).populate('propertyId').populate('assignedAgentId', 'name email status');
    const payloadVisit = populated ? Object.assign({}, populated.toObject(), {
      property: populated.propertyId,
      assignedAgent: populated.assignedAgentId
    }) : visit;

    const io = req.app && req.app.get && req.app.get('io');
    if (io) io.emit('visit:accepted', { visit: payloadVisit });

    return res.json({ visit: payloadVisit });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error aceptando la solicitud.' });
  }
};

// Actualizar estado de la visita
const updateVisitStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'in-process', 'finished'].includes(status)) return res.status(400).json({ message: 'Status inválido.' });
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'ID inválido.' });

    const visit = await VisitRequest.findById(id);
    if (!visit) return res.status(404).json({ message: 'Solicitud no encontrada.' });

    const currentUserId = req.user?.id;
    const role = String(req.user?.role || '').toLowerCase();

    if (role !== 'admin' && (!visit.assignedAgentId || String(visit.assignedAgentId) !== String(currentUserId))) {
      return res.status(403).json({ message: 'No tienes permisos para cambiar el estado.' });
    }

    visit.status = status;
    await visit.save();

    const populated = await VisitRequest.findById(visit._id).populate('propertyId').populate('assignedAgentId', 'name email status');
    const payloadVisit = populated ? Object.assign({}, populated.toObject(), {
      property: populated.propertyId,
      assignedAgent: populated.assignedAgentId
    }) : visit;

    const io = req.app && req.app.get && req.app.get('io');
    if (io) io.emit('visit:statusUpdated', { visit: payloadVisit });

    return res.json({ visit: payloadVisit });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error actualizando estado.' });
  }
};

// Agente puede actualizar el estado de la propiedad vinculada
const agentUpdatePropertyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { propertyStatus } = req.body;
    if (!['Disponible', 'Vendida', 'Alquilada'].includes(propertyStatus)) {
      return res.status(400).json({ message: 'propertyStatus inválido.' });
    }
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'ID inválido.' });

    const visit = await VisitRequest.findById(id);
    if (!visit) return res.status(404).json({ message: 'Solicitud no encontrada.' });

    const currentUserId = req.user?.id;
    if (!visit.assignedAgentId || String(visit.assignedAgentId) !== String(currentUserId)) {
      return res.status(403).json({ message: 'Solo el agente asignado puede actualizar el estado de la propiedad.' });
    }

    if (visit.status === 'finished') return res.status(400).json({ message: 'La visita está finalizada; no se puede modificar.' });

    const property = await Property.findById(visit.propertyId);
    if (!property) return res.status(404).json({ message: 'Propiedad no encontrada.' });

    property.estado = propertyStatus;
    await property.save();

    const io = req.app && req.app.get && req.app.get('io');
    if (io) io.emit('property:statusUpdated', { propertyId: property._id, status: propertyStatus });

    return res.json({ property });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error actualizando estado de propiedad.' });
  }
};

module.exports = {
  createVisitRequest,
  listVisitRequests,
  getVisitRequest,
  assignAgent,
  agentAccept,
  updateVisitStatus,
  agentUpdatePropertyStatus
};