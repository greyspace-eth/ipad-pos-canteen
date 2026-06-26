'use client';

import { useEffect, useState } from 'react';

const DESIGN_W = 1366;
const DESIGN_H = 1024;

export default function ScaleWrapper({ children }: { children: React.ReactNode }) {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    function recalc() {
      // Scale to fill the viewport (cover), anchored top-left.
      // Slight bottom overflow is hidden; no black borders.
      const scale = Math.max(
        window.innerWidth / DESIGN_W,
        window.innerHeight / DESIGN_H
      );
      setStyle({
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        position: 'absolute',
        top: 0,
        left: 0,
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
