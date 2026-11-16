import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { MyCourses } from '@/components/courses/my-courses';
import { emptyProgress, mergeProgress, progressSnapshot } from '@/lib/account/progress';
import { useLearningStore } from '@/stores/learning-store';

beforeEach(() => {
  localStorage.clear();
  useLearningStore.setState({ ...emptyProgress(), ready: true, language: 'en' });
  useLearningStore.getState().completeCourseLesson('html', 'html-day-01');
  useLearningStore.getState().completeCourseLesson('css', 'css-day-01');
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('hides a course after confirmation, keeps its progress and restores it', () => {
  render(<MyCourses />);
  const list = screen.getByRole('list');
  expect(within(list).getAllByRole('listitem')).toHaveLength(2);

  // Cancelled confirmation changes nothing.
  vi.spyOn(window, 'confirm').mockReturnValueOnce(false);
  fireEvent.click(screen.getByRole('button', { name: /Remove from my courses: HTML/ }));
  expect(useLearningStore.getState().courseVisibility.html).toBeUndefined();

  vi.spyOn(window, 'confirm').mockReturnValueOnce(true);
  fireEvent.click(screen.getByRole('button', { name: /Remove from my courses: HTML/ }));
  expect(useLearningStore.getState().courseVisibility.html?.hidden).toBe(true);
  expect(useLearningStore.getState().courses.html?.completedTopics).toEqual(['html-day-01']);
  expect(screen.getByText('Hidden (1)')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /Restore: HTML/ }));
  expect(useLearningStore.getState().courseVisibility.html?.hidden).toBe(false);
  expect(screen.queryByText(/Hidden \(/)).not.toBeInTheDocument();
});

it('syncs the newest hide or restore between devices', () => {
  const older = progressSnapshot({ courseVisibility: { html: { hidden: true, at: 100 } } });
  const newer = progressSnapshot({ courseVisibility: { html: { hidden: false, at: 200 } } });
  expect(mergeProgress(older, newer).courseVisibility.html).toEqual({ hidden: false, at: 200 });
  expect(mergeProgress(newer, older).courseVisibility.html).toEqual({ hidden: false, at: 200 });
});
