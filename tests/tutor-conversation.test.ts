// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { canonicalWord, courseFor, editDistance, nearest, topicsIn } from '@/lib/tutor/fuzzy';
import {
  smalltalkKind,
  smalltalkLanguage,
  smalltalkReply,
  type SmalltalkKind,
} from '@/lib/tutor/smalltalk';
import { definitionTopic, glossaryAnswer } from '@/lib/tutor/glossary';
import { tutorScope } from '@/lib/tutor/scope';

const fetchMock = vi.fn();
const authMock = vi.hoisted(() => vi.fn());
const membershipMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/tutor/quota', () => ({
  TUTOR_MAX_OUTPUT_TOKENS: 256,
  reserveTutorBudget: vi.fn().mockResolvedValue({ allowed: true }),
}));
vi.mock('@/lib/account/require-user', () => ({ authenticatedUser: authMock }));
vi.mock('@/lib/supabase/server', () => ({ getSupabaseServerClient: () => ({}) }));
vi.mock('@/lib/billing/entitlements', () => ({ serverMembership: membershipMock }));
const request = (body: unknown) =>
  new NextRequest('http://localhost/api/tutor', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer verified-test-session' },
  });
const ask = { action: 'ask', courseId: 'react', language: 'ru' };

describe('typo-tolerant technology names', () => {
  it('turns spelling variants into the name used in lessons', () => {
    for (const word of ['хтмл', 'html', 'htlm', 'хтмлл', 'html5'])
      expect(canonicalWord(word)).toBe('html');
    expect(canonicalWord('джаваскрипт')).toBe('javascript');
    expect(canonicalWord('javscript')).toBe('javascript');
    expect(canonicalWord('флексбокс')).toBe('flexbox');
    expect(canonicalWord('table')).toBe('table');
  });

  it('counts a swap of neighbours as one typo and gives up beyond the limit', () => {
    expect(editDistance('html', 'htlm', 1)).toBe(1);
    expect(editDistance('flexbox', 'flexbxo', 1)).toBe(1);
    expect(editDistance('react', 'angular', 2)).toBeGreaterThan(2);
    expect(nearest('usestete', ['usestate', 'useeffect'])).toBe('usestate');
    expect(nearest('abc', ['abd'])).toBeUndefined();
  });

  it('finds the course a question is about only when it names one technology', () => {
    expect(courseFor('хтмл что такое')).toBe('html');
    expect(courseFor('как работает флексбокс')).toBe('html');
    expect(courseFor('что такое питон')).toBe('python');
    expect(courseFor('html и css')).toBeNull();
    expect(courseFor('что такое переменная')).toBeNull();
    expect(topicsIn('Node.js и Git')).toEqual(['nodejs', 'git']);
  });
});

describe('everyday messages', () => {
  it.each<[string, SmalltalkKind]>([
    ['салом', 'greeting'],
    ['Ассалому алейкум', 'greeting'],
    ['Привет!', 'greeting'],
    ['Привеееет', 'greeting'],
    ['добрый день', 'greeting'],
    ['Hello there', 'greeting'],
    ['привет, как дела?', 'howAreYou'],
    ['чи хел?', 'howAreYou'],
    ['спасибо', 'thanks'],
    ['раҳмат калон', 'thanks'],
    ['thank you', 'thanks'],
    ['пока', 'bye'],
    ['кто ты', 'identity'],
    ['что ты умеешь', 'capabilities'],
    ['hola', 'greeting'],
    ['Buenos días', 'greeting'],
    ['hola, cómo estás?', 'howAreYou'],
    ['qué tal', 'howAreYou'],
    ['gracias', 'thanks'],
    ['hasta luego', 'bye'],
    ['quién eres', 'identity'],
    ['qué puedes hacer', 'capabilities'],
  ])('recognises "%s" as %s', (text, kind) => {
    expect(smalltalkKind(text)).toBe(kind);
    expect(tutorScope(text)).toBe('greeting');
  });

  it.each([
    'привет, что такое html',
    'что такое переменная',
    'день',
    'tutor',
    'как работает useState',
    '',
  ])('leaves "%s" for the course lookup', (text) => expect(smalltalkKind(text)).toBeNull());

  it('answers in the language the message was written in', () => {
    expect(smalltalkLanguage('салом', 'ru')).toBe('tg');
    expect(smalltalkLanguage('Ассалому алейкум', 'en')).toBe('tg');
    expect(smalltalkLanguage('привет', 'tg')).toBe('ru');
    expect(smalltalkLanguage('hello', 'ru')).toBe('en');
    expect(smalltalkLanguage('hola', 'en')).toBe('es');
    expect(smalltalkLanguage('Buenos días', 'ru')).toBe('es');
    expect(smalltalkLanguage('gracias', 'tg')).toBe('es');
    expect(smalltalkLanguage('', 'ru')).toBe('ru');
  });

  it('answers with a friendly, stable reply', () => {
    expect(smalltalkReply('greeting', 'tg', 'салом')).toMatch(/Салом|Хушҳолам/);
    expect(smalltalkReply('greeting', 'en', 'hello')).toMatch(/Hi!|Hello!/);
    expect(smalltalkReply('greeting', 'es', 'hola')).toMatch(/¡Hola!|¡Buenas!/);
    expect(smalltalkReply('thanks', 'es', 'gracias')).toContain('De nada');
    expect(smalltalkReply('thanks', 'ru', 'спасибо')).toContain('Пожалуйста');
    expect(smalltalkReply('greeting', 'ru', 'привет')).toBe(
      smalltalkReply('greeting', 'ru', 'привет'),
    );
  });
});

