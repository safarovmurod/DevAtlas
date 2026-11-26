'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Flame,
  GraduationCap,
  SendHorizontal,
  Users,
} from 'lucide-react';
import { PageHeading } from '@/components/learning/page-heading';
import type { InterfaceLocale } from '@/lib/locale';
import {
  BOOTCAMPS,
  STARTER_BRIEFS,
  estimateClassroomPriceUsd,
} from '@/lib/programs/programs-data';
import { useLearningStore } from '@/stores/learning-store';

type ProgramTab = 'bootcamps' | 'classroom' | 'internships';

const PROGRAMS_COPY: Record<
  InterfaceLocale,
  {
    title: string;
    subtitle: string;
    tabBootcamps: string;
    tabClassroom: string;
    tabInternships: string;
    applyBtn: string;
    days: string;
    classroomTitle: string;
    classroomSubtitle: string;
    seatsLabel: string;
    perSeat: string;
    monthlyEst: string;
    classroomFeatures: string[];
    internshipsTitle: string;
    internshipsSubtitle: string;
    openPrep: string;
    employerBtn: string;
    formHeading: string;
    fullName: string;
    contact: string;
    org: string;
    notes: string;
    submit: string;
    sending: string;
    successPersisted: string;
    successPreview: string;
    errorMsg: string;
  }
