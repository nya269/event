import apiClient from '../api/client';

const paymentsService = {
  processMockPayment: async (paymentId) => {
    const res = await apiClient.post(`/payments/${paymentId}/mock-confirm`);
    return res.data;
  },
};

export default paymentsService;
