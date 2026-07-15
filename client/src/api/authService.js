import api from './axios';

const authService = {
  changePassword: (currentPassword, newPassword) => 
    api.post('/api/auth/change-password', { currentPassword, newPassword }).then((r) => r.data),
  resetAgentPassword: (agentId) => 
    api.post(`/api/admin/users/${agentId}/reset-password`).then((r) => r.data),
};

export default authService;
