'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardCheck,
  Crown,
  Lock,
  MessageSquareCode,
  Rocket,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { useMembershipStatus } from '@/components/courses/use-membership-status';
import { PageHeading } from '@/components/learning/page-heading';
import { planIncludes } from '@/lib/billing/plans';
import { courseDisplayName } from '@/lib/catalog-copy';
import type { CourseId } from '@/lib/courses/ids';
import type { InterfaceLocale } from '@/lib/locale';
import {
  STUDIO_QUESTIONS,
  auditProjectSubmission,
  buildJobReadySprint,
  scoreMockAnswer,
  type MockAnswerScore,
  type StudioTrack,
} from '@/lib/ultra/studio-engine';
import { useLearningStore } from '@/stores/learning-store';

type Tab = 'interview' | 'audit' | 'sprint';

const SAMPLE_MANIFEST = `{
  "name": "shop-dashboard",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "eslint src/",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^19.0.0",
    "typescript": "^5.7.0",
    "zod": "^4.0.0"
  }
}
// src/api/orders.ts
export async function loadOrders() {
  try {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('Failed');
    return await res.json();
  } catch (error) {
    return { error: true };
  }
}`;

const TRACK_LABELS: Record<StudioTrack, Record<InterfaceLocale, string>> = {
  frontend: { tg: 'Frontend / React', ru: 'Frontend / React', en: 'Frontend / React', es: 'Frontend / React' },
  backend: { tg: 'Backend / SQL', ru: 'Backend / SQL', en: 'Backend / SQL', es: 'Backend / SQL' },
  python: { tg: 'Python / Data', ru: 'Python / Data', en: 'Python / Data', es: 'Python / Data' },
  ai: { tg: 'AI Engineering', ru: 'AI-инженерия', en: 'AI Engineering', es: 'Ingeniería IA' },
};

const STUDIO_COPY: Record<
  InterfaceLocale,
  {
    title: string;
    subtitle: string;
    ultraBadge: string;
    lockedTitle: string;
    lockedText: string;
    upgradeCta: string;
    tabInterview: string;
    tabAudit: string;
    tabSprint: string;
    answerPlaceholder: string;
    evaluateBtn: string;
    scoreLabel: string;
    matchedLabel: string;
    missingLabel: string;
    modelAnswerLabel: string;
    refreshCourseLabel: string;
    previewOnlyHint: string;
    auditIntro: string;
    auditPlaceholder: string;
    loadSample: string;
    runAudit: string;
    verdictReady: string;
    verdictAlmost: string;
    verdictNeedsWork: string;
    recommendedCourses: string;
    sprintPaceLabel: string;
    deliverableLabel: string;
    openCourse: string;
  }
