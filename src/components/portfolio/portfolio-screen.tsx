'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  Copy,
  ExternalLink,
  FileDown,
  Lock,
  Plus,
  Share2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useAccount } from '@/components/account/account-provider';
import { useMembershipStatus } from '@/components/courses/use-membership-status';
import { PageHeading } from '@/components/learning/page-heading';
import { buildReportSources } from '@/components/progress/report-sources';
import { planIncludes } from '@/lib/billing/plans';
import { courseDisplayName } from '@/lib/catalog-copy';
import { isCourseId } from '@/lib/courses/ids';
import { dateKey } from '@/lib/learning';
import type { InterfaceLocale } from '@/lib/locale';
import {
  encodePortfolioToken,
  loadPortfolioDraft,
  sanitizeExternalUrl,
  sanitizeTelegramHandle,
  savePortfolioDraft,
  type PortfolioDraft,
  type SharedPortfolioCourse,
} from '@/lib/portfolio/portfolio-engine';
import { buildProgressReport } from '@/lib/progress/weekly-report';
import { useLearningStore } from '@/stores/learning-store';

type CopyText = {
  title: string;
  subtitle: string;
  proBadge: string;
  lockedTitle: string;
  lockedText: string;
  upgradeCta: string;
  profileSection: string;
  fullName: string;
  headline: string;
  city: string;
  bio: string;
  github: string;
  telegram: string;
  projectsSection: string;
  addProject: string;
  projectTitle: string;
  projectStack: string;
  projectSummary: string;
  projectUrl: string;
  remove: string;
  previewTitle: string;
  hoursLabel: string;
  streakLabel: string;
  daysLabel: string;
  coursesHeading: string;
  projectsHeading: string;
  noCourses: string;
  noProjects: string;
  printPdf: string;
  copyLink: string;
  copied: string;
  openPublic: string;
  shareTelegram: string;
};

