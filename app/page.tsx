import POS from '@/components/pos/POS';
import ScaleWrapper from '@/components/ScaleWrapper';

export default function Home() {
  return (
    <main className="w-screen h-screen bg-[#0f0e0c] overflow-hidden relative">
      <ScaleWrapper>
        <POS />
      </ScaleWrapper>
    </main>
  );
}
