import api from '../../../lib/api';

export const demandeService = {
  getAll: (params) => api.get('/demandes', { params }),
  create: (data) => api.post('/demandes', data),
  updateStatus: (id, status) => api.patch(`/demandes/${id}/status`, { status }),
};
