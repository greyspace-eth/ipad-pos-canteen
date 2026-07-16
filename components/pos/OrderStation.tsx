'use client';

import { Category, MenuItem, OrderLine, Lang } from '@/types/pos';
import { T } from '@/lib/i18n';

interface Props {
  menu: MenuItem[];
  categories: Category[];
  orderLines: OrderLine[];
  orderCount: number;
  orderEmpty: boolean;
  totalCents: number;
  lang: Lang;
  onTapItem: (item: MenuItem) => void;
  onChangeQty: (lineKey: string, delta: number) => void;
  onPayCash: () => void;
  onPayNow: () => void;
  onClearOrder: () => void;
}

function catStyle(name: string) {
  if (name === 'Staff Price') return { dotColor: '#1a6fa0', bgColor: '#dce8ed', isDiscount: true };
  return { dotColor: '#1f8a5b', bgColor: '#e3eddc', isDiscount: false };
}

function catLabel(name: string, tr: { catStaffPrice: string; catFixedPrice: string; catCustom: string; catOthers: string }): string {
  if (name === 'Staff Price') return tr.catStaffPrice;
  if (name === 'Fixed Price') return tr.catFixedPrice;
  if (name === 'Custom') return tr.catCustom;
  if (name === 'Others') return tr.catOthers;
  return name;
}

function money(cents: number) {
  return '$' + (cents / 100).toFixed(2);
}

function modMoney(cents: number) {
  if (cents === 0) return '';
  return (cents > 0 ? '+' : '') + '$' + (Math.abs(cents) / 100).toFixed(2);
}

interface MenuCardProps {
  name: string;
  priceCents: number;
  qty: number;
  imageUrl?: string | null;
  bgColor: string;
  isDiscount: boolean;
  hasModifiers: boolean;
  onTap: () => void;
}

function MenuCard({ name, priceCents, qty, imageUrl, bgColor, isDiscount, hasModifiers, onTap }: MenuCardProps) {
  return (
    <button
      onClick={onTap}
      className="relative flex flex-col text-left p-0 border-[1.5px] border-sand rounded-[16px] bg-white cursor-pointer overflow-hidden font-grotesk active:scale-[0.96] transition-transform duration-100"
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={name} className="h-[102px] w-full object-cover" />
      ) : (
        <div
          className="h-[102px] w-full flex items-center justify-center"
          style={{
            backgroundColor: bgColor,
            backgroundImage: 'repeating-linear-gradient(135deg, rgba(0,0,0,.045) 0 7px, transparent 7px 14px)',
          }}
        >
          <span className="font-mono font-medium text-[10px] tracking-[0.14em] text-black/25">PHOTO</span>
        </div>
      )}

      <div className="px-[14px] pt-[11px] pb-[13px] flex flex-col gap-[6px] flex-1">
        <span className="font-semibold text-[18px] leading-[1.15] text-ink">{name}</span>
        <div className="flex items-center gap-[6px] mt-auto">
          <span className="font-mono font-bold text-[19px]" style={{ color: isDiscount ? '#c0492f' : '#17714a' }}>
            {isDiscount ? '−' : ''}{money(priceCents)}
          </span>
          {hasModifiers && (
            <span className="font-mono text-[11px] text-ink-ghost bg-[#f1ece2] px-[5px] py-[2px] rounded-[4px]">+opt</span>
          )}
        </div>
      </div>

      {qty > 0 && (
        <span
          className="absolute top-[8px] right-[8px] min-w-[30px] h-[30px] px-[8px] rounded-[15px] bg-green text-white font-mono font-bold text-[16px] flex items-center justify-center"
          style={{ boxShadow: '0 2px 7px rgba(31,138,91,.45)' }}
        >
          {qty}
        </span>
      )}
    </button>
  );
}

