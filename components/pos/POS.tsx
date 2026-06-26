'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AppStatus, Page, MenuItem, HistoryEntry, ConfirmState, Draft, MenuCategory, OrderLine,
} from '@/types/pos';
import LoginScreen from './LoginScreen';
import Sidebar from './Sidebar';
import Header from './Header';
import OrderStation from './OrderStation';
import SalesHistory from './SalesHistory';
import MenuManager from './MenuManager';
import MenuModal from './MenuModal';
import ConfirmModal from './ConfirmModal';

interface State {
  appStatus: AppStatus;
  page: Page;
  pin: string;
  pinError: boolean;
  loginLoading: boolean;
  menu: MenuItem[];
  menuLoading: boolean;
  order: Record<string, number>;
  staffDiscount: boolean;
  confirm: ConfirmState | null;
  history: HistoryEntry[];
  historyLoading: boolean;
  menuModalOpen: boolean;
  draft: Draft | null;
  draftError: string;
  draftUploading: boolean;
}

const INITIAL: State = {
  appStatus: 'loading',
  page: 'operation',
  pin: '',
  pinError: false,
  loginLoading: false,
  menu: [],
  menuLoading: false,
  order: {},
  staffDiscount: false,
  confirm: null,
  history: [],
  historyLoading: false,
  menuModalOpen: false,
  draft: null,
  draftError: '',
  draftUploading: false,
};

function computeOrder(menu: MenuItem[], order: Record<string, number>, staffDiscount: boolean) {
  let subtotalCents = 0;
  const lines: OrderLine[] = [];
  menu.forEach((m) => {
    const q = order[m.id] || 0;
    if (q > 0) {
      subtotalCents += q * m.price;
      lines.push({ id: m.id, name: m.name, price: m.price, qty: q });
    }
  });
  const discountActive = staffDiscount && subtotalCents > 0;
  const totalCents = Math.max(0, subtotalCents - (discountActive ? 50 : 0));
  const count = lines.reduce((a, l) => a + l.qty, 0);
  return { lines, subtotalCents, discountActive, totalCents, count, empty: lines.length === 0 };
}

