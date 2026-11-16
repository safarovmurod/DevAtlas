import { act, cleanup, render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { emptyProgress } from '@/lib/account/progress';
import type { CourseLesson } from '@/lib/courses/schema';
import { practiceAccessFromStatus, practiceOpenForTier } from '@/lib/billing/practice-access';
import { courseDayReady } from '@/lib/courses/plan';
import { useLearningStore } from '@/stores/learning-store';

const account = vi.hoisted(() => ({
  value: { configured: true, loading: false, user: null as null | { id: string } },
}));
const billing = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock('@/components/account/account-provider', () => ({ useAccount: () => account.value }));
vi.mock('@/lib/billing/billing-client', () => ({ billingFetch: billing.fetch }));
vi.mock('@/components/courses/lesson-assessment', () => ({ LessonAssessment: () => null }));
vi.mock('@/components/learning/code-editor', () => ({
  CodeEditor: ({ label }: { label: string }) => <textarea aria-label={label} data-editor />,
}));

import { PracticeStep } from '@/components/courses/lesson-flow-steps';
import { usePracticeAccess } from '@/components/courses/use-practice-access';

const text = (ru: string) => ({ ru, tg: ru, en: ru });
const lesson: CourseLesson = {
  id: 'html-day-02',
  day: 2,
  title: text('Урок'),
  summary: text('Описание'),
  level: 'beginner',
  sourceIds: ['html-standard'],
  sections: [{ title: text('Разбор'), body: text('Объяснение') }],
  questions: [],
  practice: {
    task: text('Секретное задание'),
    hint: text('Подсказка'),
    solution: '<h1>Ответ</h1>',
    criteria: [text('Критерий')],
  },
};

beforeEach(() => {
  useLearningStore.setState({
    ...emptyProgress(),
    ready: true,
    language: 'ru',
    contentLanguage: 'ru',
  });
  account.value = { configured: true, loading: false, user: null };
  billing.fetch.mockReset();
});
afterEach(() => cleanup());

describe('practice lock card', () => {
  it('locked: shows the lock, the Pro badge and the plans link, and renders no task or editor', () => {
    const { container } = render(
      <PracticeStep courseId="html" lesson={lesson} practiced={false} access="locked" />,
    );
    expect(
      screen.getByRole('heading', { name: 'Практика доступна в тарифе Pro' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Посмотреть тарифы' })).toHaveAttribute(
      'href',
      '/plans',
    );
    // Not hidden with CSS: the task, editor, solution and check button are not in the DOM.
    expect(screen.queryByText('Секретное задание')).toBeNull();
    expect(container.querySelector('[data-editor], textarea, details.solution')).toBeNull();
    expect(screen.queryByRole('button', { name: /Проверить|Отметить/ })).toBeNull();
  });

  it('loading: shows a busy status, never the lock, so a paying learner sees no flash', () => {
    render(<PracticeStep courseId="html" lesson={lesson} practiced={false} access="loading" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Проверяем доступ к практике…')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /тарифе Pro/ })).toBeNull();
    expect(screen.queryByText('Секретное задание')).toBeNull();
  });

  it('open: Pro and Ultra get the task and the editor', () => {
    const { container } = render(
      <PracticeStep courseId="html" lesson={lesson} practiced={false} access="open" />,
    );
    expect(screen.getByText('Секретное задание')).toBeInTheDocument();
    expect(container.querySelector('[data-editor]')).not.toBeNull();
    expect(screen.queryByRole('heading', { name: /тарифе Pro/ })).toBeNull();
  });
});

describe('practice access rules', () => {
  it('follows FEATURE_PLAN.practiceTasks: Start is locked, Pro and Ultra (expert) are open', () => {
    expect(practiceOpenForTier('starter')).toBe(false);
    expect(practiceOpenForTier('pro')).toBe(true);
    expect(practiceOpenForTier('expert')).toBe(true);
    expect(practiceAccessFromStatus(null)).toBe('locked');
    expect(practiceAccessFromStatus({ membership: { tier: 'pro', active: false } })).toBe('locked');
    expect(practiceAccessFromStatus({ membership: { tier: 'expert', active: true } })).toBe('open');
  });

  it('a locked practice does not block finishing the day', () => {
    const item = { day: 2, section: 'answers', lesson } as Parameters<typeof courseDayReady>[0];
    expect(courseDayReady(item, ['html-day-02'], [])).toBe(false);
    expect(courseDayReady(item, ['html-day-02'], [], false)).toBe(true);
    expect(courseDayReady(item, [], [], false)).toBe(false);
  });

  it('guest is locked, accounts off is open, a database plan decides after loading', async () => {
    expect(renderHook(() => usePracticeAccess()).result.current).toBe('locked');
    account.value = { configured: false, loading: false, user: null };
    expect(renderHook(() => usePracticeAccess()).result.current).toBe('open');
    account.value = { configured: true, loading: true, user: null };
    expect(renderHook(() => usePracticeAccess()).result.current).toBe('loading');

    let answer: (value: unknown) => void = () => undefined;
    billing.fetch.mockReturnValue(
      new Promise((resolve) => {
        answer = resolve;
      }),
    );
    account.value = { configured: true, loading: false, user: { id: 'pro-user' } };
    const pro = renderHook(() => usePracticeAccess());
    expect(pro.result.current).toBe('loading');
    await act(async () => answer({ membership: { tier: 'pro', active: true } }));
    expect(pro.result.current).toBe('open');

    billing.fetch.mockResolvedValue({ membership: null });
    account.value = { configured: true, loading: false, user: { id: 'start-user' } };
    const start = renderHook(() => usePracticeAccess());
    await waitFor(() => expect(start.result.current).toBe('locked'));
  });
});
