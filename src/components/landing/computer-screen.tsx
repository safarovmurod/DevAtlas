import type { CSSProperties } from 'react';
import type { CourseCategoryId } from '@/content/course-categories';
import type { LandingDirection } from '@/lib/landing-directions';

export type ComputerScreenData = {
  brand: string;
  lessonNumber: string;
  lessonLabel: string;
  lessonTitle: string;
  lessonText: string;
  progressLabel: string;
  progress: number;
  action: string;
  directionsTitle: string;
  directions: LandingDirection[];
};

/** Cohesive Atlas Precision Studio accents per learning category. */
const ACCENT: Record<CourseCategoryId, string> = {
  programming: '#818cf8',
  ai: '#38bdf8',
  design: '#a78bfa',
  marketing: '#60a5fa',
  analytics: '#34d399',
  business: '#7dd3fc',
  'soft-skills': '#c4b5fd',
  content: '#93c5fd',
  languages: '#22d3ee',
  kids: '#67e8f9',
  lifestyle: '#6ee7b7',
};

/**
 * The app window shown on the computer screen: a real lesson card and the direction list.
 * Fixed 1000×625 px design, so it stays sharp when the 3D scene scales it. It is drawn
 * for the eye only (aria-hidden on its stage); the page has the same content as text.
 */
export function ComputerScreen({
  data,
  style,
}: {
  data: ComputerScreenData;
  style?: CSSProperties;
}) {
  return (
    <div
      className="flex h-[625px] w-[1000px] flex-col overflow-hidden rounded-[18px] bg-[#060913] text-left text-white select-none"
      style={style}
    >
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-400/15 bg-[#0e1526]/90 px-5">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-slate-500/70" />
          <span className="size-3 rounded-full bg-[#818cf8]/80" />
          <span className="size-3 rounded-full bg-[#38bdf8]/85" />
          <span className="ml-4 text-[15px] font-semibold tracking-wide text-slate-200">
            {data.brand}
          </span>
        </div>
        <span className="rounded-full border border-slate-400/20 bg-[#4f46e5]/15 px-3 py-0.5 font-mono text-[12px] tracking-wider text-[#38bdf8]">
          STUDIO
        </span>
      </div>
      <div className="grid flex-1 grid-cols-[1fr_1.25fr] gap-6 p-7">
        <div className="flex flex-col justify-between rounded-[22px] border border-slate-400/15 bg-gradient-to-b from-[#131c36] to-[#0c1324] p-7">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#818cf8]/30 bg-[#4f46e5]/20 px-3.5 py-1 text-[15px] font-semibold text-[#c7d2fe]">
              {data.lessonNumber} · {data.lessonLabel}
            </span>
            <p className="mt-6 text-[34px] leading-[1.15] font-bold tracking-[-0.02em] text-white">
              {data.lessonTitle}
            </p>
            <p className="mt-4 text-[18px] leading-relaxed text-slate-300/80">{data.lessonText}</p>
          </div>
          <div>
            <div className="flex items-center justify-between text-[15px] text-slate-300/75">
              <span>{data.progressLabel}</span>
              <span className="font-semibold text-[#38bdf8]">{data.progress}%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-400/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4f46e5] via-[#818cf8] to-[#38bdf8]"
                style={{ width: `${data.progress}%` }}
              />
            </div>
            <span className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[#4f46e5] text-[18px] font-semibold text-white ring-1 ring-inset ring-white/15">
              {data.action} →
            </span>
          </div>
        </div>
        <div className="flex flex-col">
          <p className="text-[26px] font-bold tracking-[-0.01em] text-white">
            {data.directionsTitle}
          </p>
          <div className="mt-5 grid flex-1 grid-cols-2 gap-3">
            {data.directions.map((direction) => (
              <div
                key={direction.id}
                className="flex flex-col justify-between rounded-[18px] border border-slate-400/15 bg-[#0e1526]/90 p-4"
              >
                <span
                  className="flex size-10 items-center justify-center rounded-xl text-[18px] font-bold"
                  style={{
                    background: `${ACCENT[direction.id]}24`,
                    color: ACCENT[direction.id],
                  }}
                >
                  {direction.label.charAt(0)}
                </span>
                <span>
                  <span className="block text-[18px] leading-tight font-semibold text-white">
                    {direction.label}
                  </span>
                  <span className="mt-1 block text-[15px] text-slate-400">
                    {direction.countLabel}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