> = {
  tg: {
    title: 'Студияи Ultra: Карьера ва Ментор',
    subtitle:
      'Симулятори мусоҳибаи техникӣ бо баҳогузорӣ, аудити автоматии лоиҳа барои корфармо ва нақшаи 30-рӯзаи баромадан ба кор.',
    ultraBadge: 'Махсус барои Ultra',
    lockedTitle: 'Дастрасии пурра ба Студияи Ultra дар тарифи Ultra кушода мешавад',
    lockedText:
      'Шумо метавонед саволи аввали мусоҳибаро ҳамчун намуна санҷед. Барои ҳамаи саволҳо, Аудити лоиҳа ва Спринти 30-рӯза ба Ultra гузаред.',
    upgradeCta: 'Гузаштан ба Ultra',
    tabInterview: 'Мок-мусоҳиба',
    tabAudit: 'Аудити лоиҳа',
    tabSprint: 'Спринти 30-рӯза',
    answerPlaceholder: 'Ҷавоби техникии худро мисли дар мусоҳибаи воқеӣ нависед...',
    evaluateBtn: 'Санҷиш ва баҳогузорӣ',
    scoreLabel: 'Баҳои мусоҳиба',
    matchedLabel: 'Нуқтаҳои дуруст',
    missingLabel: 'Чӣ намерасад',
    modelAnswerLabel: 'Ҷавоби намунавии Senior',
    refreshCourseLabel: 'Курс барои мустаҳкамкунӣ',
    previewOnlyHint: 'Саволҳои баъдӣ ва бахшҳои пурра дар Ultra кушода мешаванд.',
    auditIntro:
      '`package.json`, сохтори папкаҳо ё порчаи коди лоиҳаатонро гузоред — система омодагии онро барои резюме ва корфармо месанҷад.',
    auditPlaceholder: 'package.json ё коди асосии лоиҳаатонро ин ҷо гузоред...',
    loadSample: 'Бор кардани намуна',
    runAudit: 'Оғози аудити лоиҳа',
    verdictReady: 'Барои фиристодан ба корфармо омода аст',
    verdictAlmost: 'Қариб омода — чанд нуқтаро ислоҳ кунед',
    verdictNeedsWork: 'Пеш аз фиристодан беҳтаркунии ҷиддӣ лозим аст',
    recommendedCourses: 'Курсҳои тавсияшуда барои бастани камбудиҳо',
    sprintPaceLabel: 'Суръати ҳаррӯзаи шумо',
    deliverableLabel: 'Натиҷаи ҳафта',
    openCourse: 'Кушодани курс',
  },
  ru: {
    title: 'Ultra Студия: Карьера и Ментор',
    subtitle:
      'Тренажёр технического мок-интервью с разбором по критериям, аудит проекта перед отправкой в резюме и персональный 30-дневный спринт к офферу.',
    ultraBadge: 'Эксклюзив Ultra',
    lockedTitle: 'Полный доступ к Ultra Студии открывается на тарифе Ultra',
    lockedText:
      'Вы можете попробовать первый вопрос мок-интервью в режиме предпросмотра. Полный тренажёр, Аудит проектов и 30-дневный спринт доступны на Ultra.',
    upgradeCta: 'Перейти на Ultra',
    tabInterview: 'Мок-интервью',
    tabAudit: 'Аудит проекта',
    tabSprint: 'Спринт на 30 дней',
    answerPlaceholder: 'Напишите развёрнутый технический ответ, как на реальном собеседовании...',
    evaluateBtn: 'Оценить ответ',
    scoreLabel: 'Оценка интервью',
    matchedLabel: 'Раскрытые ключевые пункты',
    missingLabel: 'Что стоит добавить',
    modelAnswerLabel: 'Эталонный ответ Senior-разработчика',
    refreshCourseLabel: 'Курс для закрепления',
    previewOnlyHint: 'Остальные вопросы и инструменты открываются в Ultra.',
    auditIntro:
      'Вставьте ваш package.json, структуру репозитория или ключевой фрагмент кода — аудит проверит готовность проекта к показу работодателю.',
    auditPlaceholder: 'Вставьте package.json или фрагмент кода вашего проекта...',
    loadSample: 'Загрузить пример',
    runAudit: 'Запустить аудит проекта',
    verdictReady: 'Проект готов к показу работодателям',
    verdictAlmost: 'Почти готово — поправьте пару моментов',
    verdictNeedsWork: 'Нужны доработки перед отправкой в резюме',
    recommendedCourses: 'Рекомендуемые курсы для закрытия пробелов',
    sprintPaceLabel: 'Ваш ежедневный темп',
    deliverableLabel: 'Итог недели',
    openCourse: 'Открыть курс',
  },
  en: {
    title: 'Ultra Studio: Career & Mentor Lab',
    subtitle:
      'Rubric-scored technical mock interviews, automated portfolio project audits, and a tailored 30-day job-ready sprint.',
    ultraBadge: 'Ultra Exclusive',
    lockedTitle: 'Full access to Ultra Studio unlocks on the Ultra plan',
    lockedText:
      'Try the first mock interview prompt as a free preview. Upgrade to Ultra for all tracks, Project Readiness Audit, and the 30-Day Job Sprint.',
    upgradeCta: 'Upgrade to Ultra',
    tabInterview: 'Mock Interview',
    tabAudit: 'Project Audit',
    tabSprint: '30-Day Sprint',
    answerPlaceholder: 'Write your technical answer as you would in a live engineering interview...',
    evaluateBtn: 'Score my answer',
    scoreLabel: 'Interview Score',
    matchedLabel: 'Covered concepts',
    missingLabel: 'Missing points',
    modelAnswerLabel: 'Senior Model Answer',
    refreshCourseLabel: 'Recommended refresher',
    previewOnlyHint: 'Remaining prompts and full tools unlock on Ultra.',
    auditIntro:
      'Paste your package.json, repo layout, or key source snippet to audit hiring readiness, security hygiene, and testing discipline.',
    auditPlaceholder: 'Paste your package.json or core source code here...',
    loadSample: 'Load sample project',
    runAudit: 'Run project audit',
    verdictReady: 'Ready to showcase to hiring managers',
    verdictAlmost: 'Almost ready — polish a few items',
    verdictNeedsWork: 'Needs key improvements before applying',
    recommendedCourses: 'Recommended courses to close gaps',
    sprintPaceLabel: 'Daily study pace',
    deliverableLabel: 'Weekly deliverable',
    openCourse: 'Open course',
  },
  es: {
    title: 'Estudio Ultra: Carrera y Mentoría',
    subtitle:
      'Simulador de entrevista técnica con rúbrica, auditoría de proyectos para portafolio y sprint de 30 días hacia el empleo.',
    ultraBadge: 'Exclusivo Ultra',
    lockedTitle: 'El acceso completo al Estudio Ultra se desbloquea en Ultra',
    lockedText:
      'Puedes probar la primera pregunta como vista previa. Pasa a Ultra para desbloquear todas las pistas, auditoría de proyectos y el sprint de 30 días.',
    upgradeCta: 'Pasar a Ultra',
    tabInterview: 'Entrevista simulada',
    tabAudit: 'Auditoría de proyecto',
    tabSprint: 'Sprint de 30 días',
    answerPlaceholder: 'Escribe tu respuesta técnica como en una entrevista real...',
    evaluateBtn: 'Evaluar respuesta',
    scoreLabel: 'Puntuación',
    matchedLabel: 'Conceptos cubiertos',
    missingLabel: 'Puntos faltantes',
    modelAnswerLabel: 'Respuesta modelo Senior',
    refreshCourseLabel: 'Curso recomendado',
    previewOnlyHint: 'El resto de preguntas y herramientas se desbloquean en Ultra.',
    auditIntro:
      'Pega tu package.json, estructura o código clave para auditar pruebas, seguridad y preparación laboral.',
    auditPlaceholder: 'Pega aquí tu package.json o código principal...',
    loadSample: 'Cargar ejemplo',
    runAudit: 'Ejecutar auditoría',
    verdictReady: 'Listo para mostrar a empresas',
    verdictAlmost: 'Casi listo — ajusta un par de puntos',
    verdictNeedsWork: 'Requiere mejoras antes de postular',
    recommendedCourses: 'Cursos recomendados para cerrar brechas',
    sprintPaceLabel: 'Ritmo diario',
    deliverableLabel: 'Entregable semanal',
    openCourse: 'Abrir curso',
  },
};

