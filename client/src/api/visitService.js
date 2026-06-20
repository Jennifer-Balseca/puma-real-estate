import api from './axios';

const visitService = {
  // listar solicitudes con filtros opcionales
  listVisits: (params = {}) => api.get('/api/visits', { params }).then((r) => r.data),
  getVisit: (id) => api.get(`/api/visits/${id}`).then((r) => r.data),
  createVisit: (payload) => api.post('/api/visits', payload).then((r) => r.data),
  assignAgent: (id, agentId) => api.post(`/api/visits/${id}/assign`, { agentId }).then((r) => r.data),
  acceptVisit: (id) => api.post(`/api/visits/${id}/accept`).then((r) => r.data),
  updateStatus: (id, status) => api.patch(`/api/visits/${id}/status`, { status }).then((r) => r.data),
  updatePropertyStatus: (id, status) => api.patch(`/api/visits/${id}/property-status`, { status }).then((r) => r.data),
  listAgents: () => api.get('/api/admin/agents').then((r) => r.data),
};

export default visitService;
