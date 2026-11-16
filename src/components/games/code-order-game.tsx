'use client';

import { useMemo, useState } from 'react';
import { Check, Gamepad2, RotateCcw, Undo2, X } from 'lucide-react';
import { useLearningStore } from '@/stores/learning-store';
import {
  buildPuzzle,
  checkSlots,
  clearLastSlot,
  clearSlot,
  emptySlots,
  placeLine,
  startsWithDoctype,
  type SlotResult,
  type Slots,
} from '@/lib/games/code-order';

const COPY = {
  tg: {
    title: 'Бозӣ: кодро ба тартиб гузоред',
    stepsTitle: 'Бозӣ: қадамҳои дарсро ба тартиб гузоред',
    task: 'Кадом сатр аввал меояд, кадомаш дуюм, кадомаш сеюм? Сатрҳоро бо тартиб пахш кунед — онҳо ба ҷойҳои 1, 2, 3… меафтанд.',
    stepsTask:
      'Кадом қадам аввал аст, кадомаш дуюм, кадомаш сеюм? Қадамҳоро бо тартиб пахш кунед — онҳо ба ҷойҳои 1, 2, 3… меафтанд.',
    example: 'Мисол',
    slots: 'Ҷавоби шумо',
    pool: 'Вариантҳо',
    empty: 'холӣ',
    remove: 'Аз ҷои {n} баровардан',
    check: 'Санҷидан',
    undo: 'Як қадам ақиб',
    reset: 'Аз нав',
    right: 'дуруст',
    wrong: 'ҷояш нест',
    fillAll: 'Ҳамаи ҷойҳоро пур кунед, баъд «Санҷидан»-ро пахш кунед.',
    mistakes: 'Дар ҷояш нест: {list}. Онҳоро пахш кунед, то баргарданд, ва боз кӯшиш кунед.',
    done: 'Офарин! Тартиб дуруст аст. Ҳар сатрро бо овози баланд шарҳ диҳед — ҳамин тавр дар хотир мемонад.',
  },
  ru: {
    title: 'Игра: соберите код по порядку',
    stepsTitle: 'Игра: расставьте шаги урока по порядку',
    task: 'Какая строка идёт первой, какая второй, какая третьей? Нажимайте строки по порядку — они встанут в места 1, 2, 3…',
    stepsTask:
      'Какой шаг первый, какой второй, какой третий? Нажимайте шаги по порядку — они встанут в места 1, 2, 3…',
    example: 'Пример',
    slots: 'Ваш ответ',
    pool: 'Варианты',
    empty: 'пусто',
    remove: 'Убрать из места {n}',
    check: 'Проверить',
    undo: 'Шаг назад',
    reset: 'Заново',
    right: 'верно',
    wrong: 'не на месте',
    fillAll: 'Заполните все места, затем нажмите «Проверить».',
    mistakes: 'Не на своём месте: {list}. Нажмите на них, чтобы вернуть, и попробуйте ещё раз.',
    done: 'Отлично! Порядок верный. Объясните каждую строку вслух — так она запомнится.',
  },
  en: {
    title: 'Game: put the code in order',
    stepsTitle: 'Game: put the lesson steps in order',
    task: 'Which line comes first, which second, which third? Tap the lines in order — they fill places 1, 2, 3…',
    stepsTask:
      'Which step comes first, which second, which third? Tap the steps in order — they fill places 1, 2, 3…',
    example: 'Example',
    slots: 'Your answer',
    pool: 'Choices',
    empty: 'empty',
    remove: 'Remove from place {n}',
    check: 'Check',
    undo: 'Undo',
    reset: 'Restart',
    right: 'right',
    wrong: 'out of place',
    fillAll: 'Fill every place, then press “Check”.',
    mistakes: 'Out of place: {list}. Tap them to take them back and try again.',
    done: 'Great! The order is right. Explain each line out loud — that is how it sticks.',
  },
};

