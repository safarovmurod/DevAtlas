'use client';
import { useRef, useState } from 'react';
import { useAccount } from '@/components/account/account-provider';
import { useLearningStore } from '@/stores/learning-store';
import { runFunction, type FunctionResult } from '@/lib/grading/function-runner';
import type { CourseLesson } from '@/lib/courses/schema';
import type { InterfaceLocale } from '@/lib/locale';
type Execution = NonNullable<NonNullable<CourseLesson['practice']>['execution']>;
const copy: Record<
  InterfaceLocale,
  {
    run: string;
    note: string;
    passed: string;
    failed: string;
    expected: string;
    actual: string;
    error: string;
  }
> = {
  ru: {
    run: 'Выполнить тесты функции',
    note: 'Реальное выполнение JavaScript в изолированном браузерном worker, до 3 секунд. Сеть заблокирована. Результат локальный: серверная аттестация и Mastered не начисляются. Модули Node.js проверяйте в скачиваемой лабораторной работе.',
    passed: 'Локальные тесты пройдены.',
    failed:
      'Есть ошибки. Сравните вход, ожидание и результат; исправьте код и повторите без штрафа.',
    expected: 'Ожидается',
    actual: 'Получено',
    error: 'Не удалось завершить выполнение. Проверьте синтаксис, имя функции и лимит 3 секунды.',
  },
  tg: {
    run: 'Тестҳои функсияро иҷро кунед',
    note: 'JavaScript воқеан дар worker-и ҷудои браузер, то 3 сония иҷро мешавад. Шабака баста аст. Натиҷа маҳаллӣ аст: тасдиқи сервер ва Mastered дода намешаванд. Модулҳои Node.js-ро дар лабораторияи боргирифта санҷед.',
    passed: 'Тестҳои маҳаллӣ гузаштанд.',
    failed:
      'Хато ҳаст. Вуруд, интизорӣ ва натиҷаро муқоиса карда, рамзро бе ҷарима ислоҳ ва такрор кунед.',
    expected: 'Интизорӣ',
    actual: 'Натиҷа',
    error: 'Иҷро анҷом наёфт. Синтаксис, номи функсия ва муҳлати 3 сонияро санҷед.',
  },
  en: {
    run: 'Run function tests',
    note: 'Actual JavaScript execution in an isolated browser worker, up to 3 seconds. Networking is blocked. Results are local: no server attestation or Mastered status. Check Node.js modules in the downloadable lab.',
    passed: 'Local tests passed.',
    failed:
      'Some tests failed. Compare inputs, expected and actual results; fix the code and retry without penalty.',
    expected: 'Expected',
    actual: 'Actual',
    error: 'Execution did not finish. Check syntax, function name and the 3-second limit.',
  },
  es: {
    run: 'Ejecutar las pruebas de la función',
    note: 'Ejecución real de JavaScript en un worker aislado del navegador, hasta 3 segundos. La red está bloqueada. El resultado es local: no hay certificación del servidor ni estado Mastered. Comprueba los módulos de Node.js en el laboratorio descargable.',
    passed: 'Pruebas locales superadas.',
    failed:
      'Hay pruebas que fallan. Compara la entrada, lo esperado y lo obtenido; corrige el código y vuelve a intentarlo sin penalización.',
    expected: 'Esperado',
    actual: 'Obtenido',
    error:
      'La ejecución no terminó. Revisa la sintaxis, el nombre de la función y el límite de 3 segundos.',
  },
};
function printable(value: unknown) {
  try {
    return (JSON.stringify(value) ?? String(value)).slice(0, 1200);
  } catch {
    return '[unprintable]';
  }
}
export function FunctionPractice({ code, execution }: { code: string; execution: Execution }) {
  const { user } = useAccount();
  return <Session key={user?.id ?? 'guest'} code={code} execution={execution} />;
}
function Session({ code, execution }: { code: string; execution: Execution }) {
  const locale = useLearningStore((state) => state.language),
    labels = copy[locale];
  const [running, setRunning] = useState(false),
    [error, setError] = useState(false),
    [result, setResult] = useState<{
      code: string;
      execution: Execution;
      checks: FunctionResult[];
    } | null>(null);
  const sequence = useRef(0);
  async function run() {
    const id = ++sequence.current;
    setRunning(true);
    setError(false);
    setResult(null);
    try {
      const checks = await runFunction(
        code,
        execution.functionName,
        execution.tests.map((test, index) => ({ ...test, name: String(index + 1) })),
      );
      if (sequence.current === id) setResult({ code, execution, checks });
    } catch {
      if (sequence.current === id) setError(true);
    } finally {
      if (sequence.current === id) setRunning(false);
    }
  }
  const active = result?.code === code && result.execution === execution ? result.checks : null;
  return (
    <section className="practice-validation function-practice">
      <p className="small muted">{labels.note}</p>
      <button
        type="button"
        className="button primary"
        disabled={running || !code.trim()}
        onClick={run}
      >
        {running ? '…' : labels.run}
      </button>
      {error && <p role="alert">{labels.error}</p>}
      {active && (
        <div aria-live="polite">
          <p role="status">
            {active.every((check) => check.passed) ? labels.passed : labels.failed}
          </p>
          <ol>
            {active.map((check, index) => (
              <li key={index} className={check.passed ? 'success-text' : 'warning-text'}>
                <span aria-hidden="true">{check.passed ? '✓' : '×'}</span>{' '}
                <code>
                  {execution.functionName}({execution.tests[index].args.map(printable).join(', ')})
                </code>
                <p>
                  {labels.expected}: <code>{printable(check.expected)}</code>
                </p>
                <p>
                  {labels.actual}: <code>{check.error ?? printable(check.actual)}</code>
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
