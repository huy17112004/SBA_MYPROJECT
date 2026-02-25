import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Category, MenuItem, DiningTable, Order, OrderItem, TableStatus, OrderStatus, PaymentMethod } from '@/types';
import { defaultTables, defaultOrders } from '@/data/mockData';
import { generateId } from '@/lib/utils';
import * as api from '@/services/api';

interface AppContextType {
  // Data
  categories: Category[];
  menuItems: MenuItem[];
  tables: DiningTable[];
  orders: Order[];
  loading: boolean;

  // Category ops
  addCategory: (cat: { name: string; displayOrder?: number }) => Promise<void>;
  updateCategory: (id: number, cat: { name: string; displayOrder?: number }) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;

  // Menu Item ops
  addMenuItem: (item: { name: string; price: number; categoryId: number; description?: string; available?: boolean }) => Promise<void>;
  updateMenuItem: (id: number, item: { name: string; price: number; categoryId: number; description?: string; available?: boolean }) => Promise<void>;
  deleteMenuItem: (id: number) => Promise<void>;
  toggleMenuItemAvailability: (id: number) => Promise<void>;

  // Table ops (still local)
  addTable: (table: Omit<DiningTable, 'id'>) => void;
  updateTable: (id: string, table: Partial<DiningTable>) => void;
  deleteTable: (id: string) => void;
  updateTableStatus: (id: string, status: TableStatus) => void;

  // Order ops (still local)
  createOrder: (tableId: string) => Order;
  getActiveOrderForTable: (tableId: string) => Order | undefined;
  addItemToOrder: (orderId: string, menuItem: MenuItem, note?: string) => void;
  removeItemFromOrder: (orderId: string, itemId: string) => void;
  updateOrderItemQuantity: (orderId: string, itemId: string, quantity: number) => void;
  updateOrderItemNote: (orderId: string, itemId: string, note: string) => void;
  markItemServed: (orderId: string, itemId: string) => void;
  completePayment: (orderId: string, method: PaymentMethod) => void;
  cancelOrder: (orderId: string) => void;
  getActiveOrders: () => Order[];
  getCompletedOrders: () => Order[];
  getTodayRevenue: () => number;
  getTodayOrderCount: () => number;

  // Refresh helpers
  refreshCategories: () => Promise<void>;
  refreshMenuItems: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<DiningTable[]>(defaultTables);
  const [orders, setOrders] = useState<Order[]>(defaultOrders);
  const [loading, setLoading] = useState(true);

  // --- Fetch from API on mount ---
  const refreshCategories = useCallback(async () => {
    const data = await api.fetchCategories();
    setCategories(data);
  }, []);

