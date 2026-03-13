import api from './api';

export const eventsService = {
  // Get all events with filters
  getEvents: async (params = {}) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  // Get single event
  getEvent: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // Create event
  createEvent: async (eventData) => {
    const formData = new FormData();
    Object.entries(eventData).forEach(([key, value]) => {
      if (key === 'tags' && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (key === 'image' && value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    const response = await api.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Update event
  updateEvent: async (id, eventData) => {
    const response = await api.patch(`/events/${id}`, eventData);
    return response.data;
  },

  // Delete event
  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  // Publish event
  publishEvent: async (id) => {
    const response = await api.post(`/events/${id}/publish`);
    return response.data;
  },

  // Unpublish event
  unpublishEvent: async (id) => {
    const response = await api.post(`/events/${id}/unpublish`);
    return response.data;
  },

  // Cancel event
  cancelEvent: async (id) => {
    const response = await api.post(`/events/${id}/cancel`);
    return response.data;
  },

  // Get my events (organizer)
  getMyEvents: async (params = {}) => {
    const response = await api.get('/events/my-events', { params });
    return response.data;
  },

  // Register for event
  registerForEvent: async (eventId) => {
    const response = await api.post(`/events/${eventId}/inscriptions`);
    return response.data;
  },

  // Get event inscriptions (organizer)
  getEventInscriptions: async (eventId, params = {}) => {
    const response = await api.get(`/events/${eventId}/inscriptions`, { params });
    return response.data;
  },

  // Initialize payment
  initializePayment: async (eventId) => {
    const response = await api.post(`/events/${eventId}/payments`);
    return response.data;
  },

  // Upload event image
  uploadImage: async (id, file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post(`/events/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default eventsService;

