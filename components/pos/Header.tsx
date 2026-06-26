'use client';

import { Page } from '@/types/pos';

const TITLES: Record<Exclude<Page, 'login'>, string> = {
  operation: 'Order Station',
  history: 'Sales History',
  menu: 'Menu Manager',
};

interface Props {
  page: Exclude<Page, 'login'>;
}

function getDateStr() {
  try {
    return new Date().toLocaleDateString('en-SG', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return new Date().toDateString();
  }
}

export default function Header({ page }: Props) {
  const dateStr = getDateStr();

  return (
    <div className="h-[74px] flex-shrink-0 bg-white border-b-[1.5px] border-sand flex items-center justify-between px-8">
      <div className="flex flex-col">
        <span className="font-bold text-[21px] text-ink tracking-[-0.01em] font-grotesk">
          {TITLES[page]}
        </span>
        <span className="font-medium text-[12px] text-ink-faint tracking-[0.02em] font-grotesk">
          Hua Kee Cai Png · Stall #14
        </span>
      </div>
      <div className="flex items-center gap-[10px] px-4 py-[9px] border-[1.5px] border-sand rounded-[13px] bg-warm-white">
        <span className="w-2 h-2 rounded-full bg-green" />
        <span className="font-mono font-semibold text-[13px] text-ink-mid">{dateStr}</span>
      </div>
    </div>
  );
}
