'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  Award,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Lock,
  Share2,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { useAccount } from '@/components/account/account-provider';
import { useMembershipStatus } from '@/components/courses/use-membership-status';
import { CourseIcon } from '@/components/courses/course-icon';
import { PageHeading } from '@/components/learning/page-heading';
import { buildReportSources } from '@/components/progress/report-sources';
import { planIncludes } from '@/lib/billing/plans';
import { courseDisplayName } from '@/lib/catalog-copy';
import {
  collectCertificates,
  encodeCertificateToken,
  type CertificateRecord,
} from '@/lib/certificates/certificate-engine';
import type { CourseId } from '@/lib/courses/ids';
import { dateKey } from '@/lib/learning';
import type { InterfaceLocale } from '@/lib/locale';
import { useLearningStore } from '@/stores/learning-store';

type Copy = {
  title: string;
  subtitle: string;
  proBadge: string;
  lockedTitle: string;
  lockedText: string;
  upgradeCta: string;
  earnedSection: string;
  inProgressSection: string;
  emptyTitle: string;
  emptyText: string;
  emptyAction: string;
  holderLabel: string;
  holderPlaceholder: string;
  certBanner: string;
  certSubtitle: string;
  daysLabel: (done: number, total: number) => string;
  hoursLabel: (hours: number) => string;
  issuedLabel: string;
  idLabel: string;
  downloadLandscape: string;
  downloadStory: string;
  copyVerify: string;
  copied: string;
  openVerify: string;
  shareTelegram: string;
  previewBadge: string;
  earnedBadge: string;
  completeToIssue: string;
  continueCourse: string;
  scanHint: string;
};

