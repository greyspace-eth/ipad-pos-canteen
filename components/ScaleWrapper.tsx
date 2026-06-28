'use client';

import { useEffect, useState } from 'react';

const DESIGN_W = 1366;
const DESIGN_H = 1024;

export default function ScaleWrapper({ children }: { children: React.ReactNode }) {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    function recalc() {
      // Contain mode: scale down to fit any viewport, centred.
      const scale = Math.min(
        window.innerWidth / DESIGN_W,
        window.innerHeight / DESIGN_H
      );
      const offsetX = Math.max(0, (window.innerWidth - DESIGN_W * scale) / 2);
      const offsetY = Math.max(0, (window.innerHeight - DESIGN_H * scale) / 2);
      setStyle({
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        position: 'absolute',
        top: offsetY,
        left: offsetX,
        width: DESIGN_W,
        height: DESIGN_H,
      });
    }
    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, []);

  return <div style={style}>{children}</div>;
}
