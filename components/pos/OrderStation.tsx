'use client';

import { MenuItem, MenuCategory, OrderLine } from '@/types/pos';

interface Props {
  menu: MenuItem[];
  orderLines: OrderLine[];
  orderCount: number;
  orderEmpty: boolean;
  subtotalCents: number;
  totalCents: number;
  discountActive: boolean;
  staffDiscount: boolean;
  onAddItem: (id: string) => void;
  onChangeQty: (id: string, delta: number) => void;
  onToggleDiscount: () => void;
  onPayCash: () => void;
  onPayNow: () => void;
}

const CATEGORY_SECTIONS: { cat: MenuCategory; label: string; dotColor: string; bgColor: string }[] = [
  { cat: 'Fixed Price', label: 'Fixed Price', dotColor: '#1f8a5b', bgColor: '#e3eddc' },
  { cat: 'Custom',      label: 'Custom',      dotColor: '#c0492f', bgColor: '#f1ddd6' },
  { cat: 'Others',      label: 'Others',      dotColor: '#8b857b', bgColor: '#e8e3ef' },
];

function money(cents: number) {
  return '$' + (cents / 100).toFixed(2);
}

interface MenuCardProps {
  name: string;
  priceCents: number;
  qty: number;
  imageUrl?: string | null;
  bgColor: string;
  onAdd: () => void;
}

function MenuCard({ name, priceCents, qty, imageUrl, bgColor, onAdd }: MenuCardProps) {
  return (
    <button
      onClick={onAdd}
      className="relative flex flex-col text-left p-0 border-[1.5px] border-sand rounded-[16px] bg-white cursor-pointer overflow-hidden font-grotesk active:scale-[0.96] transition-transform duration-100"
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={name}
          className="h-[76px] w-full object-cover"
        />
      ) : (
        <div
          className="h-[76px] w-full flex items-center justify-center"
          style={{
            backgroundColor: bgColor,
            backgroundImage: 'repeating-linear-gradient(135deg, rgba(0,0,0,.045) 0 7px, transparent 7px 14px)',
          }}
        >
          <span className="font-mono font-medium text-[9px] tracking-[0.14em] text-black/25">
            PHOTO
          </span>
        </div>
      )}

      <div className="px-[11px] pt-[9px] pb-[11px] flex flex-col gap-[5px] flex-1">
        <span className="font-semibold text-[14px] leading-[1.15] text-ink">{name}</span>
        <span className="font-mono font-bold text-[15px] text-green-dark mt-auto">
          {money(priceCents)}
        </span>
      </div>

      {qty > 0 && (
        <span
          className="absolute top-[7px] right-[7px] min-w-[24px] h-[24px] px-[6px] rounded-[12px] bg-green text-white font-mono font-bold text-[13px] flex items-center justify-center"
          style={{ boxShadow: '0 2px 7px rgba(31,138,91,.45)' }}
        >
          {qty}
        </span>
      )}
    </button>
  );
}