const PORTFOLIO_COPY: Record<InterfaceLocale, CopyText> = {
  tg: {
    title: 'Портфолио ва сохтани Резюме (CV)',
    subtitle:
      'Пешрафти воқеии шумо дар DevAtlas ба таври автоматӣ ба резюме ва профили оммавӣ барои корфармоён табдил меёбад.',
    proBadge: 'Хусусияти Pro / Ultra',
    lockedTitle: 'Саҳифаи оммавии портфолио ва PDF-резюме дар Pro ва Ultra кушода мешавад',
    lockedText:
      'Шумо метавонед маълумотатонро пур карда намуди CV-ро бинед. Барои нусхабардории линки оммавӣ ва чопи PDF ба Pro ё Ultra гузаред.',
    upgradeCta: 'Дидани тарифҳо',
    profileSection: 'Маълумоти асосӣ',
    fullName: 'Ном ва насаб',
    headline: 'Касб / Вазифаи мақсаднок',
    city: 'Шаҳр',
    bio: 'Дар бораи худ (кӯтоҳ)',
    github: 'Линки GitHub',
    telegram: 'Telegram username (бе @)',
    projectsSection: 'Лоиҳаҳои шумо (то 6 лоиҳа)',
    addProject: 'Илова кардани лоиҳа',
    projectTitle: 'Номи лоиҳа',
    projectStack: 'Технологияҳо (масалан: React, TypeScript, Supabase)',
    projectSummary: 'Чӣ кор кардед ва чӣ натиҷа дод',
    projectUrl: 'Линки демо ё GitHub',
    remove: 'Нест кардан',
    previewTitle: 'Намуди Резюме / Портфолио',
    hoursLabel: 'Соати амалия',
    streakLabel: 'Силсилаи рӯзҳо',
    daysLabel: 'Рӯзҳои фаъол',
    coursesHeading: 'Малакаҳо ва курсҳо дар DevAtlas',
    projectsHeading: 'Лоиҳаҳои амалӣ',
    noCourses: 'Курсҳои оғозшуда дар ин ҷо ба таври автоматӣ пайдо мешаванд.',
    noProjects: 'Барои пурқувват кардани резюме ҳадди ақал 1–2 лоиҳа илова кунед.',
    printPdf: 'Чоп / Захираи PDF',
    copyLink: 'Нусхаи линки оммавӣ',
    copied: 'Нусхабардорӣ шуд!',
    openPublic: 'Кушодани профили оммавӣ',
    shareTelegram: 'Фиристодан ба Telegram',
  },
  ru: {
    title: 'Портфолио и конструктор резюме (CV)',
    subtitle:
      'Ваш реальный прогресс в DevAtlas автоматически собирается в аккуратное резюме и публичный профиль для работодателей.',
    proBadge: 'Функция Pro / Ultra',
    lockedTitle: 'Публичная ссылка портфолио и PDF-экспорт доступны в Pro и Ultra',
    lockedText:
      'Вы можете заполнить данные и посмотреть живой предпросмотр CV. Для экспорта PDF и публичной ссылки перейдите на Pro или Ultra.',
    upgradeCta: 'Открыть тарифы',
    profileSection: 'Основные данные',
    fullName: 'Имя и фамилия',
    headline: 'Целевая роль / специализация',
    city: 'Город',
    bio: 'О себе (кратко)',
    github: 'Ссылка на GitHub',
    telegram: 'Telegram username (без @)',
    projectsSection: 'Ваши проекты (до 6)',
    addProject: 'Добавить проект',
    projectTitle: 'Название проекта',
    projectStack: 'Стек (например: React, TypeScript, Supabase)',
    projectSummary: 'Что реализовано и какой результат',
    projectUrl: 'Ссылка на демо или GitHub',
    remove: 'Удалить',
    previewTitle: 'Предпросмотр резюме и портфолио',
    hoursLabel: 'Часов практики',
    streakLabel: 'Серия дней',
    daysLabel: 'Активных дней',
    coursesHeading: 'Навыки и курсы в DevAtlas',
    projectsHeading: 'Практические проекты',
    noCourses: 'Начатые и завершённые курсы появятся здесь автоматически.',
    noProjects: 'Добавьте 1–2 проекта, чтобы усилить резюме.',
    printPdf: 'Печать / Сохранить PDF',
    copyLink: 'Скопировать ссылку портфолио',
    copied: 'Скопировано!',
    openPublic: 'Открыть публичный профиль',
    shareTelegram: 'Поделиться в Telegram',
  },
  en: {
    title: 'Public Portfolio & CV Builder',
    subtitle:
      'Turn your verified DevAtlas study progress into a clean resume and shareable employer portfolio.',
    proBadge: 'Pro / Ultra Feature',
    lockedTitle: 'Public portfolio link & PDF CV export unlock on Pro and Ultra',
    lockedText:
      'Fill in your details and preview your CV live. Upgrade to Pro or Ultra to export PDF and share your public portfolio URL.',
    upgradeCta: 'View plans',
    profileSection: 'Profile Details',
    fullName: 'Full name',
    headline: 'Target role / headline',
    city: 'City',
    bio: 'Short bio',
    github: 'GitHub URL',
    telegram: 'Telegram username (without @)',
    projectsSection: 'Featured Projects (up to 6)',
    addProject: 'Add project',
    projectTitle: 'Project title',
    projectStack: 'Tech stack (e.g. React, TypeScript, Supabase)',
    projectSummary: 'What you built and its impact',
    projectUrl: 'Live demo or GitHub URL',
    remove: 'Remove',
    previewTitle: 'Live CV & Portfolio Preview',
    hoursLabel: 'Practice hours',
    streakLabel: 'Day streak',
    daysLabel: 'Active days',
    coursesHeading: 'DevAtlas Courses & Progress',
    projectsHeading: 'Projects',
    noCourses: 'Courses you study automatically appear here.',
    noProjects: 'Add 1–2 practical projects to strengthen your CV.',
    printPdf: 'Print / Save PDF',
    copyLink: 'Copy public link',
    copied: 'Copied!',
    openPublic: 'Open public profile',
    shareTelegram: 'Share to Telegram',
  },
  es: {
    title: 'Portafolio público y creador de CV',
    subtitle:
      'Convierte tu progreso real en DevAtlas en un currículum limpio y un enlace público para empresas.',
    proBadge: 'Función Pro / Ultra',
    lockedTitle: 'El enlace público y la exportación PDF se desbloquean en Pro y Ultra',
    lockedText:
      'Completa tus datos y previsualiza tu CV en vivo. Pasa a Pro o Ultra para exportar a PDF y compartir tu perfil.',
    upgradeCta: 'Ver planes',
    profileSection: 'Datos principales',
    fullName: 'Nombre completo',
    headline: 'Rol objetivo',
    city: 'Ciudad',
    bio: 'Resumen breve',
    github: 'Enlace de GitHub',
    telegram: 'Usuario de Telegram (sin @)',
    projectsSection: 'Proyectos destacados (hasta 6)',
    addProject: 'Añadir proyecto',
    projectTitle: 'Título del proyecto',
    projectStack: 'Tecnologías (ej.: React, TypeScript, Supabase)',
    projectSummary: 'Qué construiste y su resultado',
    projectUrl: 'Enlace de demo o GitHub',
    remove: 'Eliminar',
    previewTitle: 'Vista previa del CV / Portafolio',
    hoursLabel: 'Horas de práctica',
    streakLabel: 'Racha de días',
    daysLabel: 'Días activos',
    coursesHeading: 'Cursos y progreso en DevAtlas',
    projectsHeading: 'Proyectos',
    noCourses: 'Los cursos que estudies aparecerán aquí automáticamente.',
    noProjects: 'Añade 1 o 2 proyectos prácticos para reforzar tu CV.',
    printPdf: 'Imprimir / Guardar PDF',
    copyLink: 'Copiar enlace público',
    copied: '¡Copiado!',
    openPublic: 'Abrir perfil público',
    shareTelegram: 'Compartir en Telegram',
  },
};

