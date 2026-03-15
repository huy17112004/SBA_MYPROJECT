const BASE_URL = 'http://localhost:8080/api';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Something went wrong');
  }
  const result: ApiResponse<T> = await response.json();
  return result.data;
}

export const api = {
  get: async <T>(url: string) => {
    const response = await fetch(`${BASE_URL}${url}`);
    return handleResponse<T>(response);
  },
  post: async <T>(url: string, body: any) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },
  put: async <T>(url: string, body: any) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },
  patch: async <T>(url: string, body?: any) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },
  delete: async <T>(url: string) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'DELETE',
    });
    return handleResponse<T>(response);
  },
};
