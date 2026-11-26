import { PageTransition } from '@/components/layout/page-transition';
import { ReactCourseEntry } from '@/components/learning/react-course-entry';
import { courseDescription, courseDisplayName } from '@/lib/catalog-copy';
import { getRequestLocale } from '@/lib/request-locale';
import { publicPageMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const locale = await getRequestLocale();
  return publicPageMetadata(
    locale,
    courseDisplayName('react', locale),
    courseDescription('react', locale),
    '/courses/react',
  );
}
export default function ReactEntryPage() {
  return (
    <PageTransition>
      <ReactCourseEntry />
    </PageTransition>
  );
}
