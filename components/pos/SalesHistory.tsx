'use client';

import { useState } from 'react';
import { HistoryEntry, OrderStatus, Lang } from '@/types/pos';
import { T } from '@/lib/i18n';

interface Props {
  history: HistoryEntry[];
  loading?: boolean;
  lang: Lang;
  onStatusChange: (id: string, status: 'voided' | 'refunded') => void;
}

type Filter = 'all' | 'cash' | 'paynow';

function money(cents: number) {
  return '$' + (cents / 100).toFixed(2);
}

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; label: string } | null> = {
  completed: null,
  voided:    { bg: '#fbf2ef', text: '#c0492f', label: 'statusVoided' },
  refunded:  { bg: '#fef8e8', text: '#9a6c00', label: 'statusRefunded' },
};

export default function SalesHistory({ history, loading, lang, onStatusChange }: Props) {
  const tr = T[lang];
  const [filter, setFilter] = useState<Filter>('all');
  const [actionId, setActionId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const filtered = filter === 'all' ? history : history.filter((h) => h.payment === filter);

  // Stats only count completed orders
  const completed = filtered.filter((h) => h.status === 'completed');
  const totalSalesCents = completed.reduce((a, h) => a + h.total, 0);

  async function handleAction(id: string, status: 'voided' | 'refunded') {
    setProcessing(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        onStatusChange(id, status);
        setActionId(null);
      }
    } finally {
      setProcessing(false);
    }
  }

  const actionEntry = actionId ? history.find((h) => h.id === actionId) : null;

  const filterBtn = (f: Filter, label: string) => (
    <button
      key={f}
      onClick={() => setFilter(f)}
      className={`h-[34px] px-[14px] rounded-[10px] border-[1.5px] font-grotesk font-semibold text-[13px] cursor-pointer transition-colors ${
        filter === f
          ? 'bg-ink-dark border-ink-dark text-white'
          : 'bg-[#f5f1ea] border-sand text-ink-muted hover:bg-[#efeae0]'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="h-full overflow-y-auto px-9 pt-7 pb-10 relative">
      {/* Stats */}
      <div className="flex gap-4 mb-[18px]">
        <div className="flex-1 bg-white border-[1.5px] border-sand rounded-[18px] px-6 py-5 flex flex-col gap-[6px]">
          <span className="font-semibold text-[12px] tracking-[0.12em] uppercase text-ink-faint font-grotesk">
            {tr.ordersToday}
          </span>
          <span className="font-mono font-bold text-[34px] text-ink">{completed.length}</span>
        </div>
        <div className="flex-1 bg-green rounded-[18px] px-6 py-5 flex flex-col gap-[6px]">
          <span className="font-semibold text-[12px] tracking-[0.12em] uppercase text-white/70 font-grotesk">
            {tr.salesToday}
          </span>
          <span className="font-mono font-bold text-[34px] text-white">{money(totalSalesCents)}</span>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex items-center gap-[8px] mb-[18px]">
        {filterBtn('all', tr.filterAll)}
        {filterBtn('cash', tr.cash)}
        {filterBtn('paynow', 'PayNow')}
      </div>

      {/* Section label */}
      <div className="flex items-center gap-[9px] mx-[2px] mb-[14px]">
        <span className="font-bold text-[13px] tracking-[0.14em] uppercase text-ink-muted font-grotesk">
          {tr.recentTxn}
        </span>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="font-medium text-[14px] text-ink-ghost font-grotesk">{tr.loading}</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <span className="font-semibold text-[15px] text-ink-faint font-grotesk">{tr.noTxnTitle}</span>
          <span className="font-normal text-[13px] text-ink-ghost font-grotesk">{tr.noTxnBody}</span>
        </div>
      ) : (
        filtered.map((h) => {
          const itemsSummary = h.items
            .map((i) => i.name + (i.qty > 1 ? ' ×' + i.qty : ''))
            .join(', ');
          const statusStyle = STATUS_COLORS[h.status];

          return (
            <div
              key={h.id}
              className="flex items-center gap-4 bg-white border-[1.5px] border-sand rounded-[16px] px-[22px] py-[18px] mb-3"
              style={statusStyle ? { backgroundColor: statusStyle.bg, borderColor: 'transparent' } : undefined}
            >
              <div className="w-[74px] flex-shrink-0 font-mono font-bold text-[14px] text-ink">
                {h.time}
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-[4px]">
                <span className="font-medium text-[14px] text-ink-mid leading-[1.45] font-grotesk">
                  {itemsSummary}
                </span>
                {statusStyle && (
                  <span
                    className="self-start font-bold text-[10px] tracking-[0.1em] px-[8px] py-[3px] rounded-[5px]"
                    style={{ color: statusStyle.text, backgroundColor: `${statusStyle.text}18` }}
                  >
                    {tr[statusStyle.label as keyof typeof tr]}
                  </span>
                )}
              </div>

              {h.payment === 'cash' ? (
                <span className="flex-shrink-0 font-semibold text-[12px] text-ink-mid bg-[#efeae0] px-[14px] py-[7px] rounded-[10px] font-grotesk">
                  {tr.cash}
                </span>
              ) : (
                <span className="flex-shrink-0 font-semibold text-[12px] text-green-dark bg-green-light px-[14px] py-[7px] rounded-[10px] font-grotesk">
                  PayNow
                </span>
              )}

              <div className="w-[90px] flex-shrink-0 text-right font-mono font-bold text-[21px]"
                style={{ color: statusStyle ? statusStyle.text : '#17714a' }}>
                {money(h.total)}
              </div>

              {/* Action button — only for completed orders */}
              {h.status === 'completed' ? (
                <button
                  onClick={() => setActionId(h.id)}
                  className="w-[36px] h-[36px] flex-shrink-0 flex items-center justify-center rounded-[10px] border-[1.5px] border-sand bg-[#f5f1ea] text-ink-muted cursor-pointer hover:bg-[#efeae0] active:bg-[#efeae0] transition-colors font-bold text-[15px]"
                >
                  ···
                </button>
              ) : (
                <div className="w-[36px] flex-shrink-0" />
              )}
            </div>
          );
        })
      )}

      {/* Void / Refund confirmation overlay */}
      {actionEntry && (
        <div className="absolute inset-0 bg-[rgba(31,27,23,0.55)] flex items-center justify-center z-20">
          <div
            className="w-[380px] bg-white rounded-[24px] px-8 py-8 flex flex-col gap-[16px]"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}
          >
            <div className="flex flex-col gap-[4px]">
              <span className="font-bold text-[20px] text-ink font-grotesk">{tr.actionTitle}</span>
              <span className="font-medium text-[13px] text-ink-muted font-grotesk">{actionEntry.time}</span>
            </div>
            <div className="bg-[#f8f4ee] rounded-[14px] px-5 py-4 flex items-center justify-between">
              <span className="font-medium text-[14px] text-ink-mid font-grotesk">
                {actionEntry.items.map((i) => i.name + (i.qty > 1 ? ' ×' + i.qty : '')).join(', ')}
              </span>
              <span className="font-mono font-bold text-[20px] text-green-dark ml-3 flex-shrink-0">
                {money(actionEntry.total)}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setActionId(null)}
                className="flex-1 h-[52px] rounded-[13px] border-[1.5px] border-sand bg-white text-ink font-grotesk font-semibold text-[14px] cursor-pointer hover:bg-[#f5f1ea] transition-colors"
              >
                {tr.cancel}
              </button>
              <button
                onClick={() => handleAction(actionEntry.id, 'voided')}
                disabled={processing}
                className="flex-1 h-[52px] rounded-[13px] border-none bg-[#c0492f] text-white font-grotesk font-bold text-[14px] cursor-pointer disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                {processing ? '…' : tr.voidOrder}
              </button>
              <button
                onClick={() => handleAction(actionEntry.id, 'refunded')}
                disabled={processing}
                className="flex-1 h-[52px] rounded-[13px] border-none bg-[#9a6c00] text-white font-grotesk font-bold text-[14px] cursor-pointer disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                {processing ? '…' : tr.refundOrder}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
