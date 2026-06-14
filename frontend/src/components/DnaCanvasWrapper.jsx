'use client';

import dynamic from 'next/dynamic';

const DnaCanvas = dynamic(() => import('@/components/DnaCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
    </div>
  ),
});

export default function DnaCanvasWrapper() {
  return <DnaCanvas />;
}
