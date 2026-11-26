import { beforeEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { BookmarkButton } from '@/components/learning/bookmark-button';
import { BookmarksList } from '@/components/learning/bookmarks-list';
import {
  accountStorageKey,
  emptyProgress,
  mergeProgress,
  progressSnapshot,
} from '@/lib/account/progress';
import { BOOKMARKS_COPY, bookmarkHref, bookmarkKey } from '@/lib/bookmarks';
import { switchLearningAccount, useLearningStore } from '@/stores/learning-store';

const html = { courseId: 'html', day: 3, title: 'Lists', at: 100 } as const;
const react = { courseId: 'react', month: 2, day: 5, title: 'useEffect', at: 200 } as const;

beforeEach(() => {
  localStorage.clear();
  switchLearningAccount(null);
  useLearningStore.setState({ language: 'en' });
});

describe('bookmark addresses', () => {
  it('has one key and lesson link per day, with the month for React', () => {
    expect(bookmarkKey(html)).toBe('html:3');
    expect(bookmarkHref(html)).toBe('/courses/html/home?day=3');
    expect(bookmarkKey(react)).toBe('react:2:5');
    expect(bookmarkHref(react)).toBe('/home?month=2&day=5');
  });
});

describe('saved bookmarks', () => {
  it('start empty and keep the rest of an older profile readable', () => {
    expect(emptyProgress().bookmarks).toEqual({});
    expect(emptyProgress().deletedBookmarks).toEqual({});
    const profile = progressSnapshot({
      studied: ['q1'],
      bookmarks: {
        'html:3': html,
        'bad:1': { courseId: 'no-such-course', day: 1, at: 1 },
        'css:0': { courseId: 'css', day: 0, at: 1 },
      },
    });
    expect(profile.studied).toEqual(['q1']);
    expect(Object.keys(profile.bookmarks)).toEqual(['html:3']);
  });

  it('merge both devices, keep the newer edit and respect removals', () => {
    const remote = progressSnapshot({
      bookmarks: { 'html:3': html, 'css:1': { courseId: 'css', day: 1, title: '', at: 50 } },
      deletedBookmarks: { 'react:2:5': 150 },
    });
    const local = progressSnapshot({
      bookmarks: {
        'html:3': { ...html, title: 'Lists (renamed)', at: 300 },
        'react:2:5': react,
        'css:1': { courseId: 'css', day: 1, title: '', at: 40 },
      },
      deletedBookmarks: { 'css:1': 60 },
    });
    const merged = mergeProgress(remote, local);
    // Newer local edit wins; React was saved again (200) after its removal (150).
    expect(merged.bookmarks['html:3'].title).toBe('Lists (renamed)');
    expect(merged.bookmarks['react:2:5']).toEqual(react);
    // CSS was removed (60) after both saves (40, 50).
    expect(merged.bookmarks['css:1']).toBeUndefined();
    expect(merged.deletedBookmarks).toEqual({ 'react:2:5': 150, 'css:1': 60 });
    expect(mergeProgress(merged, merged)).toEqual(merged);
  });

  it('toggle in the store, record the removal and survive a later save again', () => {
    const store = useLearningStore.getState();
    store.toggleBookmark({ courseId: 'html', day: 3, title: 'Lists' });
    const saved = useLearningStore.getState().bookmarks['html:3'];
    expect(saved).toMatchObject({ courseId: 'html', day: 3, title: 'Lists' });
    expect(saved.month).toBeUndefined();

    useLearningStore.getState().toggleBookmark({ courseId: 'html', day: 3, title: 'Lists' });
    const removedAt = useLearningStore.getState().deletedBookmarks['html:3'];
    expect(useLearningStore.getState().bookmarks).toEqual({});
    expect(removedAt).toBeGreaterThan(saved.at);

    useLearningStore.getState().toggleBookmark({ courseId: 'html', day: 3, title: 'Lists' });
    expect(useLearningStore.getState().bookmarks['html:3'].at).toBeGreaterThan(removedAt);
  });

  it('stay with the account that saved them', () => {
    switchLearningAccount('account-a');
    useLearningStore.getState().toggleBookmark({ courseId: 'react', month: 2, day: 5, title: '' });
    switchLearningAccount('account-b');
    expect(useLearningStore.getState().bookmarks).toEqual({});
    switchLearningAccount('account-a');
    expect(Object.keys(useLearningStore.getState().bookmarks)).toEqual(['react:2:5']);
    const cached = JSON.parse(localStorage.getItem(accountStorageKey('account-a'))!);
    expect(cached.state.bookmarks['react:2:5'].month).toBe(2);
  });
});

describe('bookmark screens', () => {
  it('the lesson button saves and unsaves with a pressed state', () => {
    render(<BookmarkButton target={{ courseId: 'css', day: 7 }} title="Flexbox" />);
    const button = screen.getByRole('button', { name: BOOKMARKS_COPY.en.save });
    expect(button.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(button);
    expect(screen.getByRole('button', { name: BOOKMARKS_COPY.en.saved })).toBeTruthy();
    expect(useLearningStore.getState().bookmarks['css:7'].title).toBe('Flexbox');
    fireEvent.click(screen.getByRole('button', { name: BOOKMARKS_COPY.en.saved }));
    expect(useLearningStore.getState().bookmarks['css:7']).toBeUndefined();
  });

  it('the list shows the newest first, links to the lesson and removes an item', () => {
    useLearningStore.setState({ bookmarks: { 'html:3': html, 'react:2:5': react } });
    render(<BookmarksList />);
    const links = screen.getAllByRole('link').filter((link) => link.textContent?.includes('Day'));
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/home?month=2&day=5',
      '/courses/html/home?day=3',
    ]);
    expect(links[0].textContent).toContain('Month 2 · Day 5');
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: `${BOOKMARKS_COPY.en.remove}: Lists` }));
    });
    expect(Object.keys(useLearningStore.getState().bookmarks)).toEqual(['react:2:5']);
  });

  it('opening a React bookmark selects React, because /home shows the selected course', () => {
    useLearningStore.setState({
      selectedCourse: 'html',
      courseChosen: true,
      bookmarks: { 'react:2:5': react },
    });
    render(<BookmarksList />);
    const link = screen.getAllByRole('link').find((item) => item.textContent?.includes('Day 5'))!;
    link.addEventListener('click', (event) => event.preventDefault());
    fireEvent.click(link);
    expect(useLearningStore.getState().selectedCourse).toBe('react');
  });

  it('the list explains how to add a bookmark when it is empty', () => {
    render(<BookmarksList />);
    expect(screen.getByText(BOOKMARKS_COPY.en.empty)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'All courses' }).getAttribute('href')).toBe('/courses');
  });
});