export default function OrderStation({
  menu,
  orderLines,
  orderCount,
  orderEmpty,
  subtotalCents,
  totalCents,
  discountActive,
  staffDiscount,
  onAddItem,
  onChangeQty,
  onToggleDiscount,
  onPayCash,
  onPayNow,
}: Props) {
  const orderQty: Record<string, number> = {};
  orderLines.forEach((l) => { orderQty[l.id] = l.qty; });

  return (
    <div className="flex h-full">
      {/* Left — menu grid */}
      <div className="flex-1 min-w-0 overflow-y-auto px-7 pt-6 pb-10">
        {CATEGORY_SECTIONS.map(({ cat, label, dotColor, bgColor }) => {
          const items = menu.filter((m) => m.cat === cat && m.available !== false);
          if (items.length === 0) return null;
          return (
            <div key={cat}>
              <div className="flex items-center gap-[9px] mx-[2px] mb-3 mt-6 first:mt-0">
                <span className="w-[9px] h-[9px] rounded-[3px]" style={{ background: dotColor }} />
                <span className="font-bold text-[13px] tracking-[0.14em] uppercase text-ink-muted font-grotesk">
                  {label}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-[13px]">
                {items.map((item) => (
                  <MenuCard
                    key={item.id}
                    name={item.name}
                    priceCents={item.price}
                    qty={orderQty[item.id] || 0}
                    imageUrl={item.imageUrl}
                    bgColor={bgColor}
                    onAdd={() => onAddItem(item.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right — order panel */}
      <div className="w-[456px] flex-shrink-0 bg-white border-l-[1.5px] border-sand flex flex-col h-full">
        <div className="px-6 pt-[22px] pb-4 border-b-[1.5px] border-sand-light flex items-baseline justify-between">
          <span className="font-bold text-[20px] text-ink font-grotesk">Current Order</span>
          <span className="font-mono font-semibold text-[13px] text-ink-muted">{orderCount} items</span>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {orderEmpty ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 px-10 text-center">
              <div className="w-[72px] h-[72px] rounded-[22px] border-2 border-dashed border-sand-muted flex items-center justify-center">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#cdc6b9" strokeWidth="2">
                  <path d="M4 11h16a8 8 0 0 1-16 0z" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="3" y1="11" x2="21" y2="11" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-semibold text-[15px] text-ink-faint font-grotesk">No dishes yet</span>
              <span className="font-normal text-[13px] text-ink-ghost max-w-[210px] leading-[1.5] font-grotesk">
                Tap dishes on the left to build the customer&apos;s plate.
              </span>
            </div>
          ) : (
            <div className="py-[6px]">
              {orderLines.map((l) => (
                <div key={l.id} className="flex items-center gap-3 px-[22px] py-[11px]">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[15px] text-ink truncate font-grotesk">{l.name}</div>
                    <div className="font-mono font-semibold text-[13px] text-green-dark mt-[2px]">
                      {money(l.price * l.qty)}
                    </div>
                  </div>
                  <div className="flex items-center border-[1.5px] border-sand rounded-[12px] overflow-hidden">
                    <button
                      onClick={() => onChangeQty(l.id, -1)}
                      className="w-[38px] h-[38px] border-none bg-warm-white font-bold text-[21px] text-ink cursor-pointer hover:bg-[#ece6da] active:bg-[#ece6da] transition-colors"
                    >
                      −
                    </button>
                    <span className="w-[34px] text-center font-mono font-bold text-[15px] text-ink">{l.qty}</span>
                    <button
                      onClick={() => onChangeQty(l.id, 1)}
                      className="w-[38px] h-[38px] border-none bg-warm-white font-bold text-[21px] text-ink cursor-pointer hover:bg-[#ece6da] active:bg-[#ece6da] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals + actions */}
        <div className="border-t-[1.5px] border-sand-light px-6 pt-[18px] pb-[22px] flex flex-col gap-[13px]">
          <div className="flex justify-between font-medium text-[14px] text-ink-muted font-grotesk">
            <span>Subtotal</span>
            <span className="font-mono text-ink">{money(subtotalCents)}</span>
          </div>

          <div className="flex items-center justify-between px-[14px] py-3 bg-warm-white rounded-[14px] border-[1.5px] border-sand-light">
            <div className="flex flex-col gap-[2px]">
              <span className="font-semibold text-[14px] text-ink font-grotesk">Staff discount</span>
              <span className="font-medium text-[12px] text-ink-muted font-grotesk">−$0.50 off total</span>
            </div>
            <button
              onClick={onToggleDiscount}
              className="w-[56px] h-[32px] rounded-[16px] border-none cursor-pointer flex items-center transition-colors duration-150 px-[3px]"
              style={{ background: staffDiscount ? '#1f8a5b' : '#d9d3c7' }}
            >
              <span
                className="w-[26px] h-[26px] rounded-full bg-white transition-transform duration-150"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,.3)', transform: staffDiscount ? 'translateX(24px)' : 'translateX(0)' }}
              />
            </button>
          </div>

          {discountActive && (
            <div className="flex justify-between font-medium text-[14px] text-red font-grotesk">
              <span>Staff discount</span>
              <span className="font-mono">−$0.50</span>
            </div>
          )}

          <div className="flex items-end justify-between pt-[10px] border-t-[1.5px] border-dashed border-[#e0dace]">
            <span className="font-bold text-[17px] text-ink font-grotesk">Total</span>
            <span className="font-mono font-bold text-[36px] text-green-dark leading-none tracking-[-0.02em]">
              {money(totalCents)}
            </span>
          </div>

          <div className="flex gap-3 mt-1">
            <button
              onClick={onPayCash}
              disabled={orderEmpty}
              className="flex-1 h-[66px] rounded-[16px] border-none bg-ink-dark text-white cursor-pointer flex flex-col items-center justify-center gap-[2px] font-grotesk active:scale-[0.97] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="font-bold text-[17px]">Cash</span>
              <span className="font-medium text-[11px] opacity-55">Tap when paid</span>
            </button>
            <button
              onClick={onPayNow}
              disabled={orderEmpty}
              className="flex-1 h-[66px] rounded-[16px] border-none bg-green text-white cursor-pointer flex flex-col items-center justify-center gap-[2px] font-grotesk active:scale-[0.97] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="font-bold text-[17px]">PayNow</span>
              <span className="font-medium text-[11px] opacity-70">Scan QR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
