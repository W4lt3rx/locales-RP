
export type Role = 'admin' | 'worker';
export type LocaleType = 'yummy' | 'uwu';
export type ContextType = LocaleType | 'admin_panel' | null;

// Cambia esta URL por la de tu servidor en Render/Railway al desplegar
export const API_BASE_URL = 'https://tu-backend-control-horas.onrender.com';

export interface User {
  id: string;
  username: string;
  password: string;
  role: Role;
  allowedLocales: LocaleType[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  icon: string;
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface TimeLog {
  id: string;
  userId: string;
  username: string;
  locale: LocaleType;
  type: 'entrada' | 'pausa' | 'salida';
  timestamp: string;
}

export interface ShiftLog {
  id: string;
  userId: string;
  username: string;
  locale: LocaleType;
  startTime: string;
  endTime: string;
  totalPauseTime: number;
  totalWorkTime: number;
}

export interface SaleLog {
  id: string;
  userId: string;
  username: string;
  locale: LocaleType;
  items: CartItem[];
  total: number;
  timestamp: string;
}

export interface WorkSession {
  isActive: boolean;
  isOnPause: boolean;
  startTime: string | null;
  lastPauseTime: string | null;
  totalPauseTime: number;
}

export const WEBHOOK_CONFIG = {
  yummy: {
    TIME_LOG: "https://discord.com/api/webhooks/1409036327084621824/R1k1KsUJ1qfE3xEDtml0fLPuzU2Y9q7_k7_MGArbo9UUtow4K1ltMWK37VE_2HOVjlgr",
    SALES_LOG: "https://discord.com/api/webhooks/1409036353097961492/FPeovkjPJfrnOik9YK-Jv0ig63vDzlL-s5SOwWLw89I74Xd5XGkbyG2sefAOjb_gOAWV"
  },
  uwu: {
    TIME_LOG: "https://discord.com/api/webhooks/1468247783545901069/NHxdUGcqhzSs4tcNHTMFhYrO2MTT5GSLtpE6l5dJGZBC9ytHaz-e3-DcW6ONLiHfEGpr",
    SALES_LOG: "https://discord.com/api/webhooks/1468234728904593623/JQNF4EqPXKfkjiMIsnErJyJ2E-udICTQma5Ix6gkSs4EPDq7afc9g_s-JFlqAbiFvv1n"
  },
};
