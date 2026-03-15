export interface Category {
  id: string | number;
  name: string;
  description: string;
}

export interface MenuItem {
  id: string | number;
  name: string;
  price: number;
  categoryId: string | number;
  categoryName?: string;
  description: string;
  available: boolean;
}

export interface DiningTable {
  id: string | number;
  name: string;
  status: 'empty' | 'occupied' | 'waiting_payment' | 'occupied' | string;
  seats: number;
  note?: string;
}

export interface OrderItem {
  id: string | number;
  menuItemId: string | number;
  menuItemName: string;
  quantity: number;
  note: string;
  price: number;
  status: 'pending' | 'served' | string;
  orderedAt: Date | string;
}

export interface Order {
  id: string | number;
  tableId: string | number;
  tableName: string;
  items: OrderItem[];
  status: 'active' | 'paid' | 'cancelled' | string;
  createdAt: Date | string;
  paidAt: Date | string | null;
  paymentMethod: 'cash' | 'transfer' | null | string;
  totalAmount: number;
  note?: string;
}

export type PaymentMethod = 'cash' | 'transfer';
