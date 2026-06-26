'use client';

import { T, Lang } from '@/lib/i18n';

interface Props {
  lang: Lang;
  onChangeLang: (l: Lang) => void;
}

export default function SettingsPage({ lang, onChangeLang }: Props) {
  const tr = T[lang];
  return (
    <div className="h-full overflow-y-auto px-9 pt-7 pb-10">
      <div className="bg-white border-[1.5px] border-sand rounded-[22px] p-7 max-w-[520px]">
        <span className="font-bold text-[13px] tracking-[0.12em] uppercase text-ink-muted font-grotesk">
          {tr.settingsLang}
        </span>
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => onChangeLang('en')}
            className={`flex-1 h-[62px] rounded-[14px] border-[1.5px] cursor-pointer font-grotesk font-bold text-[17px] transition-colors active:scale-[0.97] ${
              lang === 'en'
                ? 'bg-green border-green text-white'
                : 'bg-warm-white border-sand text-ink-mid hover:bg-cream'
            }`}
          >
            {tr.langEn}
          </button>
          <button
            onClick={() => onChangeLang('zh')}
            className={`flex-1 h-[62px] rounded-[14px] border-[1.5px] cursor-pointer font-grotesk font-bold text-[17px] transition-colors active:scale-[0.97] ${
              lang === 'zh'
                ? 'bg-green border-green text-white'
                : 'bg-warm-white border-sand text-ink-mid hover:bg-cream'
            }`}
          >
            {tr.langZh}
          </button>
        </div>
      </div>
    </div>
  );
}
