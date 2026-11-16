import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { HintGate, formatCountdown } from '@/components/courses/hint-gate';
import { emptyProgress } from '@/lib/account/progress';
import { useLearningStore } from '@/stores/learning-store';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-17T10:00:00Z'));
  sessionStorage.clear();
  useLearningStore.setState({ ...emptyProgress(), ready: true, language: 'ru' });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it('formats the countdown as minutes and seconds', () => {
  expect(formatCountdown(180_000)).toBe('3:00');
  expect(formatCountdown(161_000)).toBe('2:41');
  expect(formatCountdown(-5)).toBe('0:00');
});

it('keeps the hint locked for three minutes with a visible countdown', () => {
  render(<HintGate taskId="html:day-1">Секретная подсказка</HintGate>);
  act(() => vi.advanceTimersByTime(19_000));
  expect(screen.getByRole('timer')).toHaveTextContent('Подсказка через 2:41');
  expect(screen.queryByText('Секретная подсказка')).not.toBeInTheDocument();
  act(() => vi.advanceTimersByTime(160_000));
  expect(screen.getByRole('timer')).toHaveTextContent('0:01');
  act(() => vi.advanceTimersByTime(2_000));
  expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  expect(screen.getByText('Секретная подсказка')).toBeInTheDocument();
});

it('does not restart the timer after a reload of the same task', () => {
  const first = render(<HintGate taskId="js:day-2">Hint</HintGate>);
  act(() => vi.advanceTimersByTime(120_000));
  first.unmount();
  render(<HintGate taskId="js:day-2">Hint</HintGate>);
  act(() => vi.advanceTimersByTime(1_000));
  expect(screen.getByRole('timer')).toHaveTextContent('0:59');
});

it('blocks selection, copying and the context menu on the opened hint', () => {
  sessionStorage.setItem('devatlas-task-start:css:day-3', String(Date.now() - 200_000));
  render(<HintGate taskId="css:day-3">Protected text</HintGate>);
  act(() => vi.advanceTimersByTime(1_000));
  const hint = screen.getByText('Protected text');
  expect(hint).toHaveClass('select-none');
  for (const event of ['copy', 'cut', 'contextmenu'] as const) {
    const fired = fireEvent[event === 'contextmenu' ? 'contextMenu' : event](hint);
    expect(fired).toBe(false);
  }
});
