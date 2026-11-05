/**
 * Restaurant API service — maps to RestaurantController.
 */
import api from '../api/axios';

const URL = '/api/restaurants';

const restaurantService = {
  getAll: () => api.get(URL).then((r) => r.data),

  getBySlug: (slug) => api.get(`${URL}/${encodeURIComponent(slug)}`).then((r) => r.data),

  create: (data) => api.post(URL, data).then((r) => r.data),

  update: (id, data) => api.put(`${URL}/${id}`, data).then((r) => r.data),

  updateTieUps: (id, tieUpCompanies) => api.put(`${URL}/${id}/tie-ups`, { tieUpCompanies }).then((r) => r.data),

  setAvailability: (id, active) => api.patch(`${URL}/${id}/availability`, { active }).then((r) => r.data),

  delete: (id) => api.delete(`${URL}/${id}`),
};

export default restaurantService;
