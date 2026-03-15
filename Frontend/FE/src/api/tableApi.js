import api from './api';

export const getTables = () => api.get('/dining-tables');
export const getTable = (id) => api.get(`/dining-tables/${id}`);
export const createTable = (data) => api.post('/dining-tables', data);
export const updateTable = (id, data) => api.put(`/dining-tables/${id}`, data);
export const deleteTable = (id) => api.delete(`/dining-tables/${id}`);