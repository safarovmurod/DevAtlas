'use client';

import { useEffect, useRef, useState } from 'react';
import type { LaptopStoryCopy } from '@/lib/landing-copy';
import { ComputerStage } from './computer-stage';
import { LaptopStoryScreen } from './laptop-story-screen';

export function ComputerStory({
  title,
  brand,
  story,
}: {
  title: string;
  brand: string;
  story: LaptopStoryCopy;
}) {
  const track = useRef<HTMLDivElement>(null);
  const pinned = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const { steps } = story;

  useEffect(() => {
    let frame = 0;
    let scrollIndex = -1;
    const update = () => {
      frame = 0;
      const element = track.current;
      const panel = pinned.current;
      if (!element || !panel) return;
      const top = parseFloat(getComputedStyle(panel).top) || 0;
      const range = Math.max(1, element.offsetHeight - panel.offsetHeight);
      const value = Math.min(1, Math.max(0, (top - element.getBoundingClientRect().top) / range));
      progress.current = value;
      const index = Math.min(steps.length - 1, Math.floor(value * steps.length));
      if (index === scrollIndex) return;
      scrollIndex = index;
      setActiveIndex(index);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [steps.length]);

  const handleSelectStep = (index: number) => {
    setActiveIndex(index);
    progress.current = steps.length > 1 ? index / (steps.length - 1) : 0;
  };

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-computer-heading"
      className="relative isolate mx-auto max-w-[1200px] scroll-mt-20 px-4 pt-12 sm:px-6 sm:pt-16"
    >
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[#38bdf8] uppercase">
          {story.demo}
        </p>
        <h2
          id="how-computer-heading"
          className="text-[32px] leading-tight font-bold tracking-[-0.025em] text-white md:text-[48px]"
        >
          {title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300/80 sm:text-base">{story.intro}</p>
      </div>
      <div ref={track} data-laptop-track className="mx-auto mt-3 max-w-[940px]">
        <div ref={pinned} className="sticky top-[74px] [@media(max-height:520px)]:static">
          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_46%,rgba(79,70,229,0.34),rgba(56,189,248,0.14)_40%,transparent_72%)]"
            />
            <ComputerStage
              variant="story"
              screen={<LaptopStoryScreen brand={brand} story={story} active={activeIndex} />}
              progress={progress}
              className="h-[clamp(204px,64vw,360px)] w-full sm:h-[clamp(310px,49svh,460px)] [@media(max-height:520px)]:h-[230px]"
            />
          </div>
          <div className="mx-auto max-w-[720px] rounded-[22px] border border-slate-400/15 bg-[#0e1526]/95 px-2 py-2 shadow-[0_24px_64px_-24px_rgba(2,6,23,0.9)] sm:px-3 sm:py-3">
            <div
              role="group"
              aria-label={story.controls}
              className="grid grid-cols-4 gap-1 sm:gap-2"
            >
              {steps.map((step, index) => (
                <button
                  key={step.title}
                  type="button"
                  aria-pressed={index === activeIndex}
                  onClick={() => handleSelectStep(index)}
                  className="flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-transparent px-1 py-1.5 text-xs font-semibold text-slate-300/75 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8] aria-pressed:border-[#818cf8]/45 aria-pressed:bg-[#4f46e5]/25 aria-pressed:text-white motion-reduce:transition-none sm:flex-row sm:gap-2 sm:text-sm"
                >
                  <span aria-hidden="true" className="font-mono text-[#38bdf8]">
                    0{index + 1}
                  </span>
                  <span>{step.title}</span>
                </button>
              ))}
            </div>
            <div className="grid px-3 pt-3 pb-2 text-center text-sm leading-relaxed sm:px-5 sm:text-base">
              {steps.map((step, index) => (
                <p
                  key={step.title}
                  className={`col-start-1 row-start-1 text-slate-300/85 ${index === activeIndex ? '' : 'invisible'}`}
                >
                  {step.description}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="h-[clamp(220px,42svh,360px)] [@media(max-height:520px)]:h-10"
        />
      </div>
    </section>
  );
}
