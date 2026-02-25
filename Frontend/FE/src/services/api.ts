import type { Category, MenuItem } from '@/types';

const API_BASE = '/api';

// --- Generic API helper ---

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const json: ApiResponse<T> = await res.json();

  if (!res.ok || json.code !== 200) {
    throw new Error(json.message || 'Lỗi không xác định');
  }

  return json.data;
}

// --- Category APIs ---

export async function fetchCategories(): Promise<Category[]> {
  return apiRequest<Category[]>('/categories');
}

export async function createCategory(data: {
  name: string;
  displayOrder?: number;
}): Promise<Category> {
  return apiRequest<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(
  id: number,
  data: { name: string; displayOrder?: number }
): Promise<Category> {
  return apiRequest<Category>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: number): Promise<void> {
  return apiRequest<void>(`/categories/${id}`, { method: 'DELETE' });
}

// --- MenuItem APIs ---

export interface MenuItemParams {
  categoryId?: number;
  available?: boolean;
  keyword?: string;
}

export async function fetchMenuItems(
  params?: MenuItemParams
): Promise<MenuItem[]> {
  const searchParams = new URLSearchParams();
  if (params?.categoryId != null)
    searchParams.set('categoryId', String(params.categoryId));
  if (params?.available != null)
    searchParams.set('available', String(params.available));
  if (params?.keyword) searchParams.set('keyword', params.keyword);

  const qs = searchParams.toString();
  return apiRequest<MenuItem[]>(`/menu-items${qs ? `?${qs}` : ''}`);
}

export async function createMenuItem(data: {
  name: string;
  price: number;
  categoryId: number;
  description?: string;
  available?: boolean;
}): Promise<MenuItem> {
  return apiRequest<MenuItem>('/menu-items', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMenuItem(
  id: number,
  data: {
    name: string;
    price: number;
    categoryId: number;
    description?: string;
    available?: boolean;
  }
): Promise<MenuItem> {
  return apiRequest<MenuItem>(`/menu-items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function toggleMenuItemAvailability(
  id: number
): Promise<MenuItem> {
  return apiRequest<MenuItem>(`/menu-items/${id}/toggle-availability`, {
    method: 'PATCH',
  });
}

export async function deleteMenuItem(id: number): Promise<void> {
  return apiRequest<void>(`/menu-items/${id}`, { method: 'DELETE' });
}