const CERT_COPY: Record<InterfaceLocale, Copy> = {
  tg: {
    title: 'Сертификатҳо бо QR-код',
    subtitle:
      'Сертификати хатми курсро бо QR-тасдиқи оммавӣ зеркашӣ кунед ва дар Telegram, Instagram Stories ё LinkedIn гузоред.',
    proBadge: 'Хусусияти Pro / Ultra',
    lockedTitle: 'Зеркашӣ ва QR-тасдиқ дар тарифи Pro ва Ultra кушода мешавад',
    lockedText:
      'Шумо метавонед пешрафти курсҳо ва намуди сертификататонро бинед. Барои зеркашии PNG/Stories ва линки тасдиқи расмӣ ба Pro ё Ultra гузаред.',
    upgradeCta: 'Дидани тарифҳои Pro / Ultra',
    earnedSection: 'Сертификатҳои омода (100%)',
    inProgressSection: 'Дар раванди омӯзиш',
    emptyTitle: 'Ҳанӯз ягон курс оғоз нашудааст',
    emptyText: 'Аввалин дарси худро гузаред, то пешрафти сертификататон дар ин ҷо пайдо шавад.',
    emptyAction: 'Кушодани курсҳо',
    holderLabel: 'Ном ва насаб дар сертификат',
    holderPlaceholder: 'Номи пурраи шумо',
    certBanner: 'СЕРТИФИКАТИ ХАТМ',
    certSubtitle: 'Тасдиқ мекунад, ки хатмкунанда барномаи омӯзиширо бо муваффақият анҷом дод',
    daysLabel: (done, total) => `${done} / ${total} рӯз`,
    hoursLabel: (hours) => `${hours} соат амалия`,
    issuedLabel: 'Сана',
    idLabel: 'Рамз',
    downloadLandscape: 'Зеркашӣ (PNG · Резюме)',
    downloadStory: 'Зеркашӣ барои Stories',
    copyVerify: 'Нусхаи линки тасдиқ',
    copied: 'Нусхабардорӣ шуд!',
    openVerify: 'Саҳифаи тасдиқ',
    shareTelegram: 'Фиристодан ба Telegram',
    previewBadge: 'Намуна (дар раванд)',
    earnedBadge: 'Хатмшуда',
    completeToIssue: 'Ҳамаи рӯзҳои курсро анҷом диҳед, то сертификати расмӣ кушода шавад.',
    continueCourse: 'Давом додани курс',
    scanHint: 'QR-ро скан кунед барои санҷиши ҳақиқӣ будан',
  },
  ru: {
    title: 'Сертификаты с QR-проверкой',
    subtitle:
      'Скачивайте сертификаты о прохождении курсов с публичной QR-проверкой и делитесь ими в Telegram, Instagram Stories и LinkedIn.',
    proBadge: 'Функция Pro / Ultra',
    lockedTitle: 'Скачивание и публичная QR-проверка доступны на тарифах Pro и Ultra',
    lockedText:
      'Вы видите свой реальный прогресс и предпросмотр сертификата. Перейдите на Pro или Ultra, чтобы скачивать PNG/Stories и делиться ссылкой проверки.',
    upgradeCta: 'Открыть тарифы Pro / Ultra',
    earnedSection: 'Готовые сертификаты (100%)',
    inProgressSection: 'В процессе прохождения',
    emptyTitle: 'Пока нет начатых курсов',
    emptyText: 'Пройдите первый урок в любом курсе, и здесь появится ваш прогресс к сертификату.',
    emptyAction: 'Открыть курсы',
    holderLabel: 'Имя и фамилия на сертификате',
    holderPlaceholder: 'Ваше полное имя',
    certBanner: 'СЕРТИФИКАТ О ПРОХОЖДЕНИИ',
    certSubtitle: 'Подтверждает успешное завершение учебной программы на платформе DevAtlas',
    daysLabel: (done, total) => `${done} / ${total} дн.`,
    hoursLabel: (hours) => `${hours} ч. практики`,
    issuedLabel: 'Дата',
    idLabel: 'Код',
    downloadLandscape: 'Скачать PNG (Резюме)',
    downloadStory: 'Скачать для Stories',
    copyVerify: 'Скопировать ссылку проверки',
    copied: 'Скопировано!',
    openVerify: 'Страница проверки',
    shareTelegram: 'Поделиться в Telegram',
    previewBadge: 'Предпросмотр',
    earnedBadge: 'Получен',
    completeToIssue: 'Завершите все дни курса, чтобы разблокировать выпуск официального сертификата.',
    continueCourse: 'Продолжить курс',
    scanHint: 'Отсканируйте QR для проверки подлинности',
  },
  en: {
    title: 'QR-Verified Certificates',
    subtitle:
      'Download course completion certificates with public QR verification and share them on Telegram, Instagram Stories, or LinkedIn.',
    proBadge: 'Pro / Ultra Feature',
    lockedTitle: 'PNG downloads & public QR verification unlock on Pro and Ultra',
    lockedText:
      'You can track your live progress and preview your certificate layout. Upgrade to Pro or Ultra to export PNG/Stories cards and share your verification link.',
    upgradeCta: 'View Pro / Ultra plans',
    earnedSection: 'Earned Certificates (100%)',
    inProgressSection: 'In Progress',
    emptyTitle: 'No started courses yet',
    emptyText: 'Complete your first lesson in any course to see your certificate progress here.',
    emptyAction: 'Browse courses',
    holderLabel: 'Full name on certificate',
    holderPlaceholder: 'Your full name',
    certBanner: 'CERTIFICATE OF COMPLETION',
    certSubtitle: 'Certifies successful completion of the DevAtlas structured curriculum',
    daysLabel: (done, total) => `${done} / ${total} days`,
    hoursLabel: (hours) => `${hours}h practice`,
    issuedLabel: 'Issued',
    idLabel: 'ID',
    downloadLandscape: 'Download PNG (CV)',
    downloadStory: 'Download Story Card',
    copyVerify: 'Copy verify link',
    copied: 'Copied!',
    openVerify: 'Open verification page',
    shareTelegram: 'Share to Telegram',
    previewBadge: 'Preview',
    earnedBadge: 'Earned',
    completeToIssue: 'Finish all course days to unlock official certificate issuance.',
    continueCourse: 'Continue course',
    scanHint: 'Scan QR code to verify authenticity',
  },
  es: {
    title: 'Certificados con verificación QR',
    subtitle:
      'Descarga certificados de finalización con verificación pública por QR y compártelos en Telegram, Instagram Stories o LinkedIn.',
    proBadge: 'Función Pro / Ultra',
    lockedTitle: 'Descargas PNG y verificación QR disponibles en Pro y Ultra',
    lockedText:
      'Puedes ver tu progreso real y la vista previa del certificado. Pasa a Pro o Ultra para descargar tarjetas PNG/Stories y compartir el enlace.',
    upgradeCta: 'Ver planes Pro / Ultra',
    earnedSection: 'Certificados obtenidos (100%)',
    inProgressSection: 'En progreso',
    emptyTitle: 'Aún no hay cursos iniciados',
    emptyText: 'Completa tu primera lección para ver aquí el progreso hacia tu certificado.',
    emptyAction: 'Ver cursos',
    holderLabel: 'Nombre completo en el certificado',
    holderPlaceholder: 'Tu nombre completo',
    certBanner: 'CERTIFICADO DE FINALIZACIÓN',
    certSubtitle: 'Acredita la finalización exitosa del programa estructurado en DevAtlas',
    daysLabel: (done, total) => `${done} / ${total} días`,
    hoursLabel: (hours) => `${hours}h de práctica`,
    issuedLabel: 'Fecha',
    idLabel: 'ID',
    downloadLandscape: 'Descargar PNG (CV)',
    downloadStory: 'Descargar para Stories',
    copyVerify: 'Copiar enlace de verificación',
    copied: '¡Copiado!',
    openVerify: 'Abrir verificación',
    shareTelegram: 'Compartir en Telegram',
    previewBadge: 'Vista previa',
    earnedBadge: 'Obtenido',
    completeToIssue: 'Completa todos los días del curso para emitir el certificado oficial.',
    continueCourse: 'Continuar curso',
    scanHint: 'Escanea el QR para verificar autenticidad',
  },
};

