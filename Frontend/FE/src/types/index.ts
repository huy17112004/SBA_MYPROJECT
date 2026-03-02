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

export type TableStatus = 'AVAILABLE' | 'OCCUPIED';

export interface DiningTable {
  id: number;
  name: string;
  seats: number;
  status: TableStatus;
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
