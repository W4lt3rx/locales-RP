
import { User, Product, TimeLog, SaleLog, LocaleType, WorkSession, ShiftLog } from '../types';

// Initial Data Seed
const INITIAL_USERS: User[] = [
  { id: '0', username: 'admin', password: '123', role: 'admin', allowedLocales: ['yummy', 'uwu'] },
  { id: '1', username: 'jefe', password: '123', role: 'admin', allowedLocales: ['yummy', 'uwu'] },
  { id: '2', username: 'empleado1', password: '123', role: 'worker', allowedLocales: ['yummy'] },
  { id: '3', username: 'empleado2', password: '123', role: 'worker', allowedLocales: ['uwu'] },
];

const INITIAL_PRODUCTS_YUMMY: Product[] = [
  { id: 'y1', name: 'Helado de Vainilla', price: 1300, icon: '🍦', category: 'Helados' },
  { id: 'y2', name: 'Helado de Chocolate', price: 1300, icon: '🍫', category: 'Helados' },
  { id: 'y3', name: 'Helado de Fresa', price: 1300, icon: '🍓', category: 'Helados' },
  { id: 'y4', name: 'Helado de Cookies & Cream', price: 1300, icon: '🍪', category: 'Helados' },
  { id: 'y5', name: 'Helado de Menta', price: 1300, icon: '🌿', category: 'Helados' },
  { id: 'y6', name: 'Helado de Arcoiris', price: 1300, icon: '🌈', category: 'Helados' },
  { id: 'y7', name: 'Smoothie de Fresa', price: 1300, icon: '🍓', category: 'Bebidas' },
  { id: 'y8', name: 'Té Negro', price: 1300, icon: '🥤', category: 'Bebidas' },
  { id: 'y9', name: 'Cappuccino Helado', price: 1300, icon: '☕', category: 'Bebidas' },
  { id: 'y10', name: 'Piña Dulce', price: 1300, icon: '🍍', category: 'Postres' },
  { id: 'y11', name: 'Frappe Chocodream', price: 1300, icon: '🍫', category: 'Bebidas' },
  { id: 'y12', name: 'Limonada & Banana Split', price: 2000, icon: '🍋', category: 'Especial' },
  { id: 'y13', name: 'Cookies & Frappe', price: 2000, icon: '🍪', category: 'Especial' },
  { id: 'y14', name: 'Cajita Sorpresa', price: 15000, icon: '🎁', category: 'Especial' },
];

const INITIAL_PRODUCTS_UWU: Product[] = [
  { id: 'u1', name: 'RAMEN', price: 1500, icon: '🍜', category: 'Comida' },
  { id: 'u2', name: 'SUSHI', price: 1500, icon: '🍣', category: 'Comida' },
  { id: 'u3', name: 'DANGOS', price: 1500, icon: '🍡', category: 'Postres' },
  { id: 'u4', name: 'DUMPLINGS', price: 1500, icon: '🥟', category: 'Comida' },
  { id: 'u5', name: 'DORIYAKIS', price: 1500, icon: '🍘', category: 'Postres' },
  { id: 'u6', name: 'ONIGIRIS', price: 1500, icon: '🍙', category: 'Comida' },
  { id: 'u7', name: 'AWA DE UWU', price: 2000, icon: '🍶', category: 'Bebidas' },
  { id: 'u8', name: 'BUBBLE TEA', price: 1500, icon: '🥤', category: 'Bebidas' },
  { id: 'u9', name: 'TE VERDE', price: 1500, icon: '🍵', category: 'Bebidas' },
  { id: 'u10', name: 'SAKURA MILK', price: 2000, icon: '🌸', category: 'Bebidas' },
  { id: 'u11', name: 'ICE COFFEE', price: 1500, icon: '🧊', category: 'Bebidas' },
  { id: 'u12', name: 'MILKSHAKE FRESA', price: 2000, icon: '🍓', category: 'Bebidas' },
  { id: 'u13', name: 'Cajita Sorpresa', price: 15000, icon: '🎁', category: 'Especial' },
];

// Helper to simulate reading/writing JSON files
const getJSON = <T>(key: string, initialData: T): T => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(data);
};

const saveJSON = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const StorageService = {
  // --- Users ---
  getUsers: (): User[] => getJSON('users.json', INITIAL_USERS),
  saveUser: (user: User) => {
    const users = getJSON('users.json', INITIAL_USERS);
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    saveJSON('users.json', users);
  },
  deleteUser: (id: string) => {
    let users = getJSON('users.json', INITIAL_USERS);
    users = users.filter(u => u.id !== id);
    saveJSON('users.json', users);
  },

  // --- Products ---
  getProducts: (locale: LocaleType): Product[] => {
    return locale === 'yummy' 
      ? getJSON('productos_yummy.json', INITIAL_PRODUCTS_YUMMY)
      : getJSON('productos_uwu.json', INITIAL_PRODUCTS_UWU);
  },
  saveProducts: (locale: LocaleType, products: Product[]) => {
    const key = locale === 'yummy' ? 'productos_yummy.json' : 'productos_uwu.json';
    saveJSON(key, products);
  },

  // --- Logs (Raw Events) ---
  getTimeLogs: (): TimeLog[] => getJSON('logs_horario.json', []),
  addTimeLog: (log: TimeLog) => {
    const logs = getJSON('logs_horario.json', []);
    logs.unshift(log); // Add to beginning
    saveJSON('logs_horario.json', logs);
  },
  
  // --- Shift Logs (History with duration) ---
  getShiftLogs: (): ShiftLog[] => getJSON('historial_turnos.json', []),
  addShiftLog: (shift: ShiftLog) => {
    const logs = getJSON('historial_turnos.json', []);
    logs.unshift(shift);
    saveJSON('historial_turnos.json', logs);
  },
  deleteShiftLog: (id: string) => {
    let logs = getJSON('historial_turnos.json', []);
    logs = logs.filter((l: ShiftLog) => l.id !== id);
    saveJSON('historial_turnos.json', logs);
  },
  clearUserShiftLogs: (userId: string) => {
    let logs = getJSON('historial_turnos.json', []);
    logs = logs.filter((l: ShiftLog) => l.userId !== userId);
    saveJSON('historial_turnos.json', logs);
  },
  clearAllShiftLogs: () => {
    saveJSON('historial_turnos.json', []);
  },

  getSaleLogs: (): SaleLog[] => getJSON('logs_calculadora.json', []),
  addSaleLog: (log: SaleLog) => {
    const logs = getJSON('logs_calculadora.json', []);
    logs.unshift(log);
    saveJSON('logs_calculadora.json', logs);
  },

  // --- Session State (Per User) ---
  getSession: (userId: string): WorkSession => {
    const key = `session_${userId}`;
    return getJSON(key, {
      isActive: false,
      isOnPause: false,
      startTime: null,
      lastPauseTime: null,
      totalPauseTime: 0
    });
  },
  saveSession: (userId: string, session: WorkSession) => {
    saveJSON(`session_${userId}`, session);
  }
};