> = {
  tg: {
    title: 'Марафонҳо, DevAtlas Classroom (B2B) ва Стажировка',
    subtitle:
      'Барномаҳои иловагӣ берун аз обуна: марафонҳои 30-рӯза бо ментор, литсензияи гурӯҳӣ барои мактабҳо ва лоиҳаҳои оғозӣ.',
    tabBootcamps: 'Марафонҳои 30-рӯза',
    tabClassroom: 'Барои мактабҳо (B2B)',
    tabInternships: 'Стажировка ва Заказҳо',
    applyBtn: 'Сабти дархост',
    days: 'рӯз',
    classroomTitle: 'DevAtlas Classroom — барои марказҳои омӯзишӣ, мактабҳо ва донишгоҳҳо',
    classroomSubtitle:
      'Ба донишҷӯёнатон дастрасии гурӯҳӣ ба 43 курс, Code Sandbox, QR-сертификат ва назорати пешрафт диҳед.',
    seatsLabel: 'Шумораи донишҷӯён',
    perSeat: 'барои 1 хонанда / моҳ',
    monthlyEst: 'Ҳисоби тахминии моҳона',
    classroomFeatures: [
      'Дастрасии Pro барои ҳар як хонанда бо QR-сертификат',
      'Барномаҳои тайёри IT, AI, Маркетинг, Англисӣ ва Кӯдакон',
      'Пардохти расмии корпоративӣ ё тавассути бонки маҳаллӣ',
    ],
    internshipsTitle: 'Лоиҳаҳои оғозӣ ва пайваст бо корфармоён',
    internshipsSubtitle:
      'Ин брифаҳоро созед, ба `/portfolio` илова кунед ва бо линки оммавии худ ба стажировка ё фриланс муроҷиат намоед.',
    openPrep: 'Омӯхтани мавзӯи лозим',
    employerBtn: 'Ширкат доред? Дархости коромӯз фиристед',
    formHeading: 'Фиристодани дархост',
    fullName: 'Ном ва насаб',
    contact: 'Telegram (@username) ё телефон',
    org: 'Номи ширкат / марказ (ихтиёрӣ)',
    notes: 'Шарҳ ё саволи шумо',
    submit: 'Фиристодани дархост',
    sending: 'Фиристода истодаем…',
    successPersisted: 'Дархости шумо қабул шуд! Дастаи DevAtlas бо шумо тамос мегирад.',
    successPreview:
      'Дархост тасдиқ шуд (режими маҳаллӣ: барои захираи доимӣ Supabase ё TELEGRAM_ADMIN_CHAT_ID-ро пайваст кунед).',
    errorMsg: 'Лутфан ном ва тамоси дурустро пур кунед.',
  },
  ru: {
    title: 'Буткемпы, DevAtlas Classroom (B2B) и Стажировки',
    subtitle:
      'Продукты сверх подписки: 30-дневные марафоны с ментором, групповые лицензии для учебных центров и стартовые проекты.',
    tabBootcamps: 'Буткемпы (30 дней)',
    tabClassroom: 'Для школ и курсов (B2B)',
    tabInternships: 'Стажировки и заказы',
    applyBtn: 'Оставить заявку',
    days: 'дн.',
    classroomTitle: 'DevAtlas Classroom — для учебных центров, школ и вузов',
    classroomSubtitle:
      'Подключите группы учеников к 43 курсам, Code Sandbox, QR-сертификатам и трекингу прогресса.',
    seatsLabel: 'Количество учеников',
    perSeat: 'за 1 ученика / мес.',
    monthlyEst: 'Оценка стоимости в месяц',
    classroomFeatures: [
      'Доступ Pro для каждого ученика + QR-сертификаты',
      'Готовые треки: IT, AI, Маркетинг, Бизнес, Дети',
      'Оплата для организаций и учебных центров',
    ],
    internshipsTitle: 'Стартовые брифы и стажировки',
    internshipsSubtitle:
      'Реализуйте любой бриф, добавьте его в `/portfolio` и откликайтесь с публичной ссылкой.',
    openPrep: 'Подготовиться к задаче',
    employerBtn: 'Вы работодатель? Запросить стажёров',
    formHeading: 'Отправить заявку',
    fullName: 'Имя и фамилия',
    contact: 'Telegram (@username) или телефон',
    org: 'Организация / учебный центр (необязательно)',
    notes: 'Комментарий или задача',
    submit: 'Отправить заявку',
    sending: 'Отправляем…',
    successPersisted: 'Заявка получена! Команда DevAtlas скоро свяжется с вами.',
    successPreview:
      'Заявка проверена (локальный режим: подключите Supabase или TELEGRAM_ADMIN_CHAT_ID для сохранения).',
    errorMsg: 'Проверьте имя и контакт для связи.',
  },
  en: {
    title: 'Bootcamps, DevAtlas Classroom (B2B) & Internships',
    subtitle:
      'High-touch offerings beyond subscriptions: 30-day mentored cohorts, school/center licenses, and starter client briefs.',
    tabBootcamps: '30-Day Bootcamps',
    tabClassroom: 'Classroom (B2B)',
    tabInternships: 'Internships & Briefs',
    applyBtn: 'Apply / Inquire',
    days: 'days',
    classroomTitle: 'DevAtlas Classroom — for Schools, Universities & Training Centers',
    classroomSubtitle:
      'Equip cohorts with 43 structured courses, multi-language Code Sandbox, and verifiable QR certificates.',
    seatsLabel: 'Student seats',
    perSeat: 'per seat / month',
    monthlyEst: 'Estimated monthly license',
    classroomFeatures: [
      'Pro access & verifiable QR certificates for every seat',
      'Ready curricula across Coding, AI, Design, Business & Kids',
      'Invoice billing and regional payment support for centers',
    ],
    internshipsTitle: 'Starter Project Briefs & Employer Matching',
    internshipsSubtitle:
      'Build these real-world starter briefs, showcase them in `/portfolio`, and apply directly with your public link.',
    openPrep: 'Study required workshop',
    employerBtn: 'Hiring interns? Request top graduates',
    formHeading: 'Submit Inquiry',
    fullName: 'Full name',
    contact: 'Telegram (@username), phone, or email',
    org: 'School / company (optional)',
    notes: 'Goals or requirements',
    submit: 'Submit inquiry',
    sending: 'Submitting…',
    successPersisted: 'Inquiry received! The DevAtlas team will follow up shortly.',
    successPreview:
      'Inquiry validated (local mode: configure Supabase or TELEGRAM_ADMIN_CHAT_ID to persist submissions).',
    errorMsg: 'Please enter a valid name and contact.',
  },
  es: {
    title: 'Bootcamps, Classroom (B2B) y Prácticas',
    subtitle:
      'Programas adicionales: bootcamps de 30 días con mentor, licencias para academias y proyectos reales.',
    tabBootcamps: 'Bootcamps 30 días',
    tabClassroom: 'Classroom (B2B)',
    tabInternships: 'Prácticas y proyectos',
    applyBtn: 'Solicitar plaza',
    days: 'días',
    classroomTitle: 'DevAtlas Classroom — para escuelas y academias',
    classroomSubtitle:
      'Equipa tus grupos con 43 cursos, Code Sandbox y certificados QR verificables.',
    seatsLabel: 'Plazas de estudiantes',
    perSeat: 'por estudiante / mes',
    monthlyEst: 'Estimación mensual',
    classroomFeatures: [
      'Acceso Pro y certificados QR para cada alumno',
      'Rutas listas de programación, IA, diseño y niños',
      'Facturación grupal para centros educativos',
    ],
    internshipsTitle: 'Proyectos iniciales y prácticas',
    internshipsSubtitle:
      'Construye estos proyectos, súbelos a `/portfolio` y postula con tu enlace público.',
    openPrep: 'Prepararse con taller',
    employerBtn: '¿Buscas talento? Solicitar egresados',
    formHeading: 'Enviar solicitud',
    fullName: 'Nombre completo',
    contact: 'Telegram, teléfono o correo',
    org: 'Centro / empresa (opcional)',
    notes: 'Detalles',
    submit: 'Enviar solicitud',
    sending: 'Enviando…',
    successPersisted: '¡Solicitud recibida! Te contactaremos pronto.',
    successPreview:
      'Solicitud validada (modo local: conecta Supabase o TELEGRAM_ADMIN_CHAT_ID para guardar).',
    errorMsg: 'Introduce un nombre y contacto válidos.',
  },
};