async function drawCertificatePng(params: {
  variant: 'landscape' | 'story';
  holder: string;
  courseName: string;
  record: CertificateRecord;
  qrDataUrl: string;
  copy: Copy;
}) {
  const isStory = params.variant === 'story';
  const width = isStory ? 1080 : 1600;
  const height = isStory ? 1920 : 1130;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#070b18');
  bg.addColorStop(0.55, '#13173a');
  bg.addColorStop(1, '#091124');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Accent glow
  const glow = ctx.createRadialGradient(
    width * 0.8,
    height * 0.18,
    30,
    width * 0.8,
    height * 0.18,
    width * 0.55,
  );
  glow.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
  glow.addColorStop(0.5, 'rgba(56, 189, 248, 0.14)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Decorative gold/indigo frame
  const pad = isStory ? 56 : 64;
  ctx.strokeStyle = 'rgba(129, 140, 248, 0.55)';
  ctx.lineWidth = 4;
  ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);
  ctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pad + 18, pad + 18, width - (pad + 18) * 2, height - (pad + 18) * 2);

  // Header brand
  ctx.fillStyle = '#38bdf8';
  ctx.font = `700 ${isStory ? 34 : 30}px Inter, system-ui, sans-serif`;
  ctx.fillText('DEVATLAS', pad + 60, pad + (isStory ? 120 : 108));

  ctx.fillStyle = '#facc15';
  ctx.font = `700 ${isStory ? 28 : 24}px Inter, system-ui, sans-serif`;
  ctx.fillText(params.copy.certBanner, pad + 60, pad + (isStory ? 210 : 185));

  // Holder name
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${isStory ? 68 : 74}px Inter, system-ui, sans-serif`;
  ctx.fillText(params.holder.slice(0, 28), pad + 60, pad + (isStory ? 360 : 320));

  // Subtitle
  ctx.fillStyle = '#cbd5e1';
  ctx.font = `400 ${isStory ? 30 : 28}px Inter, system-ui, sans-serif`;
  ctx.fillText(params.copy.certSubtitle.slice(0, 62), pad + 60, pad + (isStory ? 445 : 395));

  // Course box
  const boxY = pad + (isStory ? 540 : 455);
  const boxW = width - (pad + 60) * 2;
  const boxH = isStory ? 260 : 185;
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(pad + 60, boxY, boxW, boxH);
  ctx.strokeStyle = 'rgba(129, 140, 248, 0.45)';
  ctx.lineWidth = 2;
  ctx.strokeRect(pad + 60, boxY, boxW, boxH);

  ctx.fillStyle = '#a5b4fc';
  ctx.font = `700 ${isStory ? 50 : 52}px Inter, system-ui, sans-serif`;
  ctx.fillText(params.courseName.slice(0, 32), pad + 100, boxY + (isStory ? 115 : 88));

  ctx.fillStyle = '#e2e8f0';
  ctx.font = `500 ${isStory ? 32 : 28}px monospace`;
  const stats = `${params.copy.daysLabel(params.record.daysDone, params.record.totalDays)}  ·  ${params.copy.hoursLabel(params.record.hoursStudied)}`;
  ctx.fillText(stats, pad + 100, boxY + (isStory ? 195 : 148));

  // Metadata + QR
  const qrSize = isStory ? 300 : 210;
  const qrX = isStory ? width / 2 - qrSize / 2 : width - pad - 60 - qrSize;
  const qrY = isStory ? height - pad - 480 : height - pad - 60 - qrSize;

  const qrImg = new Image();
  await new Promise<void>((resolve) => {
    qrImg.onload = () => resolve();
    qrImg.onerror = () => resolve();
    qrImg.src = params.qrDataUrl;
  });
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(qrX - 14, qrY - 14, qrSize + 28, qrSize + 28);
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  ctx.fillStyle = '#94a3b8';
  ctx.font = `500 ${isStory ? 26 : 22}px monospace`;
  const metaY = isStory ? height - pad - 110 : height - pad - 135;
  ctx.fillText(`${params.copy.idLabel}: ${params.record.certificateId}`, pad + 60, metaY);
  ctx.fillText(`${params.copy.issuedLabel}: ${params.record.issuedOn}`, pad + 60, metaY + 42);

  const link = document.createElement('a');
  link.download = `devatlas-${params.record.courseId}-${params.variant}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function courseHref(courseId: CourseId): string {
  return courseId === 'react' ? '/plan/1' : `/courses/${courseId}/home`;
}

