import { PageTransition } from '@/components/layout/page-transition';
import { BookmarksList } from '@/components/learning/bookmarks-list';
import { titleMetadata } from '@/lib/page-titles';

export function generateMetadata() {
  return titleMetadata('bookmarks');
}

export default function BookmarksPage() {
  return (
    <PageTransition>
      <BookmarksList />
    </PageTransition>
  );
}
