import api from '../api/axios';

const employeeService = {
  listForRestaurant: (restaurantId) => api.get(`/api/restaurants/${restaurantId}/employees`).then((r) => r.data),
  listTieUpCustomers: (restaurantId) => api.get(`/api/restaurants/${restaurantId}/employees/customers`).then((r) => r.data),
  listTieUpDepartures: (restaurantId) => api.get(`/api/restaurants/${restaurantId}/employees/departures`).then((r) => r.data),
  add: (restaurantId, data) => api.post(`/api/restaurants/${restaurantId}/employees`, data).then((r) => r.data),
  remove: (restaurantId, employeeRecordId) => api.delete(`/api/restaurants/${restaurantId}/employees/${employeeRecordId}`),
  listForAdmin: (restaurantId) => api.get(`/api/admin/restaurants/${restaurantId}/employees`).then((r) => r.data),
  listDeparturesForAdmin: (restaurantId) => api.get(`/api/admin/restaurants/${restaurantId}/employees/departures`).then((r) => r.data),
};

export default employeeService;
