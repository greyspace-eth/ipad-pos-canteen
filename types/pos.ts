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

export interface ModifierOption {
  id: string;
  name: string;
  priceCents: number;
  isDefault: boolean;
  sortOrder: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  singleSelect: boolean;
  sortOrder: number;
  options: ModifierOption[];
}

export interface SelectedModifier {
  optionId: string;
  optionName: string;
  priceCents: number;
}

export interface MenuItem {
  id: string;
  name: string;
  nameZh?: string | null;
  price: number;
  cat: MenuCategory;
  imageUrl?: string | null;
  available: boolean;
  modifierGroups?: ModifierGroup[];
}

export interface HistoryEntry {
  id: string;
  time: string;
  total: number;
  payment: PaymentMethod;
  staff: boolean;
  status: OrderStatus;
  items: { name: string; qty: number; modifiers?: string }[];
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
  attachedGroupIds: string[];
}

export interface OrderLine {
  lineKey: string;
  id: string;
  name: string;
  nameZh?: string | null;
  price: number;
  qty: number;
  cat: MenuCategory;
  modifiers: SelectedModifier[];
}
