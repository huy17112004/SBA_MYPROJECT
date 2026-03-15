import React, { createContext, useContext, useReducer, ReactNode, useCallback, useEffect } from 'react';
import { Category, MenuItem, DiningTable, Order, OrderItem } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface AppState {
  categories: Category[];
  menuItems: MenuItem[];
  tables: DiningTable[];
  orders: Order[];
  darkMode: boolean;
  loading: boolean;
}

type Action =
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_MENU_ITEMS'; payload: MenuItem[] }
  | { type: 'SET_TABLES'; payload: DiningTable[] }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string | number }
  | { type: 'UPDATE_MENU_ITEM'; payload: MenuItem }
  | { type: 'DELETE_MENU_ITEM'; payload: string | number }
  | { type: 'UPDATE_TABLE'; payload: DiningTable }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_DARK_MODE' };

const initialState: AppState = {
  categories: [],
  menuItems: [],
  tables: [],
  orders: [],
  darkMode: false,
  loading: true,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_CATEGORIES': return { ...state, categories: action.payload };
    case 'SET_MENU_ITEMS': return { ...state, menuItems: action.payload };
    case 'SET_TABLES': return { ...state, tables: action.payload };
    case 'SET_ORDERS': return { ...state, orders: action.payload };
    case 'UPDATE_CATEGORY':
      const catExists = state.categories.find(c => c.id === action.payload.id);
      return {
        ...state,
        categories: catExists
          ? state.categories.map(c => c.id === action.payload.id ? action.payload : c)
          : [...state.categories, action.payload]
      };
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c.id !== action.payload) };
    case 'UPDATE_MENU_ITEM':
      const itemExists = state.menuItems.find(m => m.id === action.payload.id);
      return {
        ...state,
        menuItems: itemExists
          ? state.menuItems.map(m => m.id === action.payload.id ? action.payload : m)
          : [...state.menuItems, action.payload]
      };
    case 'DELETE_MENU_ITEM':
      return { ...state, menuItems: state.menuItems.filter(m => m.id !== action.payload) };
    case 'UPDATE_TABLE':
      const tableExists = state.tables.find(t => t.id === action.payload.id);
      return {
        ...state,
        tables: tableExists
          ? state.tables.map(t => t.id === action.payload.id ? action.payload : t)
          : [...state.tables, action.payload]
      };
    case 'UPDATE_ORDER':
      const orderExists = state.orders.find(o => o.id === action.payload.id);
      return {
        ...state,
        orders: orderExists
          ? state.orders.map(o => o.id === action.payload.id ? action.payload : o)
          : [...state.orders, action.payload]
      };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'TOGGLE_DARK_MODE': return { ...state, darkMode: !state.darkMode };
    default: return state;
  }
}

