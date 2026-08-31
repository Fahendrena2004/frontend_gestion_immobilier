import api from '../../../lib/api';

export const adminService = {
  getDashboardStats: () => api.get('/administration/dashboard-stats'),
  moderateLogement: (id, status) => api.patch(`/administration/logements/${id}/moderation`, { status }),
  toggleUserStatus: (id, isActive) => api.patch(`/administration/users/${id}/status`, { is_active: isActive }),
};
