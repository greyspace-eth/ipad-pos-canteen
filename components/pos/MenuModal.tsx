'use client';

import { useRef } from 'react';
import { Draft, MenuCategory, Category, Lang } from '@/types/pos';
import { T } from '@/lib/i18n';

interface Props {
  draft: Draft;
  draftError: string;
  uploading: boolean;
  lang: Lang;
  categories: Category[];
  onChangeName: (v: string) => void;
  onChangeNameZh: (v: string) => void;
  onChangePrice: (v: string) => void;
  onChangeCat: (c: MenuCategory) => void;
  onUploadImage: (file: File) => void;
  onClearImage: () => void;
  onSave: () => void;
  onClose: () => void;
}

export default function MenuModal({
  draft,
  draftError,
  uploading,
  lang,
  categories,
  onChangeName,
  onChangeNameZh,
  onChangePrice,
  onChangeCat,
  onUploadImage,
  onClearImage,
  onSave,
  onClose,
}: Props) {
  const tr = T[lang];
  const isEdit = !!draft.id;
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onUploadImage(file);
    e.target.value = '';
  }

  return (
    <div className="absolute inset-0 bg-black/55 flex items-center justify-center z-20">
      <div
        className="w-[440px] bg-white rounded-[24px] p-7 flex flex-col gap-5 animate-popin"
        style={{ boxShadow: '0 24px 60px rgba(0,0,0,.3)' }}
      >
        <span className="font-bold text-[21px] text-ink font-grotesk">
          {isEdit ? tr.editDish : tr.addDish}
        </span>

        {/* Photo */}
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-[13px] text-ink-muted tracking-[0.02em] font-grotesk">
            {tr.photoLabel}
          </span>
          <div className="flex items-center gap-3">
            {draft.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={draft.imageUrl}
                alt="dish preview"
                className="w-[64px] h-[64px] rounded-[12px] object-cover border-[1.5px] border-sand"
              />
            ) : (
              <div className="w-[64px] h-[64px] rounded-[12px] border-[1.5px] border-dashed border-sand-muted bg-warm-white flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#bcb6ab" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="h-[38px] px-4 border-[1.5px] border-sand rounded-[10px] bg-warm-white font-grotesk font-semibold text-[13px] text-ink-mid cursor-pointer hover:bg-[#efeae0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? tr.uploading : draft.imageUrl ? tr.replacePhoto : tr.uploadPhoto}
              </button>
              {draft.imageUrl && (
                <button
                  type="button"
                  onClick={onClearImage}
                  className="text-[12px] text-red font-grotesk font-medium text-left pl-1 cursor-pointer bg-transparent border-none"
                >
                  {tr.removePhoto}
                </button>
              )}
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Dish name (English) */}
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-[13px] text-ink-muted tracking-[0.02em] font-grotesk">
            {tr.dishNameEn}
          </span>
          <input
            value={draft.name}
            onChange={(e) => onChangeName(e.target.value)}
            placeholder="e.g. Salted Egg Chicken"
            className="h-[52px] border-[1.5px] border-sand rounded-[13px] px-4 font-grotesk font-semibold text-[16px] text-ink outline-none bg-warm-white focus:border-green focus:bg-white transition-colors"
          />
        </div>

        {/* Dish name (Chinese) */}
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-[13px] text-ink-muted tracking-[0.02em] font-grotesk">
            {tr.dishNameZh}
          </span>
          <input
            value={draft.nameZh}
            onChange={(e) => onChangeNameZh(e.target.value)}
            placeholder="例：咸蛋鸡"
            className="h-[52px] border-[1.5px] border-sand rounded-[13px] px-4 font-grotesk font-semibold text-[16px] text-ink outline-none bg-warm-white focus:border-green focus:bg-white transition-colors"
          />
        </div>

        {/* Price */}
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-[13px] text-ink-muted tracking-[0.02em] font-grotesk">
            {tr.priceSGD}
          </span>
          <input
            value={draft.price}
            onChange={(e) => onChangePrice(e.target.value)}
            inputMode="decimal"
            placeholder="0.00"
            className="h-[52px] border-[1.5px] border-sand rounded-[13px] px-4 font-mono font-semibold text-[16px] text-ink outline-none bg-warm-white focus:border-green focus:bg-white transition-colors"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-[13px] text-ink-muted tracking-[0.02em] font-grotesk">
            {tr.categoryLabel}
          </span>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => onChangeCat(c.name)}
                className={`h-[44px] border-[1.5px] rounded-[11px] cursor-pointer font-grotesk font-semibold text-[13px] transition-colors ${
                  draft.cat === c.name
                    ? 'border-green bg-green text-white'
                    : 'border-sand bg-warm-white text-ink-mid hover:bg-[#f0ebe1]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {draftError && (
          <span className="font-semibold text-[13px] text-red font-grotesk">{draftError}</span>
        )}

        <div className="flex gap-3 mt-1">
          <button
            onClick={onClose}
            className="flex-1 h-[54px] border-[1.5px] border-sand rounded-[14px] bg-white text-ink-mid cursor-pointer font-grotesk font-bold text-[15px] hover:bg-cream active:bg-cream transition-colors"
          >
            {tr.cancel}
          </button>
          <button
            onClick={onSave}
            disabled={uploading}
            className="flex-[1.4] h-[54px] border-none rounded-[14px] bg-green text-white cursor-pointer font-grotesk font-bold text-[15px] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEdit ? tr.saveChanges : tr.addToMenu}
          </button>
        </div>
      </div>
    </div>
  );
}
