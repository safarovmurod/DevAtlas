'use client';

import { useEffect, useRef } from 'react';
import { ComputerScreen, type ComputerScreenData } from './computer-screen';
import { ComputerStage } from './computer-stage';

/**
 * The hero 3D workstation: reacts to mouse/tilt AND continuous page scroll progress (0 → 1)
 * as the visitor scrolls from the hero toward #how-it-works, with zero React re-renders.
 */
export function HeroScene({ screen }: { screen: ComputerScreenData }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    const update = () => {
      frame = 0;
      if (reduce.matches) {
        progress.current = 0;
        return;
      }
      const section = anchorRef.current?.closest('section') ?? anchorRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const range = Math.max(1, Math.min(rect.height, window.innerHeight) * 0.9);
      progress.current = Math.min(1, Math.max(0, -rect.top / range));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    reduce.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduce.removeEventListener('change', schedule);
    };
  }, []);

  return (
    <div ref={anchorRef} className="w-full min-w-0">
      <ComputerStage
        variant="hero"
        screen={<ComputerScreen data={screen} />}
        progress={progress}
        className="h-[360px] w-full min-w-0 sm:h-[420px] lg:h-[540px]"
      />
    </div>
  );
}