  const refreshMenuItems = useCallback(async () => {
    const data = await api.fetchMenuItems();
    setMenuItems(data);
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        await Promise.all([refreshCategories(), refreshMenuItems()]);
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [refreshCategories, refreshMenuItems]);

  // --- Category CRUD (API) ---
  const addCategory = useCallback(async (cat: { name: string; displayOrder?: number }) => {
    const created = await api.createCategory(cat);
    setCategories(prev => [...prev, created]);
  }, []);

  const updateCategory = useCallback(async (id: number, cat: { name: string; displayOrder?: number }) => {
    const updated = await api.updateCategory(id, cat);
    setCategories(prev => prev.map(c => c.id === id ? updated : c));
  }, []);

  const deleteCategory = useCallback(async (id: number) => {
    await api.deleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  // --- MenuItem CRUD (API) ---
  const addMenuItem = useCallback(async (item: { name: string; price: number; categoryId: number; description?: string; available?: boolean }) => {
    const created = await api.createMenuItem(item);
    setMenuItems(prev => [...prev, created]);
  }, []);

  const updateMenuItem = useCallback(async (id: number, item: { name: string; price: number; categoryId: number; description?: string; available?: boolean }) => {
    const updated = await api.updateMenuItem(id, item);
    setMenuItems(prev => prev.map(m => m.id === id ? updated : m));
  }, []);

  const deleteMenuItem = useCallback(async (id: number) => {
    await api.deleteMenuItem(id);
    setMenuItems(prev => prev.filter(m => m.id !== id));
  }, []);

  const toggleMenuItemAvailability = useCallback(async (id: number) => {
    const updated = await api.toggleMenuItemAvailability(id);
    setMenuItems(prev => prev.map(m => m.id === id ? updated : m));
  }, []);

  // --- Tables (still local state) ---
  const addTable = useCallback((table: Omit<DiningTable, 'id'>) => {
    setTables(prev => [...prev, { ...table, id: generateId() }]);
  }, []);
  const updateTable = useCallback((id: string, table: Partial<DiningTable>) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, ...table } : t));
  }, []);
  const deleteTable = useCallback((id: string) => {
    setTables(prev => prev.filter(t => t.id !== id));
  }, []);
  const updateTableStatus = useCallback((id: string, status: TableStatus) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  }, []);

  // --- Orders (still local state) ---
  const createOrder = useCallback((tableId: string): Order => {
    const table = tables.find(t => t.id === tableId);
    const order: Order = {
      id: generateId(),
      tableId,
      tableName: table?.name || 'Unknown',
      items: [],
      status: 'active',
      createdAt: new Date(),
      total: 0,
    };
    setOrders(prev => [...prev, order]);
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'occupied' as TableStatus } : t));
    return order;
  }, [tables]);

  const getActiveOrderForTable = useCallback((tableId: string) => {
    return orders.find(o => o.tableId === tableId && o.status === 'active');
  }, [orders]);

  const addItemToOrder = useCallback((orderId: string, menuItem: MenuItem, note?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const existing = o.items.find(i => i.menuItemId === menuItem.id && i.note === (note || ''));
      let newItems: OrderItem[];
      if (existing) {
        newItems = o.items.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        newItems = [...o.items, {
          id: generateId(),
          menuItemId: menuItem.id,
          menuItemName: menuItem.name,
          quantity: 1,
          priceAtTime: menuItem.price,
          note: note || '',
          served: false,
        }];
      }
      const total = newItems.reduce((sum, i) => sum + i.priceAtTime * i.quantity, 0);
      return { ...o, items: newItems, total };
    }));
  }, []);

  const removeItemFromOrder = useCallback((orderId: string, itemId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const newItems = o.items.filter(i => i.id !== itemId);
      const total = newItems.reduce((sum, i) => sum + i.priceAtTime * i.quantity, 0);
      return { ...o, items: newItems, total };
    }));
  }, []);

  const updateOrderItemQuantity = useCallback((orderId: string, itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromOrder(orderId, itemId);
      return;
    }
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const newItems = o.items.map(i => i.id === itemId ? { ...i, quantity } : i);
      const total = newItems.reduce((sum, i) => sum + i.priceAtTime * i.quantity, 0);
      return { ...o, items: newItems, total };
    }));
  }, [removeItemFromOrder]);

  const updateOrderItemNote = useCallback((orderId: string, itemId: string, note: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return { ...o, items: o.items.map(i => i.id === itemId ? { ...i, note } : i) };
    }));
  }, []);

  const markItemServed = useCallback((orderId: string, itemId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return { ...o, items: o.items.map(i => i.id === itemId ? { ...i, served: !i.served } : i) };
    }));
  }, []);

  const completePayment = useCallback((orderId: string, method: PaymentMethod) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return { ...o, status: 'completed' as OrderStatus, completedAt: new Date(), paymentMethod: method };
    }));
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setTables(prev => prev.map(t => t.id === order.tableId ? { ...t, status: 'available' as TableStatus } : t));
    }
  }, [orders]);

  const cancelOrder = useCallback((orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' as OrderStatus } : o));
    if (order) {
      setTables(prev => prev.map(t => t.id === order.tableId ? { ...t, status: 'available' as TableStatus } : t));
    }
  }, [orders]);

  const getActiveOrders = useCallback(() => {
    return orders.filter(o => o.status === 'active').sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }, [orders]);

  const getCompletedOrders = useCallback(() => {
    return orders.filter(o => o.status === 'completed').sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0));
  }, [orders]);

  const getTodayRevenue = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return orders
      .filter(o => o.status === 'completed' && o.completedAt && o.completedAt >= today)
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  const getTodayOrderCount = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return orders.filter(o => o.status === 'completed' && o.completedAt && o.completedAt >= today).length;
  }, [orders]);

  return (
    <AppContext.Provider value={{
      categories, menuItems, tables, orders, loading,
      addCategory, updateCategory, deleteCategory,
      addMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemAvailability,
      addTable, updateTable, deleteTable, updateTableStatus,
      createOrder, getActiveOrderForTable, addItemToOrder, removeItemFromOrder,
      updateOrderItemQuantity, updateOrderItemNote, markItemServed,
      completePayment, cancelOrder, getActiveOrders, getCompletedOrders,
      getTodayRevenue, getTodayOrderCount,
      refreshCategories, refreshMenuItems,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