function courseHref(courseId: CourseId): string {
  return courseId === 'react' ? '/plan/1' : `/courses/${courseId}/home`;
}

export function UltraStudioScreen() {
  const locale = useLearningStore((s) => s.language);
  const membership = useMembershipStatus();
  const copy = STUDIO_COPY[locale];

  const hasUltraAccess = membership.isPrivileged || planIncludes(membership.plan, 'careerStudio');

  const [tab, setTab] = useState<Tab>('interview');
  const [track, setTrack] = useState<StudioTrack>('frontend');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [lastScore, setLastScore] = useState<MockAnswerScore | null>(null);

  const [auditInput, setAuditInput] = useState('');
  const [auditRan, setAuditRan] = useState(false);

  const [hoursPerDay, setHoursPerDay] = useState<1 | 2 | 3>(2);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  const trackQuestions = useMemo(
    () => STUDIO_QUESTIONS.filter((item) => item.track === track),
    [track],
  );
  const currentQuestion = trackQuestions[questionIndex] ?? trackQuestions[0] ?? STUDIO_QUESTIONS[0];
  const auditReport = useMemo(
    () => (auditRan ? auditProjectSubmission({ track, codeOrManifest: auditInput }) : null),
    [auditRan, track, auditInput],
  );
  const sprintWeeks = useMemo(
    () => buildJobReadySprint({ track, hoursPerDay }),
    [track, hoursPerDay],
  );

  function selectTrack(next: StudioTrack) {
    setTrack(next);
    setQuestionIndex(0);
    setAnswer('');
    setLastScore(null);
  }

  function evaluateAnswer() {
    if (!currentQuestion) return;
    setLastScore(scoreMockAnswer(currentQuestion, answer, locale));
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeading title={copy.title} subtitle={copy.subtitle} />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-300">
          <Crown size={14} aria-hidden="true" />
          {copy.ultraBadge}
        </span>
      </div>

      {!hasUltraAccess && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-400/40 bg-card p-5 shadow-[var(--depth-1)]">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300">
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

      {/* Track selector + studio tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-[var(--depth-1)]">
        <div className="flex flex-wrap gap-2" role="tablist">
          {(
            [
              { id: 'interview', label: copy.tabInterview, icon: MessageSquareCode },
              { id: 'audit', label: copy.tabAudit, icon: ClipboardCheck },
              { id: 'sprint', label: copy.tabSprint, icon: Rocket },
            ] as const
          ).map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(id)}
                className={
                  'inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ' +
                  (active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/60 text-foreground hover:bg-muted')
                }
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(['frontend', 'backend', 'python', 'ai'] as StudioTrack[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => selectTrack(item)}
              className={
                'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ' +
                (track === item
                  ? 'border-primary bg-primary-soft text-brand'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground')
              }
            >
              {TRACK_LABELS[item][locale]}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: MOCK INTERVIEW */}
      {tab === 'interview' && currentQuestion && (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--depth-1)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-brand">
              {TRACK_LABELS[track][locale]} · #{questionIndex + 1}/{trackQuestions.length}
            </span>
            <div className="flex gap-2">
              {trackQuestions.map((q, idx) => {
                const locked = !hasUltraAccess && idx > 0;
                return (
                  <button
                    key={q.id}
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      setQuestionIndex(idx);
                      setAnswer('');
                      setLastScore(null);
                    }}
                    className={
                      'rounded-lg border px-2.5 py-1 text-xs font-semibold ' +
                      (idx === questionIndex
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-muted/40 text-foreground disabled:opacity-50')
                    }
                  >
                    Q{idx + 1} {locked ? '🔒' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          <h2 className="m-0 text-lg font-semibold leading-7 text-foreground">
            {currentQuestion.prompt[locale]}
          </h2>

          <textarea
            rows={5}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={copy.answerPlaceholder}
            className="w-full rounded-xl border border-border bg-background p-3.5 text-sm text-foreground outline-none focus:border-primary"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={!answer.trim()}
              onClick={evaluateAnswer}
              className="button primary inline-flex items-center gap-2"
            >
              <Sparkles size={16} aria-hidden="true" />
              {copy.evaluateBtn}
            </button>
            {!hasUltraAccess && (
              <span className="text-xs text-muted-foreground">{copy.previewOnlyHint}</span>
            )}
          </div>

          {lastScore && (
            <div className="space-y-4 rounded-2xl border border-border bg-muted/35 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="m-0 text-xs text-muted-foreground">{copy.scoreLabel}</p>
                  <p className="m-0 mt-0.5 text-3xl font-bold tabular-nums text-foreground">
                    {lastScore.score}%
                  </p>
                </div>
                <Link
                  href={courseHref(currentQuestion.recommendedCourse)}
                  className="button subtle text-xs no-underline"
                >
                  {copy.refreshCourseLabel}:{' '}
                  {courseDisplayName(currentQuestion.recommendedCourse, locale)}
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3.5">
                  <p className="m-0 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {copy.matchedLabel}
                  </p>
                  <ul className="mt-2 mb-0 space-y-1 pl-4 text-xs text-foreground">
                    {lastScore.matchedConcepts.length ? (
                      lastScore.matchedConcepts.map((item) => <li key={item}>{item}</li>)
                    ) : (
                      <li>—</li>
                    )}
                  </ul>
                </div>
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3.5">
                  <p className="m-0 text-xs font-semibold text-amber-600 dark:text-amber-300">
                    {copy.missingLabel}
                  </p>
                  <ul className="mt-2 mb-0 space-y-1 pl-4 text-xs text-foreground">
                    {lastScore.missingConcepts.length ? (
                      lastScore.missingConcepts.map((item) => <li key={item}>{item}</li>)
                    ) : (
                      <li>✓</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <p className="m-0 text-xs font-semibold text-brand">{copy.modelAnswerLabel}</p>
                <p className="mt-1.5 mb-0 text-sm leading-6 text-foreground">
                  {currentQuestion.modelAnswer[locale]}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROJECT AUDIT */}
      {tab === 'audit' && (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--depth-1)]">
          {!hasUltraAccess ? (
            <div className="space-y-3 py-6 text-center">
              <Lock size={28} className="mx-auto text-amber-500" aria-hidden="true" />
              <h2 className="m-0 text-lg font-semibold text-foreground">{copy.tabAudit}</h2>
              <p className="mx-auto max-w-lg text-sm text-muted-foreground">{copy.lockedText}</p>
              <Link href="/plans" className="button primary inline-flex no-underline">
                {copy.upgradeCta}
              </Link>
            </div>
          ) : (
            <>
              <p className="m-0 text-sm text-muted-foreground">{copy.auditIntro}</p>
              <textarea
                rows={7}
                value={auditInput}
                onChange={(e) => {
                  setAuditInput(e.target.value);
                  setAuditRan(false);
                }}
                placeholder={copy.auditPlaceholder}
                className="w-full rounded-xl border border-border bg-background p-3.5 font-mono text-xs text-foreground outline-none focus:border-primary"
              />
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  disabled={!auditInput.trim()}
                  onClick={() => setAuditRan(true)}
                  className="button primary inline-flex items-center gap-2"
                >
                  <ClipboardCheck size={16} aria-hidden="true" />
                  {copy.runAudit}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuditInput(SAMPLE_MANIFEST);
                    setAuditRan(true);
                  }}
                  className="button subtle"
                >
                  {copy.loadSample}
                </button>
              </div>

              {auditReport && (
                <div className="space-y-4 rounded-2xl border border-border bg-muted/30 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="m-0 text-3xl font-bold tabular-nums text-foreground">
                        {auditReport.score} / 100
                      </p>
                      <p className="m-0 mt-1 text-sm font-medium text-muted-foreground">
                        {auditReport.verdict === 'ready'
                          ? copy.verdictReady
                          : auditReport.verdict === 'almost'
                            ? copy.verdictAlmost
                            : copy.verdictNeedsWork}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {auditReport.findings.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 rounded-xl border border-border bg-card p-3.5"
                      >
                        {item.status === 'pass' ? (
                          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
                        ) : item.status === 'warn' ? (
                          <TriangleAlert size={18} className="mt-0.5 shrink-0 text-amber-500" aria-hidden="true" />
                        ) : (
                          <ShieldAlert size={18} className="mt-0.5 shrink-0 text-rose-500" aria-hidden="true" />
                        )}
                        <div>
                          <p className="m-0 text-sm font-semibold text-foreground">
                            {item.title[locale]}
                          </p>
                          <p className="m-0 mt-0.5 text-xs leading-5 text-muted-foreground">
                            {item.detail[locale]}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="m-0 text-xs font-semibold text-muted-foreground">
                      {copy.recommendedCourses}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {auditReport.recommendedCourses.map((courseId) => (
                        <Link
                          key={courseId}
                          href={courseHref(courseId)}
                          className="button subtle text-xs no-underline"
                        >
                          {courseDisplayName(courseId, locale)}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 3: 30-DAY SPRINT */}
      {tab === 'sprint' && (
        <div className="space-y-4">
          {!hasUltraAccess ? (
            <div className="space-y-3 rounded-2xl border border-border bg-card p-8 text-center">
              <Lock size={28} className="mx-auto text-amber-500" aria-hidden="true" />
              <h2 className="m-0 text-lg font-semibold text-foreground">{copy.tabSprint}</h2>
              <p className="mx-auto max-w-lg text-sm text-muted-foreground">{copy.lockedText}</p>
              <Link href="/plans" className="button primary inline-flex no-underline">
                {copy.upgradeCta}
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
                <span className="text-sm font-semibold text-foreground">{copy.sprintPaceLabel}</span>
                <div className="flex gap-2">
                  {([1, 2, 3] as const).map((hours) => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setHoursPerDay(hours)}
                      className={
                        'rounded-xl border px-3.5 py-1.5 text-xs font-semibold ' +
                        (hoursPerDay === hours
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-muted/40 text-foreground')
                      }
                    >
                      {hours === 3 ? '3h+ / day' : `${hours}h / day`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {sprintWeeks.map((week) => (
                  <div
                    key={week.week}
                    className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-[var(--depth-1)]"
                  >
                    <h3 className="m-0 text-base font-semibold text-foreground">
                      {week.focus[locale]}
                    </h3>
                    <p className="mt-1.5 mb-0 text-xs text-brand">
                      {copy.deliverableLabel}: {week.deliverable[locale]}
                    </p>
                    <ul className="my-4 list-none space-y-2 p-0">
                      {week.tasks[locale].map((task, idx) => {
                        const key = `${track}-${week.week}-${idx}`;
                        const done = Boolean(checkedTasks[key]);
                        return (
                          <li key={key}>
                            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-foreground">
                              <input
                                type="checkbox"
                                checked={done}
                                onChange={() =>
                                  setCheckedTasks((prev) => ({ ...prev, [key]: !done }))
                                }
                                className="mt-1 size-4 accent-primary"
                              />
                              <span className={done ? 'line-through opacity-60' : ''}>{task}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                    <Link
                      href={courseHref(week.courseId)}
                      className="button subtle mt-auto self-start text-xs no-underline"
                    >
                      {copy.openCourse}: {courseDisplayName(week.courseId, locale)}
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
