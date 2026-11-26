import Link from 'next/link';
import { ArrowRight, Briefcase, ExternalLink, ShieldAlert } from 'lucide-react';
import { courseDisplayName } from '@/lib/catalog-copy';
import type { InterfaceLocale } from '@/lib/locale';
import { decodePortfolioToken } from '@/lib/portfolio/portfolio-engine';
import { getRequestLocale } from '@/lib/request-locale';

const PUBLIC_PORTFOLIO_COPY: Record<
  InterfaceLocale,
  {
    invalidTitle: string;
    invalidText: string;
    hours: string;
    streak: string;
    activeDays: string;
    courses: string;
    projects: string;
    cta: string;
    careerQuiz: string;
  }
> = {
  tg: {
    invalidTitle: 'Профили портфолио ёфт нашуд',
    invalidText: 'Линк нодуруст ё нопурра аст. Аз соҳиби портфолио линки навро пурсед.',
    hours: 'Соати амалия',
    streak: 'Силсилаи рӯзҳо',
    activeDays: 'Рӯзҳои фаъол',
    courses: 'Курсҳо ва пешрафт дар DevAtlas',
    projects: 'Лоиҳаҳои амалӣ',
    cta: 'Портфолиои худро дар DevAtlas соз',
    careerQuiz: 'Тести ройгони интихоби касб',
  },
  ru: {
    invalidTitle: 'Профиль портфолио не найден',
    invalidText: 'Ссылка повреждена или неполная. Попросите владельца прислать актуальную ссылку.',
    hours: 'Часов практики',
    streak: 'Серия дней',
    activeDays: 'Активных дней',
    courses: 'Курсы и прогресс в DevAtlas',
    projects: 'Практические проекты',
    cta: 'Создать своё портфолио в DevAtlas',
    careerQuiz: 'Тест выбора IT-профессии',
  },
  en: {
    invalidTitle: 'Portfolio profile not found',
    invalidText: 'This portfolio link is incomplete or invalid. Ask the owner for a fresh link.',
    hours: 'Practice hours',
    streak: 'Day streak',
    activeDays: 'Active days',
    courses: 'DevAtlas Courses & Progress',
    projects: 'Featured Projects',
    cta: 'Build your portfolio on DevAtlas',
    careerQuiz: 'Free IT Career Finder',
  },
  es: {
    invalidTitle: 'Perfil de portafolio no encontrado',
    invalidText: 'Este enlace está incompleto o es inválido. Pide un enlace actualizado.',
    hours: 'Horas de práctica',
    streak: 'Racha de días',
    activeDays: 'Días activos',
    courses: 'Cursos y progreso en DevAtlas',
    projects: 'Proyectos destacados',
    cta: 'Crea tu portafolio en DevAtlas',
    careerQuiz: 'Test de carrera gratis',
  },
};

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const locale = await getRequestLocale();
  const copy = PUBLIC_PORTFOLIO_COPY[locale];
  const profile = decodePortfolioToken(decodeURIComponent(code));

  return (
    <main className="min-h-[100dvh] bg-[#060913] px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-indigo-400/20 bg-[#0d1428] p-6 shadow-[0_28px_70px_-24px_rgba(0,0,0,0.85)] sm:p-10">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-sm font-bold tracking-[0.2em] text-sky-400 no-underline uppercase">
            DEVATLAS
          </Link>
          <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-medium text-indigo-300 ring-1 ring-indigo-400/30">
            Verified Portfolio
          </span>
        </div>

        {!profile ? (
          <div className="mt-8 space-y-3">
            <div className="inline-flex items-center gap-2 text-rose-300">
              <ShieldAlert size={22} aria-hidden="true" />
              <h1 className="m-0 text-2xl font-bold">{copy.invalidTitle}</h1>
            </div>
            <p className="m-0 text-sm text-slate-300">{copy.invalidText}</p>
          </div>
        ) : (
          <div className="mt-7 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <h1 className="m-0 text-3xl font-bold tracking-tight text-white">
                  {profile.fullName}
                </h1>
                <p className="m-0 mt-1 text-base text-indigo-200">
                  {[profile.headline, profile.city].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white no-underline hover:bg-white/10"
                  >
                    GitHub <ExternalLink size={13} aria-hidden="true" />
                  </a>
                )}
                {profile.telegramHandle && (
                  <a
                    href={`https://t.me/${profile.telegramHandle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-sky-400/30 bg-sky-500/15 px-3.5 py-2 text-xs font-semibold text-sky-200 no-underline hover:bg-sky-500/25"
                  >
                    @{profile.telegramHandle}
                  </a>
                )}
              </div>
            </div>

            {profile.bio && <p className="m-0 text-sm leading-6 text-slate-200">{profile.bio}</p>}

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="m-0 text-xs text-slate-400">{copy.hours}</p>
                <p className="m-0 mt-1 text-xl font-bold tabular-nums">{profile.totalHours}h</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="m-0 text-xs text-slate-400">{copy.streak}</p>
                <p className="m-0 mt-1 text-xl font-bold tabular-nums">{profile.streak}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="m-0 text-xs text-slate-400">{copy.activeDays}</p>
                <p className="m-0 mt-1 text-xl font-bold tabular-nums">{profile.activeDays}</p>
              </div>
            </div>

            {profile.courses.length > 0 && (
              <div>
                <h2 className="m-0 text-sm font-semibold text-slate-300">{copy.courses}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.courses.map((course) => (
                    <span
                      key={course.id}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-white"
                    >
                      {courseDisplayName(course.id, locale)}
                      <span className="font-mono text-sky-300">{course.percent}%</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.projects.length > 0 && (
              <div>
                <h2 className="m-0 flex items-center gap-1.5 text-sm font-semibold text-slate-300">
                  <Briefcase size={15} aria-hidden="true" />
                  {copy.projects}
                </h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {profile.projects.map((project, index) => (
                    <div
                      key={`${project.title}-${index}`}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <strong className="text-sm text-white">{project.title}</strong>
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-sky-300 no-underline hover:underline"
                          >
                            Link
                          </a>
                        )}
                      </div>
                      {project.stack && (
                        <p className="m-0 mt-1 font-mono text-xs text-indigo-300">{project.stack}</p>
                      )}
                      {project.summary && (
                        <p className="m-0 mt-2 text-xs leading-5 text-slate-300">{project.summary}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3 border-t border-white/10 pt-6">
          <Link
            href="/courses"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white no-underline hover:bg-indigo-500"
          >
            {copy.cta}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link
            href="/career-test"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white no-underline hover:bg-white/10"
          >
            {copy.careerQuiz}
          </Link>
        </div>
      </div>
    </main>
  );
}
