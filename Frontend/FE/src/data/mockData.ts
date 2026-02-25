import { DiningTable, Order } from '@/types';

// Categories and MenuItems are now fetched from the backend API.
// Only Tables and Orders remain as local mock data until backend supports them.

export const defaultTables: DiningTable[] = [
  { id: 'table-1', name: 'Bàn 1', seats: 4, status: 'available' },
  { id: 'table-2', name: 'Bàn 2', seats: 4, status: 'available' },
  { id: 'table-3', name: 'Bàn 3', seats: 6, status: 'available' },
  { id: 'table-4', name: 'Bàn 4', seats: 4, status: 'available' },
  { id: 'table-5', name: 'Bàn 5', seats: 2, status: 'available' },
  { id: 'table-6', name: 'Bàn 6', seats: 4, status: 'available' },
  { id: 'table-7', name: 'Bàn 7', seats: 6, status: 'available' },
  { id: 'table-8', name: 'Bàn 8', seats: 4, status: 'available' },
];

export const defaultOrders: Order[] = [];
