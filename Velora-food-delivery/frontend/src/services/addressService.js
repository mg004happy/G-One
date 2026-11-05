/**
 * Address API service — maps to AddressController.
 */
import api from '../api/axios';

const URL = '/api/addresses';

const addressService = {
  getMyAddresses: () => api.get(URL).then((r) => r.data),

  getById: (id) => api.get(`${URL}/${id}`).then((r) => r.data),

  add: (data) => api.post(URL, data).then((r) => r.data),

  update: (id, data) => api.put(`${URL}/${id}`, data).then((r) => r.data),

  delete: (id) => api.delete(`${URL}/${id}`),

  setDefault: (id) => api.put(`${URL}/${id}/default`).then((r) => r.data),
};

export default addressService;
