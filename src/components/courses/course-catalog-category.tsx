'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { categoryLabel, type CourseCategoryId } from '@/content/course-categories';
import { useLearningStore } from '@/stores/learning-store';
import { CATALOG_COURSES, CourseGroupList } from './course-catalog';
import { CATEGORY_ICONS } from './category-icons';
import { BROWSE_COPY, courseCountLabel } from './course-catalog-copy';

/** One direction's own page: only its courses, programming grouped by specialization. */
export function CategoryCatalog({ categoryId }: { categoryId: CourseCategoryId }) {
  const language = useLearningStore((state) => state.language);
  const browse = BROWSE_COPY[language];
  const Icon = CATEGORY_ICONS[categoryId];
  const courses = CATALOG_COURSES.filter((course) => course.category === categoryId);

  return (
    <section className="course-catalog flex flex-col gap-6" data-category-page={categoryId}>
      <Link
        href="/courses"
        transitionTypes={['nav-back']}
        className="back-link inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground no-underline hover:text-foreground"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {browse.back}
      </Link>

      <header className="flex items-center gap-4">
        <span className="group-category-icon size-12! shrink-0" data-category={categoryId}>
          <Icon size={24} aria-hidden="true" />
        </span>
        <div className="grid gap-1">
          <h1 className="m-0 text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
            {categoryLabel(categoryId, language)}
          </h1>
          <span className="text-sm text-muted-foreground">
            {courseCountLabel(courses.length, language)}
          </span>
        </div>
      </header>

      {courses.length > 0 ? (
        <CourseGroupList courses={courses} showCategory={false} />
      ) : (
        <div role="status" className="catalog-empty">
          <p>{browse.empty}</p>
        </div>
      )}
    </section>
  );
}
