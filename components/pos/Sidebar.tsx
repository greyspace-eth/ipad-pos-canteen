'use client';

import { Page, Lang } from '@/types/pos';
import { T } from '@/lib/i18n';

interface Props {
  page: Page;
  lang: Lang;
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

export default function Sidebar({ page, lang, onNav, onLogout }: Props) {
  const tr = T[lang];
  return (
    <div className="w-[104px] flex-shrink-0 bg-ink-dark flex flex-col items-center px-3 pt-5 pb-5 h-full">
      <div className="h-[60px] flex-shrink-0" />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://pub-38ab79da39164b16a64630cefe4a7851.r2.dev/logo.png"
        alt="GOH CAIFAN"
        className="w-[62px] h-[62px] rounded-[17px] object-cover mb-[30px]"
      />

      <div className="flex flex-col gap-[10px] w-full">
        <button className={navStyle(page === 'operation')} onClick={() => onNav('operation')}>
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
          <span>{tr.navOrder}</span>
        </button>

        <button className={navStyle(page === 'history')} onClick={() => onNav('history')}>
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{tr.navHistory}</span>
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
          <span>{tr.navMenu}</span>
        </button>

        <button className={navStyle(page === 'settings')} onClick={() => onNav('settings')}>
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{tr.navSettings}</span>
        </button>
      </div>

      <div className="flex-1" />

      <button
        onClick={onLogout}
        className="flex flex-col items-center gap-[6px] w-full px-2 py-[14px] rounded-[16px] border-none bg-transparent text-[#6b655c] cursor-pointer font-grotesk font-semibold text-[12px] hover:bg-white/[0.06] active:bg-white/[0.06] transition-colors"
      >
        <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 5H6v14h8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 12h7m0 0l-3-3m3 3l-3 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{tr.navExit}</span>
      </button>
    </div>
  );
}
