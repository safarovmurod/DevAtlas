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

/** One accent per direction: the same hue family as the catalog category tokens. */
const ACCENT: Record<CourseCategoryId, string> = {
  programming: '#fb923c',
  ai: '#60a5fa',
  design: '#c084fc',
  marketing: '#f59e0b',
  analytics: '#34d399',
  business: '#7dd3fc',
  'soft-skills': '#f472b6',
  content: '#a78bfa',
  languages: '#38bdf8',
  kids: '#facc15',
  lifestyle: '#4ade80',
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
      className="flex h-[625px] w-[1000px] flex-col overflow-hidden rounded-[18px] bg-[#0b0d17] text-left text-white select-none"
      style={style}
    >
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-white/10 bg-white/[0.03] px-5">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <span className="ml-4 text-[15px] font-semibold tracking-wide text-white/70">
          {data.brand}
        </span>
      </div>
      <div className="grid flex-1 grid-cols-[1fr_1.25fr] gap-6 p-7">
        <div className="flex flex-col justify-between rounded-[22px] border border-white/10 bg-gradient-to-b from-[#1b1f3a] to-[#12152a] p-7">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#7c6cff]/20 px-3 py-1 text-[15px] font-semibold text-[#c9c2ff]">
              {data.lessonNumber} · {data.lessonLabel}
            </span>
            <p className="mt-6 text-[34px] leading-[1.15] font-bold tracking-[-0.02em] text-white">
              {data.lessonTitle}
            </p>
            <p className="mt-4 text-[18px] leading-relaxed text-white/65">{data.lessonText}</p>
          </div>
          <div>
            <div className="flex items-center justify-between text-[15px] text-white/60">
              <span>{data.progressLabel}</span>
              <span className="font-semibold text-white">{data.progress}%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7c6cff] to-[#38bdf8]"
                style={{ width: `${data.progress}%` }}
              />
            </div>
            <span className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[#c2410c] text-[18px] font-semibold">
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
                className="flex flex-col justify-between rounded-[18px] border border-white/10 bg-white/[0.04] p-4"
              >
                <span
                  className="flex size-10 items-center justify-center rounded-xl text-[18px] font-bold"
                  style={{
                    background: `${ACCENT[direction.id]}26`,
                    color: ACCENT[direction.id],
                  }}
                >
                  {direction.label.charAt(0)}
                </span>
                <span>
                  <span className="block text-[18px] leading-tight font-semibold">
                    {direction.label}
                  </span>
                  <span className="mt-1 block text-[15px] text-white/55">
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
