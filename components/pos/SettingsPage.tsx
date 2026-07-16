'use client';

import { useState } from 'react';
import { T, Lang } from '@/lib/i18n';
import { Category } from '@/types/pos';

interface Props {
  lang: Lang;
  categories: Category[];
  onChangeLang: (l: Lang) => void;
  onAddCategory: (name: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export default function SettingsPage({
  lang, categories, onChangeLang, onAddCategory, onDeleteCategory,
}: Props) {
  const tr = T[lang];
  const [newCatName, setNewCatName] = useState('');
  const [adding, setAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleAdd() {
    const name = newCatName.trim();
    if (!name) return;
    setAdding(true);
    await onAddCategory(name);
    setNewCatName('');
    setAdding(false);
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    await onDeleteCategory(id);
    setConfirmDeleteId(null);
    setDeleting(false);
  }

  const confirmCat = confirmDeleteId ? categories.find((c) => c.id === confirmDeleteId) : null;

  return (
    <div className="h-full overflow-y-auto px-9 pt-7 pb-10 relative">
      {/* Language */}
      <div className="bg-white border-[1.5px] border-sand rounded-[22px] p-7 max-w-[560px] mb-5">
        <span className="font-bold text-[13px] tracking-[0.12em] uppercase text-ink-muted font-grotesk">
          {tr.settingsLang}
        </span>
        <div className="flex gap-3 mt-5">
          {(['en', 'zh'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => onChangeLang(l)}
              className={`flex-1 h-[62px] rounded-[14px] border-[1.5px] cursor-pointer font-grotesk font-bold text-[17px] transition-colors active:scale-[0.97] ${
                lang === l
                  ? 'bg-green border-green text-white'
                  : 'bg-warm-white border-sand text-ink-mid hover:bg-cream'
              }`}
            >
              {l === 'en' ? tr.langEn : tr.langZh}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-[1.5px] border-sand rounded-[22px] p-7 max-w-[560px]">
        <span className="font-bold text-[13px] tracking-[0.12em] uppercase text-ink-muted font-grotesk">
          {tr.settingsCat}
        </span>

        <div className="mt-5 flex flex-col gap-[10px]">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 px-4 py-[13px] rounded-[14px] border-[1.5px] border-sand bg-[#f9f6f0]"
            >
              <span
                className="w-[10px] h-[10px] rounded-[3px] flex-shrink-0"
                style={{ background: c.name === 'Staff Price' ? '#1a6fa0' : '#1f8a5b' }}
              />
              <span className="flex-1 font-semibold text-[15px] text-ink font-grotesk">{c.name}</span>
              {c.system ? (
                <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-ink-ghost font-grotesk px-[10px] py-[4px] rounded-[6px] bg-[#ede8df]">
                  {tr.systemBadge}
                </span>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(c.id)}
                  className="w-[34px] h-[34px] flex items-center justify-center rounded-[9px] border-[1.5px] border-[#f0d9d2] bg-[#fbf2ef] text-red cursor-pointer hover:bg-[#f5e2db] active:bg-[#f5e2db] transition-colors"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          {/* Add new category */}
          <div className="flex gap-2 mt-[6px]">
            <input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder={tr.newCatPlaceholder}
              maxLength={32}
              className="flex-1 h-[50px] border-[1.5px] border-sand rounded-[13px] px-4 font-grotesk font-semibold text-[15px] text-ink outline-none bg-warm-white focus:border-green focus:bg-white transition-colors"
            />
            <button
              onClick={handleAdd}
              disabled={adding || !newCatName.trim()}
              className="h-[50px] px-5 rounded-[13px] bg-green border-none text-white font-grotesk font-bold text-[15px] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] transition-transform"
            >
              {adding ? '…' : tr.addCat}
            </button>
          </div>
        </div>
      </div>

      {/* Delete category confirmation */}
      {confirmCat && (
        <div className="absolute inset-0 bg-[rgba(31,27,23,0.5)] flex items-center justify-center z-20">
          <div
            className="w-[360px] bg-white rounded-[24px] px-8 py-8 flex flex-col gap-[16px]"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}
          >
            <div className="flex flex-col gap-[6px]">
              <span className="font-bold text-[20px] text-ink font-grotesk">{tr.confirmDeleteCat}</span>
              <span className="font-medium text-[14px] text-ink-muted font-grotesk">{tr.confirmDeleteCatBody}</span>
            </div>
            <div className="bg-[#f8f4ee] rounded-[12px] px-5 py-3">
              <span className="font-semibold text-[15px] text-ink font-grotesk">{confirmCat.name}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 h-[50px] rounded-[14px] border-[1.5px] border-sand bg-white text-ink font-grotesk font-semibold text-[15px] cursor-pointer hover:bg-[#f5f1ea] transition-colors"
              >
                {tr.cancel}
              </button>
              <button
                onClick={() => handleDelete(confirmCat.id)}
                disabled={deleting}
                className="flex-1 h-[50px] rounded-[14px] border-none bg-red text-white font-grotesk font-bold text-[15px] cursor-pointer disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                {deleting ? '…' : tr.deleteEntry}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
