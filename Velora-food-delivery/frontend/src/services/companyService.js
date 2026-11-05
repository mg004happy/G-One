import api from '../api/axios';

const companyService = {
  getAvailable: () => api.get('/api/companies').then((response) => response.data),
};

export default companyService;
