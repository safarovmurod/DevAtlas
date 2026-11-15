// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { matchVoiceCommand, voiceHref } from '@/lib/agent/voice-commands';
import { spokenText } from '@/lib/agent/voice-answer';

describe('spoken commands', () => {
  it.each([
    ['открой курсы', '/courses'],
    ['Открой каталог курсов', '/courses'],
    ['курсҳоро кушо', '/courses'],
    ['open the courses', '/courses'],
    ['мой день', '/courses/python/home'],
    ['go to my day', '/courses/python/home'],
    ['рӯзи манро кушо', '/courses/python/home'],
    ['открой план курса', '/courses/python/plan'],
    ['открой тесты', '/courses/python/tests'],
    ['открой практику', '/practice'],
    ['open practice', '/practice'],
    ['открой заметки', '/notes'],
    ['тарифы', '/plans'],
    ['покажи тарифы', '/plans'],
    ['открой сообщество', '/community'],
    ['открой чат сообщества', '/community'],
    ['открой настройки', '/settings'],
    ['покажи мой прогресс', '/progress'],
    ['abre los cursos', '/courses'],
    ['mi día', '/courses/python/home'],
    ['abre el plan del curso', '/courses/python/plan'],
    ['abre las pruebas', '/courses/python/tests'],
    ['abre la práctica', '/practice'],
    ['abre las notas', '/notes'],
    ['planes', '/plans'],
    ['abre la comunidad', '/community'],
    ['abre los ajustes', '/settings'],
    ['muéstrame mi progreso', '/progress'],
  ])('"%s" opens %s', (text, href) => {
    expect(matchVoiceCommand(text, 'python')).toEqual(
      expect.objectContaining({ type: 'navigate', href }),
    );
  });

  it('uses the React routes for the React course and the catalog when no course is chosen', () => {
    expect(voiceHref('myDay', 'react')).toBe('/home');
    expect(voiceHref('tests', 'react')).toBe('/tests');
    expect(voiceHref('answers', 'react')).toBe('/answers');
    expect(voiceHref('myDay', 'unknown-course')).toBe('/courses');
  });

  it.each([
    ['открой AI Tutor', 'tutor'],
    ['открой чат', 'tutor'],
    ['AI Tutor', 'tutor'],
    ['стоп', 'stop'],
    ['stop', 'stop'],
    ['что ты умеешь', 'help'],
    ['help', 'help'],
  ])('"%s" is a %s command', (text, type) => {
    expect(matchVoiceCommand(text, 'python')).toEqual({ type });
  });

  it.each([
    'Где найти курсы?',
    'сколько стоит подписка',
    'что такое практика',
    'как считается мастерство',
    'what is the community',
    'explain react components in my course',
    'привет',
    'салом',
    'контекст',
    '',
  ])('leaves "%s" for the guide or the tutor', (text) => {
    expect(matchVoiceCommand(text, 'python')).toBeNull();
  });
});

describe('speech text', () => {
  it('keeps only the answer, without labels, code and links', () => {
    const reply =
      'Тема: Props\n\nВопрос: Что такое props?\n\nОтвет: Props — данные, которые родитель передаёт компоненту. См. https://react.dev\n\nКод:\nfunction A(props) {}';
    expect(spokenText(reply)).toBe('Props — данные, которые родитель передаёт компоненту. См.');
  });

  it('removes code fences and markdown marks', () => {
    expect(spokenText('Use **const**.\n\n```js\nconst a = 1;\n```\n\nIt cannot change.')).toBe(
      'Use const. It cannot change.',
    );
  });

  it('joins the lines of a guide answer into sentences', () => {
    expect(spokenText('There are three plans.\nStart is free.')).toBe(
      'There are three plans. Start is free.',
    );
  });

  it('cuts long answers at the end of a sentence', () => {
    const long = Array.from({ length: 40 }, (_, index) => `Sentence number ${index} is here.`).join(
      ' ',
    );
    const spoken = spokenText(long, 200);
    expect(spoken.length).toBeLessThanOrEqual(200);
    expect(spoken.endsWith('.')).toBe(true);
  });
});
