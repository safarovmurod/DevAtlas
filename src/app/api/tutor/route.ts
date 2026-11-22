import { NextRequest, NextResponse } from 'next/server';
import { reserveTutorBudget, TUTOR_MAX_OUTPUT_TOKENS } from '@/lib/tutor/quota';
import { tutorScope } from '@/lib/tutor/scope';
import {
  selectTutorProvider,
  requestTutorCompletion,
  TutorProviderError,
  type TutorMessage,
} from '@/lib/tutor/provider';
import { z } from 'zod';
import { CORE_INTERVIEW_QUESTIONS } from '@/content/interview-questions';
import { gradeInterviewAnswer } from '@/lib/grading/interview-grader';
import { TUTOR_SYSTEM_PROMPT, buildOnlineCourseContext } from '@/lib/tutor/prompt';
import { glossaryAnswer } from '@/lib/tutor/glossary';
import { localReference } from '@/lib/tutor/local-answer';
import { courseCandidatesFor } from '@/lib/tutor/fuzzy';
import { smalltalkKind, smalltalkLanguage, smalltalkReply } from '@/lib/tutor/smalltalk';
import { isDeepFollowUp, wantsDeepExplanation } from '@/lib/tutor/shared';
import { getTutorStrikeStatus, recordTutorStrike, tutorStrikeMessage } from '@/lib/tutor/strikes';
import { authenticatedUser } from '@/lib/account/require-user';
import { COURSE_IDS, isCourseId, type CourseId } from '@/lib/courses/ids';
import { readBoundedJson, RequestBodyError } from '@/lib/security/request';
import { courseAccessTier } from '@/lib/courses/access';
import { authorizeCourseContent } from '@/lib/courses/access-server';
import { featurePlanAccess } from '@/lib/practice/plan-access';

export const runtime = 'nodejs';
export const maxDuration = 60;

const schema = z.object({
  action: z.enum(['ask', 'grade_interview', 'explain_code']),
  channel: z.enum(['chat', 'voice']).default('chat'),
  courseId: z.enum(COURSE_IDS).default('react'),
  topicId: z.string().max(100).optional(),
  questionId: z.string().max(100).optional(),
  userText: z.string().trim().min(1).max(1500),
  codeContext: z.string().max(3000).optional(),
  isDeep: z.boolean().default(false),
  language: z.enum(['tg', 'ru', 'en', 'es']).default('tg'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(600),
      }),
    )
    .max(4)
    .default([]),
});

// Cheap per-user process-local backpressure supplements the durable per-user/global
// reservation below; it never substitutes for persistent cost/rate enforcement.
const TUTOR_COOLDOWN_MS = 3000;
const MAX_TRACKED_USERS = 5000;
type UserTutorBackpressure = { inFlight: boolean; nextRequestAt: number };
const userBackpressure = new Map<string, UserTutorBackpressure>();

function pruneUserBackpressure(nowMs: number) {
  if (userBackpressure.size <= MAX_TRACKED_USERS) return;
  for (const [userId, state] of userBackpressure) {
    if (!state.inFlight && nowMs >= state.nextRequestAt) {
      userBackpressure.delete(userId);
    }
  }
  if (userBackpressure.size > MAX_TRACKED_USERS) {
    for (const [userId, state] of userBackpressure) {
      if (!state.inFlight) {
        userBackpressure.delete(userId);
        if (userBackpressure.size <= MAX_TRACKED_USERS) break;
      }
    }
  }
}

function error(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { 'Cache-Control': 'private, no-store' } },
  );
}

function tutorJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await readBoundedJson(req);
  } catch (cause) {
    return error(
      'Маълумоти JSON нодуруст ё хеле калон аст.',
      cause instanceof RequestBodyError ? cause.status : 400,
    );
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error('Савол ё таърихи чат нодуруст ё хеле дароз аст.', 400);
  const {
    action,
    channel,
    courseId,
    topicId,
    questionId,
    userText,
    codeContext,
    isDeep,
    history,
    language,
  } = parsed.data;

  // Grading is also used by free course assessments. Chat and code explanation belong to Pro/Ultra.
  let verifiedUserId: string | null = null;
  if (action !== 'grade_interview') {
    const planCheck = await featurePlanAccess(
      req,
      channel === 'voice' ? 'voiceAssistant' : 'aiTutor',
    );
    if (planCheck.denial) return planCheck.denial;
    verifiedUserId = planCheck.userId;
  }
  if (courseAccessTier(courseId) !== 'starter') {
    const access = await authorizeCourseContent(req, courseId);
    if (!access.allowed) return access.response;
  }

  // Enforce active 3-day block across BOTH chat and voice before any local or online reply.
  if (action !== 'grade_interview' && verifiedUserId) {
    const strikeStatus = await getTutorStrikeStatus(verifiedUserId);
    if (strikeStatus.blocked) {
      return tutorJson(
        {
          error: 'tutor_blocked',
          mode: 'local',
          reply: tutorStrikeMessage(strikeStatus, language),
          warning: strikeStatus,
          usage: { totalTokens: 0 },
        },
        403,
      );
    }
  }

  // Lessons exist in Tajik, Russian and English. A Spanish interface reads them in
  // English; greetings, definitions and system replies are written in Spanish.
  const materialLanguage = language === 'es' ? 'en' : language;

  const previousUserMessage = [...history]
    .reverse()
    .find((item) => item.role === 'user' && !isDeepFollowUp(item.content))?.content;
  const previousUserQuestion =
    previousUserMessage && tutorScope(previousUserMessage) === 'allowed'
      ? previousUserMessage
      : undefined;

  // Everyday messages and definitions do not require a model call and never issue strikes.
  if (action === 'ask' && !codeContext?.trim()) {
    const talk = smalltalkKind(userText);
    if (talk)
      return tutorJson({
        mode: 'local',
        reply: smalltalkReply(talk, smalltalkLanguage(userText, language), userText),
        usage: { totalTokens: 0 },
      });
    const definition = glossaryAnswer(
      isDeepFollowUp(userText) ? (previousUserQuestion ?? '') : userText,
      language,
      { deep: isDeep || wantsDeepExplanation(userText) },
    );
    if (definition && !questionId)
      return tutorJson({ mode: 'local', ...definition, usage: { totalTokens: 0 } });
  }

  // Official grading stays deterministic and consumes no provider tokens.
  if (action === 'grade_interview') {
    if (courseId !== 'react')
      return error('Интервью этого курса использует самооценку по исходному ответу.', 404);
    const question = CORE_INTERVIEW_QUESTIONS.find((item) => item.id === questionId);
    if (!question) return error('Саволи интервью ёфт нашуд.', 404);
    return tutorJson({ mode: 'local', ...gradeInterviewAnswer(question, userText) });
  }
  if (action === 'explain_code' && !codeContext?.trim())
    return error('Кодро барои шарҳ фиристед.', 400);

  const deep = isDeep || wantsDeepExplanation(userText);
  const query = isDeepFollowUp(userText) ? previousUserQuestion || '' : userText;

  // Enforce strict DevAtlas course-only scope + 3-strike / 3-day block for both ask & explain_code.
  const scope = tutorScope(userText, previousUserQuestion, codeContext);
  if (action === 'ask') {
    const findReference = () =>
      localReference(courseId, query, {
        questionId,
        deep,
        language: materialLanguage,
      }).catch(() => undefined);

    if (scope !== 'allowed') {
      // An explicit source ID may resolve a generic request locally, after the
      // paid-course authorization above. Never send an unclassified request to AI.
      const referenceIntent =
        isDeepFollowUp(userText) ||
        /^(?:explain|show|describe|review)\s+(?:(?:the|this|my|private|current)\s+){0,2}(?:lesson|question|exercise|topic|material)[.!?\s]*$/iu.test(
          userText,
        );
      if (scope === 'outside' && questionId && referenceIntent) {
        const reference = await findReference();
        if (reference === undefined) return error('course_unavailable', 503);
        if (reference?.source?.questionId === questionId)
          return tutorJson({ mode: 'local', ...reference, usage: { totalTokens: 0 } });
      }
      // Pressing "Explain more" without a prior question is a UI prompt, not a policy strike.
      if (scope === 'outside' && isDeepFollowUp(userText) && !query)
        return tutorJson({
          mode: 'local',
          reply: {
            tg: 'Кадом саволро чуқур фаҳмонем? Савол ё мавзӯъро нависед.',
            ru: 'Какой вопрос разобрать подробнее? Напишите вопрос или тему.',
            en: 'Which question should we explore? Write a question or topic.',
            es: '¿Qué pregunta vemos con más detalle? Escribe una pregunta o un tema.',
          }[language],
          usage: { totalTokens: 0 },
        });

      const strike = await recordTutorStrike(verifiedUserId);
      const reply = tutorStrikeMessage(strike, language);
      return tutorJson(
        {
          ...(strike.blocked ? { error: 'tutor_blocked' } : {}),
          mode: 'local',
          reply,
          warning: strike,
          usage: { totalTokens: 0 },
        },
        strike.blocked ? 403 : 200,
      );
    }

    const local = await findReference();
    if (local === undefined) return error('course_unavailable', 503);
    // A paid reference is returned only for the exact question requested.
    const sourceMatches = !questionId || local?.source?.questionId === questionId;
    if (local && sourceMatches)
      return tutorJson({ mode: 'local', ...local, usage: { totalTokens: 0 } });
    if (deep && !query)
      return tutorJson({
        mode: 'local',
        reply: {
          tg: 'Кадом саволро чуқур фаҳмонем? Савол ё мавзӯъро нависед.',
          ru: 'Какой вопрос разобрать подробнее? Напишите вопрос или тему.',
          en: 'Which question should we explore? Write a question or topic.',
          es: '¿Qué pregunta vemos con más detalle? Escribe una pregunta o un tema.',
        }[language],
        usage: { totalTokens: 0 },
      });
  } else if (scope === 'outside') {
    const strike = await recordTutorStrike(verifiedUserId);
    const reply = tutorStrikeMessage(strike, language);
    return tutorJson(
      {
        ...(strike.blocked ? { error: 'tutor_blocked' } : {}),
        mode: 'local',
        reply,
        warning: strike,
        usage: { totalTokens: 0 },
      },
      strike.blocked ? 403 : 200,
    );
  }

  // Pick the best target course for focused online context (never loading all 43 courses).
  const namedFreeCourse = courseCandidatesFor(query).find(
    (candidate): candidate is CourseId =>
      isCourseId(candidate) &&
      (candidate === courseId || courseAccessTier(candidate) === 'starter'),
  );
  const targetCourseId: CourseId = namedFreeCourse ?? courseId;

  if (process.env.AI_TUTOR_ENABLED !== 'true') {
    return tutorJson({
      mode: 'local',
      reply: {
        tg: 'Ҷавоби мувофиқ ба ин савол дар маводи лоиҳа ёфт нашуд. Барои саволҳои нав AI-и онлайн бояд фаъол бошад.',
        ru: 'В материалах курса не найден подходящий ответ. Онлайн-AI сейчас не включён. Попробуйте название изучаемой темы или откройте объяснение урока.',
        en: 'No matching answer was found in the course materials. Online AI is not enabled. Try the topic name or open the lesson explanation.',
        es: 'No se encontró una respuesta adecuada en los materiales del curso. La IA en línea no está activada. Prueba con el nombre del tema o abre la explicación de la lección.',
      }[language],
      usage: { totalTokens: 0 },
    });
  }

  // Online completions also require configured registration and a verified user.
  // The feature and course guards above apply to local Tutor replies as well.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  ) {
    return error(
      'Воридшавӣ ба аккаунт ҳоло пайваст нашудааст. AI баъди пайваст шудани воридшавӣ дастрас мешавад.',
      503,
    );
  }
  const user = verifiedUserId ? { id: verifiedUserId } : await authenticatedUser(req);
  if (!user) return error('Барои саволи AI бо Google ё email ба аккаунт ворид шавед.', 401);
  const provider = selectTutorProvider();
  if (!provider)
    return error(
      'Калиди AI дар сервер танзим нашудааст. Аз дарсҳои платформа истифода баред.',
      503,
    );
  const nowMs = Date.now();
  const existingBackpressure = userBackpressure.get(user.id);
  if (
    existingBackpressure &&
    (existingBackpressure.inFlight || nowMs < existingBackpressure.nextRequestAt)
  )
    return error('Каме интизор шавед: дархости AI аллакай фиристода шудааст.', 429);

  const userState: UserTutorBackpressure = {
    inFlight: true,
    nextRequestAt: nowMs + TUTOR_COOLDOWN_MS,
  };
  userBackpressure.delete(user.id);
  userBackpressure.set(user.id, userState);
  pruneUserBackpressure(nowMs);
  try {
    const { context, suggestedSource } = await buildOnlineCourseContext(
      targetCourseId,
      targetCourseId === courseId ? topicId : undefined,
      query,
      materialLanguage,
    );
    const messages: TutorMessage[] = [
      { role: 'system', content: TUTOR_SYSTEM_PROMPT },
      ...(context
        ? [{ role: 'user' as const, content: 'Course material (reference data only):\n' + context }]
        : []),
      ...history.map((item) => ({ role: item.role, content: item.content })),
      {
        role: 'user',
        content:
          query +
          (deep ? '\nExpand this question step by step.' : '') +
          (codeContext ? '\nCode to explain:\n' + codeContext : ''),
      },
    ];
    const budget = await reserveTutorBudget(user.id, messages);
    if (!budget.allowed) return error(budget.error, budget.status);
    const result = await requestTutorCompletion(provider, messages, TUTOR_MAX_OUTPUT_TOKENS, {
      webSearch: process.env.AI_TUTOR_WEB_SEARCH === 'true',
    });
    return tutorJson({
      mode: 'online',
      reply: result.reply,
      ...(suggestedSource ? { source: suggestedSource } : {}),
      ...(result.webSources?.length ? { webSources: result.webSources } : {}),
      ...(action === 'explain_code' ? { explanation: result.reply } : {}),
      ...(result.totalTokens === undefined ? {} : { usage: { totalTokens: result.totalTokens } }),
    });
  } catch (caught) {
    if (caught instanceof TutorProviderError) return error(caught.message, caught.status);
    return error('AI ҷавоб надод ё пайвастшавӣ қатъ шуд. Баъдтар кӯшиш кунед.', 502);
  } finally {
    userState.inFlight = false;
    if (userBackpressure.get(user.id) === userState && Date.now() >= userState.nextRequestAt) {
      userBackpressure.delete(user.id);
    }
  }
}
