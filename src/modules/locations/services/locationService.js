import api from '../../../lib/api';

export const locationService = {
  getAll: (params) => api.get('/locations', { params }),
  create: (data) => api.post('/locations', data),
  getContratPdf: (id) => api.get(`/locations/${id}/contrat-pdf`, { responseType: 'blob' }),
};
