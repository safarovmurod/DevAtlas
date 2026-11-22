import { ArrowRight, BookOpen, Check, Code2, Flag } from 'lucide-react';
import { CATEGORY_ICONS } from '@/components/courses/category-icons';
import type { CourseCategoryId } from '@/content/course-categories';
import type { LandingDirection } from '@/lib/landing-directions';
import type { LaptopStoryCopy } from '@/lib/landing-copy';
import type { InterfaceLocale } from '@/lib/locale';

const WORKFLOW_TONES = ['#818cf8', '#38bdf8', '#34d399', '#a5b4fc'];
const WORKFLOW_ICONS = [BookOpen, Code2, Check, Flag];

const DIRECTION_TONES: Partial<Record<CourseCategoryId, string>> = {
  programming: '#818cf8',
  ai: '#38bdf8',
  design: '#c084fc',
  marketing: '#fb923c',
  analytics: '#2dd4bf',
  business: '#f59e0b',
  languages: '#60a5fa',
  'soft-skills': '#34d399',
  content: '#f472b6',
};

const DIRECTION_TAGS: Partial<Record<CourseCategoryId, [string, string, string]>> = {
  programming: ['HTML & CSS', 'JavaScript · React', 'Node · Python · Go'],
  ai: ['AI Fundamentals', 'Context Engineering', 'Agent Harness'],
  design: ['UX Research', 'Wireframes', 'UI Systems'],
  marketing: ['Audience', 'Channels', 'Analytics'],
  analytics: ['Metrics', 'SQL & Data', 'Dashboards'],
  business: ['Foundations', 'Management', 'Strategy'],
  languages: ['Grammar', 'Speaking', 'Practice'],
  'soft-skills': ['Productivity', 'Digital Literacy', 'Communication'],
};

const DIRECTION_HINT: Record<InterfaceLocale, { eyebrow: string; cta: string }> = {
  tg: { eyebrow: 'Самти омӯзиш', cta: 'Кушодани ҳамаи курсҳои ин самт' },
  ru: { eyebrow: 'Направление обучения', cta: 'Открыть все курсы направления' },
  en: { eyebrow: 'Learning path', cta: 'Explore all courses in this path' },
  es: { eyebrow: 'Ruta de aprendizaje', cta: 'Ver todos los cursos de esta ruta' },
};

