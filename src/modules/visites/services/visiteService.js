import api from '../../../lib/api';

export const visiteService = {
  getAll: (params) => api.get('/visites', { params }),
  schedule: (data) => api.post('/visites', data),
  updateStatus: (id, status) => api.patch(`/visites/${id}/status`, { status }),
};
