'use client';

interface Props {
  pin: string;
  pinError: boolean;
  onDigit: (d: string) => void;
  onClear: () => void;
  onBackspace: () => void;
}

const PAD_KEYS = ['1','2','3','4','5','6','7','8','9','C','0','⌫'];

export default function LoginScreen({ pin, pinError, onDigit, onClear, onBackspace }: Props) {
  function handleKey(k: string) {
    if (k === 'C') onClear();
    else if (k === '⌫') onBackspace();
    else onDigit(k);
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-ink-dark">
      {/* Grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(255,255,255,.022) 0 18px, transparent 18px 36px)',
        }}
      />

      <div className="relative flex flex-col items-center gap-[30px] w-[380px]">
        {/* Logo + title */}
        <div className="flex flex-col items-center gap-[14px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://pub-38ab79da39164b16a64630cefe4a7851.r2.dev/logo.png"
            alt="GOH CAIFAN"
            className="w-[78px] h-[78px] rounded-[22px] object-cover"
            style={{ boxShadow: '0 10px 30px rgba(31,138,91,.35)' }}
          />
          <div className="flex flex-col items-center gap-[3px]">
            <span className="font-bold text-[24px] text-white tracking-[0.01em] font-grotesk">
              Goh Cai Png
            </span>
            <span className="font-medium text-[13px] text-ink-ghost tracking-[0.22em] uppercase font-grotesk">
              杂菜饭 · Vendor
            </span>
          </div>
        </div>

        {/* Pin dots */}
        <div
          className={`flex flex-col items-center gap-[18px] ${pinError ? 'animate-shake' : ''}`}
        >
          <span className="font-medium text-[14px] text-[#bcb6ab] font-grotesk">
            Enter passcode
          </span>
          <div className="flex gap-[16px]">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`w-4 h-4 rounded-full transition-colors duration-150 ${
                  i < pin.length ? 'bg-green' : 'border-2 border-[#4a443c]'
                }`}
              />
            ))}
          </div>
          {pinError && (
            <span className="font-semibold text-[13px] text-[#e0795f] font-grotesk">
              Wrong passcode — try again
            </span>
          )}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-[14px] w-full">
          {PAD_KEYS.map((k) => (
            <button
              key={k}
              onClick={() => handleKey(k)}
              className="h-[74px] rounded-[18px] font-mono font-bold text-[26px] text-white border-none cursor-pointer transition-colors duration-100 active:bg-white/[0.16]"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              {k}
            </button>
          ))}
        </div>

        <span className="font-medium text-[12px] text-[#5a544c] tracking-[0.04em] font-grotesk">
          Demo passcode — 1 2 3 4
        </span>
      </div>
    </div>
  );
}