export function LaptopStoryScreen({
  brand,
  story,
  directions,
  locale,
  active,
}: {
  brand: string;
  story: LaptopStoryCopy;
  directions: LandingDirection[];
  locale: InterfaceLocale;
  active: number;
}) {
  const totalSteps = story.steps.length + directions.length;
  const isDirection = active >= story.steps.length;
  const direction = isDirection ? directions[active - story.steps.length] : null;
  const step = !isDirection ? story.steps[active] : null;

  const tone = direction
    ? (DIRECTION_TONES[direction.id] ?? '#818cf8')
    : (WORKFLOW_TONES[active] ?? '#818cf8');
  const Icon = direction
    ? (CATEGORY_ICONS[direction.id] ?? BookOpen)
    : (WORKFLOW_ICONS[active] ?? BookOpen);
  const counter = `${String(active + 1).padStart(2, '0')} / ${String(totalSteps).padStart(2, '0')}`;
  const hint = DIRECTION_HINT[locale] ?? DIRECTION_HINT.ru;

  return (
    <div
      data-laptop-screen={active + 1}
      className="flex h-[625px] w-[1000px] flex-col overflow-hidden rounded-[18px] bg-[#060913] text-left text-white select-none"
    >
      <div className="flex h-[64px] shrink-0 items-center justify-between border-b border-slate-400/15 bg-[#0e1526]/95 px-10">
        <span className="flex items-center gap-3 text-[24px] font-semibold">
          <span className="size-3 rounded-full" style={{ backgroundColor: tone }} />
          {brand}
        </span>
        <span className="font-mono text-[22px] text-slate-400">{counter}</span>
      </div>

      <div
        className="relative flex flex-1 flex-col px-12 pt-8 pb-7"
        style={{ backgroundImage: `radial-gradient(ellipse at 0% 0%, ${tone}2e, transparent 66%)` }}
      >
        {direction ? (
          <>
            <span
              className="flex items-center gap-3 text-[24px] font-semibold"
              style={{ color: tone }}
            >
              <Icon size={28} strokeWidth={2.2} />
              {hint.eyebrow}
            </span>
            <p className="mt-4 max-w-[880px] text-[56px] leading-[1.08] font-bold tracking-[-0.035em] text-white">
              {direction.label}
            </p>
            <p className="mt-3 text-[30px] leading-snug font-medium text-slate-200/85">
              {direction.countLabel}
            </p>
            <div className="mt-auto grid grid-cols-3 gap-4">
              {(DIRECTION_TAGS[direction.id] ?? ['Lessons', 'Practice', 'Quizzes']).map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-3 rounded-[20px] border border-slate-400/20 bg-[#0e1526]/95 px-5 py-6 text-[26px] font-semibold text-slate-100"
                >
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{ backgroundColor: tone }}
                  />
                  <span className="truncate">{tag}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between rounded-[18px] border border-slate-400/15 bg-[#0e1526]/80 px-6 py-4 text-[24px] font-semibold text-sky-300">
              <span>{hint.cta}</span>
              <ArrowRight size={26} />
            </div>
          </>
        ) : step ? (
          <>
            <span
              className="flex items-center gap-3 text-[24px] font-semibold"
              style={{ color: tone }}
            >
              <Icon size={28} strokeWidth={2.2} />
              {step.title}
            </span>
            <p className="mt-4 max-w-[860px] min-h-[118px] text-[52px] leading-[1.08] font-bold tracking-[-0.035em] text-white">
              {step.screenTitle}
            </p>
            <p className="mb-5 text-[30px] leading-tight text-slate-200/80">{step.screenText}</p>
            {active === 1 ? (
              <div className="mt-auto rounded-[22px] border border-[#38bdf8]/30 bg-[#0b1326] px-8 py-5 font-mono text-[32px] leading-tight">
                <div>
                  <span className="text-[#818cf8]">const</span> pending = tasks.
                  <span className="text-[#38bdf8]">filter</span>(
                </div>
                <div className="pl-8 text-slate-200">task {'=> !task.done'}</div>
                <div>);</div>
              </div>
            ) : active === 3 ? (
              <div className="mt-auto flex items-center gap-7 rounded-[22px] border border-[#818cf8]/30 bg-[#101833] px-8 py-6 text-[34px] font-semibold">
                <span className="rounded-[14px] border border-slate-400/20 bg-white/10 px-5 py-2">
                  {story.tasks[1]}
                </span>
                <ArrowRight size={32} className="text-[#38bdf8]" />
                <span className="font-mono text-[#38bdf8]">done: true</span>
              </div>
            ) : (
              <div className="mt-auto grid grid-cols-3 gap-4">
                {story.tasks.map((task, index) => {
                  if (active === 2 && index === 0) return null;
                  const done = index === 0;
                  return (
                    <div
                      key={task}
                      className="flex items-center gap-3 rounded-[20px] border border-slate-400/15 bg-[#0e1526]/95 px-5 py-6 text-[30px] font-semibold"
                    >
                      <span
                        className="grid size-9 shrink-0 place-items-center rounded-lg border-2"
                        style={{ color: tone }}
                      >
                        {done && <Check size={22} strokeWidth={2.5} />}
                      </span>
                      <span className={done ? 'text-slate-400 line-through' : ''}>{task}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : null}

        <div
          className="mt-5 grid gap-2"
          style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: totalSteps }).map((_, index) => (
            <span
              key={index}
              className="h-[5px] rounded-full bg-slate-400/15"
              style={
                index <= active
                  ? { backgroundColor: tone, opacity: index === active ? 1 : 0.38 }
                  : undefined
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
