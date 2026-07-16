'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AppStatus, Page, Category, MenuItem, HistoryEntry, ConfirmState,
  Draft, MenuCategory, OrderLine, Lang, OrderStatus,
  ModifierGroup, ModifierOption, SelectedModifier,
} from '@/types/pos';
import { T } from '@/lib/i18n';
import LoginScreen from './LoginScreen';
import Sidebar from './Sidebar';
import Header from './Header';
import OrderStation from './OrderStation';
import SalesHistory from './SalesHistory';
import MenuManager from './MenuManager';
import MenuModal from './MenuModal';
import ConfirmModal from './ConfirmModal';
import CashInputModal from './CashInputModal';
import ModifierModal from './ModifierModal';
import SettingsPage from './SettingsPage';

interface State {
  appStatus: AppStatus;
  page: Page;
  lang: Lang;
  pin: string;
  pinError: boolean;
  loginLoading: boolean;
  categories: Category[];
  menu: MenuItem[];
  menuLoading: boolean;
  modifierGroups: ModifierGroup[];
  menuTab: 'items' | 'modifiers';
  orderLines: OrderLine[];
  modifierPending: MenuItem | null;
  cashInputOpen: boolean;
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
  lang: 'en',
  pin: '',
  pinError: false,
  loginLoading: false,
  categories: [],
  menu: [],
  menuLoading: false,
  modifierGroups: [],
  menuTab: 'items',
  orderLines: [],
  modifierPending: null,
  cashInputOpen: false,
  confirm: null,
  history: [],
  historyLoading: false,
  menuModalOpen: false,
  draft: null,
  draftError: '',
  draftUploading: false,
};

