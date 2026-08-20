const mongoose = require('mongoose');
const VisitRequest = require('../models/visitRequest');
const Appointment = require('../models/Appointment');
const Property = require('../models/Property');
const User = require('../models/User');

const isValidEmail = (email) => {
  return typeof email === 'string' && /\S+@\S+\.\S+/.test(email);
};

const isValidPhone = (phone) => {
  return typeof phone === 'string' && phone.trim().length === 10;
};

const buildAppointmentPayloadFromVisit = (visit) => {
  if (!visit) {
    return null;
  }

  const propertyId = visit.propertyId?._id ?? visit.propertyId;
  const assignedAgentId = visit.assignedAgentId?._id ?? visit.assignedAgentId ?? null;

  if (!propertyId || !assignedAgentId) {
    return null;
  }
  return {
    visitRequestId: visit._id,
    propiedad: propertyId,
    clienteNombre: visit.fullName,
    clienteEmail: visit.email,
    clienteTelefono: visit.phone,
    fecha: visit.preferredDate,
    hora: visit.timeSlot,
    mensaje: visit.message,
    agenteResponsable: assignedAgentId
  };
};

const normalizeVisitResponse = (visitDocument) => {
  if (!visitDocument) {
    return null;
  }

  const obj = visitDocument.toObject ? visitDocument.toObject() : visitDocument;
  obj.property = obj.propertyId || null;
  obj.assignedAgent = obj.assignedAgentId || null;
  return obj;
};

const timeSlotToMinutes = (timeSlot) => {
  if (!timeSlot) return 0;
  const parts = timeSlot.split(':');
  if (parts.length < 2) return 0;
  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1].split(' ')[0], 10);
  return hour * 60 + minute;
};

const withFollowUpNotes = (query) => query.populate('followUpNotes.createdBy', 'name email role');

const populateAppointment = async (appointmentId) => {
  if (!appointmentId) {
    return null;
  }

  return Appointment.findById(appointmentId)
    .populate('visitRequestId', 'status fullName email phone preferredDate timeSlot')
    .populate('propiedad')
    .populate('agenteResponsable', 'name email status');
};

const checkAgentScheduleConflict = async (agentId, dateStr, timeSlot, excludeVisitId = null) => {
  if (!agentId || !dateStr || !timeSlot) return false;

  const targetDate = new Date(dateStr);
  const startOfDay = new Date(targetDate);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const query = {
    assignedAgentId: agentId,
    status: 'in-process',
    preferredDate: { $gte: startOfDay, $lte: endOfDay },
    timeSlot: timeSlot
  };

  if (excludeVisitId) {
    query._id = { $ne: excludeVisitId };
  }

  const existingConflict = await VisitRequest.findOne(query);
  return !!existingConflict;
};

