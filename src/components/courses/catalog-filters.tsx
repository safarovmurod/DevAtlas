'use client';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { COURSE_CATEGORIES, categoryLabel } from '@/content/course-categories';
import type { CourseCatalogEntry } from '@/content/courses/catalog';
import { useLearningStore } from '@/stores/learning-store';
import { CATEGORY_ICONS } from './category-icons';
import { BROWSE_COPY, courseCountLabel } from './course-catalog-copy';

/** Direction cards: one click opens the direction's own page. */
export function CatalogCategoryGrid({ courses }: { courses: CourseCatalogEntry[] }) {
  const language = useLearningStore((state) => state.language);
  const browse = BROWSE_COPY[language];

  return (
    <section className="catalog-categories" aria-labelledby="catalog-categories-heading">
      <div className="catalog-section-heading">
        <h2 id="catalog-categories-heading">{browse.categories}</h2>
      </div>
      <div className="category-grid">
        {COURSE_CATEGORIES.map(({ id }) => {
          const Icon = CATEGORY_ICONS[id];
          const total = courses.filter((course) => course.category === id).length;
          const countLabel = courseCountLabel(total, language);
          return (
            <Link
              key={id}
              href={`/courses/category/${id}`}
              transitionTypes={['nav-forward']}
              className="category-card no-underline"
              data-category={id}
              aria-label={categoryLabel(id, language) + ' · ' + countLabel}
            >
              <span className="category-icon">
                <Icon size={23} />
              </span>
              <span className="category-text">
                <strong>{categoryLabel(id, language)}</strong>
                <small>{countLabel}</small>
              </span>
              <ChevronRight size={15} className="category-chevron" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
