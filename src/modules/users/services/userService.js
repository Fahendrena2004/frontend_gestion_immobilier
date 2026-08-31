import api from '../../../lib/api';

export const userService = {
  getUsers: (params) => api.get('/users', { params }),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};