const syncAppointmentForVisit = async (visit, nextStatus) => {
  if (!visit) {
    return null;
  }

  const existingAppointment = await Appointment.findOne({ visitRequestId: visit._id });

  if (nextStatus === 'pending') {
    if (existingAppointment) {
      await Appointment.deleteOne({ _id: existingAppointment._id });
    }

    return null;
  }

  if (nextStatus === 'cancelled') {
    if (!existingAppointment) {
      return null;
    }

    existingAppointment.estado = 'Cancelada';
    await existingAppointment.save();
    return populateAppointment(existingAppointment._id);
  }

  const appointmentPayload = buildAppointmentPayloadFromVisit(visit);
  if (!appointmentPayload) {
    return null;
  }

  const statusMapping = {
    'in-process': 'Confirmada',
    finished: 'Completada'
  };

  appointmentPayload.estado = statusMapping[nextStatus] || 'Confirmada';

  if (existingAppointment) {
    existingAppointment.propiedad = appointmentPayload.propiedad;
    existingAppointment.clienteNombre = appointmentPayload.clienteNombre;
    existingAppointment.clienteEmail = appointmentPayload.clienteEmail;
    existingAppointment.clienteTelefono = appointmentPayload.clienteTelefono;
    existingAppointment.fecha = appointmentPayload.fecha;
    existingAppointment.hora = appointmentPayload.hora;
    existingAppointment.mensaje = appointmentPayload.mensaje;
    existingAppointment.estado = appointmentPayload.estado;
    existingAppointment.agenteResponsable = appointmentPayload.agenteResponsable;
    await existingAppointment.save();
    return populateAppointment(existingAppointment._id);
  }
  const appointment = await Appointment.create(appointmentPayload);
  return populateAppointment(appointment._id);
};
//Crear una nueva solicitud de visita
const createVisitRequest = async (req, res) => {
  try {
    const { propertyId, fullName, phone, email, preferredDate, timeSlot, message, requestKey } = req.body;

    // 1. Validaciones básicas
    if (!propertyId || !mongoose.isValidObjectId(propertyId)) return res.status(400).json({ message: 'propertyId inválido.' });
    if (!fullName || !String(fullName).trim()) return res.status(400).json({ message: 'fullName es obligatorio.' });
    if (!phone || !isValidPhone(phone)) return res.status(400).json({ message: 'phone inválido.' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ message: 'email inválido.' });
    if (!preferredDate || isNaN(Date.parse(preferredDate))) return res.status(400).json({ message: 'preferredDate inválida.' });
    if (!timeSlot || !String(timeSlot).trim()) return res.status(400).json({ message: 'timeSlot es obligatorio.' });
    if (!requestKey || !String(requestKey).trim()) return res.status(400).json({ message: 'requestKey es obligatorio.' });

    const normalizedRequestKey = String(requestKey).trim();
    const existingRequest = await VisitRequest.findOne({ requestKey: normalizedRequestKey })
      .populate('propertyId')
      .populate('assignedAgentId', 'name email status')
      .populate('followUpNotes.createdBy', 'name email role');

    if (existingRequest) {
      return res.status(200).json({ visit: normalizeVisitResponse(existingRequest), duplicated: true });
    }

    // Validar duplicación de solicitudes activas para la misma propiedad y correo
    const normalizedEmail = String(email).trim().toLowerCase();
    const activeDuplicate = await VisitRequest.findOne({
      email: normalizedEmail,
      propertyId: propertyId,
      status: { $in: ['pending', 'in-process'] }
    });

    if (activeDuplicate) {
      return res.status(400).json({ message: 'Ya tienes una solicitud de visita activa y bajo revisión para esta propiedad.' });
    }

    const targetDate = new Date(preferredDate);
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const sameDayVisits = await VisitRequest.find({
      propertyId: propertyId,
      preferredDate: { $gte: startOfDay, $lte: endOfDay },
      status: 'in-process'
    });

    const newVisitMinutes = timeSlotToMinutes(timeSlot);

    for (const v of sameDayVisits) {
      if (v.timeSlot) {
        const existingMinutes = timeSlotToMinutes(v.timeSlot);
        if (Math.abs(existingMinutes - newVisitMinutes) < 60) {
          return res.status(400).json({ 
            message: `La propiedad ya tiene una visita agendada cerca de las ${v.timeSlot}. Por favor, selecciona un horario con al menos 1 hora de diferencia.` 
          });
        }
      }
    }

    // 2. Buscar propiedad y validar existencia y disponibilidad 
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Propiedad no encontrada.' });

    if (property.estado !== 'Disponible') {
      return res.status(400).json({ message: 'Lo sentimos, esta propiedad ya no se encuentra disponible' });
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
      requestKey: normalizedRequestKey,
      createdBy: req.user?.id || null
    });

    const populated = await VisitRequest.findById(visit._id)
      .populate('propertyId')
      .populate('assignedAgentId')
      .populate('followUpNotes.createdBy', 'name email role');
    const payloadVisit = normalizeVisitResponse(populated) || visit;

    const io = req.app && req.app.get && req.app.get('io');
    if (io) {
      io.emit('visit:created', { visit: payloadVisit });
      
      const notification = {
        _id: `new-visit-${visit._id}-${Date.now()}`,
        title: 'Nueva solicitud de visita sin asignar',
        message: `Cliente: ${visit.fullName} para la propiedad "${populated.propertyId?.titulo || 'Propiedad'}".`,
        type: 'pending',
        visitId: visit._id,
        read: false,
        createdAt: new Date()
      };
      io.to('admin').emit('notification:new', notification);
      io.to('agent').emit('notification:new', notification);
    }

    return res.status(201).json({ visit: payloadVisit });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error creando la solicitud de visita.' });
  }
};

