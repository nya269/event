import api from './api';

export const usersService = {
  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.patch('/users/me', data);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/users/me/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get user inscriptions
  getInscriptions: async (params = {}) => {
    const response = await api.get('/users/me/inscriptions', { params });
    return response.data;
  },

  // Get user payments
  getPayments: async (params = {}) => {
    const response = await api.get('/users/me/payments', { params });
    return response.data;
  },

  // Cancel inscription
  cancelInscription: async (inscriptionId) => {
    const response = await api.patch(`/inscriptions/${inscriptionId}/cancel`);
    return response.data;
  },
};

export default usersService;

