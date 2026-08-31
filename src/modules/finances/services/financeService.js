import api from '../../../lib/api';

export const financeService = {
  getFactures: (params) => api.get('/finances/factures', { params }),
  submitPaiement: (formData) => api.post('/finances/paiements', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  validerPaiement: (id) => api.patch(`/finances/paiements/${id}/valider`),
  getQuittancePdf: (id) => api.get(`/finances/quittances/${id}/pdf`, { responseType: 'blob' }),
};