export function ProgramsScreen() {
  const locale = useLearningStore((s) => s.language);
  const copy = PROGRAMS_COPY[locale];

  const [tab, setTab] = useState<ProgramTab>('bootcamps');
  const [seats, setSeats] = useState(30);
  const [selectedKind, setSelectedKind] = useState<'bootcamp' | 'classroom_b2b' | 'employer_internship'>('bootcamp');
  const [selectedProgramId, setSelectedProgramId] = useState(BOOTCAMPS[0].id);

  const [fullName, setFullName] = useState('');
  const [contact, setContact] = useState('');
  const [organization, setOrganization] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);

  const estimate = estimateClassroomPriceUsd(seats);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatusMsg(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/programs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: selectedKind,
          programId: selectedProgramId,
          fullName,
          contact,
          organization,
          seats: selectedKind === 'classroom_b2b' ? seats : undefined,
          notes,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; persisted?: boolean };
      if (!res.ok || !data.ok) {
        setStatusMsg({ tone: 'err', text: copy.errorMsg });
        return;
      }
      setStatusMsg({
        tone: 'ok',
        text: data.persisted ? copy.successPersisted : copy.successPreview,
      });
      setNotes('');
    } catch {
      setStatusMsg({ tone: 'err', text: copy.errorMsg });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <PageHeading title={copy.title} subtitle={copy.subtitle} />

      <div className="flex flex-wrap gap-2" role="tablist">
        {(
          [
            { id: 'bootcamps', label: copy.tabBootcamps, icon: Flame },
            { id: 'classroom', label: copy.tabClassroom, icon: Building2 },
            { id: 'internships', label: copy.tabInternships, icon: Briefcase },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => {
              setTab(id);
              setStatusMsg(null);
              if (id === 'bootcamps') {
                setSelectedKind('bootcamp');
                setSelectedProgramId(BOOTCAMPS[0].id);
              } else if (id === 'classroom') {
                setSelectedKind('classroom_b2b');
                setSelectedProgramId('classroom-license');
              } else {
                setSelectedKind('employer_internship');
                setSelectedProgramId('employer-talent-request');
              }
            }}
            className={
              'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ' +
              (tab === id
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-card text-foreground hover:bg-muted')
            }
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* TAB 1: BOOTCAMPS */}
      {tab === 'bootcamps' && (
        <div className="grid gap-4 md:grid-cols-3">
          {BOOTCAMPS.map((item) => (
            <div
              key={item.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-[var(--depth-1)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-brand">
                  {item.durationDays} {copy.days}
                </span>
                <strong className="text-xl font-bold text-foreground">${item.priceUsd}</strong>
              </div>
              <h2 className="mt-3 mb-0 text-base font-bold text-foreground">{item.title[locale]}</h2>
              <p className="mt-2 mb-4 text-xs leading-5 text-muted-foreground">{item.summary[locale]}</p>
              <ul className="mb-5 list-none space-y-2 p-0 text-xs text-foreground">
                {item.outcomes[locale].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => {
                  setSelectedKind('bootcamp');
                  setSelectedProgramId(item.id);
                  document.getElementById('program-apply-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="button primary mt-auto text-xs"
              >
                {copy.applyBtn}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: CLASSROOM B2B */}
      {tab === 'classroom' && (
        <div className="grid gap-5 rounded-3xl border border-border bg-card p-6 shadow-[var(--depth-1)] md:grid-cols-2">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-brand">
              <GraduationCap size={14} aria-hidden="true" />
              DevAtlas Classroom B2B
            </span>
            <h2 className="m-0 text-xl font-bold text-foreground">{copy.classroomTitle}</h2>
            <p className="m-0 text-sm leading-6 text-muted-foreground">{copy.classroomSubtitle}</p>
            <ul className="list-none space-y-2.5 p-0 text-sm text-foreground">
              {copy.classroomFeatures.map((feat) => (
                <li key={feat} className="flex items-start gap-2">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 rounded-2xl border border-border bg-muted/35 p-5">
            <div className="flex items-center justify-between text-sm font-semibold text-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Users size={16} aria-hidden="true" />
                {copy.seatsLabel}
              </span>
              <span className="font-mono text-lg text-brand">{seats}</span>
            </div>
            <input
              type="range"
              min={10}
              max={200}
              step={5}
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl border border-border bg-card p-3.5">
                <p className="m-0 text-xs text-muted-foreground">{copy.perSeat}</p>
                <p className="m-0 mt-1 text-xl font-bold text-foreground">${estimate.perSeatUsd}</p>
              </div>
              <div className="rounded-xl border border-primary/35 bg-card p-3.5">
                <p className="m-0 text-xs text-muted-foreground">{copy.monthlyEst}</p>
                <p className="m-0 mt-1 text-xl font-bold text-brand">${estimate.monthlyTotalUsd}/mo</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INTERNSHIPS & STARTER BRIEFS */}
      {tab === 'internships' && (
        <div className="space-y-4">
          <div>
            <h2 className="m-0 text-lg font-bold text-foreground">{copy.internshipsTitle}</h2>
            <p className="mt-1 mb-0 text-sm text-muted-foreground">{copy.internshipsSubtitle}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {STARTER_BRIEFS.map((brief) => (
              <div
                key={brief.id}
                className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-[var(--depth-1)]"
              >
                <span className="self-start rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-brand">
                  {brief.level}
                </span>
                <h3 className="mt-2.5 mb-0 text-sm font-bold text-foreground">
                  {brief.title[locale]}
                </h3>
                <p className="mt-2 mb-3 text-xs leading-5 text-muted-foreground">
                  {brief.deliverable[locale]}
                </p>
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {brief.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-lg border border-border bg-muted/50 px-2 py-0.5 font-mono text-[11px] text-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <Link
                  href={brief.relatedWorkshopOrCourse}
                  className="button subtle mt-auto self-start text-xs no-underline"
                >
                  {copy.openPrep}
                </Link>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedKind('employer_internship');
              setSelectedProgramId('employer-talent-request');
              document.getElementById('program-apply-form')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="button primary text-xs"
          >
            {copy.employerBtn}
          </button>
        </div>
      )}

      {/* Shared Application Form */}
      <form
        id="program-apply-form"
        onSubmit={(e) => void handleSubmit(e)}
        className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-[var(--depth-1)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="m-0 text-base font-bold text-foreground">{copy.formHeading}</h2>
          <span className="rounded-full bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">
            {selectedProgramId}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            {copy.fullName}
            <input
              required
              minLength={2}
              maxLength={80}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            {copy.contact}
            <input
              required
              minLength={4}
              maxLength={100}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            {copy.org}
            <input
              maxLength={100}
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
        </div>

        <label className="grid gap-1 text-xs font-medium text-muted-foreground">
          {copy.notes}
          <textarea
            rows={2}
            maxLength={600}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>

        {statusMsg && (
          <p
            role={statusMsg.tone === 'err' ? 'alert' : 'status'}
            className={
              'm-0 rounded-xl border p-3 text-xs font-medium ' +
              (statusMsg.tone === 'ok'
                ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border-rose-500/35 bg-rose-500/10 text-rose-700 dark:text-rose-300')
            }
          >
            {statusMsg.text}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="button primary inline-flex items-center gap-2 text-sm"
        >
          <SendHorizontal size={15} aria-hidden="true" />
          {submitting ? copy.sending : copy.submit}
        </button>
      </form>
    </section>
  );
}
