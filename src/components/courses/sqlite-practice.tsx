'use client';
import { useEffect, useRef, useState } from 'react';
import { useAccount } from '@/components/account/account-provider';
import { useLearningStore } from '@/stores/learning-store';
import type { SqliteGrade } from '@/lib/practice/sqlite-grader';
import type { InterfaceLocale } from '@/lib/locale';
const t = (
  ru: string,
  tg: string,
  en: string,
  uk: string,
  ja: string,
  ko: string,
): Record<InterfaceLocale, string> => ({ ru, tg, en, uk, ja, ko });
const copy = {
  title: t(
    'SQLite в браузере',
    'SQLite дар браузер',
    'SQLite in your browser',
    'SQLite у браузері',
    'ブラウザー内のSQLite',
    '브라우저의 SQLite',
  ),
  run: t(
    'Запустить и проверить SQL',
    'SQL-ро иҷро ва санҷед',
    'Run and check SQL',
    'Запустити й перевірити SQL',
    'SQLを実行して確認',
    'SQL 실행 및 확인',
  ),
  stop: t('Остановить', 'Қатъ кунед', 'Stop', 'Зупинити', '停止', '중지'),
  loading: t(
    'Загрузка SQLite…',
    'Боркунии SQLite…',
    'Loading SQLite…',
    'Завантаження SQLite…',
    'SQLiteを読み込み中…',
    'SQLite 불러오는 중…',
  ),
  running: t(
    'Выполняем запросы…',
    'Иҷрои дархостҳо…',
    'Running queries…',
    'Виконання запитів…',
    'クエリを実行中…',
    '쿼리 실행 중…',
  ),
  note: t(
    'Свежая временная база в отдельном worker. Рабочие данные не используются. Объяснение оцените отдельно по критериям ниже.',
    'Пойгоҳи нави муваққатӣ дар worker-и ҷудогона. Додаҳои корӣ истифода намешаванд. Шарҳро бо меъёрҳои поён ҷудогона арзёбӣ кунед.',
    'Fresh temporary database in a separate worker. No production data. Review your explanation separately using the criteria below.',
    'Нова тимчасова база в окремому worker. Без робочих даних. Пояснення оцініть окремо за критеріями нижче.',
    '専用workerの新しい一時DBです。本番データは使用しません。説明は下の基準で別途自己確認してください。',
    '별도 worker의 새 임시 DB입니다. 운영 데이터는 사용하지 않습니다. 설명은 아래 기준으로 별도 검토하세요.',
  ),
  passed: t(
    'SQL пройден локально; серверная аттестация не начислена.',
    'SQL маҳаллӣ гузашт; тасдиқи сервер дода нашуд.',
    'SQL passed locally; no server attestation granted.',
    'SQL пройдено локально; серверне підтвердження не надано.',
    'SQLはローカルで合格。サーバー認証は付与されません。',
    'SQL 로컬 검사 통과. 서버 인증은 부여되지 않습니다.',
  ),
  failed: t(
    'Исправьте SQL и повторите без штрафа.',
    'SQL-ро ислоҳ карда, бе ҷарима такрор кунед.',
    'Fix SQL and retry without penalty.',
    'Виправте SQL і повторіть без штрафу.',
    'SQLを修正して減点なしで再試行できます。',
    'SQL을 수정하고 감점 없이 다시 시도하세요.',
  ),
  error: t(
    'SQL не завершён. Лимит выполнения 5 секунд, размер кода 32 КБ.',
    'SQL анҷом наёфт. Муҳлат 5 сония, ҳаҷми рамз 32 КБ.',
    'SQL did not finish. Execution limit 5 seconds, code limit 32 KB.',
    'SQL не завершено. Ліміт виконання 5 секунд, коду — 32 КБ.',
    'SQLを完了できません。実行上限5秒、コード上限32KBです。',
    'SQL을 완료하지 못했습니다. 실행 제한 5초, 코드 제한 32KB입니다.',
  ),
  expected: t('Ожидается', 'Интизорӣ', 'Expected', 'Очікується', '期待値', '예상'),
  actual: t('Получено', 'Натиҷа', 'Actual', 'Отримано', '実際', '실제'),
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
