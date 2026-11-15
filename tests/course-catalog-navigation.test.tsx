import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COURSE_CATALOG } from '@/content/courses/catalog';
import { COURSE_CATEGORIES } from '@/content/course-categories';
import { courseDisplayName } from '@/lib/catalog-copy';
import { CourseCatalog } from '@/components/courses/course-catalog';
import { CategoryCatalog } from '@/components/courses/course-catalog-category';

const mocks = vi.hoisted(() => ({ push: vi.fn(), chooseCourse: vi.fn(), setState: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('@/stores/learning-store', () => ({
  useLearningStore: Object.assign(
    (select: (state: unknown) => unknown) =>
      select({ language: 'ru', selectedCourse: 'html', courseChosen: true }),
    { getState: () => ({ chooseCourse: mocks.chooseCourse }) },
  ),
}));
vi.mock('@/stores/app-store', () => ({ useAppStore: { setState: mocks.setState } }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () =>
        COURSE_CATALOG.map((course) => ({ id: course.id, ready: true, lessons: 2, files: 0 })),
    }),
  );
});

afterEach(() => vi.unstubAllGlobals());

describe('general course catalog navigation', () => {
  it('shows only direction cards, each linking to its own page', () => {
    const { container } = render(<CourseCatalog />);
    const cards = container.querySelectorAll('.category-card');
    expect(cards).toHaveLength(COURSE_CATEGORIES.length);
    expect(container.querySelector('.category-card[data-category="design"]')).toHaveAttribute(
      'href',
      '/courses/category/design',
    );
    expect(container.querySelector('.course-card')).not.toBeInTheDocument();
    expect(container.querySelector('.course-access-filters')).not.toBeInTheDocument();
    expect(container.querySelector('.subtrack-filters')).not.toBeInTheDocument();
  });

  it('searches across every direction and opens the found course directly', async () => {
    const { container } = render(<CourseCatalog />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Найти курс' }), {
      target: { value: 'UX/UI' },
    });
    const designCard = container.querySelector('[data-course="ux-design"]') as HTMLElement;
    expect(designCard).toBeInTheDocument();
    expect(container.querySelector('[data-course="sql"]')).not.toBeInTheDocument();
    fireEvent.click(
      within(designCard).getByRole('button', {
        name: 'Выбрать ' + courseDisplayName('ux-design', 'ru'),
      }),
    );
    expect(mocks.chooseCourse).toHaveBeenCalledWith('ux-design');
    expect(mocks.push).toHaveBeenCalledWith('/courses/ux-design/plan', {
      transitionTypes: ['nav-forward'],
    });
    expect(mocks.setState).toHaveBeenCalledWith({
      sidebarOpen: false,
      tutorDrawerOpen: false,
      tutorQuestion: null,
    });
    await waitFor(() => expect(screen.queryByText('Проверяем материалы…')).not.toBeInTheDocument());
  });
});

describe('direction page', () => {
  it('shows only programming courses grouped by specialization with a back link', async () => {
    const { container } = render(<CategoryCatalog categoryId="programming" />);
    expect(screen.getByRole('link', { name: /Назад к направлениям/ })).toHaveAttribute(
      'href',
      '/courses',
    );
    expect(screen.getByRole('heading', { name: 'Фронтенд' })).toBeVisible();
    expect(container.querySelector('[data-course="html"]')).toBeInTheDocument();
    expect(container.querySelector('[data-course="ux-design"]')).not.toBeInTheDocument();
    const programming = COURSE_CATALOG.filter(
      (course) => course.category === 'programming' && course.id !== 'javascript-2',
    );
    expect(container.querySelectorAll('.course-card')).toHaveLength(programming.length);
    await waitFor(() => expect(screen.queryByText('Проверяем материалы…')).not.toBeInTheDocument());
  });

  it('keeps courses usable when the materials endpoint returns an invalid payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ error: 'Unavailable' }) }),
    );
    const { container } = render(<CategoryCatalog categoryId="design" />);
    await waitFor(() =>
      expect(screen.getAllByText('Статус материалов недоступен').length).toBeGreaterThan(0),
    );
    expect(container.querySelector('[data-course="ux-design"]')).toBeInTheDocument();
    expect(container.querySelector('[data-course="html"]')).not.toBeInTheDocument();
  });
});