export function PortfolioScreen() {
  const state = useLearningStore();
  const account = useAccount();
  const membership = useMembershipStatus();
  const copy = PORTFOLIO_COPY[state.language];
  const today = dateKey();

  const accountKey = account.user?.id ?? 'guest';
  const fallbackName =
    account.profile?.displayName?.trim() || account.user?.email?.split('@')[0] || 'DevAtlas Developer';

  const [draft, setDraft] = useState<PortfolioDraft>(() => loadPortfolioDraft(accountKey, fallbackName));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    savePortfolioDraft(accountKey, draft);
  }, [accountKey, draft]);

  const hasProAccess = membership.isPrivileged || planIncludes(membership.plan, 'portfolioCv');

  const report = useMemo(() => {
    const sources = buildReportSources(state);
    return buildProgressReport({ sources, registeredOn: null, today });
  }, [state, today]);

  const sharedCourses: SharedPortfolioCourse[] = useMemo(
    () =>
      report.courses
        .filter((course) => isCourseId(course.id) && (course.daysDone > 0 || course.percent > 0))
        .map((course) => ({
          id: course.id as SharedPortfolioCourse['id'],
          percent: course.percent,
          daysDone: course.daysDone,
          totalDays: course.total,
        })),
    [report.courses],
  );

  const totalHours = Math.round((report.totals.seconds / 3600) * 10) / 10;

  const publicPath = useMemo(() => {
    const token = encodePortfolioToken({
      fullName: draft.fullName || fallbackName,
      headline: draft.headline,
      city: draft.city,
      bio: draft.bio,
      githubUrl: draft.githubUrl,
      telegramHandle: draft.telegramHandle,
      totalHours,
      streak: report.totals.streak,
      activeDays: report.totals.activeDays,
      courses: sharedCourses,
      projects: draft.projects.map(({ title, stack, summary, url }) => ({
        title,
        stack,
        summary,
        url,
      })),
    });
    return `/u/${token}`;
  }, [draft, fallbackName, totalHours, report.totals.streak, report.totals.activeDays, sharedCourses]);

  const fullPublicUrl =
    typeof window === 'undefined' ? publicPath : `${window.location.origin}${publicPath}`;

  async function copyPublicLink() {
    try {
      await navigator.clipboard.writeText(fullPublicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Ignore clipboard permission errors.
    }
  }

  function addProject() {
    if (draft.projects.length >= 6) return;
    setDraft((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { id: `proj-${Date.now()}`, title: '', stack: '', summary: '', url: '' },
      ],
    }));
  }

  function updateProject(id: string, field: 'title' | 'stack' | 'summary' | 'url', value: string) {
    setDraft((prev) => ({
      ...prev,
      projects: prev.projects.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  }

  function removeProject(id: string) {
    setDraft((prev) => ({
      ...prev,
      projects: prev.projects.filter((item) => item.id !== id),
    }));
  }

  const safeGithub = sanitizeExternalUrl(draft.githubUrl);
  const safeTelegram = sanitizeTelegramHandle(draft.telegramHandle);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <PageHeading title={copy.title} subtitle={copy.subtitle} />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-xs font-semibold text-brand">
          <Sparkles size={14} aria-hidden="true" />
          {copy.proBadge}
        </span>
      </div>

      {!hasProAccess && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-card p-5 shadow-[var(--depth-1)] print:hidden">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-brand">
              <Lock size={19} aria-hidden="true" />
            </span>
            <div>
              <h2 className="m-0 text-base font-semibold text-foreground">{copy.lockedTitle}</h2>
              <p className="mt-1 mb-0 max-w-2xl text-sm text-muted-foreground">{copy.lockedText}</p>
            </div>
          </div>
          <Link href="/plans" className="button primary no-underline">
            {copy.upgradeCta}
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        {/* Editor Column */}
        <div className="space-y-5 print:hidden">
          <div className="space-y-3.5 rounded-2xl border border-border bg-card p-5 shadow-[var(--depth-1)]">
            <h2 className="m-0 text-base font-semibold text-foreground">{copy.profileSection}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                {copy.fullName}
                <input
                  type="text"
                  value={draft.fullName}
                  maxLength={80}
                  onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
              <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                {copy.headline}
                <input
                  type="text"
                  value={draft.headline}
                  maxLength={100}
                  onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
              <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                {copy.city}
                <input
                  type="text"
                  value={draft.city}
                  maxLength={60}
                  onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
              <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                {copy.telegram}
                <input
                  type="text"
                  value={draft.telegramHandle}
                  maxLength={40}
                  placeholder="username"
                  onChange={(e) => setDraft({ ...draft, telegramHandle: e.target.value })}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
            </div>
            <label className="grid gap-1 text-xs font-medium text-muted-foreground">
              {copy.github}
              <input
                type="url"
                value={draft.githubUrl}
                maxLength={180}
                placeholder="https://github.com/username"
                onChange={(e) => setDraft({ ...draft, githubUrl: e.target.value })}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="grid gap-1 text-xs font-medium text-muted-foreground">
              {copy.bio}
              <textarea
                rows={3}
                value={draft.bio}
                maxLength={360}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
          </div>

          <div className="space-y-3.5 rounded-2xl border border-border bg-card p-5 shadow-[var(--depth-1)]">
            <div className="flex items-center justify-between gap-2">
              <h2 className="m-0 text-base font-semibold text-foreground">{copy.projectsSection}</h2>
              <button
                type="button"
                disabled={draft.projects.length >= 6}
                onClick={addProject}
                className="button subtle inline-flex items-center gap-1.5 text-xs"
              >
                <Plus size={15} aria-hidden="true" />
                {copy.addProject}
              </button>
            </div>
            {draft.projects.length === 0 && (
              <p className="m-0 text-sm text-muted-foreground">{copy.noProjects}</p>
            )}
            {draft.projects.map((project) => (
              <div key={project.id} className="space-y-2 rounded-xl border border-border bg-muted/30 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    placeholder={copy.projectTitle}
                    value={project.title}
                    maxLength={80}
                    onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground"
                  />
                  <button
                    type="button"
                    aria-label={copy.remove}
                    onClick={() => removeProject(project.id)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder={copy.projectStack}
                  value={project.stack}
                  maxLength={100}
                  onChange={(e) => updateProject(project.id, 'stack', e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground"
                />
                <textarea
                  rows={2}
                  placeholder={copy.projectSummary}
                  value={project.summary}
                  maxLength={240}
                  onChange={(e) => updateProject(project.id, 'summary', e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground"
                />
                <input
                  type="url"
                  placeholder={copy.projectUrl}
                  value={project.url}
                  maxLength={200}
                  onChange={(e) => updateProject(project.id, 'url', e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Live CV Preview Column */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              disabled={!hasProAccess}
              onClick={() => window.print()}
              className="button primary inline-flex items-center gap-2"
            >
              <FileDown size={16} aria-hidden="true" />
              {copy.printPdf}
            </button>
            <button
              type="button"
              disabled={!hasProAccess}
              onClick={() => void copyPublicLink()}
              className="button subtle inline-flex items-center gap-2"
            >
              <Copy size={16} aria-hidden="true" />
              {copied ? copy.copied : copy.copyLink}
            </button>
            {hasProAccess && (
              <>
                <Link href={publicPath} className="button subtle inline-flex items-center gap-2 no-underline">
                  <ExternalLink size={16} aria-hidden="true" />
                  {copy.openPublic}
                </Link>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(fullPublicUrl)}&text=${encodeURIComponent(
                    `${draft.fullName || fallbackName} — ${draft.headline} (DevAtlas Portfolio)`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="button subtle inline-flex items-center gap-2 no-underline"
                >
                  <Share2 size={16} aria-hidden="true" />
                  {copy.shareTelegram}
                </a>
              </>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--depth-2)] sm:p-8 print:border-none print:shadow-none">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
              <div>
                <p className="m-0 text-xs font-semibold tracking-[0.16em] text-brand uppercase">
                  DEVATLAS PORTFOLIO
                </p>
                <h2 className="m-0 mt-1 text-2xl font-bold text-foreground">
                  {draft.fullName.trim() || fallbackName}
                </h2>
                <p className="m-0 mt-1 text-sm font-medium text-muted-foreground">
                  {[draft.headline.trim(), draft.city.trim()].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {safeGithub && (
                  <a
                    href={safeGithub}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-border px-2.5 py-1 text-foreground no-underline hover:border-primary"
                  >
                    GitHub
                  </a>
                )}
                {safeTelegram && (
                  <a
                    href={`https://t.me/${safeTelegram}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-border px-2.5 py-1 text-foreground no-underline hover:border-primary"
                  >
                    @{safeTelegram}
                  </a>
                )}
              </div>
            </div>

            {draft.bio.trim() && (
              <p className="mt-4 mb-0 text-sm leading-6 text-foreground/90">{draft.bio.trim()}</p>
            )}

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <p className="m-0 text-xs text-muted-foreground">{copy.hoursLabel}</p>
                <p className="m-0 mt-1 text-lg font-bold tabular-nums text-foreground">
                  {totalHours}h
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <p className="m-0 text-xs text-muted-foreground">{copy.streakLabel}</p>
                <p className="m-0 mt-1 text-lg font-bold tabular-nums text-foreground">
                  {report.totals.streak}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-3">
                <p className="m-0 text-xs text-muted-foreground">{copy.daysLabel}</p>
                <p className="m-0 mt-1 text-lg font-bold tabular-nums text-foreground">
                  {report.totals.activeDays}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="m-0 text-sm font-semibold text-foreground">{copy.coursesHeading}</h3>
              {sharedCourses.length === 0 ? (
                <p className="mt-2 mb-0 text-xs text-muted-foreground">{copy.noCourses}</p>
              ) : (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {sharedCourses.map((course) => (
                    <span
                      key={course.id}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground"
                    >
                      {courseDisplayName(course.id, state.language)}
                      <span className="font-mono text-brand">{course.percent}%</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6">
              <h3 className="m-0 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Briefcase size={15} aria-hidden="true" />
                {copy.projectsHeading}
              </h3>
              {draft.projects.filter((p) => p.title.trim()).length === 0 ? (
                <p className="mt-2 mb-0 text-xs text-muted-foreground">{copy.noProjects}</p>
              ) : (
                <div className="mt-2.5 space-y-2.5">
                  {draft.projects
                    .filter((p) => p.title.trim())
                    .map((project) => {
                      const safeUrl = sanitizeExternalUrl(project.url);
                      return (
                        <div key={project.id} className="rounded-xl border border-border bg-muted/30 p-3.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <strong className="text-sm text-foreground">{project.title}</strong>
                            {safeUrl && (
                              <a
                                href={safeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-medium text-brand no-underline hover:underline"
                              >
                                {safeUrl.replace(/^https?:\/\//, '').slice(0, 32)}
                              </a>
                            )}
                          </div>
                          {project.stack.trim() && (
                            <p className="m-0 mt-1 font-mono text-xs text-muted-foreground">
                              {project.stack}
                            </p>
                          )}
                          {project.summary.trim() && (
                            <p className="m-0 mt-1.5 text-xs leading-5 text-foreground/85">
                              {project.summary}
                            </p>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
