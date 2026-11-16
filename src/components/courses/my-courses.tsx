'use client';
import Link from 'next/link';
import { RotateCcw, X } from 'lucide-react';
import { courseHidden, startedCourses } from '@/lib/account/progress';
import { courseDisplayName } from '@/lib/catalog-copy';
import type { CourseId } from '@/lib/courses/ids';
import type { InterfaceLocale } from '@/lib/locale';
import { useLearningStore } from '@/stores/learning-store';
import { CourseIcon } from './course-icon';

const COPY: Record<
  InterfaceLocale,
  { title: string; remove: string; confirm: string; hidden: string; restore: string }
> = {
  ru: {
    title: 'Мои курсы',
    remove: 'Убрать из моих курсов',
    confirm: 'Убрать курс «{name}» из ваших курсов? Прогресс сохранится, курс можно вернуть.',
    hidden: 'Скрытые',
    restore: 'Вернуть',
  },
  tg: {
    title: 'Курсҳои ман',
    remove: 'Аз курсҳои ман гирифтан',
    confirm:
      'Курси «{name}» аз курсҳои шумо гирифта шавад? Прогресс нигоҳ дошта мешавад ва курсро баргардондан мумкин аст.',
    hidden: 'Пинҳоншуда',
    restore: 'Баргардондан',
  },
  en: {
    title: 'My courses',
    remove: 'Remove from my courses',
    confirm: 'Remove “{name}” from your courses? Progress is kept and you can bring it back.',
    hidden: 'Hidden',
    restore: 'Restore',
  },
  es: {
    title: 'Mis cursos',
    remove: 'Quitar de mis cursos',
    confirm: '¿Quitar «{name}» de tus cursos? El progreso se conserva y puedes recuperarlo.',
    hidden: 'Ocultos',
    restore: 'Recuperar',
  },
};

const courseHref = (id: CourseId) => (id === 'react' ? '/courses/react' : `/courses/${id}/plan`);

/** Courses the learner started. A course can be hidden (progress stays) and restored. */
export function MyCourses() {
  const language = useLearningStore((state) => state.language);
  const courseChosen = useLearningStore((state) => state.courseChosen);
  const selectedCourse = useLearningStore((state) => state.selectedCourse);
  const completedTopics = useLearningStore((state) => state.completedTopics);
  const answers = useLearningStore((state) => state.answers);
  const courses = useLearningStore((state) => state.courses);
  const courseVisibility = useLearningStore((state) => state.courseVisibility);
  const copy = COPY[language];
  const state = {
    courseChosen,
    selectedCourse,
    completedTopics,
    answers,
    courses,
    courseVisibility,
  };
  const started = startedCourses(state);
  const visible = started.filter((id) => !courseHidden(state, id));
  const hidden = started.filter((id) => courseHidden(state, id));
  if (!started.length) return null;

  return (
    <section aria-labelledby="my-courses-title" className="grid gap-3">
      <h2 id="my-courses-title" className="m-0 text-lg font-semibold">
        {copy.title}
      </h2>
      {visible.length > 0 && (
        <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((id) => {
            const name = courseDisplayName(id, language);
            return (
              <li
                key={id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-2 pl-3"
              >
                <CourseIcon courseId={id} size={26} className="rounded-md" />
                <Link href={courseHref(id)} className="min-w-0 flex-1 truncate font-medium">
                  {name}
                </Link>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`${copy.remove}: ${name}`}
                  title={copy.remove}
                  onClick={() => {
                    if (window.confirm(copy.confirm.replace('{name}', name)))
                      useLearningStore.getState().hideCourse(id);
                  }}
                >
                  <X size={17} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {hidden.length > 0 && (
        <details>
          <summary className="cursor-pointer text-sm text-muted-foreground">
            {copy.hidden} ({hidden.length})
          </summary>
          <ul className="m-0 mt-2 grid list-none gap-2 p-0">
            {hidden.map((id) => {
              const name = courseDisplayName(id, language);
              return (
                <li key={id} className="flex items-center gap-3 text-sm">
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">{name}</span>
                  <button
                    type="button"
                    className="button subtle"
                    aria-label={`${copy.restore}: ${name}`}
                    onClick={() => useLearningStore.getState().restoreCourse(id)}
                  >
                    <RotateCcw size={15} aria-hidden="true" />
                    {copy.restore}
                  </button>
                </li>
              );
            })}
          </ul>
        </details>
      )}
    </section>
  );
}
