import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CodeOrderGame } from '@/components/games/code-order-game';
import { emptyProgress } from '@/lib/account/progress';
import {
  buildPuzzle,
  checkSlots,
  clearLastSlot,
  clearSlot,
  emptySlots,
  placeLine,
  startsWithDoctype,
} from '@/lib/games/code-order';
import { useLearningStore } from '@/stores/learning-store';

describe('numbered answer slots', () => {
  it('fills places in order, never twice, and empties one place or the last one', () => {
    let slots = emptySlots(3);
    expect(slots).toEqual([null, null, null]);
    slots = placeLine(slots, 2);
    slots = placeLine(slots, 2);
    slots = placeLine(slots, 0);
    expect(slots).toEqual([2, 0, null]);
    expect(clearSlot(slots, 0)).toEqual([null, 0, null]);
    expect(placeLine(clearSlot(slots, 0), 1)).toEqual([1, 0, null]);
    expect(clearLastSlot(slots)).toEqual([2, null, null]);
    expect(clearLastSlot(emptySlots(2))).toEqual([null, null]);
  });

  it('checks only a full answer and names every place right or wrong', () => {
    expect(checkSlots([0, null, 2])).toBeNull();
    expect(checkSlots([0, 1, 2])).toEqual(['right', 'right', 'right']);
    expect(checkSlots([0, 2, 1])).toEqual(['right', 'wrong', 'wrong']);
  });

  it('shows the doctype example only when the doctype really is line 1', () => {
    expect(startsWithDoctype(['<!doctype html>', '<html>', '</html>'])).toBe(true);
    expect(startsWithDoctype(['<!DOCTYPE html>'])).toBe(true);
    expect(startsWithDoctype(['<html>', '<!doctype html>'])).toBe(false);
    expect(startsWithDoctype([])).toBe(false);
  });
});

const sections = [{ code: '<!doctype html>\n<html lang="ru">\n<body>' }];
const lines = ['<!doctype html>', '<html lang="ru">', '<body>'];

describe('code order game screen', () => {
  beforeEach(() => {
    useLearningStore.setState({
      ...emptyProgress(),
      ready: true,
      language: 'ru',
      contentLanguage: 'ru',
    });
  });
  afterEach(() => cleanup());

  it('reads at a glance: task, one doctype example, places 1 → ?, choices as buttons', () => {
    const { container } = render(<CodeOrderGame sections={sections} seed="html-test" />);
    expect(
      screen.getByText(/Какая строка идёт первой, какая второй, какая третьей/),
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.code-game-example')).toHaveLength(1);
    expect(container.querySelector('.code-game-example code')).toHaveTextContent('<!DOCTYPE html>');
    expect(container.querySelectorAll('.code-game-slot-empty')).toHaveLength(3);
    expect(container.querySelectorAll('button.code-game-line')).toHaveLength(3);
  });

  it('names wrong places, resets, then accepts the right order', () => {
    const puzzle = buildPuzzle(sections, 'html-test')!;
    expect(puzzle.lines).toEqual(lines);
    const { container } = render(<CodeOrderGame sections={sections} seed="html-test" />);
    const choose = (line: string) => fireEvent.click(screen.getByRole('button', { name: line }));
    const check = () => fireEvent.click(screen.getByRole('button', { name: 'Проверить' }));

    expect(screen.getByRole('button', { name: 'Проверить' })).toBeDisabled();
    choose(lines[0]);
    choose(lines[2]);
    choose(lines[1]);
    check();
    const status = container.querySelector('.code-game-feedback')!;
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('Не на своём месте: 2, 3');
    // Not only colour: every place says "верно" or "не на месте".
    const marks = [...container.querySelectorAll('.code-game-mark')].map(
      (mark) => mark.textContent,
    );
    expect(marks).toEqual(['верно', 'не на месте', 'не на месте']);

    fireEvent.click(screen.getByRole('button', { name: 'Заново' }));
    expect(container.querySelectorAll('.code-game-slot-empty')).toHaveLength(3);
    expect(status).toBeEmptyDOMElement();

    for (const line of lines) choose(line);
    // Taking a line back out of place 3 returns it to the choices.
    fireEvent.click(
      within(container.querySelector('.code-game-slots')!).getByRole('button', { name: /места 3/ }),
    );
    expect(container.querySelectorAll('.code-game-slot-empty')).toHaveLength(1);
    choose(lines[2]);
    check();
    expect(status).toHaveTextContent('Отлично! Порядок верный.');
  });
});
