import type { Lang } from '@/lib/i18n';

export type { Lang };
export type MenuCategory = string;
export type PaymentMethod = 'cash' | 'paynow';
export type AppStatus = 'loading' | 'login' | 'app';
export type Page = 'operation' | 'history' | 'menu' | 'settings';
export type OrderStatus = 'completed' | 'voided' | 'refunded';

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  system: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  nameZh?: string | null;
  price: number;
  cat: MenuCategory;
  imageUrl?: string | null;
  available: boolean;
}

export interface HistoryEntry {
  id: string;
  time: string;
  total: number;
  payment: PaymentMethod;
  staff: boolean;
  status: OrderStatus;
  items: { name: string; qty: number }[];
}

export interface ConfirmState {
  methodLabel: string;
  totalCents: number;
  count: number;
}

export interface Draft {
  id: string | null;
  name: string;
  nameZh: string;
  price: string;
  cat: MenuCategory;
  imageUrl?: string | null;
}

export interface OrderLine {
  id: string;
  name: string;
  nameZh?: string | null;
  price: number;
  qty: number;
  cat: MenuCategory;
}
