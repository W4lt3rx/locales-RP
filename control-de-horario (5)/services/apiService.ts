
import { User, Product, TimeLog, SaleLog, LocaleType, WorkSession, ShiftLog, API_BASE_URL } from '../types';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error en la petición');
  }
  return response.json();
};

export const ApiService = {
  // --- Auth ---
  login: async (username: string, password: string): Promise<User> => {
    const res = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return handleResponse(res);
  },

  // --- Data Fetching ---
  getAllData: async () => {
    const res = await fetch(`${API_BASE_URL}/api/data`);
    return handleResponse(res);
  },

  getProducts: async (locale: LocaleType): Promise<Product[]> => {
    const res = await fetch(`${API_BASE_URL}/api/products/${locale}`);
    return handleResponse(res);
  },

  // --- Clocking ---
  clockAction: async (actionData: any) => {
    const res = await fetch(`${API_BASE_URL}/api/clock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actionData)
    });
    return handleResponse(res);
  },

  // --- Calculator ---
  registerSale: async (saleData: any) => {
    const res = await fetch(`${API_BASE_URL}/api/sale`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleData)
    });
    return handleResponse(res);
  },

  // --- Admin ---
  saveUser: async (user: User) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    return handleResponse(res);
  },

  deleteUser: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  saveProducts: async (locale: LocaleType, products: Product[]) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale, products })
    });
    return handleResponse(res);
  },

  deleteShift: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/shifts/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  clearHistory: async (userId: string, locale: LocaleType) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/clear-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, locale })
    });
    return handleResponse(res);
  }
};
