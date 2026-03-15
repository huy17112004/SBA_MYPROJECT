import api from './api';

export const getDailyRevenue = () => api.get('/stats/today');
export const getRevenueStats = (days = 7) => api.get(`/stats/revenue-chart?days=${days}`);
export const getTopItems = (days = 7) => api.get(`/stats/top-items?days=${days}`);