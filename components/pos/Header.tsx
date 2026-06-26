'use client';

import { useEffect, useState } from 'react';
import { Page } from '@/types/pos';

const TITLES: Record<Exclude<Page, 'login'>, string> = {
  operation: 'Order Station',
  history: 'Sales History',
  menu: 'Menu Manager',
};

interface Props {
  page: Exclude<Page, 'login'>;
}

export default function Header({ page }: Props) {
  // Start optimistically online; update after first ping
  const [online, setOnline] = useState(true);

  useEffect(() => {
    async function ping() {
      try {
        const res = await fetch('/api/auth/me', { method: 'GET' });
        // Any HTTP response (including 401) means server is reachable
        setOnline(res.status < 500);
      } catch {
        setOnline(false);
      }
    }

    ping();
    const id = setInterval(ping, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-[74px] flex-shrink-0 bg-white border-b-[1.5px] border-sand flex items-center justify-between px-8">
      <div className="flex flex-col">
        <span className="font-bold text-[21px] text-ink tracking-[-0.01em] font-grotesk">
          {TITLES[page]}
        </span>
        <span className="font-medium text-[12px] text-ink-faint tracking-[0.02em] font-grotesk">
          Best Cai Png
        </span>
      </div>

      <div className="flex items-center gap-[10px] px-4 py-[9px] border-[1.5px] border-sand rounded-[13px] bg-warm-white">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: online ? '#1f8a5b' : '#c0492f' }}
        />
        <span
          className="font-mono font-semibold text-[13px]"
          style={{ color: online ? '#1f8a5b' : '#c0492f' }}
        >
          {online ? 'LIVE' : 'OFF'}
        </span>
      </div>
    </div>
  );
}
