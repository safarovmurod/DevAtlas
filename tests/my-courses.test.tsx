import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { MyCourses } from '@/components/courses/my-courses';
import { CourseGroupList } from '@/components/courses/course-catalog';
import { COURSE_CATALOG } from '@/content/courses/catalog';
import { emptyProgress, mergeProgress, progressSnapshot } from '@/lib/account/progress';
import { useLearningStore } from '@/stores/learning-store';
import { courseDisplayName } from '@/lib/catalog-copy';

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: navigation.push }) }));
const originalScope = useLearningStore.persist.getOptions().name!;
const dialogPrototype = HTMLDialogElement.prototype;
const originalShowModal = Object.getOwnPropertyDescriptor(dialogPrototype, 'showModal');
const originalClose = Object.getOwnPropertyDescriptor(dialogPrototype, 'close');
const htmlName = courseDisplayName('html', 'en');

// jsdom lacks native dialog methods and the default form method="dialog" behavior.
function closeDialogForm(event: Event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || form.method !== 'dialog') return;
  event.preventDefault();
  form.closest('dialog')?.close();
}

beforeEach(() => {
  localStorage.clear();
  navigation.push.mockClear();
  useLearningStore.persist.setOptions({ name: originalScope });
  Object.defineProperty(dialogPrototype, 'showModal', {
    configurable: true,
    value() {
      this.open = true;
    },
  });
  Object.defineProperty(dialogPrototype, 'close', {
    configurable: true,
    value() {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    },
  });
  document.addEventListener('submit', closeDialogForm);
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        Response.json(
          COURSE_CATALOG.map((course) => ({
            id: course.id,
            ready: true,
            lessons: course.publishedDays,
            files: 0,
          })),
        ),
      ),
  );
  useLearningStore.setState({ ...emptyProgress(), ready: true, language: 'en' });
  useLearningStore.getState().completeCourseLesson('html', 'html-day-01');
  useLearningStore.getState().completeCourseLesson('css', 'css-day-01');
});

afterEach(() => {
  cleanup();
  document.removeEventListener('submit', closeDialogForm);
  if (originalShowModal) Object.defineProperty(dialogPrototype, 'showModal', originalShowModal);
  else Reflect.deleteProperty(dialogPrototype, 'showModal');
  if (originalClose) Object.defineProperty(dialogPrototype, 'close', originalClose);
  else Reflect.deleteProperty(dialogPrototype, 'close');
  useLearningStore.persist.setOptions({ name: originalScope });
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it('uses the inline confirmation and cancels without changing progress', () => {
  render(<MyCourses />);
  const list = screen.getByRole('list');
  expect(within(list).getAllByRole('listitem')).toHaveLength(2);
  const confirm = vi.spyOn(window, 'confirm');
  fireEvent.click(screen.getByRole('button', { name: /Remove from my courses: HTML/ }));
  const dialog = screen.getByRole('dialog', { name: `Remove course · ${htmlName}` });
  expect(dialog).toBeVisible();
  expect(within(dialog).getByText(/Select it again in All courses/)).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(useLearningStore.getState().courseVisibility.html).toBeUndefined();
  expect(within(list).getAllByRole('listitem')).toHaveLength(2);
  expect(useLearningStore.getState().courses.html?.completedTopics).toEqual(['html-day-01']);
  expect(confirm).not.toHaveBeenCalled();
});

it('persists removal without deleting progress and restores through the real catalog action', async () => {
  const view = render(<MyCourses />);
  const originalProgress = useLearningStore.getState().courses.html;
  fireEvent.click(screen.getByRole('button', { name: /Remove from my courses: HTML/ }));
  fireEvent.click(
    within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove course' }),
  );
  expect(useLearningStore.getState().courseVisibility.html?.hidden).toBe(true);
  expect(useLearningStore.getState().courses.html).toEqual(originalProgress);
  expect(screen.queryByRole('link', { name: htmlName })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'CSS' })).toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  const saved = localStorage.getItem(originalScope)!;
  expect(JSON.parse(saved).state.courseVisibility.html.hidden).toBe(true);
  view.unmount();
  useLearningStore.setState({ ...emptyProgress(), ready: true });
  localStorage.setItem(originalScope, saved);
  await act(async () => {
    await useLearningStore.persist.rehydrate();
  });
  expect(useLearningStore.getState().courseVisibility.html?.hidden).toBe(true);
  expect(useLearningStore.getState().courses.html).toEqual(originalProgress);
  const html = COURSE_CATALOG.find((course) => course.id === 'html')!;
  render(
    <>
      <MyCourses />
      <CourseGroupList courses={[html]} />
    </>,
  );
  expect(screen.queryByRole('link', { name: htmlName })).not.toBeInTheDocument();
  await waitFor(() => expect(screen.queryByText('Checking materials…')).not.toBeInTheDocument());
  fireEvent.click(screen.getByRole('button', { name: `Choose course ${htmlName}` }));
  expect(useLearningStore.getState().courseVisibility.html?.hidden).toBe(false);
  expect(screen.getByRole('link', { name: htmlName })).toHaveAttribute(
    'href',
    '/courses/html/plan',
  );
  expect(useLearningStore.getState().courses.html).toEqual(originalProgress);
  expect(navigation.push).toHaveBeenCalledWith('/courses/html/plan', {
    transitionTypes: ['nav-forward'],
  });
  expect(JSON.parse(localStorage.getItem(originalScope)!).state.courseVisibility.html.hidden).toBe(
    false,
  );
});

it('removes the last visible course without retaining an open confirmation', () => {
  useLearningStore.getState().hideCourse('css');
  render(<MyCourses />);
  fireEvent.click(screen.getByRole('button', { name: /Remove from my courses: HTML/ }));
  fireEvent.click(
    within(screen.getByRole('dialog')).getByRole('button', { name: 'Remove course' }),
  );
  expect(screen.queryByRole('heading', { name: 'My courses' })).not.toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(useLearningStore.getState().courses.html?.completedTopics).toEqual(['html-day-01']);
});

it('syncs the newest hide or restore between devices', () => {
  const older = progressSnapshot({ courseVisibility: { html: { hidden: true, at: 100 } } });
  const newer = progressSnapshot({ courseVisibility: { html: { hidden: false, at: 200 } } });
  expect(mergeProgress(older, newer).courseVisibility.html).toEqual({ hidden: false, at: 200 });
  expect(mergeProgress(newer, older).courseVisibility.html).toEqual({ hidden: false, at: 200 });
});
