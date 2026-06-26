export type MenuCategory = 'Fixed Price' | 'Custom' | 'Others';
export type PaymentMethod = 'cash' | 'paynow';
export type AppStatus = 'loading' | 'login' | 'app';
export type Page = 'operation' | 'history' | 'menu';

export interface MenuItem {
  id: string;
  name: string;
  price: number; // cents (from DB)
  cat: MenuCategory;
  imageUrl?: string | null;
  available: boolean;
}

export interface HistoryEntry {
  id: string;
  time: string;
  total: number; // cents
  payment: PaymentMethod;
  staff: boolean;
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
  price: string; // user input, dollars as string
  cat: MenuCategory;
  imageUrl?: string | null;
}

export interface OrderLine {
  id: string;
  name: string;
  price: number; // cents
  qty: number;
}
