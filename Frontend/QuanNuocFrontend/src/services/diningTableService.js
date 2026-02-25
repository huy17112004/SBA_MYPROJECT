import api from './api';

const diningTableService = {
    getAll: () => api.get('/dining-tables'),
    getById: (id) => api.get(`/dining-tables/${id}`),
    create: (data) => api.post('/dining-tables', data),
    update: (id, data) => api.put(`/dining-tables/${id}`, data),
    delete: (id) => api.delete(`/dining-tables/${id}`),
};

export default diningTableService;
