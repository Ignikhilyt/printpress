import api from './api';

export const adminService = {
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  async getPricingConfig() {
    const response = await api.get('/admin/pricing-config');
    return response.data;
  },

  // Institutes
  async getInstitutes(params = {}) {
    const response = await api.get('/institutes', { params });
    return response.data;
  },

  async createInstitute(formData) {
    const response = await api.post('/institutes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async updateInstitute(id, formData) {
    const response = await api.put(`/institutes/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteInstitute(id) {
    const response = await api.delete(`/institutes/${id}`);
    return response.data;
  },
};