describe('what-is questions', () => {
  it.each([
    ['хтмл что такое', 'html'],
    ['html что такое', 'html'],
    ['htlm чист', 'html'],
    ['CSS чист?', 'css'],
    ['What is React?', 'react'],
    ['что такое реакт', 'react'],
    ['js чи аст', 'javascript'],
    ['Что такое гит?', 'git'],
    ['html', 'html'],
    ['¿Qué es HTML?', 'html'],
    ['qué es react', 'react'],
    ['explícame qué es git', 'git'],
  ])('maps "%s" to %s', (text, topic) => expect(definitionTopic(text)).toBe(topic));

  it.each([
    'что такое props',
    'html css что такое',
    'как работает html',
    'Svelte runes чияй?',
    'что такое flexbox',
  ])('does not treat "%s" as a glossary question', (text) =>
    expect(definitionTopic(text)).toBeNull(),
  );

  it('answers in every tutor language with the course link', () => {
    for (const language of ['tg', 'ru', 'en', 'es'] as const) {
      const answer = glossaryAnswer('хтмл что такое', language);
      expect(answer?.reply.length).toBeGreaterThan(60);
      expect(answer?.source.href).toBe('/courses/html/answers');
    }
    expect(glossaryAnswer('what is react', 'en')?.source.href).toBe('/answers');
    expect(glossaryAnswer('what is html', 'en', { deep: true })?.reply).toContain(
      'Answers section',
    );
    expect(glossaryAnswer('¿qué es HTML?', 'es', { deep: true })?.reply).toContain(
      'lenguaje de marcado',
    );
  });
});

describe('Tutor API conversation', () => {
  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('AI_TUTOR_ENABLED', 'false');
    authMock.mockReset();
    authMock.mockResolvedValue({ id: 'verified-pro-user' });
    membershipMock.mockReset();
    membershipMock.mockResolvedValue({ tier: 'pro', available: true });
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('answers "салом" and thanks naturally for Pro without a course lookup or provider tokens', async () => {
    const { POST } = await import('@/app/api/tutor/route');
    for (const [text, language, pattern] of [
      ['салом', 'tg', /Салом/],
      ['привет', 'ru', /Привет|Здравствуйте/],
      ['Hello!', 'en', /Hi!|Hello!/],
      ['спасибо', 'ru', /Пожалуйста/],
      ['ассалому алейкум', 'tg', /Салом|Хушҳолам/],
      ['салом', 'ru', /Салом|Хушҳолам/],
      ['hello', 'ru', /Hi!|Hello!/],
    ] as const) {
      const response = await POST(request({ ...ask, userText: text, language }));
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body).toMatchObject({ mode: 'local', usage: { totalTokens: 0 } });
      expect(body.reply).toMatch(pattern);
      expect(body.reply).not.toContain('не найден');
    }
    expect(fetchMock).not.toHaveBeenCalled();
    expect(authMock).toHaveBeenCalled();
  });

  it('answers "хтмл что такое" with the HTML definition while another course is selected', async () => {
    const { POST } = await import('@/app/api/tutor/route');
    for (const courseId of ['react', 'python', 'html']) {
      const response = await POST(request({ ...ask, courseId, userText: 'хтмл что такое' }));
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.mode).toBe('local');
      expect(body.reply).toMatch(/^HTML — язык разметки/);
      expect(body.source).toMatchObject({ topicId: 'html', href: '/courses/html/answers' });
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('finds a lesson topic from materials despite typos and a wrong selected course', async () => {
    const { POST } = await import('@/app/api/tutor/route');
    const response = await POST(
      request({ ...ask, courseId: 'react', userText: 'флексбокс что такое' }),
    );
    const body = await response.json();
    expect(body.mode).toBe('local');
    expect(body.source.href).toMatch(/^\/courses\/html\/answers#html-day-1[56]$/);
    expect(body.reply.toLowerCase()).toContain('flex');
    const typo = await POST(request({ ...ask, courseId: 'html', userText: 'flexbxo что такое' }));
    expect((await typo.json()).source.href).toMatch(/#html-day-1[56]$/);
  });

  it('still reports honestly when nothing matches and online AI is off', async () => {
    const { POST } = await import('@/app/api/tutor/route');
    const response = await POST(
      request({ ...ask, courseId: 'html', userText: 'zxquantumwidget plasma' }),
    );
    expect((await response.json()).reply).toMatch(/не найден/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps the sign-in gate for online AI on a new subject', async () => {
    authMock.mockResolvedValue(null);
    vi.stubEnv('AI_TUTOR_ENABLED', 'true');
    vi.stubEnv('AI_PROVIDER_KEY', 'test-only-placeholder-not-a-real-key');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'public-example');
    const { POST } = await import('@/app/api/tutor/route');
    const response = await POST(request({ ...ask, userText: 'zxquantumwidget plasma' }));
    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
