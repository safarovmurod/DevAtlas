import { ArrowRight, BookOpen, Check, Code2, Flag } from 'lucide-react';
import type { LaptopStoryCopy } from '@/lib/landing-copy';

const tones = ['#818cf8', '#38bdf8', '#34d399', '#a5b4fc'];
const icons = [BookOpen, Code2, Check, Flag];

export function LaptopStoryScreen({
  brand,
  story,
  active,
}: {
  brand: string;
  story: LaptopStoryCopy;
  active: number;
}) {
  const step = story.steps[active];
  const tone = tones[active] ?? '#818cf8';
  const Icon = icons[active] ?? BookOpen;

  return (
    <div
      data-laptop-screen={active + 1}
      className="flex h-[625px] w-[1000px] flex-col overflow-hidden rounded-[18px] bg-[#060913] text-left text-white select-none"
    >
      <div className="flex h-[66px] shrink-0 items-center justify-between border-b border-slate-400/15 bg-[#0e1526]/95 px-10">
        <span className="flex items-center gap-3 text-[25px] font-semibold">
          <span className="size-3 rounded-full" style={{ backgroundColor: tone }} />
          {brand}
        </span>
        <span className="font-mono text-[23px] text-slate-400">
          0{active + 1} / 0{story.steps.length}
        </span>
      </div>
      <div
        className="relative flex flex-1 flex-col px-12 pt-9 pb-7"
        style={{ backgroundImage: `radial-gradient(ellipse at 0% 0%, ${tone}2e, transparent 66%)` }}
      >
        <span className="flex items-center gap-3 text-[25px] font-semibold" style={{ color: tone }}>
          <Icon size={28} strokeWidth={2.2} />
          {step.title}
        </span>
        <p className="mt-4 max-w-[860px] min-h-[126px] text-[58px] leading-[1.07] font-bold tracking-[-0.035em] text-white">
          {step.screenTitle}
        </p>
        <p className="mb-6 text-[32px] leading-tight text-slate-200/80">{step.screenText}</p>
        {active === 1 ? (
          <div className="mt-auto rounded-[22px] border border-[#38bdf8]/30 bg-[#0b1326] px-8 py-5 font-mono text-[34px] leading-tight">
            <div>
              <span className="text-[#818cf8]">const</span> pending = tasks.
              <span className="text-[#38bdf8]">filter</span>(
            </div>
            <div className="pl-8 text-slate-200">task {'=> !task.done'}</div>
            <div>);</div>
          </div>
        ) : active === 3 ? (
          <div className="mt-auto flex items-center gap-7 rounded-[22px] border border-[#818cf8]/30 bg-[#101833] px-8 py-7 text-[36px] font-semibold">
            <span className="rounded-[14px] border border-slate-400/20 bg-white/10 px-5 py-2">
              {story.tasks[1]}
            </span>
            <ArrowRight size={34} className="text-[#38bdf8]" />
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
                  className="flex items-center gap-3 rounded-[20px] border border-slate-400/15 bg-[#0e1526]/95 px-5 py-7 text-[32px] font-semibold"
                >
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-lg border-2"
                    style={{ color: tone }}
                  >
                    {done && <Check size={24} strokeWidth={2.5} />}
                  </span>
                  <span className={done ? 'text-slate-400 line-through' : ''}>{task}</span>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-6 grid grid-cols-4 gap-3">
          {story.steps.map((item, index) => (
            <span
              key={item.title}
              className="h-[5px] rounded-full bg-slate-400/15"
              style={
                index <= active
                  ? { backgroundColor: tone, opacity: index === active ? 1 : 0.4 }
                  : undefined
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
