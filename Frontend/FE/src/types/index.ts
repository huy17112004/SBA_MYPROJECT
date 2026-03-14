export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  description: string;
  available: boolean;
}

export interface DiningTable {
  id: string;
  name: string;
  status: 'empty' | 'occupied' | 'waiting_payment';
  seats: number;
  note: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  note: string;
  price: number;
  status: 'pending' | 'served';
  createdAt: Date;
}

export interface Order {
  id: string;
  tableId: string;
  tableName: string;
  items: OrderItem[];
  status: 'active' | 'paid' | 'cancelled';
  createdAt: Date;
  paidAt: Date | null;
  paymentMethod: 'cash' | 'transfer' | null;
  totalAmount: number;
}

export type PaymentMethod = 'cash' | 'transfer';
