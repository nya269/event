import apiClient from '../api/client';

const eventsService = {
  getEvents: async (params = {}) => {
    const res = await apiClient.get('/events', { params });
    return res.data;
  },

  getEvent: async (id) => {
    const res = await apiClient.get(`/events/${id}`);
    return res.data;
  },

  registerForEvent: async (eventId) => {
    const res = await apiClient.post(`/events/${eventId}/inscriptions`);
    return res.data;
  },

  initializePayment: async (eventId) => {
    const res = await apiClient.post(`/events/${eventId}/payments`);
    return res.data;
  },

  getMyInscriptions: async () => {
    const res = await apiClient.get('/users/me/inscriptions');
    return res.data;
  },
};

export default eventsService;
