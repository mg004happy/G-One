/**
 * Order API service — maps to OrderController.
 */
import api from '../api/axios';

const URL = '/api/orders';

const orderService = {
  placeOrder: (data) => api.post(URL, data).then((r) => r.data),

  getMyOrders: () => api.get(`${URL}/my`).then((r) => r.data),

  getRestaurantOrders: () => api.get(`${URL}/restaurant`).then((r) => r.data),

  getById: (id) => api.get(`${URL}/${id}`).then((r) => r.data),

  cancel: (id) => api.put(`${URL}/${id}/cancel`).then((r) => r.data),

  updateStatus: (id, data) =>
    api.put(`${URL}/${id}/status`, data).then((r) => r.data),
};

export default orderService;
