import { courseAccessTier } from '@/lib/courses/access';
import { loadCourseContent } from '@/lib/courses/content';
import { isCourseId, type CourseId, type ImportedCourseId } from '@/lib/courses/ids';
import { courseAnswer } from '@/lib/courses/tutor';
import { canonicalWord, courseCandidatesFor, nearest, wordsOf } from './fuzzy';
import { QUESTION_FILLER } from './glossary';
import { projectAnswer } from './project-answers';
import type { TutorSource } from './shared';

export interface LocalReference {
  reply: string;
  source: TutorSource;
}
type Options = { questionId?: string; deep: boolean; language: 'tg' | 'ru' | 'en' };

/** Words used in a course's lesson titles, section titles and questions, so a typo can be matched to a real word. */
const vocabularies = new Map<ImportedCourseId, Promise<Set<string>>>();
function vocabulary(courseId: ImportedCourseId): Promise<Set<string>> {
  let words = vocabularies.get(courseId);
  if (!words) {
    words = loadCourseContent(courseId)
      .then((content) => {
        const known = new Set<string>();
        for (const lesson of content.lessons)
          for (const text of [
            lesson.title,
            ...lesson.sections.map((section) => section.title),
            ...lesson.questions.map((question) => question.question),
          ])
            for (const value of Object.values(text))
              for (const word of value?.toLocaleLowerCase().match(/[\p{L}\p{N}_+]+/gu) ?? [])
                known.add(word);
        return known;
      })
      .catch((error) => {
        vocabularies.delete(courseId);
        throw error;
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
 * Searches DevAtlas course materials smartly without scanning all 43 courses:
 * 1. A lesson question bound by `questionId` stays strictly in `courseId`.
 * 2. When the question explicitly names one or two courses (e.g. "Python", "UX дизайн", "SQL"),
 *    search those named free courses first so learners sitting on another course get the right lesson.
 * 3. Always search the currently selected `courseId` as well (when not already checked).
 */
export async function localReference(
  courseId: CourseId,
  query: string,
  options: Options,
): Promise<LocalReference | null> {
  if (options.questionId) return lookup(courseId, query, options);

  const candidates = courseCandidatesFor(query)
    .filter((candidate): candidate is CourseId => isCourseId(candidate))
    .filter((candidate) => candidate === courseId || courseAccessTier(candidate) === 'starter')
    .slice(0, 2);

  const order: CourseId[] = [];
  for (const candidate of candidates) {
    if (!order.includes(candidate)) order.push(candidate);
  }
  if (!order.includes(courseId)) order.push(courseId);

  for (const target of order) {
    const found = await lookup(target, query, options);
    if (found) return found;
  }
  return null;
}
