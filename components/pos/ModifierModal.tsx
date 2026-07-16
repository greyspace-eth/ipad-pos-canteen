'use client';

import { useState, useEffect } from 'react';
import { MenuItem, ModifierGroup, SelectedModifier, Lang } from '@/types/pos';
import { T } from '@/lib/i18n';

interface Props {
  item: MenuItem;
  lang: Lang;
  onConfirm: (modifiers: SelectedModifier[]) => void;
  onCancel: () => void;
}

function money(cents: number) {
  if (cents === 0) return '';
  return (cents > 0 ? '+' : '') + '$' + (Math.abs(cents) / 100).toFixed(2);
}

function buildInitialSelections(groups: ModifierGroup[]): Record<string, string[]> {
  const init: Record<string, string[]> = {};
  for (const g of groups) {
    const def = g.options.find((o) => o.isDefault);
    if (def) {
      init[g.id] = [def.id];
    } else {
      init[g.id] = [];
    }
  }
  return init;
}

export default function ModifierModal({ item, lang, onConfirm, onCancel }: Props) {
  const tr = T[lang];
  const groups = item.modifierGroups ?? [];

  const [selections, setSelections] = useState<Record<string, string[]>>(() =>
    buildInitialSelections(groups)
  );
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    setSelections(buildInitialSelections(groups));
    setShowErrors(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  function toggle(group: ModifierGroup, optionId: string) {
    setSelections((prev) => {
      const current = prev[group.id] ?? [];
      if (group.singleSelect) {
        return { ...prev, [group.id]: current[0] === optionId ? [] : [optionId] };
      }
      // multi-select
      const has = current.includes(optionId);
      return {
        ...prev,
        [group.id]: has ? current.filter((id) => id !== optionId) : [...current, optionId],
      };
    });
  }

  function handleConfirm() {
    const invalid = groups.some((g) => g.required && (selections[g.id] ?? []).length === 0);
    if (invalid) {
      setShowErrors(true);
      return;
    }
    const modifiers: SelectedModifier[] = [];
    for (const g of groups) {
      const selected = selections[g.id] ?? [];
      for (const optId of selected) {
        const opt = g.options.find((o) => o.id === optId);
        if (opt) modifiers.push({ optionId: opt.id, optionName: opt.name, priceCents: opt.priceCents });
      }
    }
    onConfirm(modifiers);
  }

  const modifierTotal = groups.reduce((sum, g) => {
    const selected = selections[g.id] ?? [];
    return sum + selected.reduce((s, optId) => {
      const opt = g.options.find((o) => o.id === optId);
      return s + (opt?.priceCents ?? 0);
    }, 0);
  }, 0);

  const grandTotal = item.price + modifierTotal;

  return (
    <div className="absolute inset-0 bg-black/55 flex items-center justify-center z-30">
      <div
        className="w-[560px] max-h-[780px] bg-white rounded-[28px] flex flex-col overflow-hidden animate-popin"
        style={{ boxShadow: '0 28px 70px rgba(0,0,0,.35)' }}
      >
        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b-[1.5px] border-sand flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-[3px]">
              <span className="font-bold text-[22px] text-ink font-grotesk leading-tight">
                {lang === 'zh' && item.nameZh ? item.nameZh : item.name}
              </span>
              <span className="font-mono font-semibold text-[15px] text-ink-muted">
                ${(item.price / 100).toFixed(2)} base
              </span>
            </div>
            {item.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-[60px] h-[60px] rounded-[14px] object-cover flex-shrink-0"
              />
            )}
          </div>
        </div>

        {/* Groups — scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-5 flex flex-col gap-6">
          {groups.map((group) => {
            const selected = selections[group.id] ?? [];
            const hasError = showErrors && group.required && selected.length === 0;

            return (
              <div key={group.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-[15px] text-ink font-grotesk">{group.name}</span>
                  {group.required ? (
                    <span
                      className="text-[10px] font-bold tracking-[0.08em] uppercase px-[8px] py-[3px] rounded-[5px]"
                      style={{ color: hasError ? '#c0492f' : '#17714a', backgroundColor: hasError ? '#fbf2ef' : '#e3eddc' }}
                    >
                      {tr.requiredBadge}
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-ink-ghost bg-[#f1ece2] px-[8px] py-[3px] rounded-[5px]">
                      Optional
                    </span>
                  )}
                  {!group.singleSelect && (
                    <span className="text-[10px] font-semibold tracking-[0.06em] text-ink-ghost font-grotesk ml-auto">
                      Choose multiple
                    </span>
                  )}
                </div>
                {hasError && (
                  <p className="text-[12px] font-semibold text-[#c0492f] font-grotesk mb-2 -mt-1">
                    {tr.selectionRequired}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {group.options.map((opt) => {
                    const isSelected = selected.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => toggle(group, opt.id)}
                        className="flex items-center gap-[6px] h-[46px] px-[16px] rounded-[13px] border-[2px] cursor-pointer font-grotesk font-semibold text-[14px] transition-all active:scale-[0.97]"
                        style={
                          isSelected
                            ? { borderColor: '#1f8a5b', backgroundColor: '#1f8a5b', color: '#fff' }
                            : { borderColor: '#e0dace', backgroundColor: '#f9f6f0', color: '#2C1A0E' }
                        }
                      >
                        <span>{opt.name}</span>
                        {opt.priceCents !== 0 && (
                          <span
                            className="font-mono text-[12px]"
                            style={{ opacity: isSelected ? 0.85 : 0.65 }}
                          >
                            {money(opt.priceCents)}
                          </span>
                        )}
                        {opt.priceCents === 0 && opt.isDefault && (
                          <span
                            className="font-mono text-[11px]"
                            style={{ opacity: isSelected ? 0.8 : 0.5 }}
                          >
                            {tr.free}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-8 pb-7 pt-5 border-t-[1.5px] border-sand flex-shrink-0 flex items-center gap-3">
          <button
            onClick={onCancel}
            className="h-[58px] px-6 rounded-[15px] border-[1.5px] border-sand bg-white text-ink-mid font-grotesk font-bold text-[15px] cursor-pointer hover:bg-cream transition-colors"
          >
            {tr.cancel}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 h-[58px] rounded-[15px] border-none bg-green text-white font-grotesk font-bold text-[16px] cursor-pointer active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
          >
            <span>{tr.addToOrder}</span>
            <span className="font-mono font-bold text-[17px] opacity-90">
              ${(grandTotal / 100).toFixed(2)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