const listVisitRequests = async (req, res) => {
  try {
    const { status, assigned, tab, agentId } = req.query;
    const q = {};
    if (tab === 'finished') {
      q.status = 'finished';
    } else if (tab === 'cancelled') {
      q.status = 'cancelled';
    } else if (tab === 'pending') {
      q.status = 'pending';
    } else if (tab === 'in-process') {
      q.status = 'in-process';
    } else if (tab === 'requests') {
      q.status = { $in: ['pending', 'in-process'] };
    } else if (status) {
      q.status = status;
    } else {
      q.status = { $ne: 'cancelled' };
    }
    if (assigned === 'true') q.assignedAgentId = { $ne: null };
    if (assigned === 'false') q.assignedAgentId = null;
    if (agentId && mongoose.isValidObjectId(agentId)) q.assignedAgentId = agentId;

    const visits = await VisitRequest.find(q)
      .populate('propertyId', 'titulo ubicacion precio imagenes estado')
      .populate('assignedAgentId', 'name email status')
      .populate('followUpNotes.createdBy', 'name email role');

    const normalized = visits.map((v) => {
      return normalizeVisitResponse(v);
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

    const visit = await VisitRequest.findById(id)
      .populate('propertyId')
      .populate('assignedAgentId', 'name email status')
      .populate('followUpNotes.createdBy', 'name email role');
    if (!visit) return res.status(404).json({ message: 'Solicitud no encontrada.' });

    return res.json({ visit: normalizeVisitResponse(visit) });
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

    if (visit.status === 'finished' || visit.status === 'cancelled') {
      return res.status(400).json({ message: 'La visita ya está cerrada y no se puede modificar.' });
    }

    const agent = await User.findById(agentId);
    if (!agent) return res.status(404).json({ message: 'Agente no encontrado.' });
    // Validar conflicto de agenda
    const hasConflict = await checkAgentScheduleConflict(agentId, visit.preferredDate, visit.timeSlot, visit._id);
    if (hasConflict) {
      return res.status(409).json({ message: 'El agente ya tiene otra visita agendada a esa misma hora.' });
    }

    visit.assignedAgentId = agentId;
    if (visit.status === 'pending') {
      visit.status = 'in-process';
    }
    await visit.save();

    const populatedVisit = await VisitRequest.findById(visit._id)
      .populate('propertyId')
      .populate('assignedAgentId', 'name email status');

    if (visit.status !== 'pending') {
      const appointment = await syncAppointmentForVisit(populatedVisit, visit.status);
      if (appointment) {
        const io = req.app && req.app.get && req.app.get('io');
        if (io) io.emit('appointment:created', { appointment });
      }
    }

    const payloadVisit = populatedVisit ? Object.assign({}, populatedVisit.toObject(), {
      property: populatedVisit.propertyId,
      assignedAgent: populatedVisit.assignedAgentId
    }) : visit;

    const io = req.app && req.app.get && req.app.get('io');
    if (io) {
      io.emit('visit:assigned', { visit: payloadVisit });

      const notification = {
        _id: `assign-visit-${visit._id}-${Date.now()}`,
        title: 'Se te ha asignado una nueva visita',
        message: `Se te ha asignado la visita de ${visit.fullName} para la propiedad "${populatedVisit.propertyId?.titulo || 'Propiedad'}".`,
        type: 'assigned',
        visitId: visit._id,
        read: false,
        createdAt: new Date()
      };
      io.to(`user:${agentId}`).emit('notification:new', notification);
      io.to('admin').emit('notification:new', notification);
    }

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
    if (visit.status === 'finished' || visit.status === 'cancelled') {
      return res.status(400).json({ message: 'La visita ya está cerrada y no se puede modificar.' });
    }
    if (visit.status !== 'pending') {
      return res.status(400).json({ message: 'Solo se pueden aceptar solicitudes pendientes.' });
    }
    if (visit.assignedAgentId && String(visit.assignedAgentId) !== String(agentId)) {
      return res.status(403).json({ message: 'Solicitud ya asignada a otro agente.' });
    }
    // Validar conflicto de agenda
    const hasConflict = await checkAgentScheduleConflict(agentId, visit.preferredDate, visit.timeSlot, visit._id);
    if (hasConflict) {
      return res.status(409).json({ message: 'Ya tienes otra visita agendada a esta misma hora.' });
    }

    visit.assignedAgentId = agentId;
    visit.status = 'in-process';
    await visit.save();

    const populated = await VisitRequest.findById(visit._id).populate('propertyId').populate('assignedAgentId', 'name email status');
    const appointment = await syncAppointmentForVisit(populated, 'in-process');
    const payloadVisit = populated ? Object.assign({}, populated.toObject(), {
      property: populated.propertyId,
      assignedAgent: populated.assignedAgentId
    }) : visit;

    const io = req.app && req.app.get && req.app.get('io');
    if (io) {
      io.emit('visit:accepted', { visit: payloadVisit });
      if (appointment) io.emit('appointment:created', { appointment });

      const notification = {
        _id: `accept-visit-${visit._id}-${Date.now()}`,
        title: 'Se te ha asignado una nueva visita',
        message: `Has tomado la visita de ${visit.fullName} para la propiedad "${populated.propertyId?.titulo || 'Propiedad'}".`,
        type: 'assigned',
        visitId: visit._id,
        read: false,
        createdAt: new Date()
      };
      io.to(`user:${agentId}`).emit('notification:new', notification);
      io.to('admin').emit('notification:new', notification);
    }

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
    if (!['pending', 'in-process', 'finished', 'cancelled'].includes(status)) return res.status(400).json({ message: 'Status inválido.' });
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'ID inválido.' });

    const visit = await VisitRequest.findById(id);
    if (!visit) return res.status(404).json({ message: 'Solicitud no encontrada.' });

    if (visit.status === 'finished' || visit.status === 'cancelled') {
      return res.status(400).json({ message: 'La visita ya está cerrada y no se puede modificar.' });
    }

    if (visit.status === 'finished' || visit.status === 'cancelled') {
      if (visit.status !== status) {
        return res.status(400).json({ message: 'La visita ya está cerrada y no se puede modificar.' });
      }

      return res.json({ visit });
    }

    const currentUserId = req.user?.id;
    const role = String(req.user?.role || '').toLowerCase();

    if (role !== 'admin' && (!visit.assignedAgentId || String(visit.assignedAgentId) !== String(currentUserId))) {
      return res.status(403).json({ message: 'No tienes permisos para cambiar el estado.' });
    }

    if (status === 'in-process' && !visit.assignedAgentId) {
      return res.status(400).json({ message: 'No se puede cambiar el estado a "En proceso" sin asignar un agente primero.' });
    }

    if (status === 'in-process' && visit.assignedAgentId) {
      const hasConflict = await checkAgentScheduleConflict(visit.assignedAgentId, visit.preferredDate, visit.timeSlot, visit._id);
      if (hasConflict) {
        return res.status(409).json({ message: 'El agente ya tiene otra visita agendada a esa misma hora.' });
      }
    }

    visit.status = status;
    await visit.save();

    const populated = await VisitRequest.findById(visit._id).populate('propertyId').populate('assignedAgentId', 'name email status');
    const appointment = await syncAppointmentForVisit(populated, status);
    const payloadVisit = populated ? Object.assign({}, populated.toObject(), {
      property: populated.propertyId,
      assignedAgent: populated.assignedAgentId
    }) : visit;

    const io = req.app && req.app.get && req.app.get('io');
    if (io) {
      io.emit('visit:statusUpdated', { visit: payloadVisit });
      if (status === 'pending') {
        io.emit('appointment:deleted', { visitRequestId: visit._id });
      } else if (status === 'cancelled') {
        io.emit('visit:cancelled', { visit: payloadVisit });
        if (appointment) io.emit('appointment:updated', { appointment });
      } else if (appointment) {
        io.emit('appointment:created', { appointment });
      }
    }

    return res.json({ visit: payloadVisit });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error actualizando estado.' });
  }
};

