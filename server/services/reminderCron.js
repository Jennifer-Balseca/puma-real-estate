const cron = require('node-cron');
const VisitRequest = require('../models/visitRequest');
const User = require('../models/User');

// Caché en memoria para evitar enviar alertas duplicadas
const sentRemindersCache = new Set();

const initReminderCron = (io) => {
  // Ejecutar cada 15 minutos
  cron.schedule('*/15 * * * *', async () => {
    try {
      const now = new Date();
      const next2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // 1. Alertas de solicitudes sin asignar
      const unassignedVisits = await VisitRequest.find({
        status: 'pending',
        assignedAgentId: null
      }).populate('propertyId');

      for (const visit of unassignedVisits) {
        const visitId = String(visit._id);
        const preferredTime = visit.preferredDate.getTime();
        const createdTime = visit.createdAt.getTime();
        const timeToVisitFromCreation = preferredTime - createdTime;

        // Caso A: Visita agendada para más de 2 días en el futuro
        if (timeToVisitFromCreation > 2 * 24 * 60 * 60 * 1000) {
          if (now.getTime() - createdTime >= 2 * 24 * 60 * 60 * 1000) {
            const cacheKeyUnassigned2d = `${visitId}-unassigned-2d`;
            if (!sentRemindersCache.has(cacheKeyUnassigned2d)) {
              sentRemindersCache.add(cacheKeyUnassigned2d);

              const notification = {
                _id: `unassigned-2d-${visitId}-${Date.now()}`,
                title: 'Alerta: Solicitud sin asignar',
                message: `La solicitud de visita de ${visit.fullName} para la propiedad "${visit.propertyId?.titulo || 'Propiedad'}" creada hace más de 2 días aún no tiene un agente asignado.`,
                type: 'pending',
                visitId: visit._id,
                read: false,
                createdAt: new Date()
              };
              io.to('admin').emit('notification:new', notification);
            }
          }
        }
        // Caso B: Visita agendada para pronto (menos de 2 días)
        else {
          if (preferredTime - now.getTime() <= 24 * 60 * 60 * 1000 && preferredTime > now.getTime()) {
            const cacheKeyUnassigned24h = `${visitId}-unassigned-24h`;
            if (!sentRemindersCache.has(cacheKeyUnassigned24h)) {
              sentRemindersCache.add(cacheKeyUnassigned24h);

              const notification = {
                _id: `unassigned-24h-${visitId}-${Date.now()}`,
                title: 'Alerta urgente: Solicitud sin asignar',
                message: `Urgente: Falta menos de 24 horas para la visita de ${visit.fullName} para la propiedad "${visit.propertyId?.titulo || 'Propiedad'}" y aún no tiene un agente asignado.`,
                type: 'pending',
                visitId: visit._id,
                read: false,
                createdAt: new Date()
              };
              io.to('admin').emit('notification:new', notification);
            }
          }
        }
      }

      // 2. Alertas de visitas vencidas
      const expiredVisits = await VisitRequest.find({
        status: { $in: ['pending', 'in-process'] },
        preferredDate: { $lt: now }
      }).populate('propertyId');

      for (const visit of expiredVisits) {
        const visitId = String(visit._id);
        const cacheKeyExpired = `${visitId}-expired`;

        if (!sentRemindersCache.has(cacheKeyExpired)) {
          sentRemindersCache.add(cacheKeyExpired);

          const propertyTitle = visit.propertyId?.titulo || 'Propiedad';
          const notification = {
            _id: `expired-${visitId}-${Date.now()}`,
            title: 'Visita vencida',
            message: `La visita de ${visit.fullName} para la propiedad "${propertyTitle}" ha vencido sin cerrarse.`,
            type: 'reminder',
            visitId: visit._id,
            read: false,
            createdAt: new Date()
          };

          const agentId = visit.assignedAgentId;
          if (agentId) {
            io.to(`user:${agentId}`).emit('notification:new', notification);
          }
          io.to('admin').emit('notification:new', notification);
        }
      }

      // Buscar visitas activas (en proceso) con agente asignado
      const upcomingVisits = await VisitRequest.find({
        status: 'in-process',
        assignedAgentId: { $ne: null },
        preferredDate: { $gte: now, $lte: next24h }
      }).populate('propertyId').populate('assignedAgentId', 'name email');

      for (const visit of upcomingVisits) {
        const visitId = String(visit._id);
        const preferredTime = visit.preferredDate.getTime();
        const propertyTitle = visit.propertyId?.titulo || 'Propiedad de lujo';
        const agentId = String(visit.assignedAgentId._id);
        const agentName = visit.assignedAgentId.name;
        
        // Formato legible de hora
        const timeStr = visit.timeSlot || visit.preferredDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Caso 1: Próximas 2 horas (Urgente)
        if (preferredTime <= next2h.getTime()) {
          const cacheKey2h = `${visitId}-2h`;
          if (!sentRemindersCache.has(cacheKey2h)) {
            // Registrar como enviado
            sentRemindersCache.add(cacheKey2h);
            sentRemindersCache.add(`${visitId}-24h`); // También marcar 24h para no duplicar

            const notification = {
              _id: `rem-2h-${visitId}-${Date.now()}`,
              title: 'Alerta: Visita en 2 horas',
              message: `Urgente: La visita del cliente ${visit.fullName} para la propiedad "${propertyTitle}" es en menos de 2 horas (a las ${timeStr}). Asignado a: ${agentName}.`,
              type: 'reminder',
              visitId: visit._id,
              read: false,
              createdAt: new Date()
            };

            // Enviar al agente asignado y a administradores
            io.to(`user:${agentId}`).emit('notification:new', notification);
            io.to('admin').emit('notification:new', notification);
          }
        }
        // Caso 2: Próximas 24 horas (Recordatorio estándar)
        else if (preferredTime <= next24h.getTime()) {
          const cacheKey24h = `${visitId}-24h`;
          if (!sentRemindersCache.has(cacheKey24h)) {
            sentRemindersCache.add(cacheKey24h);

            const notification = {
              _id: `rem-24h-${visitId}-${Date.now()}`,
              title: 'Recordatorio: Visita en 24 horas',
              message: `La visita de ${visit.fullName} para la propiedad "${propertyTitle}" está programada para mañana a las ${timeStr}. Asignado a: ${agentName}.`,
              type: 'reminder',
              visitId: visit._id,
              read: false,
              createdAt: new Date()
            };

            io.to(`user:${agentId}`).emit('notification:new', notification);
            io.to('admin').emit('notification:new', notification);
          }
        }
      }
    } catch (err) {
      console.error('Error en cron job de recordatorios:', err);
    }
  });
};

module.exports = { initReminderCron, sentRemindersCache };
