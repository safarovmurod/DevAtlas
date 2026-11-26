'use client';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { BOOKMARKS_COPY, bookmarkKey, type BookmarkTarget } from '@/lib/bookmarks';
import { useLearningStore } from '@/stores/learning-store';

/** Saves the lesson day to the learner's bookmarks; a second press removes it. */
export function BookmarkButton({ target, title }: { target: BookmarkTarget; title: string }) {
  const language = useLearningStore((state) => state.language);
  const saved = useLearningStore((state) => Boolean(state.bookmarks[bookmarkKey(target)]));
  const toggleBookmark = useLearningStore((state) => state.toggleBookmark);
  const copy = BOOKMARKS_COPY[language];
  const Icon = saved ? BookmarkCheck : Bookmark;
  return (
    <button
      type="button"
      aria-pressed={saved}
      className="button subtle shrink-0 justify-self-start"
      onClick={() => toggleBookmark({ ...target, title })}
    >
      <Icon size={17} aria-hidden="true" />
      {saved ? copy.saved : copy.save}
    </button>
  );
}
