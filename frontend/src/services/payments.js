import api from './api';

export const paymentsService = {
  // Get payment status
  getPaymentStatus: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}/status`);
    return response.data;
  },

  // Process mock payment (for testing)
  processMockPayment: async (paymentId, simulateFailure = false) => {
    const response = await api.post(`/payments/${paymentId}/mock`, {
      simulateFailure,
    });
    return response.data;
  },

  // Request refund
  requestRefund: async (paymentId) => {
    const response = await api.post(`/payments/${paymentId}/refund`);
    return response.data;
  },
};

export default paymentsService;

