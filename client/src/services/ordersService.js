import api from './api';

export const ordersService = {
  async create(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  async trackOrder(orderNumber, verifyData) {
    const response = await api.get(`/orders/track/${orderNumber}`, {
      params: verifyData,
    });
    return response.data;
  },

  // Admin methods
  async getAll(params = {}) {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  async updateStatus(id, data) {
    const response = await api.patch(`/orders/${id}/status`, data);
    return response.data;
  },

  async updatePaymentStatus(id, paymentStatus) {
    const response = await api.patch(`/orders/${id}/payment`, { paymentStatus });
    return response.data;
  },

  async downloadSummary(id) {
    const response = await api.get(`/orders/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async cancel(id, reason) {
    const response = await api.post(`/orders/${id}/cancel`, { reason });
    return response.data;
  },
};