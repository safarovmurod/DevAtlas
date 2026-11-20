import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import html from '@/content/courses/html.json';
import { courseContentSchema } from '@/lib/courses/schema';
import { publicCourseContent } from '@/lib/courses/delivery';
import { emptyProgress } from '@/lib/account/progress';
import { useLearningStore } from '@/stores/learning-store';

const mocks = vi.hoisted(() => ({
  account: { configured: true, loading: false, user: { id: 'account-a' } as { id: string } | null },
  access: 'open' as 'open' | 'locked' | 'loading',
  load: vi.fn(),
}));
vi.mock('@/components/account/account-provider', () => ({ useAccount: () => mocks.account }));
vi.mock('@/components/courses/use-practice-access', () => ({ usePracticeAccess: () => mocks.access }));
vi.mock('@/lib/courses/fetch-course', () => ({ fetchCourseContent: mocks.load }));
vi.mock('@/components/courses/course-day', () => ({ CourseDay: ({ lesson, practiceAccess }: { lesson?: { title: { en?: string }; practiceAvailable?: boolean; practice?: unknown }; practiceAccess: string }) => <div>{lesson?.title.en}<span>{practiceAccess}</span><span>{lesson?.practiceAvailable ? 'practice-available' : ''}</span>{lesson?.practice ? <span>private-task</span> : null}</div> }));
vi.mock('@/components/courses/course-workspace-header', () => ({ CourseWorkspaceHeader: () => null }));
vi.mock('@/components/courses/course-header', () => ({ CourseHeader: () => null }));
vi.mock('@/components/courses/course-navigation', () => ({ JavaScriptMonths: () => null, TrackPath: () => null }));
import { CourseWorkspace } from '@/components/courses/course-workspace';

const canonical = courseContentSchema.parse(html);
function paid(title: string) {
  return { ...canonical, courseId: 'javascript-pro' as const, lessons: [{ ...canonical.lessons[0], title: { ru: title, tg: title, en: title } }] };
}
beforeEach(() => {
  mocks.account = { configured: true, loading: false, user: { id: 'account-a' } };
  mocks.access = 'open';
  mocks.load.mockReset();
  localStorage.clear();
  useLearningStore.setState({ ...emptyProgress(), ready: true, language: 'en', selectedCourse: 'javascript-pro', courseChosen: true });
});
afterEach(cleanup);

it('hides a loaded paid course immediately when sign-out starts and while another account loads', async () => {
  mocks.load.mockResolvedValueOnce({ content: paid('Account A private lesson') });
  const view = render(<CourseWorkspace courseId="javascript-pro" section="home" day={1} />);
  await screen.findByText('Account A private lesson');
  mocks.account.loading = true;
  mocks.access = 'loading';
  view.rerender(<CourseWorkspace courseId="javascript-pro" section="home" day={1} />);
  expect(screen.queryByText('Account A private lesson')).not.toBeInTheDocument();
  mocks.account = { configured: true, loading: false, user: null };
  mocks.access = 'locked';
  mocks.load.mockResolvedValueOnce({ status: 401 });
  view.rerender(<CourseWorkspace courseId="javascript-pro" section="home" day={1} />);
  await screen.findByRole('alert');
  expect(screen.queryByText('Account A private lesson')).not.toBeInTheDocument();
});

it('ignores a late old-account response and waits for the new owner before showing private content', async () => {
  let finishA!: (value: unknown) => void;
  let finishB!: (value: unknown) => void;
  mocks.load.mockImplementationOnce(() => new Promise(resolve => { finishA = resolve; }));
  const view = render(<CourseWorkspace courseId="javascript-pro" section="home" day={1} />);
  await waitFor(() => expect(mocks.load).toHaveBeenCalledTimes(1));
  const oldSignal = mocks.load.mock.calls[0][2] as AbortSignal;
  mocks.account = { configured: true, loading: false, user: { id: 'account-b' } };
  mocks.load.mockImplementationOnce(() => new Promise(resolve => { finishB = resolve; }));
  view.rerender(<CourseWorkspace courseId="javascript-pro" section="home" day={1} />);
  expect(oldSignal.aborted).toBe(true);
  await act(async () => finishA({ content: paid('Late A private lesson') }));
  expect(screen.queryByText('Late A private lesson')).not.toBeInTheDocument();
  expect(mocks.load.mock.calls[1][3]).toMatchObject({ expectedUserId: 'account-b', includePractice: true });
  await act(async () => finishB({ content: paid('Account B private lesson') }));
  await screen.findByText('Account B private lesson');
});

it('retains public lessons and the lock marker when Start cannot load paid practice', () => {
  mocks.account.user = null;
  mocks.access = 'locked';
  const projected = publicCourseContent(canonical);
  render(<CourseWorkspace courseId="html" section="home" day={1} initialContent={projected} />);
  expect(screen.getByText(canonical.lessons[0].title.en!)).toBeVisible();
  expect(screen.getByText('practice-available')).toBeVisible();
  expect(screen.getByText('locked')).toBeVisible();
  expect(screen.queryByText('private-task')).not.toBeInTheDocument();
  expect(mocks.load).not.toHaveBeenCalled();
});

it('discards enriched starter practice on sign-out while preserving its free lesson', async () => {
  const projected = publicCourseContent(canonical);
  mocks.load.mockResolvedValueOnce({ content: canonical });
  const view = render(<CourseWorkspace courseId="html" section="home" day={1} initialContent={projected} />);
  await screen.findByText('private-task');
  mocks.account.user = null;
  mocks.access = 'locked';
  view.rerender(<CourseWorkspace courseId="html" section="home" day={1} initialContent={projected} />);
  expect(screen.queryByText('private-task')).not.toBeInTheDocument();
  expect(screen.getByText(canonical.lessons[0].title.en!)).toBeVisible();
  expect(screen.getByText('locked')).toBeVisible();
});