export function CertificatesScreen() {
  const state = useLearningStore();
  const account = useAccount();
  const membership = useMembershipStatus();
  const copy = CERT_COPY[state.language];
  const today = dateKey();

  const defaultName =
    account.profile?.displayName?.trim() ||
    account.user?.email?.split('@')[0] ||
    'DevAtlas Learner';
  const [holderName, setHolderName] = useState(defaultName);
  const [selectedCourseId, setSelectedCourseId] = useState<CourseId | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const hasProAccess = membership.isPrivileged || planIncludes(membership.plan, 'certificate');

  const records = useMemo(() => {
    const sources = buildReportSources(state);
    return collectCertificates(sources, account.user?.id ?? 'local', today);
  }, [state, account.user?.id, today]);

  const activeRecord = useMemo(() => {
    if (!records.length) return null;
    return records.find((item) => item.courseId === selectedCourseId) ?? records[0];
  }, [records, selectedCourseId]);

  const effectiveHolder = holderName.trim() || defaultName;

  const verifyPath = useMemo(() => {
    if (!activeRecord) return '';
    const token = encodeCertificateToken({
      id: activeRecord.certificateId,
      holder: effectiveHolder,
      courseId: activeRecord.courseId,
      daysDone: activeRecord.daysDone,
      totalDays: activeRecord.totalDays,
      hours: activeRecord.hoursStudied,
      issuedOn: activeRecord.issuedOn,
    });
    return `/verify/${token}`;
  }, [activeRecord, effectiveHolder]);

  const fullVerifyUrl = useMemo(() => {
    if (!verifyPath) return '';
    if (typeof window === 'undefined') return verifyPath;
    return `${window.location.origin}${verifyPath}`;
  }, [verifyPath]);

  useEffect(() => {
    let cancelled = false;
    if (!fullVerifyUrl) return;
    QRCode.toDataURL(fullVerifyUrl, { width: 280, margin: 1 })
      .then((url) => {
        if (!cancelled) setQrUrl(url);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [fullVerifyUrl]);

  const earned = records.filter((item) => item.status === 'earned');
  const inProgress = records.filter((item) => item.status === 'in_progress');
  const canExport = Boolean(activeRecord && activeRecord.status === 'earned' && hasProAccess);

  async function handleCopy() {
    if (!fullVerifyUrl) return;
    try {
      await navigator.clipboard.writeText(fullVerifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Ignore clipboard failures in restricted browsers.
    }
  }

  const telegramShareUrl = activeRecord
    ? `https://t.me/share/url?url=${encodeURIComponent(fullVerifyUrl)}&text=${encodeURIComponent(
        `${courseDisplayName(activeRecord.courseId, state.language)} — DevAtlas Certificate (${activeRecord.certificateId})`,
      )}`
    : '#';

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeading title={copy.title} subtitle={copy.subtitle} />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-xs font-semibold text-brand">
          <Sparkles size={14} aria-hidden="true" />
          {copy.proBadge}
        </span>
      </div>

      {!hasProAccess && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-card p-5 shadow-[var(--depth-1)]">
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

      {!records.length ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-[var(--depth-1)]">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-brand">
            <Award size={24} aria-hidden="true" />
          </span>
          <h2 className="mt-3 text-lg font-semibold text-foreground">{copy.emptyTitle}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{copy.emptyText}</p>
          <Link href="/courses" className="button primary mt-5 inline-flex no-underline">
            {copy.emptyAction}
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Active Certificate Showcase */}
          {activeRecord && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--depth-1)]">
                <label className="block text-xs font-medium text-muted-foreground" htmlFor="cert-holder-input">
                  {copy.holderLabel}
                </label>
                <input
                  id="cert-holder-input"
                  type="text"
                  value={holderName}
                  onChange={(event) => setHolderName(event.target.value)}
                  placeholder={copy.holderPlaceholder}
                  maxLength={80}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-indigo-400/35 bg-[linear-gradient(145deg,#070b18_0%,#151b3d_55%,#0a1226_100%)] p-6 text-white shadow-[0_24px_54px_-24px_rgba(15,23,42,0.9)] sm:p-8">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-20 -right-16 size-64 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.35),rgba(56,189,248,0.12)_50%,transparent_72%)] blur-2xl"
                />
                <div className="relative flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold tracking-[0.22em] text-sky-400 uppercase">
                    DEVATLAS
                  </span>
                  <span
                    className={
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ' +
                      (activeRecord.status === 'earned'
                        ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40'
                        : 'bg-amber-400/15 text-amber-200 ring-1 ring-amber-300/35')
                    }
                  >
                    <CheckCircle2 size={13} aria-hidden="true" />
                    {activeRecord.status === 'earned' ? copy.earnedBadge : copy.previewBadge}
                  </span>
                </div>

                <p className="relative mt-6 mb-1 text-xs font-semibold tracking-[0.2em] text-amber-300 uppercase">
                  {copy.certBanner}
                </p>
                <h2 className="relative m-0 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {effectiveHolder}
                </h2>
                <p className="relative mt-2 text-sm text-slate-300">{copy.certSubtitle}</p>

                <div className="relative mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-white/12 bg-white/6 p-4">
                  <CourseIcon courseId={activeRecord.courseId} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate text-lg font-bold text-indigo-200">
                      {courseDisplayName(activeRecord.courseId, state.language)}
                    </p>
                    <p className="m-0 mt-0.5 font-mono text-xs text-slate-300">
                      {copy.daysLabel(activeRecord.daysDone, activeRecord.totalDays)} ·{' '}
                      {copy.hoursLabel(activeRecord.hoursStudied)}
                    </p>
                  </div>
                </div>

                <div className="relative mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-5">
                  <div className="space-y-1 font-mono text-xs text-slate-300">
                    <div>
                      <span className="text-slate-400">{copy.idLabel}:</span>{' '}
                      {activeRecord.certificateId}
                    </div>
                    <div>
                      <span className="text-slate-400">{copy.issuedLabel}:</span>{' '}
                      {activeRecord.issuedOn}
                    </div>
                    <p className="m-0 pt-1 font-sans text-[11px] text-slate-400">{copy.scanHint}</p>
                  </div>
                  {qrUrl && (
                    <div className="rounded-xl bg-white p-2 shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrUrl}
                        alt="Certificate QR verification code"
                        width={88}
                        height={88}
                        className="block size-[88px]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {activeRecord.status !== 'earned' ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
                  <p className="m-0 text-sm text-muted-foreground">{copy.completeToIssue}</p>
                  <Link href={courseHref(activeRecord.courseId)} className="button primary no-underline">
                    {copy.continueCourse}
                  </Link>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    disabled={!canExport || !qrUrl}
                    onClick={() =>
                      void drawCertificatePng({
                        variant: 'landscape',
                        holder: effectiveHolder,
                        courseName: courseDisplayName(activeRecord.courseId, state.language),
                        record: activeRecord,
                        qrDataUrl: qrUrl,
                        copy,
                      })
                    }
                    className="button primary inline-flex items-center gap-2"
                  >
                    <Download size={16} aria-hidden="true" />
                    {copy.downloadLandscape}
                  </button>
                  <button
                    type="button"
                    disabled={!canExport || !qrUrl}
                    onClick={() =>
                      void drawCertificatePng({
                        variant: 'story',
                        holder: effectiveHolder,
                        courseName: courseDisplayName(activeRecord.courseId, state.language),
                        record: activeRecord,
                        qrDataUrl: qrUrl,
                        copy,
                      })
                    }
                    className="button subtle inline-flex items-center gap-2"
                  >
                    <Smartphone size={16} aria-hidden="true" />
                    {copy.downloadStory}
                  </button>
                  <button
                    type="button"
                    disabled={!canExport}
                    onClick={() => void handleCopy()}
                    className="button subtle inline-flex items-center gap-2"
                  >
                    <Copy size={16} aria-hidden="true" />
                    {copied ? copy.copied : copy.copyVerify}
                  </button>
                  {canExport && (
                    <>
                      <Link href={verifyPath} className="button subtle inline-flex items-center gap-2 no-underline">
                        <ExternalLink size={16} aria-hidden="true" />
                        {copy.openVerify}
                      </Link>
                      <a
                        href={telegramShareUrl}
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
              )}
            </div>
          )}

          {/* Course list selector */}
          <div className="space-y-5">
            {earned.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="m-0 text-sm font-semibold text-foreground">{copy.earnedSection}</h3>
                {earned.map((item) => {
                  const selected = activeRecord?.courseId === item.courseId;
                  return (
                    <button
                      key={item.courseId}
                      type="button"
                      onClick={() => setSelectedCourseId(item.courseId)}
                      className={
                        'flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors ' +
                        (selected
                          ? 'border-primary bg-primary-soft/50'
                          : 'border-border bg-card hover:border-primary/40')
                      }
                    >
                      <CourseIcon courseId={item.courseId} size={28} />
                      <div className="min-w-0 flex-1">
                        <p className="m-0 truncate text-sm font-semibold text-foreground">
                          {courseDisplayName(item.courseId, state.language)}
                        </p>
                        <p className="m-0 mt-0.5 text-xs text-muted-foreground">
                          {copy.daysLabel(item.daysDone, item.totalDays)} · {item.certificateId}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        100%
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {inProgress.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="m-0 text-sm font-semibold text-foreground">{copy.inProgressSection}</h3>
                {inProgress.map((item) => {
                  const selected = activeRecord?.courseId === item.courseId;
                  return (
                    <button
                      key={item.courseId}
                      type="button"
                      onClick={() => setSelectedCourseId(item.courseId)}
                      className={
                        'flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors ' +
                        (selected
                          ? 'border-primary bg-primary-soft/50'
                          : 'border-border bg-card hover:border-primary/40')
                      }
                    >
                      <CourseIcon courseId={item.courseId} size={28} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="m-0 truncate text-sm font-semibold text-foreground">
                            {courseDisplayName(item.courseId, state.language)}
                          </p>
                          <span className="font-mono text-xs text-muted-foreground">
                            {item.percent}%
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                        <p className="m-0 mt-1 text-xs text-muted-foreground">
                          {copy.daysLabel(item.daysDone, item.totalDays)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