interface StoreContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  refreshData: () => Promise<void>;
  actions: {
    // Categories
    addCategory: (data: Omit<Category, 'id'>) => Promise<void>;
    updateCategory: (id: string | number, data: Omit<Category, 'id'>) => Promise<void>;
    deleteCategory: (id: string | number) => Promise<void>;
    // Menu Items
    addMenuItem: (data: any) => Promise<void>;
    updateMenuItem: (id: string | number, data: any) => Promise<void>;
    deleteMenuItem: (id: string | number) => Promise<void>;
    toggleMenuItemAvailable: (id: string | number) => Promise<void>;
    // Tables
    addTable: (data: any) => Promise<void>;
    updateTable: (id: string | number, data: any) => Promise<void>;
    deleteTable: (id: string | number) => Promise<void>;
    // Orders
    createOrder: (tableId: string | number) => Promise<Order>;
    addOrderItems: (orderId: string | number, items: { menuItemId: string | number; quantity: number; note: string }[]) => Promise<void>;
    updateOrderItem: (orderId: string | number, itemId: string | number, quantity: number, note: string) => Promise<void>;
    removeOrderItem: (orderId: string | number, itemId: string | number) => Promise<void>;
    markItemServed: (orderId: string | number, itemId: string | number) => Promise<void>;
    payOrder: (orderId: string | number, paymentMethod: string) => Promise<void>;
  };
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refreshData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [cats, items, tables, activeOrders] = await Promise.all([
        api.get<Category[]>('/categories'),
        api.get<MenuItem[]>('/menu-items'),
        api.get<DiningTable[]>('/dining-tables'),
        api.get<Order[]>('/orders/active'),
      ]);
      dispatch({ type: 'SET_CATEGORIES', payload: cats });
      dispatch({ type: 'SET_MENU_ITEMS', payload: items });
      dispatch({ type: 'SET_TABLES', payload: tables });
      dispatch({ type: 'SET_ORDERS', payload: activeOrders });
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Không thể kết nối với máy chủ');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode);
  }, [state.darkMode]);

  const actions = {
    addCategory: async (data: Omit<Category, 'id'>) => {
      try {
        const res = await api.post<Category>('/categories', data);
        dispatch({ type: 'UPDATE_CATEGORY', payload: res });
        toast.success('Đã thêm danh mục');
      } catch (error: any) {
        toast.error(error.message || 'Không thể thêm danh mục');
      }
    },
    updateCategory: async (id: string | number, data: Omit<Category, 'id'>) => {
      try {
        const res = await api.put<Category>(`/categories/${id}`, data);
        dispatch({ type: 'UPDATE_CATEGORY', payload: res });
        toast.success('Đã cập nhật danh mục');
      } catch (error: any) {
        toast.error(error.message || 'Không thể cập nhật danh mục');
      }
    },
    deleteCategory: async (id: string | number) => {
      try {
        await api.delete(`/categories/${id}`);
        dispatch({ type: 'DELETE_CATEGORY', payload: id });
        toast.success('Đã xóa danh mục');
      } catch (error: any) {
        toast.error(error.message || 'Không thể xóa danh mục');
      }
    },
    addMenuItem: async (data: any) => {
      try {
        const res = await api.post<MenuItem>('/menu-items', data);
        dispatch({ type: 'UPDATE_MENU_ITEM', payload: res });
        toast.success('Đã thêm món');
      } catch (error: any) {
        toast.error(error.message || 'Không thể thêm món');
      }
    },
    updateMenuItem: async (id: string | number, data: any) => {
      try {
        const res = await api.put<MenuItem>(`/menu-items/${id}`, data);
        dispatch({ type: 'UPDATE_MENU_ITEM', payload: res });
        toast.success('Đã cập nhật món');
      } catch (error: any) {
        toast.error(error.message || 'Không thể cập nhật món');
      }
    },
    deleteMenuItem: async (id: string | number) => {
      try {
        await api.delete(`/menu-items/${id}`);
        dispatch({ type: 'DELETE_MENU_ITEM', payload: id });
        toast.success('Đã xóa món');
      } catch (error: any) {
        toast.error(error.message || 'Không thể xóa món');
      }
    },
    toggleMenuItemAvailable: async (id: string | number) => {
      try {
        const res = await api.patch<MenuItem>(`/menu-items/${id}/toggle-availability`);
        dispatch({ type: 'UPDATE_MENU_ITEM', payload: res });
      } catch (error: any) {
        toast.error(error.message || 'Không thể cập nhật trạng thái món');
      }
    },
    addTable: async (data: any) => {
      try {
        const res = await api.post<DiningTable>('/dining-tables', data);
        dispatch({ type: 'UPDATE_TABLE', payload: res });
        toast.success('Đã thêm bàn');
      } catch (error: any) {
        toast.error(error.message || 'Không thể thêm bàn');
      }
    },
    updateTable: async (id: string | number, data: any) => {
      try {
        const res = await api.put<DiningTable>(`/dining-tables/${id}`, data);
        dispatch({ type: 'UPDATE_TABLE', payload: res });
        toast.success('Đã cập nhật bàn');
      } catch (error: any) {
        toast.error(error.message || 'Không thể cập nhật bàn');
      }
    },
    deleteTable: async (id: string | number) => {
      try {
        await api.delete(`/dining-tables/${id}`);
        dispatch({ type: 'SET_TABLES', payload: state.tables.filter(t => t.id !== id) });
        toast.success('Đã xóa bàn');
      } catch (error: any) {
        toast.error(error.message || 'Không thể xóa bàn');
      }
    },
    createOrder: async (tableId: string | number) => {
      try {
        const res = await api.post<Order>('/orders', { tableId });
        dispatch({ type: 'UPDATE_ORDER', payload: res });
        const updatedTable = await api.get<DiningTable>(`/dining-tables/${tableId}`);
        dispatch({ type: 'UPDATE_TABLE', payload: updatedTable });
        toast.success('Đã tạo order');
        return res;
      } catch (error: any) {
        toast.error(error.message || 'Không thể tạo order');
        throw error;
      }
    },
    addOrderItems: async (orderId: string | number, items: any[]) => {
      try {
        const res = await api.post<Order>(`/orders/${orderId}/items`, { items });
        dispatch({ type: 'UPDATE_ORDER', payload: res });
        toast.success('Đã thêm món');
      } catch (error: any) {
        toast.error(error.message || 'Không thể thêm món');
      }
    },
    updateOrderItem: async (orderId: string | number, itemId: string | number, quantity: number, note: string) => {
      try {
        const res = await api.put<Order>(`/orders/${orderId}/items/${itemId}`, { quantity, note });
        dispatch({ type: 'UPDATE_ORDER', payload: res });
      } catch (error: any) {
        toast.error(error.message || 'Không thể cập nhật món');
      }
    },
    removeOrderItem: async (orderId: string | number, itemId: string | number) => {
      try {
        const res = await api.delete<Order>(`/orders/${orderId}/items/${itemId}`);
        dispatch({ type: 'UPDATE_ORDER', payload: res });
        toast.success('Đã xóa món');
      } catch (error: any) {
        toast.error(error.message || 'Không thể xóa món');
      }
    },
    markItemServed: async (orderId: string | number, itemId: string | number) => {
      try {
        const res = await api.patch<Order>(`/orders/${orderId}/items/${itemId}/serve`);
        dispatch({ type: 'UPDATE_ORDER', payload: res });
        toast.success('Đã phục vụ món');
      } catch (error: any) {
        toast.error(error.message || 'Không thể cập nhật trạng thái món');
      }
    },
    payOrder: async (orderId: string | number, paymentMethod: string) => {
      try {
        const res = await api.patch<Order>(`/orders/${orderId}/pay`, { paymentMethod });
        dispatch({ type: 'SET_ORDERS', payload: state.orders.filter(o => o.id !== orderId) });
        const tables = await api.get<DiningTable[]>('/dining-tables');
        dispatch({ type: 'SET_TABLES', payload: tables });
        toast.success('Đã thanh toán');
      } catch (error: any) {
        toast.error(error.message || 'Không thể thanh toán');
      }
    }
  };

  return (
    <StoreContext.Provider value={{ state, dispatch, refreshData, actions }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be within StoreProvider');
  return ctx;
}
