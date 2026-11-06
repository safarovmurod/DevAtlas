'use client';
import Link from 'next/link';
import { useDeferredValue, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { ImportedCourseId } from '@/lib/courses/ids';
import { courseSectionHref } from '@/lib/courses/links';
import { courseText, type CourseLesson } from '@/lib/courses/schema';
import { COPY } from '@/lib/i18n';
import { LEARNING_UI_COPY } from '@/lib/learning-ui-copy';
import { useLearningStore } from '@/stores/learning-store';

const PAGE_SIZE = 18;

/** Searchable list of every opened lesson with its questions and answers. */
export function CourseAnswers({
  courseId,
  lessons,
  openedLessonIds,
}: {
  courseId: ImportedCourseId;
  lessons: CourseLesson[];
  openedLessonIds: Set<string>;
}) {
  const language = useLearningStore((state) => state.language);
  const contentLanguage = useLearningStore((state) => state.contentLanguage);
  const copy = COPY[language];
  const ui = LEARNING_UI_COPY[language];
  const text = (value: CourseLesson['title']) => courseText(value, contentLanguage);

  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const search = useDeferredValue(query.trim().toLowerCase());

  function matchesSearch(lesson: CourseLesson) {
    if (!search) return true;
    const searchable = [
      text(lesson.title),
      text(lesson.summary),
      ...lesson.questions.flatMap((q) => [text(q.question), text(q.answer)]),
      ...lesson.sections.map((section) => text(section.body)),
    ];
    return searchable.join(' ').toLowerCase().includes(search);
  }

  // Unscheduled reference lessons (for example the Sass library after the CSS
  // fundamentals) have no day and stay readable here.
  const library = lessons
    .filter((lesson) => openedLessonIds.has(lesson.id) || lesson.day === undefined)
    .filter(matchesSearch);

  return (
    <>
      <label className="course-search">
        {copy.search}
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setLimit(PAGE_SIZE);
          }}
        />
      </label>
      <div className="panel">
        <h2>{ui.answersFlow}</h2>
        <p>{ui.answersIntro}</p>
      </div>

      {library.slice(0, limit).map((lesson) => (
        <article className="panel course-lesson" id={lesson.id} key={lesson.id}>
          <h2>{text(lesson.title)}</h2>
          {lesson.questions.map((question) => (
            <details key={question.id}>
              <summary>{text(question.question)}</summary>
              <p className="preserve-lines">{text(question.answer)}</p>
            </details>
          ))}
          <Link className="text-link" href={courseSectionHref(courseId, 'tests', lesson.day || 1)}>
            {ui.checkYourself} <ArrowRight size={15} />
          </Link>
        </article>
      ))}

      {library.length > limit && (
        <button className="button subtle" onClick={() => setLimit((count) => count + PAGE_SIZE)}>
          {ui.showMore}
        </button>
      )}
    </>
  );
}
