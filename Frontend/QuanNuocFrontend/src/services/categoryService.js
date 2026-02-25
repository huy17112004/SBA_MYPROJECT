import api from './api';

const API_URL = '/categories';

const categoryService = {
    getAll: () => api.get(API_URL),
    getById: (id) => api.get(`${API_URL}/${id}`),
    create: (data) => api.post(API_URL, data),
    update: (id, data) => api.put(`${API_URL}/${id}`, data),
    delete: (id) => api.delete(`${API_URL}/${id}`),
};

export default categoryService;
