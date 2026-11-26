import { PageTransition } from '@/components/layout/page-transition';
import { CourseCatalog } from '@/components/courses/course-catalog';
import { pageTitle } from '@/lib/page-titles';
import { PUBLIC_COPY } from '@/lib/public-copy';
import { getRequestLocale } from '@/lib/request-locale';
import { publicPageMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const locale = await getRequestLocale();
  return publicPageMetadata(
    locale,
    pageTitle('courses', locale),
    PUBLIC_COPY[locale].description,
    '/courses',
  );
}
export default function CoursesPage() {
  return (
    <PageTransition>
      <CourseCatalog />
    </PageTransition>
  );
}
