'use client';

import dynamic from 'next/dynamic';

// The 3D computer loads after the first paint, so the headline and buttons show up at once.
export const LazyHeroScene = dynamic(() => import('./hero-scene').then((m) => m.HeroScene), {
  ssr: false,
  loading: () => <div className="h-[360px] w-full sm:h-[420px] lg:h-[540px]" aria-hidden="true" />,
});
