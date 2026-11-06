'use client';
import { ArrowRight, ChevronRight, Terminal } from 'lucide-react';
import {
  COURSE_CATEGORIES,
  PROGRAMMING_SUBTRACKS,
  categoryLabel,
  subtrackLabel,
  type CourseCategoryId,
  type ProgrammingSubtrackId,
} from '@/content/course-categories';
import type { CourseCatalogEntry } from '@/content/courses/catalog';
import type { CourseAccessTier } from '@/lib/courses/access';
import { PREMIUM_COPY } from '@/lib/premium-copy';
import { useLearningStore } from '@/stores/learning-store';
import { CATEGORY_ICONS } from './category-icons';
import {
  BROWSE_COPY,
  CATALOG_UI,
  EXTRA_FILTER_COPY,
  courseCountLabel,
} from './course-catalog-copy';

export type StartFilter = 'all' | 'zero' | 'next';
export type LengthFilter = 'all' | 'short' | 'month' | 'long';
export type CatalogFilters = {
  category: CourseCategoryId | 'all';
  subtrack: ProgrammingSubtrackId | 'all';
  access: CourseAccessTier | 'all';
  start: StartFilter;
  length: LengthFilter;
};

const CATEGORY_IDS = COURSE_CATEGORIES.map((entry) => entry.id);
const SUBTRACK_IDS = PROGRAMMING_SUBTRACKS.map((entry) => entry.id);
const ACCESS_TIERS = ['all', 'starter', 'pro', 'expert'] as const;
const STARTS: StartFilter[] = ['all', 'zero', 'next'];
const LENGTHS: LengthFilter[] = ['all', 'short', 'month', 'long'];

/** Category cards, programming specializations and the access / start / length filters. */
export function CatalogFilterPanel({
  courses,
  filters,
  onChange,
}: {
  courses: CourseCatalogEntry[];
  filters: CatalogFilters;
  onChange: (changes: Partial<CatalogFilters>) => void;
}) {
  const language = useLearningStore((state) => state.language);
  const browse = BROWSE_COPY[language];
  const labels = CATALOG_UI[language];
  const extra = EXTRA_FILTER_COPY[language];
  const premium = PREMIUM_COPY[language];
  const { category, subtrack, access, start, length } = filters;

  // A new category always starts with all of its specializations.
  const selectCategory = (id: CourseCategoryId | 'all') =>
    onChange({ category: id, subtrack: 'all' });
  const accessLabel = (tier: (typeof ACCESS_TIERS)[number]) =>
    tier === 'all'
      ? premium.all
      : tier === 'starter'
        ? premium.starter
        : tier === 'pro'
          ? 'Pro'
          : 'Expert';

  return (
    <>
      <section className="catalog-categories" aria-labelledby="catalog-categories-heading">
        <div className="catalog-section-heading">
          <h2 id="catalog-categories-heading">{browse.categories}</h2>
          <button
            type="button"
            className={'category-reset ' + (category === 'all' ? 'is-active' : '')}
            aria-pressed={category === 'all'}
            onClick={() => selectCategory('all')}
          >
            {browse.all}
            <ArrowRight size={15} />
          </button>
        </div>
        <div className="category-grid">
          {CATEGORY_IDS.map((id) => {
            const Icon = CATEGORY_ICONS[id];
            const total = courses.filter((course) => course.category === id).length;
            const countLabel = courseCountLabel(total, language);
            return (
              <button
                key={id}
                type="button"
                className={'category-card ' + (category === id ? 'is-active' : '')}
                data-category={id}
                aria-label={categoryLabel(id, language) + ' · ' + countLabel}
                aria-pressed={category === id}
                onClick={() => selectCategory(id)}
              >
                <span className="category-icon">
                  <Icon size={23} />
                </span>
                <span className="category-text">
                  <strong>{categoryLabel(id, language)}</strong>
                  <small>{countLabel}</small>
                </span>
                <ChevronRight size={15} className="category-chevron" />
              </button>
            );
          })}
        </div>
      </section>

      {(category === 'all' || category === 'programming') && (
        <section className="programming-filters" aria-label={browse.programming}>
          <span>{browse.programming}</span>
          <div className="subtrack-filters">
            <button
              type="button"
              aria-pressed={subtrack === 'all'}
              onClick={() => onChange({ subtrack: 'all' })}
            >
              {browse.allTracks}
            </button>
            {SUBTRACK_IDS.map((track) => (
              <button
                key={track}
                type="button"
                aria-pressed={subtrack === track}
                onClick={() => onChange({ subtrack: track, category: 'programming' })}
              >
                {subtrackLabel(track, language)}
              </button>
            ))}
          </div>
        </section>
      )}

      {category === 'programming' && subtrack === 'frontend' && (
        <div className="course-route panel">
          <span className="route-icon">
            <Terminal size={23} />
          </span>
          <div>
            <strong>{labels.route}</strong>
            <p className="learning-route-steps">
              <span>HTML + CSS</span>
              <ArrowRight size={15} />
              <span>JavaScript</span>
              <ArrowRight size={15} />
              <span>React</span>
              <ArrowRight size={15} />
              <span>Next.js</span>
            </p>
            <span>{labels.routeNote}</span>
          </div>
        </div>
      )}

      <nav className="course-access-filters" aria-label={premium.all}>
        {ACCESS_TIERS.map((tier) => (
          <button
            type="button"
            key={tier}
            aria-pressed={access === tier}
            onClick={() => onChange({ access: tier })}
          >
            {accessLabel(tier)}
          </button>
        ))}
      </nav>

      <div className="course-extra-filters">
        <nav className="course-access-filters" aria-label={extra.start}>
          <span>{extra.start}</span>
          {STARTS.map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={start === value}
              onClick={() => onChange({ start: value })}
            >
              {extra.starts[value]}
            </button>
          ))}
        </nav>
        <nav className="course-access-filters" aria-label={extra.length}>
          <span>{extra.length}</span>
          {LENGTHS.map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={length === value}
              onClick={() => onChange({ length: value })}
            >
              {extra.lengths[value]}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
