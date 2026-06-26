'use client';

import { useEffect, useState } from 'react';
import { Page, Lang } from '@/types/pos';
import { T } from '@/lib/i18n';

const PAGE_KEY: Record<Exclude<Page, 'login'>, 'pageOrder' | 'pageHistory' | 'pageMenu' | 'pageSettings'> = {
  operation: 'pageOrder',
  history: 'pageHistory',
  menu: 'pageMenu',
  settings: 'pageSettings',
};

interface Props {
  page: Exclude<Page, 'login'>;
  lang: Lang;
}

export default function Header({ page, lang }: Props) {
  const tr = T[lang];
  const [online, setOnline] = useState(true);

  useEffect(() => {
    async function ping() {
      try {
        const res = await fetch('/api/auth/me', { method: 'GET' });
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
          {tr[PAGE_KEY[page]]}
        </span>
        <span className="font-medium text-[12px] text-ink-faint tracking-[0.02em] font-grotesk">
          GOH CAIFAN · 吴
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
          {online ? tr.statusLive : tr.statusOff}
        </span>
      </div>
    </div>
  );
}
