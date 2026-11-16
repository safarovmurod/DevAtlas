'use client';

import { useEffect, useRef, useState } from 'react';
import type { ComputerScreenData } from './computer-screen';
import { ComputerStage } from './computer-stage';

type Step = { title: string; description: string };

/**
 * "How it works": a pinned section. Scrolling turns the computer to the viewer, switches
 * the screen on and finally dives into it, while the steps on the right light up one by one.
 */
export function ComputerStory({
  title,
  steps,
  screen,
  screenLabel,
}: {
  title: string;
  steps: Step[];
  screen: ComputerScreenData;
  /** Text version of what the screen shows, for screen readers. */
  screenLabel: string;
}) {
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const active = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const element = section.current;
      if (!element) return;
      // 0 when the pinned range starts, 1 when it ends.
      const range = element.offsetHeight - window.innerHeight;
      const value =
        range > 0 ? Math.min(1, Math.max(0, -element.getBoundingClientRect().top / range)) : 0;
      progress.current = value;
      const index = Math.min(steps.length - 1, Math.floor(value * steps.length));
      if (index !== active.current) {
        active.current = index;
        setActiveIndex(index);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [steps.length]);

  return (
    <section
      ref={section}
      id="how-it-works"
      aria-labelledby="how-computer-heading"
      className="lg:relative lg:h-[300vh]"
    >
      <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-5 py-16 sm:px-6 lg:sticky lg:top-0 lg:h-screen lg:grid-cols-[1.15fr_1fr] lg:py-0">
        <ComputerStage
          variant="story"
          screen={screen}
          progress={progress}
          className="h-[380px] w-full sm:h-[480px] lg:h-[640px]"
        />
        <div>
          <h2
            id="how-computer-heading"
            className="text-[32px] leading-tight font-bold tracking-[-0.02em] text-white md:text-[44px]"
          >
            {title}
          </h2>
          <div className="sr-only">
            <p>{screenLabel}</p>
            <p>
              {screen.lessonNumber} · {screen.lessonLabel}: {screen.lessonTitle}.{' '}
              {screen.lessonText} {screen.progressLabel}: {screen.progress}%.
            </p>
            <p>{screen.directionsTitle}:</p>
            <ul>
              {screen.directions.map((direction) => (
                <li key={direction.id}>
                  {direction.label} — {direction.countLabel}
                </li>
              ))}
            </ul>
          </div>
          <ol className="mt-8 space-y-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                aria-current={index === activeIndex ? 'step' : undefined}
                className={`rounded-2xl border p-5 transition-colors duration-300 ${
                  index === activeIndex
                    ? 'border-white/30 bg-white/10'
                    : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/40">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
