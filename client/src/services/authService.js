import api from './api';
import { storage } from '../utils/helpers';

const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const ADMIN_KEY = 'admin';

export const authService = {
  /**
   * Login with email and password
   * All validation happens on the server
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      this.setAuth(response.data.data);
    }
    return response.data;
  },

  /**
   * Get current user profile from server
   * This validates the token is still valid
   */
  async getProfile() {
    const response = await api.get('/auth/me');
    if (response.data.success) {
      // Update cached admin data with fresh server data
      storage.set(ADMIN_KEY, response.data.data);
    }
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken() {
    const refreshToken = storage.get(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/auth/refresh', { refreshToken });
    if (response.data.success) {
      storage.set(AUTH_TOKEN_KEY, response.data.data.accessToken);
      if (response.data.data.refreshToken) {
        storage.set(REFRESH_TOKEN_KEY, response.data.data.refreshToken);
      }
    }
    return response.data;
  },

  /**
   * Update password
   */
  async updatePassword(currentPassword, newPassword) {
    const response = await api.put('/auth/password', { currentPassword, newPassword });
    return response.data;
  },

  /**
   * Store auth data after successful login
   */
  setAuth(data) {
    storage.set(AUTH_TOKEN_KEY, data.accessToken);
    storage.set(REFRESH_TOKEN_KEY, data.refreshToken);
    storage.set(ADMIN_KEY, data.admin);
  },

  /**
   * Clear all auth data
   */
  clearAuth() {
    storage.remove(AUTH_TOKEN_KEY);
    storage.remove(REFRESH_TOKEN_KEY);
    storage.remove(ADMIN_KEY);
  },

  /**
   * Logout - clear auth and redirect
   */
  logout() {
    this.clearAuth();
    window.location.href = '/admin/login';
  },

  /**
   * Check if token exists (doesn't validate it)
   */
  hasToken() {
    return !!storage.get(AUTH_TOKEN_KEY);
  },

  /**
   * Get stored token
   */
  getToken() {
    return storage.get(AUTH_TOKEN_KEY);
  },

  /**
   * Get refresh token
   */
  getRefreshToken() {
    return storage.get(REFRESH_TOKEN_KEY);
  },

  /**
   * Get cached admin data (may be stale)
   */
  getAdmin() {
    return storage.get(ADMIN_KEY);
  },

  /**
   * Check if user is authenticated (has valid token)
   * Note: This only checks localStorage, not server
   * Use AuthContext.isAuthenticated for validated status
   */
  isAuthenticated() {
    return !!storage.get(AUTH_TOKEN_KEY);
  },
};