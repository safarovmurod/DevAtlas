'use client';
import { useEffect, useRef, useState } from 'react';
import { useAccount } from '@/components/account/account-provider';
import { useLearningStore } from '@/stores/learning-store';
import type { SqliteGrade } from '@/lib/practice/sqlite-grader';
import type { InterfaceLocale } from '@/lib/locale';
const t = (ru: string, tg: string, en: string, es: string): Record<InterfaceLocale, string> => ({
  ru,
  tg,
  en,
  es,
});
const copy = {
  title: t(
    'SQLite в браузере',
    'SQLite дар браузер',
    'SQLite in your browser',
    'SQLite en tu navegador',
  ),
  run: t(
    'Запустить и проверить SQL',
    'SQL-ро иҷро ва санҷед',
    'Run and check SQL',
    'Ejecutar y comprobar el SQL',
  ),
  stop: t('Остановить', 'Қатъ кунед', 'Stop', 'Detener'),
  loading: t('Загрузка SQLite…', 'Боркунии SQLite…', 'Loading SQLite…', 'Cargando SQLite…'),
  running: t(
    'Выполняем запросы…',
    'Иҷрои дархостҳо…',
    'Running queries…',
    'Ejecutando las consultas…',
  ),
  note: t(
    'Свежая временная база в отдельном worker. Рабочие данные не используются. Объяснение оцените отдельно по критериям ниже.',
    'Пойгоҳи нави муваққатӣ дар worker-и ҷудогона. Додаҳои корӣ истифода намешаванд. Шарҳро бо меъёрҳои поён ҷудогона арзёбӣ кунед.',
    'Fresh temporary database in a separate worker. No production data. Review your explanation separately using the criteria below.',
    'Base de datos temporal nueva en un worker aparte. No se usan datos de trabajo. Evalúa tu explicación por separado con los criterios de abajo.',
  ),
  passed: t(
    'SQL пройден локально; серверная аттестация не начислена.',
    'SQL маҳаллӣ гузашт; тасдиқи сервер дода нашуд.',
    'SQL passed locally; no server attestation granted.',
    'El SQL pasó en local; no se otorgó certificación del servidor.',
  ),
  failed: t(
    'Исправьте SQL и повторите без штрафа.',
    'SQL-ро ислоҳ карда, бе ҷарима такрор кунед.',
    'Fix SQL and retry without penalty.',
    'Corrige el SQL y vuelve a intentarlo sin penalización.',
  ),
  error: t(
    'SQL не завершён. Лимит выполнения 5 секунд, размер кода 32 КБ.',
    'SQL анҷом наёфт. Муҳлат 5 сония, ҳаҷми рамз 32 КБ.',
    'SQL did not finish. Execution limit 5 seconds, code limit 32 KB.',
    'El SQL no terminó. Límite de ejecución: 5 segundos; tamaño del código: 32 KB.',
  ),
  expected: t('Ожидается', 'Интизорӣ', 'Expected', 'Esperado'),
  actual: t('Получено', 'Натиҷа', 'Actual', 'Obtenido'),
};
const cases = {
  baseline: { ru: 'Исходный результат', tg: 'Натиҷаи ибтидоӣ', en: 'Initial result' },
  schema: {
    ru: 'Столбцы и ограничения',
    tg: 'Сутунҳо ва маҳдудиятҳо',
    en: 'Columns and constraints',
  },
  'changed-data': {
    ru: 'Другие данные и лишняя строка',
    tg: 'Додаҳои дигар ва сатри иловагӣ',
    en: 'Changed data and an extra row',
  },
  'zero-price': { ru: 'Нулевая цена', tg: 'Нархи сифр', en: 'Zero price' },
  'missing-id': { ru: 'Нет нужного id', tg: 'id-и лозим нест', en: 'Missing target id' },
  'negative-price': {
    ru: 'Отрицательная цена запрещена',
    tg: 'Нархи манфӣ манъ аст',
    en: 'Negative price rejected',
  },
  'null-name': { ru: 'NULL-имя запрещено', tg: 'Номи NULL манъ аст', en: 'NULL name rejected' },
};
export function SqlitePractice({ code }: { code: string }) {
  const { user } = useAccount();
  return <SqliteSession key={user?.id ?? 'guest'} code={code} />;
}
function SqliteSession({ code }: { code: string }) {
  const locale = useLearningStore((state) => state.language),
    contentLocale = useLearningStore((state) => state.contentLanguage);
  const label = (key: keyof typeof copy) => copy[key][locale];
  const worker = useRef<Worker | null>(null),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [phase, setPhase] = useState<'idle' | 'loading' | 'running'>('idle'),
    [error, setError] = useState(false);
  const [result, setResult] = useState<{ code: string; grade: SqliteGrade } | null>(null);
  function stop() {
    worker.current?.terminate();
    worker.current = null;
    clearTimeout(timer.current);
  }
  useEffect(
    () => () => {
      worker.current?.terminate();
      clearTimeout(timer.current);
    },
    [],
  );
  function run() {
    stop();
    setError(false);
    setResult(null);
    if (!code.trim() || new TextEncoder().encode(code).byteLength > 32768) {
      setError(true);
      setPhase('idle');
      return;
    }
    setPhase('loading');
    const submitted = code;
    try {
      const active = new Worker('/sqlite/practice.worker.js');
      worker.current = active;
      const fail = () => {
        if (worker.current !== active) return;
        stop();
        setError(true);
        setPhase('idle');
      };
      timer.current = setTimeout(fail, 20000);
      active.onerror = fail;
      active.onmessage = (event) => {
        if (worker.current !== active) return;
        if (event.data?.type === 'ready') {
          clearTimeout(timer.current);
          setPhase('running');
          timer.current = setTimeout(fail, 5000);
          active.postMessage({ type: 'run', code: submitted });
        } else if (event.data?.type === 'result') {
          setResult({ code: submitted, grade: event.data.result });
          stop();
          setPhase('idle');
        } else fail();
      };
    } catch {
      stop();
      setError(true);
      setPhase('idle');
    }
  }
  const active = result?.code === code ? result.grade : null;
  return (
    <section className="sqlite-practice" aria-label={label('title')}>
      <h3>{label('title')}</h3>
      <p>{label('note')}</p>
      <div className="button-row">
        <button
          type="button"
          className="button primary"
          disabled={phase !== 'idle' || !code.trim()}
          onClick={run}
        >
          {phase === 'idle' ? label('run') : label(phase)}
        </button>
        {phase !== 'idle' && (
          <button
            type="button"
            className="button subtle"
            onClick={() => {
              stop();
              setPhase('idle');
            }}
          >
            {label('stop')}
          </button>
        )}
      </div>
      {error && <p role="alert">{label('error')}</p>}
      {active && (
        <div className="sqlite-result" aria-live="polite">
          <p role="status">
            {active.passed ? label('passed') : label('failed')} SQLite {active.engineVersion}
          </p>
          {active.error && <p className="warning-text">{active.error}</p>}
          <ul>
            {active.checks.map((check) => (
              <li key={check.id} className={check.passed ? 'success-text' : 'warning-text'}>
                <strong>
                  {check.passed ? '✓' : '×'} {cases[check.id][contentLocale]}
                </strong>
                <div>
                  {label('expected')}: <code>{check.expected}</code>
                </div>
                <div>
                  {label('actual')}: <code>{check.actual}</code>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
