// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { siteGuideAnswer, guideContext, agentTrackLine } from '@/lib/agent/site-agent';
import { COURSE_CATALOG } from '@/content/courses/catalog';

const base = guideContext({
  language: 'ru',
  selectedCourse: 'python',
  progress: { completedTopics: ['python-day-01'], completedPractice: ['python-day-01'], confirmedDays: ['1'], masteredQuestions: ['python-day-01-q1'], drafts: { 'selected-day-v3': '1' } },
});

describe('site agent guide brain', () => {
  it('answers navigation intents in three languages with real links', () => {
    for (const [language, query] of [
      ['ru', 'Где найти курсы и с чего начать?'],
      ['tg', 'Курсҳо дар куҷо?'],
      ['en', 'Where are the courses?'],
    ] as const) {
      const context = guideContext({ language, selectedCourse: 'python', progress: { completedTopics: [], completedPractice: [], confirmedDays: [], masteredQuestions: [], drafts: {} } });
      const reply = siteGuideAnswer(query, context);
      expect(reply, language).not.toBeNull();
      expect(reply?.links.some(link => link.href === '/courses')).toBe(true);
      expect(reply?.reply.toLowerCase()).toContain(COURSE_CATALOG.length.toString());
    }
  });

  it('answers platform questions in Spanish with real links', () => {
    const context = guideContext({ language: 'es', selectedCourse: 'python', progress: { completedTopics: [], completedPractice: [], confirmedDays: [], masteredQuestions: [], drafts: {} } });
    const courses = siteGuideAnswer('¿Dónde están los cursos?', context);
    expect(courses?.links.some(link => link.href === '/courses')).toBe(true);
    expect(courses?.reply).toContain(COURSE_CATALOG.length.toString());
    const plans = siteGuideAnswer('¿Cuánto cuesta la suscripción?', context);
    expect(plans?.links.some(link => link.href === '/plans')).toBe(true);
    for (const plan of ['Start', 'Pro', 'Ultra']) expect(plans?.reply).toContain(plan);
    expect(siteGuideAnswer('¿Dónde están mis notas?', context)?.reply).toContain('notas');
    expect(agentTrackLine('python', 'es')).toContain('gratis');
  });

  it('recommends the concrete next step from real learner progress', () => {
    const reply = siteGuideAnswer('Что мне делать дальше?', base);
    expect(reply?.reply).toContain('Python');
    expect(reply?.reply).toContain('день 1');
    expect(reply?.links.some(link => link.href === '/courses/python/plan')).toBe(true);
  });

  it('explains mastery honestly including retry and xp rules', () => {
    const reply = siteGuideAnswer('Как считается мастерство и XP?', base);
    expect(reply?.reply).toContain('Мастерство');
    expect(reply?.reply.toLowerCase()).toMatch(/переответить|повторно/);
  });

  it('covers practice, tests, notes, plans and community intents', () => {
    for (const query of ['Где практика?', 'Как готовиться к интервью?', 'Где мои заметки?', 'Сколько стоит подписка?', 'Где сообщество?']) {
      expect(siteGuideAnswer(query, base), query).not.toBeNull();
    }
    expect(siteGuideAnswer('Где практика?', base)?.links.some(link => link.href === '/practice')).toBe(true);
    expect(siteGuideAnswer('Как готовиться к интервью?', base)?.links.some(link => link.href === '/courses/python/tests')).toBe(true);
    expect(siteGuideAnswer('Сколько стоит подписка?', base)?.reply).toContain('бесплатн');
    const plans = siteGuideAnswer('Сколько стоит подписка?', base)?.reply;
    for (const plan of ['Start', 'Pro', 'Ultra']) expect(plans).toContain(plan);
    expect(plans).not.toContain('Pro Ultra');
  });

  it('explains the three plans in every guide language and says which plan has which tool', () => {
    for (const [language, query] of [['ru', 'Какие есть тарифы?'], ['tg', 'Тарифҳо чанд аст?'], ['en', 'How much is Ultra?']] as const) {
      const context = guideContext({ language, selectedCourse: 'python', progress: { completedTopics: [], completedPractice: [], confirmedDays: [], masteredQuestions: [] } });
      const reply = siteGuideAnswer(query, context);
      expect(reply?.links.some(link => link.href === '/plans'), language).toBe(true);
      for (const plan of ['Start', 'Pro', 'Ultra']) expect(reply?.reply, language).toContain(plan);
    }
    expect(siteGuideAnswer('Где чат сообщества?', base)?.reply).toContain('всех, кто вошёл');
  });

  it('points to the AI Tutor chat and names its plan', () => {
    const reply = siteGuideAnswer('Где AI Tutor?', base);
    expect(reply?.reply).toContain('AI Tutor');
    expect(reply?.reply).toContain('Pro');
    expect(siteGuideAnswer('Where is the AI tutor chat?', { ...base, language: 'en' })?.reply).toContain('Pro');
  });

  it('refuses to invent lesson content and hands material questions to the course library', () => {
    expect(siteGuideAnswer('Что такое переменные в Python?', base)).toBeNull();
    expect(siteGuideAnswer('Explain variables', {...base,language:'en'})).toBeNull();
    expect(siteGuideAnswer('What is user experience?', {...base,language:'en'})).toBeNull();
    expect(siteGuideAnswer('Как работает sort() в JavaScript?', base)).toBeNull();
  });

  it('gives an unstarted-course recommendation and greets in the UI language', () => {
    const fresh = guideContext({ language: 'en', selectedCourse: 'go', progress: { completedTopics: [], completedPractice: [], confirmedDays: [], masteredQuestions: [] } });
    expect(siteGuideAnswer('what should I do next?', fresh)?.reply).toContain('day 1');
    expect(agentTrackLine('python', 'ru')).toContain('Python');
    expect(agentTrackLine('javascript', 'ru')).toContain('JavaScript · Pro');
  });
});
