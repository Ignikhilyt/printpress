import api from './api';

export const notesService = {
  async getAll(params = {}) {
    const response = await api.get('/notes', { params });
    return response.data;
  },

  async getBySlug(slug) {
    const response = await api.get(`/notes/${slug}`);
    return response.data;
  },

  async getFeatured() {
    const response = await api.get('/notes/featured');
    return response.data;
  },

  async getSubjects() {
    const response = await api.get('/notes/subjects');
    return response.data;
  },

  async getCategories() {
    const response = await api.get('/notes/categories');
    return response.data;
  },

  async calculatePrice(data) {
    const response = await api.post('/notes/calculate-price', data);
    return response.data;
  },

  // Admin methods
  async getAllAdmin(params = {}) {
    const response = await api.get('/notes/admin/all', { params });
    return response.data;
  },

  async create(formData) {
    const response = await api.post('/notes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async update(id, formData) {
    const response = await api.put(`/notes/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },
};