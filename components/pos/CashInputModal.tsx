'use client';

import { useState } from 'react';
import { Lang } from '@/types/pos';
import { T } from '@/lib/i18n';

interface Props {
  totalCents: number;
  lang: Lang;
  onConfirm: () => void;
  onClose: () => void;
}

// Quick-select note denominations in cents
const QUICK = [100, 200, 500, 1000, 2000, 5000];

const PAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

function fmt(cents: number): string {
  return '$' + (cents / 100).toFixed(2);
}

export default function CashInputModal({ totalCents, lang, onConfirm, onClose }: Props) {
  const tr = T[lang];
  // digits represent cents: "1000" = $10.00
  const [digits, setDigits] = useState('');

  const receivedCents = digits ? parseInt(digits, 10) : 0;
  const changeCents = receivedCents - totalCents;
  const isEnough = receivedCents >= totalCents;

  function pressKey(k: string) {
    if (k === '⌫') {
      setDigits((p) => p.slice(0, -1));
    } else if (digits.length < 7) {
      // Ignore leading zeros
      setDigits((p) => (p === '' && k === '0' ? '' : p + k));
    }
  }

  const displayAmount = digits ? fmt(receivedCents) : '$—';

  return (
    <div className="absolute inset-0 bg-[rgba(31,27,23,0.62)] flex items-center justify-center z-30">
      <div
        className="w-[440px] bg-white rounded-[28px] px-8 pt-8 pb-7 flex flex-col gap-[15px]"
        style={{ boxShadow: '0 30px 70px rgba(0,0,0,.38)' }}
      >
        {/* Header */}
        <div className="flex flex-col gap-[3px]">
          <span className="font-bold text-[22px] text-ink font-grotesk">{tr.cashPayment}</span>
          <span className="font-medium text-[14px] text-ink-muted font-grotesk">
            {tr.totalDue}:&nbsp;
            <span className="font-mono font-bold text-ink">{fmt(totalCents)}</span>
          </span>
        </div>

        {/* Amount display */}
        <div className="bg-[#f8f4ee] rounded-[18px] px-6 py-[14px] flex flex-col gap-[3px]">
          <span className="font-semibold text-[11px] tracking-[0.12em] uppercase text-ink-faint font-grotesk">
            {tr.amountReceived}
          </span>
          <span className="font-mono font-bold text-[44px] text-ink tracking-[-0.02em] leading-none">
            {displayAmount}
          </span>
        </div>

        {/* Quick amounts */}
        <div className="flex gap-[7px]">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => setDigits(String(q))}
              className={`flex-1 h-[38px] rounded-[10px] border-[1.5px] font-grotesk font-semibold text-[12px] cursor-pointer transition-colors ${
                receivedCents === q
                  ? 'bg-ink-dark border-ink-dark text-white'
                  : 'bg-[#f5f1ea] border-sand text-ink-mid hover:bg-[#efeae0] active:bg-[#efeae0]'
              }`}
            >
              {fmt(q)}
            </button>
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-[7px]">
          {PAD_KEYS.map((k, i) =>
            k === '' ? (
              <div key={i} />
            ) : (
              <button
                key={i}
                onClick={() => pressKey(k)}
                className="h-[58px] rounded-[14px] border-[1.5px] border-sand bg-[#f8f4ee] font-grotesk font-bold text-[24px] text-ink cursor-pointer hover:bg-[#efeae0] active:bg-[#ddd8ce] transition-colors"
              >
                {k}
              </button>
            )
          )}
        </div>

        {/* Change row */}
        <div
          className="flex items-center justify-between px-5 py-[14px] rounded-[14px]"
          style={{ backgroundColor: isEnough ? '#d6edde' : '#fbf2ef' }}
        >
          <span
            className="font-semibold text-[15px] font-grotesk"
            style={{ color: isEnough ? '#17714a' : '#c0492f' }}
          >
            {isEnough ? tr.change : tr.notEnough}
          </span>
          <span
            className="font-mono font-bold text-[26px]"
            style={{ color: isEnough ? '#17714a' : '#c0492f' }}
          >
            {isEnough ? fmt(changeCents) : '—'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-[2px]">
          <button
            onClick={onClose}
            className="flex-1 h-[54px] rounded-[14px] border-[1.5px] border-sand bg-white text-ink font-grotesk font-semibold text-[15px] cursor-pointer hover:bg-[#f5f1ea] active:bg-[#f5f1ea] transition-colors"
          >
            {tr.cancel}
          </button>
          <button
            onClick={onConfirm}
            disabled={!isEnough}
            className="flex-1 h-[54px] rounded-[14px] border-none bg-ink-dark text-white font-grotesk font-bold text-[16px] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
          >
            {tr.confirmPayment}
          </button>
        </div>
      </div>
    </div>
  );
}