// Cancelar una visita sin eliminar el registro
const cancelVisitRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'ID inválido.' });

    const visit = await VisitRequest.findById(id);
    if (!visit) return res.status(404).json({ message: 'Solicitud no encontrada.' });

    if (visit.status === 'finished') {
      return res.status(400).json({ message: 'No se puede cancelar una visita finalizada.' });
    }

    if (visit.status === 'cancelled') {
      const currentAppointment = await syncAppointmentForVisit(visit, 'cancelled');
      return res.json({ visit, appointment: currentAppointment });
    }

    const currentUserId = req.user?.id;
    const role = String(req.user?.role || '').toLowerCase();
    const canCancel = role === 'admin' || String(visit.assignedAgentId || '') === String(currentUserId);

    if (!canCancel) {
      return res.status(403).json({ message: 'No tienes permisos para cancelar esta visita.' });
    }

    visit.status = 'cancelled';
    await visit.save();

    const populated = await VisitRequest.findById(visit._id)
      .populate('propertyId')
      .populate('assignedAgentId', 'name email status')
      .populate('followUpNotes.createdBy', 'name email role');

    const appointment = await syncAppointmentForVisit(populated, 'cancelled');
    const payloadVisit = normalizeVisitResponse(populated) || visit;

    const io = req.app && req.app.get && req.app.get('io');
    if (io) {
      io.emit('visit:cancelled', { visit: payloadVisit });
      if (appointment) io.emit('appointment:updated', { appointment });
    }

    return res.json({ visit: payloadVisit, appointment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error cancelando la visita.' });
  }
};

const addFollowUpNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'ID inválido.' });
    if (!note || !String(note).trim()) return res.status(400).json({ message: 'La nota es obligatoria.' });

    const visit = await VisitRequest.findById(id);
    if (!visit) return res.status(404).json({ message: 'Solicitud no encontrada.' });

    const currentUserId = req.user?.id;
    const role = String(req.user?.role || '').toLowerCase();
    const assignedAgentId = String(visit.assignedAgentId || '');
    const canNote = role === 'admin' || (assignedAgentId && String(currentUserId) === assignedAgentId);

    if (!canNote) {
      return res.status(403).json({ message: 'No tienes permisos para agregar una nota de seguimiento.' });
    }

    visit.followUpNotes = visit.followUpNotes || [];
    visit.followUpNotes.push({
      note: String(note).trim(),
      createdBy: currentUserId || null,
      createdAt: new Date()
    });
    await visit.save();

    const populated = await VisitRequest.findById(visit._id)
      .populate('propertyId')
      .populate('assignedAgentId', 'name email status')
      .populate('followUpNotes.createdBy', 'name email role');

    return res.status(201).json({ visit: normalizeVisitResponse(populated) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error agregando la nota de seguimiento.' });
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

    if (visit.status === 'finished' || visit.status === 'cancelled') {
      return res.status(400).json({ message: 'La visita ya está cerrada y no se puede modificar.' });
    }

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
  agentUpdatePropertyStatus,
  cancelVisitRequest,
  addFollowUpNote,
  confirmVisitRequest: async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'ID inválido.' });
      const visit = await VisitRequest.findById(id)
        .populate('propertyId')
        .populate('assignedAgentId', 'name email status');

      if (!visit) {
        return res.status(404).json({ message: 'Solicitud no encontrada.' });
      }
      if (visit.status === 'pending') {
        return res.status(400).json({ message: 'Primero cambia la solicitud a En proceso para generar la cita.' });
      }
      if (visit.status === 'finished' || visit.status === 'cancelled') {
        return res.status(400).json({ message: 'La visita ya está cerrada y no se puede modificar.' });
      }

      const appointment = await syncAppointmentForVisit(visit, visit.status);

      if (!appointment) {
        return res.status(400).json({ message: 'No se pudo generar la cita.' });
      }
      return res.status(200).json({ appointment, visit });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error confirmando la solicitud de visita.' });
    }
  }
};