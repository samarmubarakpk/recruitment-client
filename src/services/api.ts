import axios from 'axios';

const API_URL = 'https://localhost:7000/api'; // Adjust this to your actual backend URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id: number) => api.get(`/users/${id}`),
  create: (user: any) => api.post('/users', user),
  update: (id: number, user: any) => api.put(`/users/${id}`, user),
  delete: (id: number) => api.delete(`/users/${id}`)
};

export const companyService = {
  getAll: () => api.get('/companies'),
  getById: (id: number) => api.get(`/companies/${id}`),
  create: (company: any) => api.post('/companies', company),
  update: (id: number, company: any) => api.put(`/companies/${id}`, company),
  delete: (id: number) => api.delete(`/companies/${id}`)
};

export const vacancyService = {
  getAll: () => api.get('/jobvacancies'),
  getById: (id: number) => api.get(`/jobvacancies/${id}`),
  create: (vacancy: any) => api.post('/jobvacancies', vacancy),
  update: (id: number, vacancy: any) => api.put(`/jobvacancies/${id}`, vacancy),
  delete: (id: number) => api.delete(`/jobvacancies/${id}`)
};

export default api;