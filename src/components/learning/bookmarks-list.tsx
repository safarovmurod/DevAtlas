'use client';
import Link from 'next/link';
import { Bookmark, Trash2 } from 'lucide-react';
import { CourseIcon } from '@/components/courses/course-icon';
import { courseDisplayName } from '@/lib/catalog-copy';
import { BOOKMARKS_COPY, bookmarkHref } from '@/lib/bookmarks';
import { COPY } from '@/lib/i18n';
import { LEARNING_UI_COPY } from '@/lib/learning-ui-copy';
import { useLearningStore } from '@/stores/learning-store';
import { PageHeading } from './page-heading';

export function BookmarksList() {
  const language = useLearningStore((state) => state.language);
  const ready = useLearningStore((state) => state.ready);
  const bookmarks = useLearningStore((state) => state.bookmarks);
  const removeBookmark = useLearningStore((state) => state.removeBookmark);
  const chooseCourse = useLearningStore((state) => state.chooseCourse);
  const copy = BOOKMARKS_COPY[language];
  const ui = LEARNING_UI_COPY[language];
  const monthLabel = COPY[language].month;
  // Newest first: the lesson saved last is usually the one to return to.
  const entries = Object.entries(bookmarks).sort(([, a], [, b]) => b.at - a.at);
  const header = <PageHeading title={copy.title} subtitle={copy.subtitle} />;

  // Saved progress is not loaded yet: an empty list now would be wrong.
  if (!ready) return header;
  if (!entries.length)
    return (
      <>
        {header}
        <section className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-[var(--depth-1)]">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-brand">
            <Bookmark size={24} aria-hidden="true" />
          </span>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{copy.empty}</p>
          <Link href="/courses" className="button primary mt-5 inline-flex no-underline">
            {ui.allCourses}
          </Link>
        </section>
      </>
    );

  return (
    <>
      {header}
      <ul className="grid gap-3">
        {entries.map(([key, bookmark]) => {
          const day = `${bookmark.month ? `${monthLabel} ${bookmark.month} · ` : ''}${ui.day} ${bookmark.day}`;
          const title = bookmark.title || day;
          return (
            <li
              key={key}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-[var(--depth-1)] sm:p-4"
            >
              <Link
                href={bookmarkHref(bookmark)}
                // React days live at /home, which shows the selected course: select React first.
                onClick={() => {
                  if (bookmark.courseId === 'react') chooseCourse('react');
                }}
                className="flex min-w-0 flex-1 items-center gap-3 no-underline"
              >
                <CourseIcon courseId={bookmark.courseId} size={36} />
                <span className="grid min-w-0">
                  <span className="truncate text-xs text-muted-foreground">
                    {courseDisplayName(bookmark.courseId, language)} · {day}
                  </span>
                  <strong className="truncate text-[15px] font-semibold text-foreground">
                    {title}
                  </strong>
                </span>
              </Link>
              <button
                type="button"
                className="icon-button shrink-0"
                aria-label={`${copy.remove}: ${title}`}
                title={copy.remove}
                onClick={() => removeBookmark(key)}
              >
                <Trash2 size={17} aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
