'use client';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useRef, useState } from 'react';
import { courseHidden, startedCourses } from '@/lib/account/progress';
import { courseDisplayName } from '@/lib/catalog-copy';
import type { CourseId } from '@/lib/courses/ids';
import type { InterfaceLocale } from '@/lib/locale';
import { useLearningStore } from '@/stores/learning-store';
import { CourseIcon } from './course-icon';

/** Touch targets stay at least 44×44 px. */
const TOUCH = { width: 44, height: 44 };

const COPY: Record<
  InterfaceLocale,
  { title: string; remove: string; confirm: string; cancel: string; submit: string }
> = {
  ru: {
    title: 'Мои курсы',
    remove: 'Убрать из моих курсов',
    confirm: 'Курс исчезнет из списка. Чтобы продолжить, выберите его снова во «Всех курсах».',
    cancel: 'Отмена',
    submit: 'Убрать курс',
  },
  tg: {
    title: 'Курсҳои ман',
    remove: 'Аз курсҳои ман гирифтан',
    confirm: 'Курс аз рӯйхат мебарояд. Барои идома онро аз «Ҳамаи курсҳо» боз интихоб кунед.',
    cancel: 'Бекор кардан',
    submit: 'Аз рӯйхат баровардан',
  },
  en: {
    title: 'My courses',
    remove: 'Remove from my courses',
    confirm: 'The course will leave this list. Select it again in All courses to continue.',
    cancel: 'Cancel',
    submit: 'Remove course',
  },
  es: {
    title: 'Mis cursos',
    remove: 'Quitar de mis cursos',
    confirm:
      'El curso se quitará de esta lista. Vuelve a elegirlo en Todos los cursos para continuar.',
    cancel: 'Cancelar',
    submit: 'Quitar curso',
  },
};

const courseHref = (id: CourseId) => (id === 'react' ? '/courses/react' : `/courses/${id}/plan`);

/** Removing a course from this list leaves its progress in the account. */
export function MyCourses() {
  const language = useLearningStore((state) => state.language);
  const courseChosen = useLearningStore((state) => state.courseChosen);
  const selectedCourse = useLearningStore((state) => state.selectedCourse);
  const completedTopics = useLearningStore((state) => state.completedTopics);
  const answers = useLearningStore((state) => state.answers);
  const courses = useLearningStore((state) => state.courses);
  const courseVisibility = useLearningStore((state) => state.courseVisibility);
  const dialog = useRef<HTMLDialogElement>(null);
  const [candidate, setCandidate] = useState<CourseId | null>(null);
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
  if (!visible.length) return null;

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
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-2 pl-3 shadow-[var(--depth-1)] transition-colors hover:border-primary/45"
              >
                <CourseIcon courseId={id} size={26} className="rounded-md" />
                <Link
                  href={courseHref(id)}
                  className="flex min-h-11 min-w-0 flex-1 items-center truncate font-medium no-underline"
                >
                  {name}
                </Link>
                <button
                  type="button"
                  className="icon-button"
                  style={TOUCH}
                  aria-label={`${copy.remove}: ${name}`}
                  title={copy.remove}
                  onClick={() => {
                    setCandidate(id);
                    dialog.current?.showModal();
                  }}
                >
                  <X size={17} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <dialog
        ref={dialog}
        aria-labelledby="remove-my-course-title"
        className="fixed inset-0 m-auto w-[min(calc(100%-32px),460px)] rounded-2xl border border-border bg-card p-6 text-foreground shadow-xl backdrop:bg-black/50"
        onClose={() => setCandidate(null)}
      >
        <h3 id="remove-my-course-title" className="text-lg font-semibold">
          {copy.submit}
          {candidate ? ` · ${courseDisplayName(candidate, language)}` : ''}
        </h3>
        <p className="my-4 text-sm leading-relaxed text-muted-foreground">{copy.confirm}</p>
        <form method="dialog" className="flex flex-wrap justify-end gap-2">
          <button className="button subtle" autoFocus>
            {copy.cancel}
          </button>
          <button
            className="button primary"
            onClick={() => {
              if (candidate) useLearningStore.getState().hideCourse(candidate);
            }}
          >
            {copy.submit}
          </button>
        </form>
      </dialog>
    </section>
  );
}
