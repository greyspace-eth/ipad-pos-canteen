'use client';

import { Page } from '@/types/pos';

interface Props {
  page: Page;
  onNav: (p: Page) => void;
  onLogout: () => void;
}

function navStyle(active: boolean) {
  const base =
    'flex flex-col items-center gap-[6px] w-full px-2 py-[15px] rounded-[16px] border-none cursor-pointer font-grotesk font-semibold text-[12px] tracking-[0.02em] transition-colors duration-100';
  return active
    ? `${base} bg-green text-white`
    : `${base} bg-transparent text-ink-muted hover:text-[#a8a298]`;
}

export default function Sidebar({ page, onNav, onLogout }: Props) {
  return (
    <div className="w-[104px] flex-shrink-0 bg-ink-dark flex flex-col items-center px-3 pt-5 pb-5 h-full">
      {/* Top spacer — pushes logo + nav down */}
      <div className="h-[60px] flex-shrink-0" />
      {/* Logo */}
      <div className="w-[58px] h-[58px] rounded-[17px] bg-green flex items-center justify-center font-bold text-[26px] text-white mb-[30px] font-grotesk">
        饭
      </div>

      {/* Nav items */}
      <div className="flex flex-col gap-[10px] w-full">
        <button className={navStyle(page === 'operation')} onClick={() => onNav('operation')}>
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
          <span>Order</span>
        </button>

        <button className={navStyle(page === 'history')} onClick={() => onNav('history')}>
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>History</span>
        </button>

        <button className={navStyle(page === 'menu')} onClick={() => onNav('menu')}>
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="9" y1="6" x2="20" y2="6" />
            <line x1="9" y1="12" x2="20" y2="12" />
            <line x1="9" y1="18" x2="20" y2="18" />
            <circle cx="4.5" cy="6" r="1.4" />
            <circle cx="4.5" cy="12" r="1.4" />
            <circle cx="4.5" cy="18" r="1.4" />
          </svg>
          <span>Menu</span>
        </button>
      </div>

      <div className="flex-1" />

      {/* Logout */}
      <button
        onClick={onLogout}
        className="flex flex-col items-center gap-[6px] w-full px-2 py-[14px] rounded-[16px] border-none bg-transparent text-[#6b655c] cursor-pointer font-grotesk font-semibold text-[12px] hover:bg-white/[0.06] active:bg-white/[0.06] transition-colors"
      >
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 5H6v14h8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 12h7m0 0l-3-3m3 3l-3 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Exit</span>
      </button>
    </div>
  );
}
