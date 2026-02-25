import api from './api';

const API_URL = '/menu-items';

const menuItemService = {
    getAll: (params = {}) => api.get(API_URL, { params }),
    getById: (id) => api.get(`${API_URL}/${id}`),
    create: (data) => api.post(API_URL, data),
    update: (id, data) => api.put(`${API_URL}/${id}`, data),
    delete: (id) => api.delete(`${API_URL}/${id}`),
    toggleAvailability: (id) => api.patch(`${API_URL}/${id}/toggle-availability`),
};

export default menuItemService;
