'use client';

import { ConfirmState } from '@/types/pos';

interface Props {
  confirm: ConfirmState;
  onFinish: () => void;
}

export default function ConfirmModal({ confirm, onFinish }: Props) {
  return (
    <div className="absolute inset-0 bg-[rgba(31,27,23,0.6)] flex items-center justify-center z-30">
      <div
        className="w-[420px] bg-white rounded-[28px] px-9 py-10 flex flex-col items-center gap-[18px] animate-popin"
        style={{ boxShadow: '0 30px 70px rgba(0,0,0,.35)' }}
      >
        {/* Check circle */}
        <div className="w-[88px] h-[88px] rounded-full bg-green-light flex items-center justify-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2.6">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Labels */}
        <div className="flex flex-col items-center gap-[5px]">
          <span className="font-bold text-[23px] text-ink font-grotesk">Payment received</span>
          <span className="font-medium text-[14px] text-ink-muted font-grotesk">
            {confirm.count} items · {confirm.methodLabel}
          </span>
        </div>

        {/* Total */}
        <span className="font-mono font-bold text-[46px] text-green-dark tracking-[-0.02em]">
          {'$' + (confirm.totalCents / 100).toFixed(2)}
        </span>

        {/* CTA */}
        <button
          onClick={onFinish}
          className="w-full h-[62px] rounded-[16px] border-none bg-ink-dark text-white cursor-pointer font-grotesk font-bold text-[17px] mt-[6px] active:scale-[0.98] transition-transform"
        >
          Next customer
        </button>
      </div>
    </div>
  );
}
