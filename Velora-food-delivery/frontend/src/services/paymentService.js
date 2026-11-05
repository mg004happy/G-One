/**
 * Payment API service — maps to PaymentController.
 */
import api from '../api/axios';

const URL = '/api/payments';

const paymentService = {
  createPayment: (orderId, data) =>
    api.post(`${URL}/create/${orderId}`, data).then((r) => r.data),

  verifyPayment: (data) => api.post(`${URL}/verify`, data).then((r) => r.data),

  getPayment: (paymentId) =>
    api.get(`${URL}/${paymentId}`).then((r) => r.data),

};

export default paymentService;
