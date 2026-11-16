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
  { run: string; passed: string; failed: string; expected: string; actual: string; error: string }
> = {
  ru: {
    run: 'Проверить решение',
    passed: 'Верно',
    failed: 'Неверно',
    expected: 'ожидается',
    actual: 'получено',
    error: 'Код не выполнился: проверьте синтаксис и имя функции.',
  },
  tg: {
    run: 'Санҷидани ҳал',
    passed: 'Дуруст',
    failed: 'Нодуруст',
    expected: 'интизор',
    actual: 'натиҷа',
    error: 'Код иҷро нашуд: синтаксис ва номи функсияро санҷед.',
  },
  en: {
    run: 'Check solution',
    passed: 'Correct',
    failed: 'Incorrect',
    expected: 'expected',
    actual: 'got',
    error: 'The code did not run: check the syntax and the function name.',
  },
  es: {
    run: 'Comprobar solución',
    passed: 'Correcto',
    failed: 'Incorrecto',
    expected: 'se espera',
    actual: 'se obtuvo',
    error: 'El código no se ejecutó: revisa la sintaxis y el nombre de la función.',
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
  const failed = active?.filter((check) => !check.passed) ?? [];
  return (
    <section className="practice-validation function-practice">
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
          <p role="status" className={failed.length ? 'warning-text' : 'success-text'}>
            <strong>{failed.length ? '× ' + labels.failed : '✓ ' + labels.passed}</strong> ·{' '}
            {active.length - failed.length}/{active.length}
          </p>
          {failed.length > 0 && (
            <ul className="grid gap-1 text-sm">
              {active.map((check, index) =>
                check.passed ? null : (
                  <li key={index}>
                    <code>
                      {execution.functionName}(
                      {execution.tests[index].args.map(printable).join(', ')})
                    </code>{' '}
                    — {labels.expected} <code>{printable(check.expected)}</code>, {labels.actual}{' '}
                    <code>{check.error ?? printable(check.actual)}</code>
                  </li>
                ),
              )}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
