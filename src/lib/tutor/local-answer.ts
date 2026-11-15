import { courseAccessTier } from '@/lib/courses/access';
import { loadCourseContent } from '@/lib/courses/content';
import { isCourseId, type CourseId, type ImportedCourseId } from '@/lib/courses/ids';
import { courseAnswer } from '@/lib/courses/tutor';
import { canonicalWord, courseFor, nearest, wordsOf } from './fuzzy';
import { QUESTION_FILLER } from './glossary';
import { projectAnswer } from './project-answers';
import type { TutorSource } from './shared';

export interface LocalReference {
  reply: string;
  source: TutorSource;
}
type Options = { questionId?: string; deep: boolean; language: 'tg' | 'ru' | 'en' };

/** Words used in a course's lesson titles and questions, so a typo can be matched to a real word. */
const vocabularies = new Map<ImportedCourseId, Promise<Set<string>>>();
function vocabulary(courseId: ImportedCourseId): Promise<Set<string>> {
  let words = vocabularies.get(courseId);
  if (!words) {
    words = loadCourseContent(courseId).then((content) => {
      const known = new Set<string>();
      for (const lesson of content.lessons)
        for (const text of [lesson.title, ...lesson.questions.map((question) => question.question)])
          for (const value of Object.values(text))
            for (const word of value?.toLocaleLowerCase().match(/[\p{L}\p{N}_+]+/gu) ?? [])
              known.add(word);
      return known;
    });
    vocabularies.set(courseId, words);
  }
  return words;
}

/**
 * The question with typos fixed to words the course really uses, and without
 * words that only say "what is this?". "хтмл что такое" becomes "html".
 */
async function correctedQuery(courseId: ImportedCourseId, query: string): Promise<string> {
  const known = await vocabulary(courseId);
  const words = wordsOf(query)
    .filter((word) => !QUESTION_FILLER.has(word))
    .map((word) => {
      if (known.has(word)) return word;
      const name = canonicalWord(word);
      if (known.has(name)) return name;
      return nearest(word, known) ?? word;
    });
  return words.join(' ') || query;
}

async function lookup(
  courseId: CourseId,
  query: string,
  options: Options,
): Promise<LocalReference | null> {
  if (courseId === 'react') return projectAnswer(query, options);
  // A question bound to its lesson by id is matched as written.
  const text = options.questionId ? query : await correctedQuery(courseId, query);
  return courseAnswer(courseId, text, options);
}

/**
 * An answer from the course materials. The selected course is searched first.
 * When it has nothing and the question names a technology ("хтмл что такое"),
 * that technology's course is searched as well, so the course picker does not
 * have to match the question. A lesson question bound by `questionId` stays in its course.
 */
export async function localReference(
  courseId: CourseId,
  query: string,
  options: Options,
): Promise<LocalReference | null> {
  const found = await lookup(courseId, query, options);
  if (found || options.questionId) return found;
  const named = courseFor(query);
  if (!named || named === courseId || !isCourseId(named)) return null;
  // Only free courses are searched on the side; a protected one needs its own request.
  if (courseAccessTier(named) !== 'starter') return null;
  return lookup(named, query, options);
}
