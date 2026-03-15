import api from './api';

export const getActiveOrders = () => api.get('/orders/active');
export const getOrderHistory = (page = 0, size = 10) => api.get(`/orders/history?page=${page}&size=${size}`);
export const getOrder = (id) => api.get(`/orders/${id}`);
export const getActiveOrderByTable = (tableId) => api.get(`/orders/table/${tableId}`);
export const createOrder = (data) => api.post('/orders', data);
export const addOrderItem = (orderId, data) => api.post(`/orders/${orderId}/items`, data);
export const updateOrderItem = (orderId, itemId, data) => api.put(`/orders/${orderId}/items/${itemId}`, data);
export const deleteOrderItem = (orderId, itemId) => api.delete(`/orders/${orderId}/items/${itemId}`);
export const payOrder = (orderId, data) => api.patch(`/orders/${orderId}/pay`, data);

// Kitchen
export const getPendingOrderItems = (page = 0, size = 100) => api.get(`/orders/kitchen/pending?page=${page}&size=${size}`);
export const markItemAsServed = (orderId, itemId) => api.patch(`/orders/${orderId}/items/${itemId}/serve`);