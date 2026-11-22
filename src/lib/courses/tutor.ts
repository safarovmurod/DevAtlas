import { courseName } from '@/content/courses/catalog';
import { loadCourseContent } from './content';
import { courseText, type CourseText } from './schema';
import type { ImportedCourseId } from './ids';
import type { TutorSource } from '@/lib/tutor/shared';

const noise = new Set(
  'what is a an the how why explain about does are can for to it это что как зачем для нужен нужна работает объясни чи чияй чист чиба барои даркорай фаҳмон фахмон дар бораи про о об'.split(
    ' ',
  ),
);

const QUESTION_LABELS = {
  tg: { question: 'Савол аз курс', answer: 'Ҷавоб' },
  ru: { question: 'Вопрос из курса', answer: 'Ответ' },
  en: { question: 'Course question', answer: 'Answer' },
} as const;

function tokens(text: string) {
  return (
    text
      .toLocaleLowerCase()
      .match(/[\p{L}\p{N}_+]+/gu)
      ?.filter((word) => word.length > 1 && !noise.has(word)) || []
  );
}

export async function courseAnswer(
  courseId: ImportedCourseId,
  query: string,
  options: { questionId?: string; deep: boolean; language: 'tg' | 'ru' | 'en' },
) {
  const content = await loadCourseContent(courseId),
    wanted = tokens(query);
  let best:
    | {
        score: number;
        lesson: (typeof content.lessons)[number];
        question?: (typeof content.lessons)[number]['questions'][number];
      }
    | undefined;
  const score = (text: CourseText) =>
    Math.max(
      0,
      ...Object.values(text)
        .filter((value): value is string => !!value)
        .map((value) => {
          const found = new Set(tokens(value));
          return wanted.filter((word) => found.has(word)).length;
        }),
    );
  for (const lesson of content.lessons) {
    for (const question of lesson.questions) {
      const points = options.questionId === question.id ? 1000 : score(question.question);
      if (points && (!best || points > best.score)) best = { score: points, lesson, question };
    }
    const titlePoints = score(lesson.title);
    if (titlePoints && (!best || titlePoints > best.score)) best = { score: titlePoints, lesson };
    for (const section of lesson.sections) {
      const sectionPoints = score(section.title);
      if (sectionPoints && (!best || sectionPoints > best.score))
        best = { score: sectionPoints, lesson };
    }
  }
  if (!best || (best.score < 1000 && best.score < Math.max(1, Math.ceil(wanted.length * 0.6))))
    return null;
  const { lesson, question } = best,
    language = options.language,
    labels = QUESTION_LABELS[language];
  const matchedQuestion = question ? courseText(question.question, language) : undefined;
  const reply =
    question && !options.deep
      ? `${labels.question}: ${matchedQuestion}\n\n${labels.answer}: ${courseText(question.answer, language)}`
      : [
          courseText(lesson.title, language),
          question
            ? `${labels.question}: ${matchedQuestion}\n${labels.answer}: ${courseText(question.answer, language)}`
            : courseText(lesson.summary, language),
          ...lesson.sections.map((section) =>
            [
              courseText(section.title, language),
              courseText(section.body, language),
              section.code,
              section.output ? courseText(section.output, language) : '',
            ]
              .filter(Boolean)
              .join('\n'),
          ),
        ].join('\n\n');
  const source = content.sources.find((item) => item.id === lesson.sourceIds[0])!;
  const metadata: TutorSource = {
    questionId: question?.id || lesson.id,
    topicId: lesson.id,
    title: courseText(lesson.title, language),
    file: source.title,
    sourceId: source.id,
    courseId,
    courseTitle: courseName(courseId),
    day: lesson.day,
    ...(matchedQuestion ? { matchedQuestion } : {}),
    href: '/courses/' + courseId + '/answers#' + lesson.id,
    lessonHref:
      typeof lesson.day === 'number' && lesson.day >= 1
        ? '/courses/' + courseId + '/home?day=' + lesson.day
        : '/courses/' + courseId + '/home',
  };
  return { reply, source: metadata };
}