function computeFromLines(lines: OrderLine[]) {
  let totalCents = 0;
  lines.forEach((l) => {
    const modTotal = l.modifiers.reduce((a, m) => a + m.priceCents, 0);
    const sign = l.cat === 'Staff Price' ? -1 : 1;
    totalCents += sign * (l.price + modTotal) * l.qty;
  });
  const count = lines.reduce((a, l) => a + l.qty, 0);
  return { lines, totalCents: Math.max(0, totalCents), count, empty: lines.length === 0 };
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
      status: ((o.status as string) || 'completed') as OrderStatus,
      items: items.map((i) => {
        let modifiers: string | undefined;
        if (i.modifiers) {
          try {
            const mods = JSON.parse(i.modifiers as string) as SelectedModifier[];
            if (mods.length > 0) modifiers = mods.map((m) => m.optionName).join(', ');
          } catch { /* ignore */ }
        }
        return { name: i.name as string, qty: i.quantity as number, modifiers };
      }),
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

  useEffect(() => {
    const stored = localStorage.getItem('pos-lang') as Lang | null;
    if (stored === 'en' || stored === 'zh') {
      setS((prev) => ({ ...prev, lang: stored }));
    }
  }, []);

  async function loadCategories() {
    const res = await fetch('/api/categories');
    if (res.ok) {
      const cats: Category[] = await res.json();
      update({ categories: cats });
    }
  }

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

  async function loadModifierGroups() {
    const res = await fetch('/api/modifier-groups');
    if (res.ok) {
      const groups: ModifierGroup[] = await res.json();
      update({ modifierGroups: groups });
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
          await Promise.all([loadCategories(), loadMenu(), loadModifierGroups(), loadHistory()]);
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

  // ── Language ──────────────────────────────────────────────────────────────

  function changeLang(l: Lang) {
    localStorage.setItem('pos-lang', l);
    update({ lang: l });
  }

  // ── Auth ────────────────────────────────────────────────────────────────

  function pressDigit(d: string) {
    if (s.pin.length >= 4 || s.loginLoading) return;
    const pin = s.pin + d;
    update({ pin, pinError: false });
    if (pin.length === 4) submitPin(pin);
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
        await Promise.all([loadCategories(), loadMenu(), loadModifierGroups(), loadHistory()]);
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
      appStatus: 'login', pin: '', orderLines: [],
      confirm: null, cashInputOpen: false, menuModalOpen: false, modifierPending: null,
      menu: [], history: [], categories: [], modifierGroups: [],
    });
  }

  // ── Order ────────────────────────────────────────────────────────────────

  function tapItem(item: MenuItem) {
    const groups = item.modifierGroups ?? [];
    if (groups.length > 0) {
      update({ modifierPending: item });
    } else {
      commitItem(item, []);
    }
  }

  function commitItem(item: MenuItem, modifiers: SelectedModifier[]) {
    const sortedIds = [...modifiers].sort((a, b) => a.optionId.localeCompare(b.optionId)).map((m) => m.optionId).join(',');
    const lineKey = sortedIds ? `${item.id}:${sortedIds}` : item.id;
    update((prev) => {
      const existing = prev.orderLines.find((l) => l.lineKey === lineKey);
      if (existing) {
        return { orderLines: prev.orderLines.map((l) => l.lineKey === lineKey ? { ...l, qty: l.qty + 1 } : l) };
      }
      return {
        orderLines: [...prev.orderLines, {
          lineKey, id: item.id, name: item.name, nameZh: item.nameZh,
          price: item.price, qty: 1, cat: item.cat, modifiers,
        }],
      };
    });
  }

  function changeQty(lineKey: string, delta: number) {
    update((prev) => ({
      orderLines: prev.orderLines
        .map((l) => l.lineKey === lineKey ? { ...l, qty: l.qty + delta } : l)
        .filter((l) => l.qty > 0),
    }));
  }

  function clearOrder() {
    update({ orderLines: [] });
  }

  async function choosePayment(method: 'cash' | 'paynow') {
    const o = computeFromLines(s.orderLines);
    if (o.empty) return;

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalCents: o.totalCents,
          payment: method,
          staffDiscount: o.lines.some((l) => l.cat === 'Staff Price'),
          items: o.lines.map((l) => {
            const modTotal = l.modifiers.reduce((a, m) => a + m.priceCents, 0);
            return {
              menuItemId: l.id,
              name: l.name,
              quantity: l.qty,
              unitCents: l.price + modTotal,
              modifiers: l.modifiers,
            };
          }),
        }),
      });

      if (res.ok) {
        const newOrder = await res.json();
        const tr = T[s.lang];
        const histEntry: HistoryEntry = {
          id: newOrder.id,
          time: formatTimeFromDate(new Date()),
          total: newOrder.totalCents,
          payment: method,
          staff: false,
          status: 'completed',
          items: o.lines.map((l) => ({
            name: l.name,
            qty: l.qty,
            modifiers: l.modifiers.length > 0 ? l.modifiers.map((m) => m.optionName).join(', ') : undefined,
          })),
        };
        update((prev) => ({
          history: [histEntry, ...prev.history],
          confirm: {
            methodLabel: method === 'cash' ? tr.cash : 'PayNow',
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
    update({ orderLines: [], confirm: null });
  }

  // ── Categories ───────────────────────────────────────────────────────────

  async function addCategory(name: string) {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const cat: Category = await res.json();
      update((prev) => ({ categories: [...prev.categories, cat] }));
    }
  }

  async function deleteCategory(id: string) {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (res.ok) {
      update((prev) => ({ categories: prev.categories.filter((c) => c.id !== id) }));
      loadMenu();
    }
  }

  // ── Modifier Groups ───────────────────────────────────────────────────────

  function handleGroupCreated(group: ModifierGroup) {
    update((prev) => ({ modifierGroups: [...prev.modifierGroups, group] }));
  }

  function handleGroupUpdated(group: ModifierGroup) {
    update((prev) => ({
      modifierGroups: prev.modifierGroups.map((g) => g.id === group.id ? group : g),
    }));
  }

  function handleGroupDeleted(id: string) {
    update((prev) => ({ modifierGroups: prev.modifierGroups.filter((g) => g.id !== id) }));
    // Reload menu since items may have lost attached groups
    loadMenu();
  }

  function handleOptionCreated(groupId: string, option: ModifierOption) {
    update((prev) => ({
      modifierGroups: prev.modifierGroups.map((g) =>
        g.id === groupId ? { ...g, options: [...g.options, option] } : g
      ),
    }));
  }

  function handleOptionUpdated(groupId: string, option: ModifierOption) {
    update((prev) => ({
      modifierGroups: prev.modifierGroups.map((g) =>
        g.id === groupId
          ? { ...g, options: g.options.map((o) => o.id === option.id ? option : o) }
          : g
      ),
    }));
  }

  function handleOptionDeleted(groupId: string, optionId: string) {
    update((prev) => ({
      modifierGroups: prev.modifierGroups.map((g) =>
        g.id === groupId ? { ...g, options: g.options.filter((o) => o.id !== optionId) } : g
      ),
    }));
  }

  // ── Menu CRUD ────────────────────────────────────────────────────────────

  function openAdd() {
    const defaultCat = s.categories.find((c) => !c.system)?.name ?? 'Fixed Price';
    update({
      menuModalOpen: true, draftError: '',
      draft: { id: null, name: '', nameZh: '', price: '', cat: defaultCat, imageUrl: null, attachedGroupIds: [] },
    });
  }

  function openEdit(item: MenuItem) {
    update({
      menuModalOpen: true,
      draftError: '',
      draft: {
        id: item.id,
        name: item.name,
        nameZh: item.nameZh ?? '',
        price: (item.price / 100).toFixed(2),
        cat: item.cat,
        imageUrl: item.imageUrl ?? null,
        attachedGroupIds: (item.modifierGroups ?? []).map((g) => g.id),
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

  function toggleDraftGroup(groupId: string) {
    update((prev) => {
      if (!prev.draft) return {};
      const ids = prev.draft.attachedGroupIds;
      const next = ids.includes(groupId) ? ids.filter((id) => id !== groupId) : [...ids, groupId];
      return { draft: { ...prev.draft, attachedGroupIds: next } };
    });
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
      update({ draftError: T[s.lang].validationError });
      return;
    }
    const priceCents = Math.round(priceDollars * 100);
    const body = {
      name,
      nameZh: d.nameZh.trim() || null,
      price: priceCents,
      cat: d.cat,
      imageUrl: d.imageUrl ?? null,
      attachedGroupIds: d.attachedGroupIds,
    };

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
            menuModalOpen: false, draft: null, draftError: '',
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
            menuModalOpen: false, draft: null, draftError: '',
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
        update((prev) => ({
          menu: prev.menu.filter((m) => m.id !== id),
          orderLines: prev.orderLines.filter((l) => l.id !== id),
        }));
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://pub-38ab79da39164b16a64630cefe4a7851.r2.dev/3375px_cafeine_logo.jpg"
            alt="CAFÉINE"
            className="w-[58px] h-[58px] rounded-[17px] object-cover"
          />
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

  const o = computeFromLines(s.orderLines);

  return (
    <div className="w-[1366px] h-[1024px] relative overflow-hidden font-grotesk text-ink bg-cream">
      <div className="flex h-full">
        <Sidebar
          page={s.page}
          lang={s.lang}
          onNav={(p: Page) => {
            update({ page: p });
            if (p === 'history') loadHistory();
          }}
          onLogout={doLogout}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Header page={s.page as Exclude<Page, 'login'>} lang={s.lang} />

          <div className="flex-1 min-h-0">
            {s.page === 'operation' && (
              <OrderStation
                menu={s.menu}
                categories={s.categories}
                orderLines={o.lines}
                orderCount={o.count}
                orderEmpty={o.empty}
                totalCents={o.totalCents}
                lang={s.lang}
                onTapItem={tapItem}
                onChangeQty={changeQty}
                onPayCash={() => update({ cashInputOpen: true })}
                onPayNow={() => choosePayment('paynow')}
                onClearOrder={clearOrder}
              />
            )}
            {s.page === 'history' && (
              <SalesHistory
                history={s.history}
                loading={s.historyLoading}
                lang={s.lang}
                onStatusChange={(id, status) =>
                  update((prev) => ({
                    history: prev.history.map((h) => h.id === id ? { ...h, status } : h),
                  }))
                }
              />
            )}
            {s.page === 'menu' && (
              <MenuManager
                menu={s.menu}
                modifierGroups={s.modifierGroups}
                lang={s.lang}
                menuTab={s.menuTab}
                onTabChange={(tab) => update({ menuTab: tab })}
                onOpenAdd={openAdd}
                onEdit={openEdit}
                onDelete={deleteDish}
                onGroupCreated={handleGroupCreated}
                onGroupUpdated={handleGroupUpdated}
                onGroupDeleted={handleGroupDeleted}
                onOptionCreated={handleOptionCreated}
                onOptionUpdated={handleOptionUpdated}
                onOptionDeleted={handleOptionDeleted}
              />
            )}
            {s.page === 'settings' && (
              <SettingsPage
                lang={s.lang}
                categories={s.categories}
                onChangeLang={changeLang}
                onAddCategory={addCategory}
                onDeleteCategory={deleteCategory}
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
          lang={s.lang}
          categories={s.categories}
          modifierGroups={s.modifierGroups}
          onChangeName={(v) => setDraftField('name', v)}
          onChangeNameZh={(v: string) => setDraftField('nameZh', v)}
          onChangePrice={(v) => setDraftField('price', v)}
          onChangeCat={(c) => setDraftField('cat', c)}
          onToggleGroup={toggleDraftGroup}
          onUploadImage={uploadImage}
          onClearImage={() => setDraftField('imageUrl', null)}
          onSave={saveDraft}
          onClose={closeModal}
        />
      )}

      {s.modifierPending && (
        <ModifierModal
          item={s.modifierPending}
          lang={s.lang}
          onConfirm={(modifiers) => {
            commitItem(s.modifierPending!, modifiers);
            update({ modifierPending: null });
          }}
          onCancel={() => update({ modifierPending: null })}
        />
      )}

      {s.cashInputOpen && (
        <CashInputModal
          totalCents={o.totalCents}
          lang={s.lang}
          onConfirm={() => { update({ cashInputOpen: false }); choosePayment('cash'); }}
          onClose={() => update({ cashInputOpen: false })}
        />
      )}

      {s.confirm && <ConfirmModal confirm={s.confirm} lang={s.lang} onFinish={finishOrder} />}
    </div>
  );
}
