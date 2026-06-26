'use client';

import { HistoryEntry, Lang } from '@/types/pos';
import { T } from '@/lib/i18n';

interface Props {
  history: HistoryEntry[];
  loading?: boolean;
  lang: Lang;
}

function money(cents: number) {
  return '$' + (cents / 100).toFixed(2);
}

export default function SalesHistory({ history, loading, lang }: Props) {
  const tr = T[lang];
  const totalSalesCents = history.reduce((a, h) => a + h.total, 0);

  return (
    <div className="h-full overflow-y-auto px-9 pt-7 pb-10">
      <div className="flex gap-4 mb-[26px]">
        <div className="flex-1 bg-white border-[1.5px] border-sand rounded-[18px] px-6 py-5 flex flex-col gap-[6px]">
          <span className="font-semibold text-[12px] tracking-[0.12em] uppercase text-ink-faint font-grotesk">
            {tr.ordersToday}
          </span>
          <span className="font-mono font-bold text-[34px] text-ink">{history.length}</span>
        </div>
        <div className="flex-1 bg-green rounded-[18px] px-6 py-5 flex flex-col gap-[6px]">
          <span className="font-semibold text-[12px] tracking-[0.12em] uppercase text-white/70 font-grotesk">
            {tr.salesToday}
          </span>
          <span className="font-mono font-bold text-[34px] text-white">{money(totalSalesCents)}</span>
        </div>
      </div>

      <div className="flex items-center gap-[9px] mx-[2px] mb-[14px]">
        <span className="font-bold text-[13px] tracking-[0.14em] uppercase text-ink-muted font-grotesk">
          {tr.recentTxn}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="font-medium text-[14px] text-ink-ghost font-grotesk">{tr.loading}</span>
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <span className="font-semibold text-[15px] text-ink-faint font-grotesk">{tr.noTxnTitle}</span>
          <span className="font-normal text-[13px] text-ink-ghost font-grotesk">{tr.noTxnBody}</span>
        </div>
      ) : (
        history.map((h) => {
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
            </div>
          );
        })
      )}
    </div>
  );
}
