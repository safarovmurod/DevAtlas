import { INTERVIEW_QUESTIONS, QUIZ_QUESTIONS, type LearningQuestion } from '@/content/course';
import { reactMonthDays } from '@/lib/react-plan';
import { tr } from '@/lib/translate';
import { orderedOptions } from '@/lib/learning';
import type { CoursePlanDay } from './plan';

const text = (value: string) => ({ tg: value, ru: tr(value, 'ru'), en: tr(value, 'en') });

export function reactAssessmentPlan(month: number): {
  plan: CoursePlanDay[];
  topicIds: Record<string, string>;
} {
  const topicIds: Record<string, string> = {};
  const keepTopic = (question: LearningQuestion) => {
    topicIds[question.id] = question.topicId;
    return question;
  };
  const plan = reactMonthDays(month).map((entry): CoursePlanDay => {
    const topics = new Set(entry.topics.map((topic) => topic.id));
    const questions = QUIZ_QUESTIONS.filter(
      (question) =>
        topics.has(question.topicId) &&
        question.options.length >= 2 &&
        question.options.includes(question.answer),
    )
      .slice(0, 10)
      .map(keepTopic);
    const written = INTERVIEW_QUESTIONS.find((question) => topics.has(question.topicId));
    const fallbackTopic = entry.topics.find((topic) => topic.questions.length);
    const fallback = fallbackTopic?.questions[0];
    const fallbackId = fallbackTopic ? fallbackTopic.id + '-day-written' : '';
    if (!written && fallbackTopic) topicIds[fallbackId] = fallbackTopic.id;
    return {
      day: entry.day,
      section: 'tests',
      lesson: {
        id: `react-month-${month}-day-${entry.day}`,
        title: text(entry.title),
        summary: text(entry.title),
        level: 'beginner',
        sourceIds: ['react'],
        sections: [],
        questions: questions.map((question) => {
          const options = orderedOptions(question);
          return {
            id: question.id,
            question: text(question.question),
            answer: text(question.explanation || question.answer),
            options: options.map(text),
            correctIndex: options.indexOf(question.answer),
          };
        }),
        interview: written
          ? {
              id: keepTopic(written).id,
              question: text(written.question),
              answer: text(written.answer),
              acceptedAnswers: written.acceptedAnswers,
              caseSensitive: written.caseSensitive,
            }
          : fallback
            ? { id: fallbackId, question: text(fallback.question), answer: text(fallback.answer) }
            : undefined,
      },
    };
  });
  return { plan, topicIds };
}
