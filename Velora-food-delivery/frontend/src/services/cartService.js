/**
 * Cart API service — maps to CartController.
 */
import api from '../api/axios';

const URL = '/api/cart';

const cartService = {
  getCart: () => api.get(URL).then((r) => r.data),

  addToCart: (data) => api.post(`${URL}/add`, data).then((r) => r.data),

  updateItem: (cartItemId, data) =>
    api.put(`${URL}/item/${cartItemId}`, data).then((r) => r.data),

  removeItem: (cartItemId) =>
    api.delete(`${URL}/item/${cartItemId}`).then((r) => r.data),

  clearCart: () => api.delete(`${URL}/clear`),
};

export default cartService;
