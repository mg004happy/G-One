/**
 * Auth API service — maps to AuthController.
 */
import api from '../api/axios';

const AUTH_URL = '/api/auth';

const authService = {
  /**
   * Register a new user.
   * @param {{ fullName: string, email: string, password: string, role: string }} data
   * @returns {Promise<{ token, fullName, email, role }>}
   */
  register: (data) => api.post(`${AUTH_URL}/register`, data).then((r) => r.data),

  /**
   * Login an existing user.
   * @param {{ email: string, password: string }} data
   * @returns {Promise<{ token, fullName, email, role }>}
   */
  login: (data) => api.post(`${AUTH_URL}/login`, data).then((r) => r.data),

  updateCompanyAffiliation: (data) => api.put(`${AUTH_URL}/company-affiliation`, data).then((r) => r.data),
};

export default authService;