function formatTimeFromDate(date: Date): string {
  try {
    return date.toLocaleTimeString('en-SG', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch {
    return date.toLocaleTimeString();
  }
}

function mapApiOrders(apiOrders: Record<string, unknown>[]): HistoryEntry[] {
  return apiOrders.map((o) => {
    const items = (o.items as Record<string, unknown>[]) ?? [];
    return {
      id: o.id as string,
      time: formatTimeFromDate(new Date(o.createdAt as string)),
      total: o.totalCents as number,
      payment: (o.payment as string) === 'cash' ? 'cash' : 'paynow',
      staff: o.staffDiscount as boolean,
      items: items.map((i) => ({
        name: i.name as string,
        qty: i.quantity as number,
      })),
    };
  });
}

export default function POS() {
  const [s, setS] = useState<State>(INITIAL);

  const update = useCallback(
    (partial: Partial<State> | ((prev: State) => Partial<State>)) => {
      setS((prev) => ({ ...prev, ...(typeof partial === 'function' ? partial(prev) : partial) }));
    },
    []
  );

  // ── Bootstrap ────────────────────────────────────────────────────────────

  async function loadMenu() {
    update({ menuLoading: true });
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const items: MenuItem[] = await res.json();
        update({ menu: items, menuLoading: false });
      }
    } catch {
      update({ menuLoading: false });
    }
  }

  async function loadHistory() {
    update({ historyLoading: true });
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        update({ history: mapApiOrders(data), historyLoading: false });
      }
    } catch {
      update({ historyLoading: false });
    }
  }

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          await Promise.all([loadMenu(), loadHistory()]);
          update({ appStatus: 'app' });
        } else {
          update({ appStatus: 'login' });
        }
      } catch {
        update({ appStatus: 'login' });
      }
    }
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auth ────────────────────────────────────────────────────────────────

  function pressDigit(d: string) {
    if (s.pin.length >= 4 || s.loginLoading) return;
    const pin = s.pin + d;
    update({ pin, pinError: false });
    if (pin.length === 4) {
      submitPin(pin);
    }
  }

  async function submitPin(pin: string) {
    update({ loginLoading: true });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        await Promise.all([loadMenu(), loadHistory()]);
        update({ appStatus: 'app', pin: '', loginLoading: false });
      } else {
        update({ pinError: true, loginLoading: false });
        setTimeout(() => update({ pin: '', pinError: false }), 700);
      }
    } catch {
      update({ pinError: true, loginLoading: false });
      setTimeout(() => update({ pin: '', pinError: false }), 700);
    }
  }

  async function doLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    update({
      appStatus: 'login', pin: '', order: {}, staffDiscount: false,
      confirm: null, menuModalOpen: false, menu: [], history: [],
    });
  }

  // ── Order ────────────────────────────────────────────────────────────────

  function addItem(id: string) {
    update((prev) => ({ order: { ...prev.order, [id]: (prev.order[id] || 0) + 1 } }));
  }

  function changeQty(id: string, delta: number) {
    update((prev) => {
      const order = { ...prev.order };
      const q = (order[id] || 0) + delta;
      if (q <= 0) delete order[id];
      else order[id] = q;
      return { order };
    });
  }

  function toggleDiscount() {
    update((prev) => ({ staffDiscount: !prev.staffDiscount }));
  }

  async function choosePayment(method: 'cash' | 'paynow') {
    const o = computeOrder(s.menu, s.order, s.staffDiscount);
    if (o.empty) return;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalCents: o.totalCents,
          payment: method,
          staffDiscount: o.discountActive,
          items: o.lines.map((l) => ({
            menuItemId: l.id,
            name: l.name,
            quantity: l.qty,
            unitCents: l.price,
          })),
        }),
      });

      if (res.ok) {
        const newOrder = await res.json();
        const histEntry: HistoryEntry = {
          id: newOrder.id,
          time: formatTimeFromDate(new Date()),
          total: newOrder.totalCents,
          payment: method,
          staff: o.discountActive,
          items: o.lines.map((l) => ({ name: l.name, qty: l.qty })),
        };
        update((prev) => ({
          history: [histEntry, ...prev.history],
          confirm: {
            methodLabel: method === 'cash' ? 'Cash' : 'PayNow',
            totalCents: o.totalCents,
            count: o.count,
          },
        }));
      }
    } catch {
      // no-op — order stays open, staff can retry
    }
  }

  function finishOrder() {
    update({ order: {}, staffDiscount: false, confirm: null });
  }

  // ── Menu CRUD ────────────────────────────────────────────────────────────

  function openAdd() {
    update({ menuModalOpen: true, draftError: '', draft: { id: null, name: '', price: '', cat: 'Rice', imageUrl: null } });
  }

  function openEdit(item: MenuItem) {
    update({
      menuModalOpen: true,
      draftError: '',
      draft: {
        id: item.id,
        name: item.name,
        price: (item.price / 100).toFixed(2),
        cat: item.cat,
        imageUrl: item.imageUrl ?? null,
      },
    });
  }

  function closeModal() {
    update({ menuModalOpen: false, draft: null, draftError: '' });
  }

  function setDraftField(k: keyof Draft, v: string | MenuCategory | null) {
    update((prev) => ({
      draft: prev.draft ? { ...prev.draft, [k]: v } : prev.draft,
      draftError: '',
    }));
  }

  async function uploadImage(file: File) {
    update({ draftUploading: true });
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        update((prev) => ({
          draft: prev.draft ? { ...prev.draft, imageUrl: data.url } : prev.draft,
          draftUploading: false,
        }));
      } else {
        update({ draftError: data.error ?? 'Upload failed', draftUploading: false });
      }
    } catch {
      update({ draftError: 'Upload failed', draftUploading: false });
    }
  }

  async function saveDraft() {
    const d = s.draft;
    if (!d) return;

    const name = d.name.trim();
    const priceDollars = parseFloat(d.price);
    if (!name || isNaN(priceDollars) || priceDollars < 0) {
      update({ draftError: 'Enter a name and a valid price.' });
      return;
    }
    const priceCents = Math.round(priceDollars * 100);

    const body = { name, price: priceCents, cat: d.cat, imageUrl: d.imageUrl ?? null };

    try {
      if (d.id) {
        const res = await fetch(`/api/menu/${d.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const updated: MenuItem = await res.json();
          update((prev) => ({
            menu: prev.menu.map((m) => (m.id === updated.id ? updated : m)),
            menuModalOpen: false,
            draft: null,
            draftError: '',
          }));
        }
      } else {
        const res = await fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const created: MenuItem = await res.json();
          update((prev) => ({
            menu: [...prev.menu, created],
            menuModalOpen: false,
            draft: null,
            draftError: '',
          }));
        }
      }
    } catch {
      update({ draftError: 'Failed to save. Please try again.' });
    }
  }

  async function deleteDish(id: string) {
    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      if (res.ok) {
        update((prev) => {
          const order = { ...prev.order };
          delete order[id];
          return { menu: prev.menu.filter((m) => m.id !== id), order };
        });
      }
    } catch {
      // no-op
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  if (s.appStatus === 'loading') {
    return (
      <div className="w-[1366px] h-[1024px] bg-ink-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-[58px] h-[58px] rounded-[17px] bg-green flex items-center justify-center font-bold text-[26px] text-white font-grotesk">
            饭
          </div>
          <span className="font-medium text-[13px] text-ink-ghost font-grotesk">Loading…</span>
        </div>
      </div>
    );
  }

  if (s.appStatus === 'login') {
    return (
      <div className="w-[1366px] h-[1024px] relative overflow-hidden font-grotesk text-ink bg-cream">
        <LoginScreen
          pin={s.pin}
          pinError={s.pinError}
          onDigit={pressDigit}
          onClear={() => update({ pin: '', pinError: false })}
          onBackspace={() => update((prev) => ({ pin: prev.pin.slice(0, -1), pinError: false }))}
        />
      </div>
    );
  }

  const o = computeOrder(s.menu, s.order, s.staffDiscount);

  return (
    <div className="w-[1366px] h-[1024px] relative overflow-hidden font-grotesk text-ink bg-cream">
      <div className="flex h-full">
        <Sidebar
          page={s.page}
          onNav={(p: Page) => {
            update({ page: p });
            if (p === 'history') loadHistory();
          }}
          onLogout={doLogout}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Header page={s.page} />

          <div className="flex-1 min-h-0">
            {s.page === 'operation' && (
              <OrderStation
                menu={s.menu}
                orderLines={o.lines}
                orderCount={o.count}
                orderEmpty={o.empty}
                subtotalCents={o.subtotalCents}
                totalCents={o.totalCents}
                discountActive={o.discountActive}
                staffDiscount={s.staffDiscount}
                onAddItem={addItem}
                onChangeQty={changeQty}
                onToggleDiscount={toggleDiscount}
                onPayCash={() => choosePayment('cash')}
                onPayNow={() => choosePayment('paynow')}
              />
            )}
            {s.page === 'history' && (
              <SalesHistory history={s.history} loading={s.historyLoading} />
            )}
            {s.page === 'menu' && (
              <MenuManager
                menu={s.menu}
                onOpenAdd={openAdd}
                onEdit={openEdit}
                onDelete={deleteDish}
              />
            )}
          </div>
        </div>
      </div>

      {s.menuModalOpen && s.draft && (
        <MenuModal
          draft={s.draft}
          draftError={s.draftError}
          uploading={s.draftUploading}
          onChangeName={(v) => setDraftField('name', v)}
          onChangePrice={(v) => setDraftField('price', v)}
          onChangeCat={(c) => setDraftField('cat', c)}
          onUploadImage={uploadImage}
          onClearImage={() => setDraftField('imageUrl', null)}
          onSave={saveDraft}
          onClose={closeModal}
        />
      )}

      {s.confirm && <ConfirmModal confirm={s.confirm} onFinish={finishOrder} />}
    </div>
  );
}
