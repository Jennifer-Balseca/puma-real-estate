import api from './axios';

const visitService = {
  listVisits: (params = {}) => api.get('/api/visits', { params }).then((r) => r.data),
  getVisit: (id) => api.get(`/api/visits/${id}`).then((r) => r.data),
  createVisit: (payload) => api.post('/api/visits', payload).then((r) => r.data),
  assignAgent: (id, agentId) => api.post(`/api/visits/${id}/assign`, { agentId }).then((r) => r.data),
  acceptVisit: (id) => api.patch(`/api/visits/${id}`).then((r) => r.data),
  cancelVisit: (id) => api.post(`/api/visits/${id}/cancel`).then((r) => r.data),
  addFollowUpNote: (id, note) => api.post(`/api/visits/${id}/notes`, { note }).then((r) => r.data),
  updateStatus: (id, status) => api.patch(`/api/visits/${id}/status`, { status }).then((r) => r.data),
  updatePropertyStatus: (id, status) => api.patch(`/api/visits/${id}/property-status`, { status }).then((r) => r.data),
  listAgents: (params = {}) => api.get('/api/admin/agents', { params }).then((r) => r.data),
  getDashboardStats: (params = {}) => api.get('/api/admin/dashboard-stats', { params }).then((r) => r.data),
};

export default visitService;
