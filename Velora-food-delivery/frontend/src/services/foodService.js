/**
 * Food Item API service — maps to FoodItemController.
 */
import api from '../api/axios';

const URL = '/api/foods';

const foodService = {
  getAll: () => api.get(URL).then((r) => r.data),

  getById: (id) => api.get(`${URL}/${id}`).then((r) => r.data),

  getByRestaurant: (restaurantId) =>
    api.get(`${URL}/restaurant/${restaurantId}`).then((r) => r.data),

  create: (data) => api.post(URL, data).then((r) => r.data),

  update: (id, data) => api.put(`${URL}/${id}`, data).then((r) => r.data),

  delete: (id) => api.delete(`${URL}/${id}`),
};

export default foodService;
