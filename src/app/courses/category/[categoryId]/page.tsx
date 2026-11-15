import { notFound } from 'next/navigation';
import { PageTransition } from '@/components/layout/page-transition';
import { CategoryCatalog } from '@/components/courses/course-catalog-category';
import { COURSE_CATEGORY_IDS, type CourseCategoryId } from '@/content/course-categories';

function isCategoryId(value: string): value is CourseCategoryId {
  return (COURSE_CATEGORY_IDS as readonly string[]).includes(value);
}

export function generateStaticParams() {
  return COURSE_CATEGORY_IDS.map((categoryId) => ({ categoryId }));
}

export default async function CourseCategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  if (!isCategoryId(categoryId)) notFound();
  return (
    <PageTransition>
      <CategoryCatalog categoryId={categoryId} />
    </PageTransition>
  );
}
