'use client';

import { useMemo, useState } from 'react';
import { Gamepad2, RotateCcw, Undo2 } from 'lucide-react';
import { useLearningStore } from '@/stores/learning-store';
import { buildPuzzle, firstMistake } from '@/lib/games/code-order';

const COPY = {
  tg: {
    title: 'Бозӣ: кодро ба тартиб гузоред',
    stepsTitle: 'Бозӣ: қадамҳои дарсро ба тартиб гузоред',
    stepsIntro:
      'Қадамҳоро бо тартиби дуруст пахш кунед. Барои ҳар қадам як ҷумла фикр кунед: чаро маҳз ҳамин вақт?',
    intro:
      'Сатрҳоро бо ҳамон тартибе пахш кунед, ки дар коди дуруст меоянд. Ҳар сатр чӣ кор мекунад — дар сар фикр кунед.',
    pool: 'Сатрҳо',
    answer: 'Ҷавоби шумо',
    empty: 'Аз боло сатри аввалро интихоб кунед.',
    undo: 'Як қадам ақиб',
    reset: 'Аз нав',
    wrong:
      'Сатри {n} дар ҷояш нест. Онро бардоред ва боз фикр кунед: кадом сатр бояд пеш аз он ояд?',
    done: 'Офарин! Тартиб дуруст аст. Ҳар сатрро бо овози баланд шарҳ диҳед — ҳамин тавр дар хотир мемонад.',
    moves: 'Хатоҳо',
  },
  ru: {
    title: 'Игра: соберите код по порядку',
    stepsTitle: 'Игра: расставьте шаги урока по порядку',
    stepsIntro:
      'Нажимайте шаги в правильном порядке. Для каждого шага подумайте: почему именно сейчас?',
    intro:
      'Нажимайте строки в том порядке, в котором они идут в правильном коде. Проговаривайте, что делает каждая строка.',
    pool: 'Строки',
    answer: 'Ваш ответ',
    empty: 'Выберите первую строку сверху.',
    undo: 'Шаг назад',
    reset: 'Заново',
    wrong: 'Строка {n} стоит не на месте. Уберите её и подумайте: какая строка должна идти раньше?',
    done: 'Отлично! Порядок верный. Объясните каждую строку вслух — так она запомнится.',
    moves: 'Ошибок',
  },
  en: {
    title: 'Game: put the code in order',
    stepsTitle: 'Game: put the lesson steps in order',
    stepsIntro: 'Tap the steps in the right order. For each one, think: why now?',
    intro: 'Tap the lines in the order they appear in correct code. Say what each line does.',
    pool: 'Lines',
    answer: 'Your answer',
    empty: 'Choose the first line above.',
    undo: 'Undo',
    reset: 'Restart',
    wrong: 'Line {n} is out of place. Remove it and think: which line must come earlier?',
    done: 'Great! The order is right. Explain each line out loud — that is how it sticks.',
    moves: 'Mistakes',
  },
};

type GameSection = { code?: string; title?: Partial<Record<'tg' | 'ru' | 'en', string>> };
export function CodeOrderGame({ sections, seed }: { sections: GameSection[]; seed: string }) {
  const language = useLearningStore((state) => state.contentLanguage);
  const copy = COPY[language === 'tg' || language === 'en' ? language : 'ru'];
  const locale = language === 'tg' || language === 'en' ? language : 'ru';
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
  const [answer, setAnswer] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  if (!puzzle) return null;
  const mistake = firstMistake(answer);
  const solved = answer.length === puzzle.lines.length && mistake === -1;
  function pick(line: number) {
    const next = [...answer, line];
    if (firstMistake(next) !== -1) setMistakes((count) => count + 1);
    setAnswer(next);
  }
  return (
    <section className="panel code-game" aria-labelledby={seed + '-game'}>
      <h3 id={seed + '-game'}>
        <Gamepad2 size={18} /> {puzzle.kind === 'steps' ? copy.stepsTitle : copy.title}
      </h3>
      <p className="small muted">{puzzle.kind === 'steps' ? copy.stepsIntro : copy.intro}</p>
      <p className="code-game-label">{copy.pool}</p>
      <div className="code-game-pool">
        {puzzle.shuffled
          .filter((line) => !answer.includes(line))
          .map((line) => (
            <button
              key={line}
              type="button"
              className="code-game-line"
              disabled={solved}
              onClick={() => pick(line)}
            >
              <code>{puzzle.lines[line].trim()}</code>
            </button>
          ))}
      </div>
      <p className="code-game-label">{copy.answer}</p>
      <ol className="code-game-answer">
        {answer.length === 0 ? (
          <li className="muted small">{copy.empty}</li>
        ) : (
          answer.map((line, position) => (
            <li key={line} className={mistake !== -1 && position >= mistake ? 'wrong' : 'right'}>
              <code>{puzzle.lines[line]}</code>
            </li>
          ))
        )}
      </ol>
      <div aria-live="polite">
        {mistake !== -1 && (
          <p className="warning-text small">{copy.wrong.replace('{n}', String(mistake + 1))}</p>
        )}
        {solved && <p className="success-text">{copy.done}</p>}
      </div>
      <div className="button-row">
        <span className="small muted">
          {copy.moves}: {mistakes}
        </span>
        <button
          type="button"
          className="button subtle"
          disabled={!answer.length || solved}
          onClick={() => setAnswer(answer.slice(0, -1))}
        >
          <Undo2 size={16} /> {copy.undo}
        </button>
        <button
          type="button"
          className="button subtle"
          onClick={() => {
            setAnswer([]);
            setMistakes(0);
          }}
        >
          <RotateCcw size={16} /> {copy.reset}
        </button>
      </div>
    </section>
  );
}
