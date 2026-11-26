import { notFound } from 'next/navigation';
import { PageTransition } from '@/components/layout/page-transition';
import { CategoryCatalog } from '@/components/courses/course-catalog-category';
import {
  COURSE_CATEGORIES,
  COURSE_CATEGORY_IDS,
  type CourseCategoryId,
} from '@/content/course-categories';
import { COURSE_CATALOG } from '@/content/courses/catalog';
import { courseDisplayName } from '@/lib/catalog-copy';
import { PUBLIC_COPY } from '@/lib/public-copy';
import { getRequestLocale } from '@/lib/request-locale';
import { publicPageMetadata } from '@/lib/seo';

function isCategoryId(value: string): value is CourseCategoryId {
  return (COURSE_CATEGORY_IDS as readonly string[]).includes(value);
}

export function generateStaticParams() {
  return COURSE_CATEGORY_IDS.map((categoryId) => ({ categoryId }));
}

export async function generateMetadata({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  if (!isCategoryId(categoryId)) return {};
  const locale = await getRequestLocale();
  const label = COURSE_CATEGORIES.find((category) => category.id === categoryId)!.labels[locale];
  const names = COURSE_CATALOG.filter((course) => course.category === categoryId).map((course) =>
    courseDisplayName(course.id, locale),
  );
  const description = names.length
    ? `${label}: ${names.join(', ')}.`
    : PUBLIC_COPY[locale].description;
  return publicPageMetadata(locale, label, description, `/courses/category/${categoryId}`);
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