type GameSection = { code?: string; title?: Partial<Record<'tg' | 'ru' | 'en', string>> };
export function CodeOrderGame({ sections, seed }: { sections: GameSection[]; seed: string }) {
  const language = useLearningStore((state) => state.contentLanguage);
  const locale = language === 'tg' || language === 'en' ? language : 'ru';
  const copy = COPY[locale];
  const puzzle = useMemo(
    () =>
      buildPuzzle(
        sections.map((section) => ({
          code: section.code,
          title: section.title?.[locale] ?? section.title?.ru,
        })),
        seed,
      ),
    [sections, seed, locale],
  );
  const size = puzzle?.lines.length ?? 0;
  const [slots, setSlots] = useState<Slots>(() => emptySlots(size));
  const [results, setResults] = useState<SlotResult[] | null>(null);
  if (!puzzle) return null;

  // A puzzle of another size (language switch) starts from empty places.
  const current = slots.length === size ? slots : emptySlots(size);
  const full = current.every((value) => value !== null);
  const solved = results !== null && results.every((result) => result === 'right');
  const code = puzzle.kind === 'code';
  const headingId = seed + '-game';

  function change(next: Slots) {
    setSlots(next);
    setResults(null);
  }
  const show = (line: number) =>
    code ? <code>{puzzle.lines[line].trim()}</code> : <span>{puzzle.lines[line]}</span>;
  const wrongPlaces = results
    ? results.flatMap((result, index) => (result === 'wrong' ? [String(index + 1)] : []))
    : [];

  return (
    <section className="panel code-game" aria-labelledby={headingId}>
      <h3 id={headingId}>
        <Gamepad2 size={18} aria-hidden="true" /> {code ? copy.title : copy.stepsTitle}
      </h3>
      <p className="code-game-task">{code ? copy.task : copy.stepsTask}</p>
      {code && startsWithDoctype(puzzle.lines) && (
        <p className="code-game-example">
          <span>{copy.example}:</span> 1 → <code>{'<!DOCTYPE html>'}</code>
        </p>
      )}

      <p className="code-game-label" id={headingId + '-slots'}>
        {copy.slots}
      </p>
      <ol className="code-game-slots" aria-labelledby={headingId + '-slots'}>
        {current.map((line, position) => {
          const result = results?.[position];
          return (
            <li key={position} className="code-game-slot" data-result={result}>
              <span className="code-game-slot-number" aria-hidden="true">
                {position + 1} →
              </span>
              {line === null ? (
                <span className="code-game-slot-empty">
                  <span aria-hidden="true">?</span>
                  <span className="sr-only">{copy.empty}</span>
                </span>
              ) : (
                <button
                  type="button"
                  className="code-game-slot-fill"
                  disabled={solved}
                  aria-label={`${copy.remove.replace('{n}', String(position + 1))}: ${puzzle.lines[line].trim()}`}
                  onClick={() => change(clearSlot(current, position))}
                >
                  {show(line)}
                </button>
              )}
              {result && (
                <span className="code-game-mark">
                  {result === 'right' ? (
                    <Check size={14} aria-hidden="true" />
                  ) : (
                    <X size={14} aria-hidden="true" />
                  )}
                  {result === 'right' ? copy.right : copy.wrong}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {!solved && (
        <>
          <p className="code-game-label" id={headingId + '-pool'}>
            {copy.pool}
          </p>
          <div className="code-game-pool" role="group" aria-labelledby={headingId + '-pool'}>
            {puzzle.shuffled
              .filter((line) => !current.includes(line))
              .map((line) => (
                <button
                  key={line}
                  type="button"
                  className="code-game-line"
                  onClick={() => change(placeLine(current, line))}
                >
                  {show(line)}
                </button>
              ))}
          </div>
        </>
      )}

      <div role="status" aria-live="polite" className="code-game-feedback">
        {solved ? (
          <p className="success-text">{copy.done}</p>
        ) : results ? (
          <p className="warning-text">{copy.mistakes.replace('{list}', wrongPlaces.join(', '))}</p>
        ) : !full && current.some((value) => value !== null) ? (
          <p className="small muted">{copy.fillAll}</p>
        ) : null}
      </div>

      <div className="button-row">
        <button
          type="button"
          className="button primary"
          disabled={!full || solved || results !== null}
          onClick={() => setResults(checkSlots(current))}
        >
          <Check size={16} aria-hidden="true" /> {copy.check}
        </button>
        <button
          type="button"
          className="button subtle"
          disabled={current.every((value) => value === null) || solved}
          onClick={() => change(clearLastSlot(current))}
        >
          <Undo2 size={16} aria-hidden="true" /> {copy.undo}
        </button>
        <button type="button" className="button subtle" onClick={() => change(emptySlots(size))}>
          <RotateCcw size={16} aria-hidden="true" /> {copy.reset}
        </button>
      </div>
    </section>
  );
}
