import Link from 'next/link';
import { Award, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { decodeAndVerifyCertificateToken } from '@/lib/certificates/certificate-engine';
import { courseDisplayName } from '@/lib/catalog-copy';
import { getRequestLocale } from '@/lib/request-locale';
import type { InterfaceLocale } from '@/lib/locale';

const VERIFY_COPY: Record<
  InterfaceLocale,
  {
    validTitle: string;
    validBadge: string;
    invalidTitle: string;
    invalidText: string;
    holder: string;
    course: string;
    completion: string;
    practice: string;
    issued: string;
    code: string;
    disclaimer: string;
    startLearning: string;
    careerTest: string;
  }
> = {
  tg: {
    validTitle: 'Сертификати DevAtlas тасдиқ шуд',
    validBadge: 'Имзои криптографӣ дуруст аст',
    invalidTitle: 'Рамзи сертификат нодуруст ё тағйир дода шудааст',
    invalidText:
      'Ин линк ё QR-код санҷиши ҳақиқӣ буданро нагузашт. Аз соҳиби сертификат линки дурустро пурсед.',
    holder: 'Соҳиби сертификат',
    course: 'Курси хатмшуда',
    completion: 'Ҳаҷми барнома',
    practice: 'Вақти амалия',
    issued: 'Санаи додашавӣ',
    code: 'Рамзи ягона',
    disclaimer:
      'Ин саҳифа тамомияти маълумоти сертификати додашудаи DevAtlas-ро тасдиқ мекунад.',
    startLearning: 'Омӯзишро дар DevAtlas оғоз кун',
    careerTest: 'Тести ройгони интихоби касб',
  },
  ru: {
    validTitle: 'Сертификат DevAtlas подтверждён',
    validBadge: 'Контрольная подпись верна',
    invalidTitle: 'Код сертификата недействителен или был изменён',
    invalidText:
      'Эта ссылка или QR-код не прошли проверку подлинности. Попросите владельца прислать оригинальную ссылку.',
    holder: 'Владелец сертификата',
    course: 'Пройденный курс',
    completion: 'Объём программы',
    practice: 'Время практики',
    issued: 'Дата выдачи',
    code: 'Уникальный код',
    disclaimer: 'Эта страница проверяет целостность выданного сертификата платформы DevAtlas.',
    startLearning: 'Начать обучение в DevAtlas',
    careerTest: 'Пройти тест выбора профессии',
  },
  en: {
    validTitle: 'DevAtlas Certificate Verified',
    validBadge: 'Integrity signature valid',
    invalidTitle: 'Invalid or altered certificate code',
    invalidText:
      'This verification link or QR code failed integrity verification. Ask the certificate holder for the original link.',
    holder: 'Certificate Holder',
    course: 'Completed Course',
    completion: 'Program Progress',
    practice: 'Practice Time',
    issued: 'Issue Date',
    code: 'Certificate ID',
    disclaimer: 'This page verifies the signed integrity of an issued DevAtlas certificate link.',
    startLearning: 'Start learning on DevAtlas',
    careerTest: 'Take free Career Finder quiz',
  },
  es: {
    validTitle: 'Certificado DevAtlas verificado',
    validBadge: 'Firma de integridad válida',
    invalidTitle: 'Código de certificado inválido o alterado',
    invalidText:
      'Este enlace o código QR no superó la comprobación de integridad. Pide al titular el enlace original.',
    holder: 'Titular',
    course: 'Curso completado',
    completion: 'Progreso del programa',
    practice: 'Tiempo de práctica',
    issued: 'Fecha de emisión',
    code: 'ID del certificado',
    disclaimer: 'Esta página verifica la integridad firmada de un certificado emitido por DevAtlas.',
    startLearning: 'Empezar en DevAtlas',
    careerTest: 'Hacer test de carrera gratis',
  },
};

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const locale = await getRequestLocale();
  const copy = VERIFY_COPY[locale];
  const result = decodeAndVerifyCertificateToken(decodeURIComponent(code));

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#060913] px-4 py-12 text-white">
      <div className="w-full max-w-2xl rounded-3xl border border-indigo-400/25 bg-[#0d1428] p-6 shadow-[0_28px_70px_-24px_rgba(0,0,0,0.85)] sm:p-10">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-sm font-bold tracking-[0.2em] text-sky-400 no-underline uppercase">
            DEVATLAS
          </Link>
          {result.valid ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/35">
              <CheckCircle2 size={14} aria-hidden="true" />
              {copy.validBadge}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-300 ring-1 ring-rose-400/35">
              <ShieldAlert size={14} aria-hidden="true" />
              Invalid
            </span>
          )}
        </div>

        {result.valid ? (
          <div className="mt-6 space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/30">
                <Award size={26} aria-hidden="true" />
              </span>
              <h1 className="m-0 text-2xl font-bold tracking-tight sm:text-3xl">{copy.validTitle}</h1>
            </div>

            <dl className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-400">{copy.holder}</dt>
                <dd className="m-0 mt-1 text-lg font-semibold text-white">{result.payload.holder}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">{copy.course}</dt>
                <dd className="m-0 mt-1 text-lg font-semibold text-indigo-300">
                  {courseDisplayName(result.payload.courseId, locale)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">{copy.completion}</dt>
                <dd className="m-0 mt-1 font-mono text-sm text-slate-200">
                  {result.payload.daysDone} / {result.payload.totalDays}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">{copy.practice}</dt>
                <dd className="m-0 mt-1 font-mono text-sm text-slate-200">{result.payload.hours}h</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">{copy.issued}</dt>
                <dd className="m-0 mt-1 font-mono text-sm text-slate-200">{result.payload.issuedOn}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">{copy.code}</dt>
                <dd className="m-0 mt-1 font-mono text-sm text-amber-300">{result.payload.id}</dd>
              </div>
            </dl>
            <p className="m-0 text-xs text-slate-400">{copy.disclaimer}</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <h1 className="m-0 text-2xl font-bold text-rose-200">{copy.invalidTitle}</h1>
            <p className="m-0 text-sm leading-6 text-slate-300">{copy.invalidText}</p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3 border-t border-white/10 pt-6">
          <Link
            href="/courses"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white no-underline hover:bg-indigo-500"
          >
            {copy.startLearning}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link
            href="/career-test"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white no-underline hover:bg-white/10"
          >
            {copy.careerTest}
          </Link>
        </div>
      </div>
    </main>
  );
}
