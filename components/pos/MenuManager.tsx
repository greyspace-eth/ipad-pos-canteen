'use client';

import { MenuItem, Lang } from '@/types/pos';
import { T } from '@/lib/i18n';

interface Props {
  menu: MenuItem[];
  lang: Lang;
  onOpenAdd: () => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
}

function money(n: number) {
  return '$' + (n / 100).toFixed(2);
}

const CAT_BG: Record<string, string> = {
  'Fixed Price': '#e3eddc',
  'Custom': '#f1ddd6',
  'Others': '#e8e3ef',
  'Staff Price': '#dce8ed',
};

export default function MenuManager({ menu, lang, onOpenAdd, onEdit, onDelete }: Props) {
  const tr = T[lang];
  return (
    <div className="h-full overflow-y-auto px-9 pt-7 pb-10">
      <div className="flex items-center justify-between mb-[22px]">
        <span className="font-semibold text-[14px] text-ink-muted font-grotesk">
          {lang === 'zh' ? `菜单共 ${menu.length} 件菜品` : `${menu.length} dishes on the menu`}
        </span>
        <button
          onClick={onOpenAdd}
          className="flex items-center gap-[9px] h-[46px] px-[22px] rounded-[13px] border-none bg-green text-white cursor-pointer font-grotesk font-bold text-[15px] active:scale-[0.97] transition-transform"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
            <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
          </svg>
          {tr.newDish}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-[14px]">
        {menu.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-4 bg-white border-[1.5px] border-sand rounded-[16px] px-4 py-[14px]"
          >
            {m.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.imageUrl}
                alt={m.name}
                className="w-[54px] h-[54px] flex-shrink-0 rounded-[12px] object-cover"
              />
            ) : (
              <div
                className="w-[54px] h-[54px] flex-shrink-0 rounded-[12px]"
                style={{
                  backgroundColor: CAT_BG[m.cat] ?? '#efe7d6',
                  backgroundImage:
                    'repeating-linear-gradient(135deg, rgba(0,0,0,.05) 0 6px, transparent 6px 12px)',
                }}
              />
            )}

            <div className="flex-1 min-w-0 flex flex-col gap-[3px]">
              <span className="font-semibold text-[15px] text-ink truncate font-grotesk">
                {m.name}
              </span>
              {m.nameZh && (
                <span className="font-semibold text-[13px] text-ink-muted truncate font-grotesk">
                  {m.nameZh}
                </span>
              )}
              <span className="self-start font-semibold text-[11px] tracking-[0.04em] text-ink-muted bg-[#f1ece2] px-[9px] py-[2px] rounded-[6px] font-grotesk mt-[2px]">
                {m.cat}
              </span>
            </div>

            <span className="font-mono font-bold text-[17px] text-green-dark">
              {money(m.price)}
            </span>

            <div className="flex gap-2 ml-[6px]">
              <button
                onClick={() => onEdit(m)}
                className="w-[40px] h-[40px] border-[1.5px] border-sand rounded-[11px] bg-warm-white cursor-pointer flex items-center justify-center text-ink-mid hover:bg-[#efeae0] active:bg-[#efeae0] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 20h4L19 9l-4-4L4 16v4z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 6l4 4" strokeLinecap="round" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(m.id)}
                className="w-[40px] h-[40px] border-[1.5px] border-[#f0d9d2] rounded-[11px] bg-[#fbf2ef] cursor-pointer flex items-center justify-center text-red hover:bg-[#f5e2db] active:bg-[#f5e2db] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
