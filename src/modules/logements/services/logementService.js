import api from '../../../lib/api';

export const logementService = {
  getAll: (params) => api.get('/logements', { params }),
  getById: (id) => api.get(`/logements/${id}`),
  getQuartiers: () => api.get('/logements/quartiers'),
  create: (data) => api.post('/logements', data),
  update: (id, data) => api.put(`/logements/${id}`, data),
  delete: (id) => api.delete(`/logements/${id}`),
  uploadPhotos: (id, formData) => api.post(`/logements/${id}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
