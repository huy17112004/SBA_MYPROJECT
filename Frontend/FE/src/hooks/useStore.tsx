import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Category, MenuItem, DiningTable, Order, OrderItem } from '@/types';
import { initialCategories, initialMenuItems, initialTables, initialOrders } from '@/data/mockData';
import { generateId } from '@/lib/format';

interface AppState {
  categories: Category[];
  menuItems: MenuItem[];
  tables: DiningTable[];
  orders: Order[];
  darkMode: boolean;
}

type Action =
  | { type: 'ADD_CATEGORY'; payload: Omit<Category, 'id'> }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_MENU_ITEM'; payload: Omit<MenuItem, 'id'> }
  | { type: 'UPDATE_MENU_ITEM'; payload: MenuItem }
  | { type: 'DELETE_MENU_ITEM'; payload: string }
  | { type: 'TOGGLE_MENU_ITEM_AVAILABLE'; payload: string }
  | { type: 'ADD_TABLE'; payload: Omit<DiningTable, 'id'> }
  | { type: 'UPDATE_TABLE'; payload: DiningTable }
  | { type: 'DELETE_TABLE'; payload: string }
  | { type: 'SET_TABLE_STATUS'; payload: { id: string; status: DiningTable['status'] } }
  | { type: 'CREATE_ORDER'; payload: { tableId: string; tableName: string } }
  | { type: 'ADD_ORDER_ITEMS'; payload: { orderId: string; items: Omit<OrderItem, 'id' | 'createdAt'>[] } }
  | { type: 'UPDATE_ORDER_ITEM_QTY'; payload: { orderId: string; itemId: string; quantity: number } }
  | { type: 'REMOVE_ORDER_ITEM'; payload: { orderId: string; itemId: string } }
  | { type: 'MARK_ITEM_SERVED'; payload: { orderId: string; itemId: string } }
  | { type: 'PAY_ORDER'; payload: { orderId: string; paymentMethod: 'cash' | 'transfer' } }
  | { type: 'CANCEL_ORDER'; payload: string }
  | { type: 'MOVE_TABLE'; payload: { orderId: string; newTableId: string; newTableName: string } }
  | { type: 'TOGGLE_DARK_MODE' };

const initialState: AppState = {
  categories: initialCategories,
  menuItems: initialMenuItems,
  tables: initialTables,
  orders: initialOrders,
  darkMode: false,
};

function calcTotal(items: OrderItem[]): number {
  return items.reduce((s, i) => s + i.price * i.quantity, 0);
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, { ...action.payload, id: generateId() }] };
    case 'UPDATE_CATEGORY':
      return { ...state, categories: state.categories.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c.id !== action.payload) };
    case 'ADD_MENU_ITEM':
      return { ...state, menuItems: [...state.menuItems, { ...action.payload, id: generateId() }] };
    case 'UPDATE_MENU_ITEM':
      return { ...state, menuItems: state.menuItems.map(m => m.id === action.payload.id ? action.payload : m) };
    case 'DELETE_MENU_ITEM':
      return { ...state, menuItems: state.menuItems.filter(m => m.id !== action.payload) };
    case 'TOGGLE_MENU_ITEM_AVAILABLE':
      return { ...state, menuItems: state.menuItems.map(m => m.id === action.payload ? { ...m, available: !m.available } : m) };
    case 'ADD_TABLE':
      return { ...state, tables: [...state.tables, { ...action.payload, id: generateId() }] };
    case 'UPDATE_TABLE':
      return { ...state, tables: state.tables.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TABLE':
      return { ...state, tables: state.tables.filter(t => t.id !== action.payload) };
    case 'SET_TABLE_STATUS':
      return { ...state, tables: state.tables.map(t => t.id === action.payload.id ? { ...t, status: action.payload.status } : t) };
    case 'CREATE_ORDER': {
      const newOrder: Order = {
        id: generateId(), tableId: action.payload.tableId, tableName: action.payload.tableName,
        items: [], status: 'active', createdAt: new Date(), paidAt: null, paymentMethod: null, totalAmount: 0,
      };
      return {
        ...state,
        orders: [...state.orders, newOrder],
        tables: state.tables.map(t => t.id === action.payload.tableId ? { ...t, status: 'occupied' } : t),
      };
    }
    case 'ADD_ORDER_ITEMS': {
      return {
        ...state,
        orders: state.orders.map(o => {
          if (o.id !== action.payload.orderId) return o;
          const newItems: OrderItem[] = action.payload.items.map(item => ({ ...item, id: generateId(), createdAt: new Date() }));
          const allItems = [...o.items, ...newItems];
          return { ...o, items: allItems, totalAmount: calcTotal(allItems) };
        }),
      };
    }
    case 'UPDATE_ORDER_ITEM_QTY': {
      return {
        ...state,
        orders: state.orders.map(o => {
          if (o.id !== action.payload.orderId) return o;
          const items = action.payload.quantity <= 0
            ? o.items.filter(i => i.id !== action.payload.itemId)
            : o.items.map(i => i.id === action.payload.itemId ? { ...i, quantity: action.payload.quantity } : i);
          return { ...o, items, totalAmount: calcTotal(items) };
        }),
      };
    }
    case 'REMOVE_ORDER_ITEM': {
      return {
        ...state,
        orders: state.orders.map(o => {
          if (o.id !== action.payload.orderId) return o;
          const items = o.items.filter(i => i.id !== action.payload.itemId);
          return { ...o, items, totalAmount: calcTotal(items) };
        }),
      };
    }
    case 'MARK_ITEM_SERVED':
      return {
        ...state,
        orders: state.orders.map(o => {
          if (o.id !== action.payload.orderId) return o;
          return { ...o, items: o.items.map(i => i.id === action.payload.itemId ? { ...i, status: 'served' as const } : i) };
        }),
      };
    case 'PAY_ORDER': {
      let paidTableId = '';
      const orders = state.orders.map(o => {
        if (o.id !== action.payload.orderId) return o;
        paidTableId = o.tableId;
        return { ...o, status: 'paid' as const, paidAt: new Date(), paymentMethod: action.payload.paymentMethod };
      });
      return {
        ...state,
        orders,
        tables: state.tables.map(t => t.id === paidTableId ? { ...t, status: 'empty' as const, note: '' } : t),
      };
    }
    case 'CANCEL_ORDER': {
      let cancelTableId = '';
      const orders = state.orders.map(o => {
        if (o.id !== action.payload) return o;
        cancelTableId = o.tableId;
        return { ...o, status: 'cancelled' as const };
      });
      return {
        ...state,
        orders,
        tables: state.tables.map(t => t.id === cancelTableId ? { ...t, status: 'empty' as const } : t),
      };
    }
    case 'MOVE_TABLE': {
      let oldTableId = '';
      const orders = state.orders.map(o => {
        if (o.id !== action.payload.orderId) return o;
        oldTableId = o.tableId;
        return { ...o, tableId: action.payload.newTableId, tableName: action.payload.newTableName };
      });
      return {
        ...state,
        orders,
        tables: state.tables.map(t => {
          if (t.id === oldTableId) return { ...t, status: 'empty' as const };
          if (t.id === action.payload.newTableId) return { ...t, status: 'occupied' as const };
          return t;
        }),
      };
    }
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };
    default:
      return state;
  }
}

const StoreContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode);
  }, [state.darkMode]);

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be within StoreProvider');
  return ctx;
}
