'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { CATEGORY_ICONS } from '@/components/courses/category-icons';
import type { LandingDirection } from '@/lib/landing-directions';
import type { LaptopStoryCopy } from '@/lib/landing-copy';
import type { InterfaceLocale } from '@/lib/locale';
import { ComputerStage } from './computer-stage';
import { LaptopStoryScreen } from './laptop-story-screen';

const OPEN_THRESHOLD = 0.16;

export function ComputerStory({
  title,
  directionTitle,
  brand,
  story,
  directions,
  locale,
}: {
  title: string;
  directionTitle: string;
  brand: string;
  story: LaptopStoryCopy;
  directions: LandingDirection[];
  locale: InterfaceLocale;
}) {
  const track = useRef<HTMLDivElement>(null);
  const pinned = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const { steps } = story;
  const totalSteps = steps.length + directions.length;

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
      // First 16% of scroll smoothly opens the closed laptop lid; remaining 84% steps through all 10 screens.
      const normalized =
        value <= OPEN_THRESHOLD ? 0 : (value - OPEN_THRESHOLD) / (1 - OPEN_THRESHOLD);
      const index = Math.min(totalSteps - 1, Math.floor(normalized * totalSteps));
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
  }, [totalSteps]);

  const handleSelectStep = (index: number) => {
    setActiveIndex(index);
    // Ensure clicking any step opens the laptop lid smoothly and jumps cleanly to that slide.
    progress.current =
      totalSteps > 1
        ? OPEN_THRESHOLD + 0.04 + (index / (totalSteps - 1)) * (1 - OPEN_THRESHOLD - 0.04)
        : 0.25;
  };

  const activeDirection =
    activeIndex >= steps.length ? directions[activeIndex - steps.length] : null;
  const activeStep = activeIndex < steps.length ? steps[activeIndex] : null;

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-computer-heading"
      className="relative isolate mx-auto max-w-[1200px] scroll-mt-20 px-4 pt-14 pb-10 sm:px-6 sm:pt-20"
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

      <div ref={track} data-laptop-track className="mx-auto mt-4 max-w-[1000px]">
        <div
          ref={pinned}
          className="sticky top-[70px] flex min-h-[calc(100svh-90px)] flex-col items-center justify-center [@media(max-height:560px)]:static [@media(max-height:560px)]:min-h-0"
        >
          <div className="relative w-full">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,rgba(79,70,229,0.34),rgba(56,189,248,0.14)_42%,transparent_72%)]"
            />
            <ComputerStage
              variant="story"
              screen={
                <LaptopStoryScreen
                  brand={brand}
                  story={story}
                  directions={directions}
                  locale={locale}
                  active={activeIndex}
                />
              }
              progress={progress}
              className="h-[clamp(220px,62vw,360px)] w-full sm:h-[clamp(300px,46svh,440px)] [@media(max-height:560px)]:h-[240px]"
            />
          </div>

          <div className="mx-auto mt-2 w-full max-w-[920px] rounded-[22px] border border-slate-400/15 bg-[#0e1526]/95 p-3 shadow-[0_24px_64px_-24px_rgba(2,6,23,0.9)] sm:p-4">
            {/* Workflow steps 01 - 04 */}
            <div
              role="group"
              aria-label={story.controls}
              className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2"
            >
              {steps.map((step, index) => (
                <button
                  key={step.title}
                  type="button"
                  aria-pressed={index === activeIndex}
                  onClick={() => handleSelectStep(index)}
                  className="flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2.5 py-2 text-xs font-semibold text-slate-300/80 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8] aria-pressed:border-[#818cf8]/45 aria-pressed:bg-[#4f46e5]/25 aria-pressed:text-white motion-reduce:transition-none sm:text-sm"
                >
                  <span aria-hidden="true" className="font-mono text-[#38bdf8]">
                    0{index + 1}
                  </span>
                  <span className="truncate">{step.title}</span>
                </button>
              ))}
            </div>

            {/* Active step description / CTA */}
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-3 border-y border-slate-400/12 px-2 py-2.5 text-center text-sm leading-relaxed text-slate-200/85">
              {activeStep ? (
                <p className="m-0">{activeStep.description}</p>
              ) : activeDirection ? (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <span className="font-semibold text-white">
                    {activeDirection.label} · {activeDirection.countLabel}
                  </span>
                  <Link
                    href={`/courses/category/${activeDirection.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#4f46e5] px-3 py-1.5 text-xs font-semibold text-white no-underline transition-colors hover:bg-[#4338ca]"
                  >
                    <span>{activeDirection.label}</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              ) : null}
            </div>

            {/* Integrated Directions 05 - 10 inside the laptop showcase */}
            <div id="directions" className="mt-3 scroll-mt-24">
              <div className="mb-2 flex items-center justify-between px-1">
                <h3 className="m-0 text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">
                  {directionTitle}
                </h3>
                <span className="font-mono text-[11px] text-slate-400">
                  0{steps.length + 1}–{String(totalSteps).padStart(2, '0')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {directions.map((category, idx) => {
                  const stepIdx = steps.length + idx;
                  const Icon = CATEGORY_ICONS[category.id];
                  const selected = activeIndex === stepIdx;
                  return (
                    <Link
                      key={category.id}
                      href={`/courses/category/${category.id}`}
                      onMouseEnter={() => handleSelectStep(stepIdx)}
                      onFocus={() => handleSelectStep(stepIdx)}
                      className={
                        'group flex min-h-[54px] items-center gap-2.5 rounded-xl border px-3 py-2 text-left no-underline transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8] motion-reduce:transition-none ' +
                        (selected
                          ? 'border-[#38bdf8]/55 bg-[#4f46e5]/25 text-white shadow-[0_8px_24px_-12px_rgba(56,189,248,0.5)]'
                          : 'border-slate-400/15 bg-[#0a1020]/85 text-slate-200 hover:border-[#38bdf8]/35 hover:bg-[#131d33]')
                      }
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#4f46e5]/20 text-[#818cf8] ring-1 ring-inset ring-[#818cf8]/25 group-hover:text-[#38bdf8]">
                        <Icon size={16} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-xs font-semibold text-white sm:text-sm">
                          <span className="mr-1 font-mono text-[11px] text-[#38bdf8]">
                            {String(stepIdx + 1).padStart(2, '0')}
                          </span>
                          {category.label}
                        </strong>
                        <small className="block truncate text-[11px] text-slate-400">
                          {category.countLabel}
                        </small>
                      </span>
                      <ArrowRight
                        size={14}
                        aria-hidden="true"
                        className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-[#38bdf8]"
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {/* Balanced scroll track: enough travel for lid open + 10 steps without feeling endless or jumpy. */}
        <div
          aria-hidden="true"
          className="h-[clamp(1400px,230svh,2350px)] [@media(max-height:560px)]:h-12"
        />
      </div>
    </section>
  );
}
