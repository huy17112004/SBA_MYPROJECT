import api from './api';

export const getMenuItems = (params = {}) => api.get('/menu-items', { params });
export const getMenuItem = (id) => api.get(`/menu-items/${id}`);
export const createMenuItem = (data) => api.post('/menu-items', data);
export const updateMenuItem = (id, data) => api.put(`/menu-items/${id}`, data);
export const deleteMenuItem = (id) => api.delete(`/menu-items/${id}`);
export const toggleMenuItemAvailability = (id) => api.patch(`/menu-items/${id}/toggle-availability`);

export const getCategories = () => api.get('/categories');
export const createCategory = (data) => api.post('/categories', data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);