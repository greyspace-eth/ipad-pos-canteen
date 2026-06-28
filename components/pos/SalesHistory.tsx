'use client';

import { useState } from 'react';
import { HistoryEntry, Lang } from '@/types/pos';
import { T } from '@/lib/i18n';

interface Props {
  history: HistoryEntry[];
  loading?: boolean;
  lang: Lang;
  onDeleteEntry: (id: string) => void;
}

type Filter = 'all' | 'cash' | 'paynow';

function money(cents: number) {
  return '$' + (cents / 100).toFixed(2);
}

export default function SalesHistory({ history, loading, lang, onDeleteEntry }: Props) {
  const tr = T[lang];
  const [filter, setFilter] = useState<Filter>('all');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = filter === 'all' ? history : history.filter((h) => h.payment === filter);
  const totalSalesCents = filtered.reduce((a, h) => a + h.total, 0);

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onDeleteEntry(id);
        setConfirmId(null);
      }
    } finally {
      setDeleting(false);
    }
  }

  const confirmEntry = confirmId ? history.find((h) => h.id === confirmId) : null;

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
          <span className="font-mono font-bold text-[34px] text-ink">{filtered.length}</span>
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
          return (
            <div
              key={h.id}
              className="flex items-center gap-5 bg-white border-[1.5px] border-sand rounded-[16px] px-[22px] py-[18px] mb-3"
            >
              <div className="w-[74px] flex-shrink-0 font-mono font-bold text-[14px] text-ink">
                {h.time}
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-[6px]">
                <span className="font-medium text-[14px] text-ink-mid leading-[1.45] font-grotesk">
                  {itemsSummary}
                </span>
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

              <div className="w-[96px] flex-shrink-0 text-right font-mono font-bold text-[21px] text-green-dark">
                {money(h.total)}
              </div>

              <button
                onClick={() => setConfirmId(h.id)}
                className="w-[36px] h-[36px] flex-shrink-0 flex items-center justify-center rounded-[10px] border-[1.5px] border-[#f0d9d2] bg-[#fbf2ef] text-red cursor-pointer hover:bg-[#f5e2db] active:bg-[#f5e2db] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          );
        })
      )}

      {/* Delete confirmation overlay */}
      {confirmEntry && (
        <div className="absolute inset-0 bg-[rgba(31,27,23,0.55)] flex items-center justify-center z-20">
          <div
            className="w-[360px] bg-white rounded-[24px] px-8 py-8 flex flex-col gap-[16px]"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}
          >
            <div className="flex flex-col gap-[6px]">
              <span className="font-bold text-[20px] text-ink font-grotesk">{tr.confirmDeleteTitle}</span>
              <span className="font-medium text-[14px] text-ink-muted font-grotesk">{tr.confirmDeleteBody}</span>
            </div>
            <div className="bg-[#f8f4ee] rounded-[14px] px-5 py-4 flex items-center justify-between">
              <span className="font-medium text-[14px] text-ink-mid font-grotesk">{confirmEntry.time}</span>
              <span className="font-mono font-bold text-[20px] text-green-dark">{money(confirmEntry.total)}</span>
            </div>
            <div className="flex gap-3 mt-[4px]">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 h-[50px] rounded-[14px] border-[1.5px] border-sand bg-white text-ink font-grotesk font-semibold text-[15px] cursor-pointer hover:bg-[#f5f1ea] active:bg-[#f5f1ea] transition-colors"
              >
                {tr.cancel}
              </button>
              <button
                onClick={() => handleDelete(confirmEntry.id)}
                disabled={deleting}
                className="flex-1 h-[50px] rounded-[14px] border-none bg-red text-white font-grotesk font-bold text-[15px] cursor-pointer disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                {deleting ? '…' : tr.confirmDeleteYes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
