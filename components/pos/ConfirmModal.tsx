'use client';

import { ConfirmState, Lang } from '@/types/pos';
import { T } from '@/lib/i18n';

interface Props {
  confirm: ConfirmState;
  lang: Lang;
  onFinish: () => void;
}

export default function ConfirmModal({ confirm, lang, onFinish }: Props) {
  const tr = T[lang];
  return (
    <div className="absolute inset-0 bg-[rgba(31,27,23,0.6)] flex items-center justify-center z-30">
      <div
        className="w-[420px] bg-white rounded-[28px] px-9 py-10 flex flex-col items-center gap-[18px] animate-popin"
        style={{ boxShadow: '0 30px 70px rgba(0,0,0,.35)' }}
      >
        <div className="w-[88px] h-[88px] rounded-full bg-green-light flex items-center justify-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2.6">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="flex flex-col items-center gap-[5px]">
          <span className="font-bold text-[23px] text-ink font-grotesk">{tr.paymentReceived}</span>
          <span className="font-medium text-[14px] text-ink-muted font-grotesk">
            {confirm.count} {tr.itemsUnit} · {confirm.methodLabel}
          </span>
        </div>

        <span className="font-mono font-bold text-[46px] text-green-dark tracking-[-0.02em]">
          {'$' + (confirm.totalCents / 100).toFixed(2)}
        </span>

        <button
          onClick={onFinish}
          className="w-full h-[62px] rounded-[16px] border-none bg-ink-dark text-white cursor-pointer font-grotesk font-bold text-[17px] mt-[6px] active:scale-[0.98] transition-transform"
        >
          {tr.nextCustomer}
        </button>
      </div>
    </div>
  );
}
