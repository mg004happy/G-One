/**
 * Admin API service — maps to AdminController.
 */
import api from '../api/axios';

const URL = '/api/admin';

const adminService = {
  // ---- Dashboard ----
  getDashboardStats: () => api.get(`${URL}/dashboard`).then((r) => r.data),

  // ---- User Management ----
  getUsers: (params = {}) =>
    api.get(`${URL}/users`, { params }).then((r) => r.data),

  getUserById: (id) => api.get(`${URL}/users/${id}`).then((r) => r.data),

  updateUserStatus: (id, data) =>
    api.put(`${URL}/users/${id}/status`, data).then((r) => r.data),

  deleteUser: (id) => api.delete(`${URL}/users/${id}`),

  // ---- Restaurant Management ----
  getRestaurants: (page = 0, size = 10) =>
    api.get(`${URL}/restaurants`, { params: { page, size } }).then((r) => r.data),

  approveRestaurant: (id) =>
    api.put(`${URL}/restaurants/${id}/approve`).then((r) => r.data),

  disableRestaurant: (id) =>
    api.put(`${URL}/restaurants/${id}/disable`).then((r) => r.data),

  deleteRestaurant: (id) => api.delete(`${URL}/restaurants/${id}`),

  // ---- Order Management ----
  getOrders: (params = {}) =>
    api.get(`${URL}/orders`, { params }).then((r) => r.data),

  getOrderById: (id) => api.get(`${URL}/orders/${id}`).then((r) => r.data),

  // ---- Analytics ----
  getOrderAnalytics: () =>
    api.get(`${URL}/analytics/orders`).then((r) => r.data),

  getRevenueAnalytics: (days = 30) =>
    api.get(`${URL}/analytics/revenue`, { params: { days } }).then((r) => r.data),
};

export default adminService;
