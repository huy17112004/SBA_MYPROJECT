export interface Category {
  id: number;
  name: string;
  displayOrder?: number;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  categoryName?: string;
  description?: string;
  available: boolean;
}

export type TableStatus = 'available' | 'occupied' | 'waiting';

export interface DiningTable {
  id: string;
  name: string;
  seats: number;
  status: TableStatus;
  note?: string;
}

export type OrderStatus = 'active' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'transfer';

export interface OrderItem {
  id: string;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  priceAtTime: number;
  note?: string;
  served: boolean;
}

export interface Order {
  id: string;
  tableId: string;
  tableName: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: Date;
  completedAt?: Date;
  total: number;
  paymentMethod?: PaymentMethod;
  note?: string;
}