export default function OrderStation({
  menu, categories, orderLines, orderCount, orderEmpty, totalCents,
  lang, onTapItem, onChangeQty, onPayCash, onPayNow, onClearOrder,
}: Props) {
  const tr = T[lang];

  // Sum qty per menu item id for card badges
  const itemQty: Record<string, number> = {};
  orderLines.forEach((l) => { itemQty[l.id] = (itemQty[l.id] ?? 0) + l.qty; });

  return (
    <div className="flex h-full">
      {/* Left — menu grid */}
      <div className="flex-1 min-w-0 overflow-y-auto px-7 pt-6 pb-10">
        {categories.map(({ name }) => {
          const items = menu.filter((m) => m.cat === name && m.available !== false);
          if (items.length === 0) return null;
          const { dotColor, bgColor, isDiscount } = catStyle(name);
          return (
            <div key={name} className="mt-20 first:mt-0">
              <div className="flex items-center gap-[10px] mx-[2px] mb-6">
                <span className="w-[12px] h-[12px] rounded-[3px]" style={{ background: dotColor }} />
                <span className="font-bold text-[17px] tracking-[0.12em] uppercase text-ink-muted font-grotesk">
                  {catLabel(name, tr)}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-[13px]">
                {items.map((item) => (
                  <MenuCard
                    key={item.id}
                    name={lang === 'zh' && item.nameZh ? item.nameZh : item.name}
                    priceCents={item.price}
                    qty={itemQty[item.id] ?? 0}
                    imageUrl={item.imageUrl}
                    bgColor={bgColor}
                    isDiscount={isDiscount}
                    hasModifiers={(item.modifierGroups?.length ?? 0) > 0}
                    onTap={() => onTapItem(item)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right — order panel */}
      <div className="w-[500px] flex-shrink-0 bg-white border-l-[1.5px] border-sand flex flex-col h-full">
        <div className="px-6 pt-[22px] pb-4 border-b-[1.5px] border-sand-light flex items-center justify-between">
          <span className="font-bold text-[26px] text-ink font-grotesk">{tr.currentOrder}</span>
          <div className="flex items-center gap-3">
            {!orderEmpty && (
              <button
                onClick={onClearOrder}
                className="h-[34px] px-[14px] rounded-[10px] border-[1.5px] border-[#f0d9d2] bg-[#fbf2ef] text-red font-grotesk font-semibold text-[13px] cursor-pointer hover:bg-[#f5e2db] transition-colors"
              >
                {tr.clearAll}
              </button>
            )}
            <span className="font-mono font-semibold text-[17px] text-ink-muted">
              {orderCount} {tr.itemsUnit}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {orderEmpty ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 px-10 text-center">
              <div className="w-[80px] h-[80px] rounded-[22px] border-2 border-dashed border-sand-muted flex items-center justify-center">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#cdc6b9" strokeWidth="2">
                  <path d="M4 11h16a8 8 0 0 1-16 0z" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="3" y1="11" x2="21" y2="11" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-semibold text-[19px] text-ink-faint font-grotesk">{tr.noDishesTitle}</span>
              <span className="font-normal text-[16px] text-ink-ghost max-w-[230px] leading-[1.5] font-grotesk">{tr.noDishesBody}</span>
            </div>
          ) : (
            <div className="py-[6px]">
              {orderLines.map((l) => {
                const isDiscount = l.cat === 'Staff Price';
                const displayName = lang === 'zh' && l.nameZh ? l.nameZh : l.name;
                const modTotal = l.modifiers.reduce((a, m) => a + m.priceCents, 0);
                const unitTotal = l.price + modTotal;
                return (
                  <div key={l.lineKey} className="px-[22px] py-[14px] border-b-[1px] border-[#f1ece2] last:border-b-0">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[20px] text-ink font-grotesk">{displayName}</div>
                        {/* Modifier sub-lines */}
                        {l.modifiers.length > 0 && (
                          <div className="mt-[4px] flex flex-col gap-[2px]">
                            {l.modifiers.map((m) => (
                              <div key={m.optionId} className="flex items-center gap-[6px]">
                                <span className="text-[11px] text-ink-ghost">·</span>
                                <span className="font-medium text-[13px] text-ink-muted font-grotesk">{m.optionName}</span>
                                {m.priceCents !== 0 && (
                                  <span className="font-mono text-[12px] text-ink-ghost">{modMoney(m.priceCents)}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <div
                          className="font-mono font-semibold text-[17px] mt-[6px]"
                          style={{ color: isDiscount ? '#c0492f' : '#17714a' }}
                        >
                          {isDiscount ? '−' : ''}{money(unitTotal * l.qty)}
                        </div>
                      </div>
                      <div className="flex items-center border-[1.5px] border-sand rounded-[14px] overflow-hidden flex-shrink-0">
                        <button
                          onClick={() => onChangeQty(l.lineKey, -1)}
                          className="w-[50px] h-[50px] border-none bg-warm-white font-bold text-[28px] text-ink cursor-pointer hover:bg-[#ece6da] transition-colors"
                        >
                          −
                        </button>
                        <span className="w-[45px] text-center font-mono font-bold text-[20px] text-ink">{l.qty}</span>
                        <button
                          onClick={() => onChangeQty(l.lineKey, 1)}
                          className="w-[50px] h-[50px] border-none bg-warm-white font-bold text-[28px] text-ink cursor-pointer hover:bg-[#ece6da] transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Totals + actions */}
        <div className="border-t-[1.5px] border-sand-light px-6 pt-[18px] pb-[22px] flex flex-col gap-[13px]">
          <div className="flex items-end justify-between pt-[10px] border-t-[1.5px] border-dashed border-[#e0dace]">
            <span className="font-bold text-[22px] text-ink font-grotesk">{tr.total}</span>
            <span className="font-mono font-bold text-[48px] text-green-dark leading-none tracking-[-0.02em]">
              {money(totalCents)}
            </span>
          </div>

          <div className="flex gap-3 mt-1">
            <button
              onClick={onPayCash}
              disabled={orderEmpty}
              className="flex-1 h-[88px] rounded-[16px] border-none bg-ink-dark text-white cursor-pointer flex flex-col items-center justify-center gap-[3px] font-grotesk active:scale-[0.97] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="font-bold text-[22px]">{tr.cash}</span>
              <span className="font-medium text-[15px] opacity-55">{tr.cashSub}</span>
            </button>
            <button
              onClick={onPayNow}
              disabled={orderEmpty}
              className="flex-1 h-[88px] rounded-[16px] border-none bg-green text-white cursor-pointer flex flex-col items-center justify-center gap-[3px] font-grotesk active:scale-[0.97] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="font-bold text-[22px]">{tr.payNow}</span>
              <span className="font-medium text-[15px] opacity-70">{tr.payNowSub}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
