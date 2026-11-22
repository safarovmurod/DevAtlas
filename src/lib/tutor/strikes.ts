import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { ModerationSummary, TutorStrikeNotice } from './shared';
import type { TutorLanguage } from './scope';
import { PROFANITY_MAX_STRIKES, profanityStrikeMessage } from './profanity';

export const TUTOR_MAX_STRIKES = 3 as const;
export const TUTOR_BLOCK_DURATION_MS = 3 * 24 * 60 * 60 * 1000;

export { PROFANITY_MAX_STRIKES, profanityStrikeMessage };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_LOCAL_STRIKE_ENTRIES = 5000;

type LocalStrikeRecord = {
  strikes: number;
  blockedUntilMs: number | null;
  profanityStrikes: number;
  profanityBlockedUntilMs: number | null;
  updatedAtMs: number;
};
const localStrikes = new Map<string, LocalStrikeRecord>();

function pruneLocalStrikes(nowMs: number) {
  if (localStrikes.size <= MAX_LOCAL_STRIKE_ENTRIES) return;
  for (const [key, entry] of localStrikes) {
    const offDone = entry.blockedUntilMs !== null && entry.blockedUntilMs <= nowMs;
    const profDone =
      entry.profanityBlockedUntilMs !== null && entry.profanityBlockedUntilMs <= nowMs;
    if ((offDone && profDone) || nowMs - entry.updatedAtMs > TUTOR_BLOCK_DURATION_MS) {
      localStrikes.delete(key);
    }
  }
  if (localStrikes.size > MAX_LOCAL_STRIKE_ENTRIES) {
    for (const key of localStrikes.keys()) {
      localStrikes.delete(key);
      if (localStrikes.size <= MAX_LOCAL_STRIKE_ENTRIES) break;
    }
  }
}

export function resetLocalTutorStrikes() {
  localStrikes.clear();
}

function emptyNotice(kind: 'off_topic' | 'profanity'): TutorStrikeNotice {
  return {
    kind,
    strikes: 0,
    maxStrikes: kind === 'profanity' ? PROFANITY_MAX_STRIKES : TUTOR_MAX_STRIKES,
    blocked: false,
    blockedUntil: null,
  };
}

function normalizeRpcRow(data: unknown, kind: 'off_topic' | 'profanity'): TutorStrikeNotice | null {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== 'object') return null;
  const max = kind === 'profanity' ? PROFANITY_MAX_STRIKES : TUTOR_MAX_STRIKES;
  const record = row as { strikes?: unknown; blocked?: unknown; blocked_until?: unknown };
  const strikes =
    typeof record.strikes === 'number' && Number.isFinite(record.strikes)
      ? Math.max(0, Math.min(max, Math.trunc(record.strikes)))
      : 0;
  const blockedUntil = typeof record.blocked_until === 'string' ? record.blocked_until : null;
  const blocked = record.blocked === true && blockedUntil !== null;
  return {
    kind,
    strikes,
    maxStrikes: max,
    blocked,
    blockedUntil: blocked ? blockedUntil : null,
  };
}

function buildSummary(
  offTopic: TutorStrikeNotice,
  profanity: TutorStrikeNotice,
): ModerationSummary {
  if (profanity.blocked && profanity.blockedUntil) {
    return {
      offTopic,
      profanity,
      blocked: true,
      blockReason: 'profanity',
      blockedUntil: profanity.blockedUntil,
    };
  }
  if (offTopic.blocked && offTopic.blockedUntil) {
    return {
      offTopic,
      profanity,
      blocked: true,
      blockReason: 'off_topic',
      blockedUntil: offTopic.blockedUntil,
    };
  }
  return { offTopic, profanity, blocked: false, blockReason: null, blockedUntil: null };
}

function getLocalStrikeStatus(userId: string, nowMs = Date.now()): TutorStrikeNotice {
  const entry = localStrikes.get(userId);
  if (!entry) return emptyNotice('off_topic');
  if (entry.blockedUntilMs !== null) {
    if (entry.blockedUntilMs > nowMs) {
      return {
        kind: 'off_topic',
        strikes: TUTOR_MAX_STRIKES,
        maxStrikes: TUTOR_MAX_STRIKES,
        blocked: true,
        blockedUntil: new Date(entry.blockedUntilMs).toISOString(),
      };
    }
    entry.strikes = 0;
    entry.blockedUntilMs = null;
    return emptyNotice('off_topic');
  }
  return {
    kind: 'off_topic',
    strikes: Math.max(0, Math.min(TUTOR_MAX_STRIKES, entry.strikes)),
    maxStrikes: TUTOR_MAX_STRIKES,
    blocked: false,
    blockedUntil: null,
  };
}

function getLocalProfanityStatus(userId: string, nowMs = Date.now()): TutorStrikeNotice {
  const entry = localStrikes.get(userId);
  if (!entry) return emptyNotice('profanity');
  if (entry.profanityBlockedUntilMs !== null) {
    if (entry.profanityBlockedUntilMs > nowMs) {
      return {
        kind: 'profanity',
        strikes: PROFANITY_MAX_STRIKES,
        maxStrikes: PROFANITY_MAX_STRIKES,
        blocked: true,
        blockedUntil: new Date(entry.profanityBlockedUntilMs).toISOString(),
      };
    }
    entry.profanityStrikes = 0;
    entry.profanityBlockedUntilMs = null;
    return emptyNotice('profanity');
  }
  return {
    kind: 'profanity',
    strikes: Math.max(0, Math.min(PROFANITY_MAX_STRIKES, entry.profanityStrikes)),
    maxStrikes: PROFANITY_MAX_STRIKES,
    blocked: false,
    blockedUntil: null,
  };
}

function recordLocalStrike(userId: string, nowMs = Date.now()): TutorStrikeNotice {
  const existing = localStrikes.get(userId);
  if (existing && existing.blockedUntilMs !== null && existing.blockedUntilMs > nowMs) {
    return {
      kind: 'off_topic',
      strikes: TUTOR_MAX_STRIKES,
      maxStrikes: TUTOR_MAX_STRIKES,
      blocked: true,
      blockedUntil: new Date(existing.blockedUntilMs).toISOString(),
    };
  }
  const expiredBlock =
    existing && existing.blockedUntilMs !== null && existing.blockedUntilMs <= nowMs;
  const nextStrikes =
    !existing || expiredBlock ? 1 : Math.min(TUTOR_MAX_STRIKES, existing.strikes + 1);
  const blockedUntilMs = nextStrikes >= TUTOR_MAX_STRIKES ? nowMs + TUTOR_BLOCK_DURATION_MS : null;
  localStrikes.set(userId, {
    strikes: nextStrikes,
    blockedUntilMs,
    profanityStrikes: existing?.profanityStrikes ?? 0,
    profanityBlockedUntilMs: existing?.profanityBlockedUntilMs ?? null,
    updatedAtMs: nowMs,
  });
  pruneLocalStrikes(nowMs);
  return {
    kind: 'off_topic',
    strikes: nextStrikes,
    maxStrikes: TUTOR_MAX_STRIKES,
    blocked: blockedUntilMs !== null,
    blockedUntil: blockedUntilMs !== null ? new Date(blockedUntilMs).toISOString() : null,
  };
}

function recordLocalProfanityStrike(userId: string, nowMs = Date.now()): TutorStrikeNotice {
  const existing = localStrikes.get(userId);
  if (
    existing &&
    existing.profanityBlockedUntilMs !== null &&
    existing.profanityBlockedUntilMs > nowMs
  ) {
    return {
      kind: 'profanity',
      strikes: PROFANITY_MAX_STRIKES,
      maxStrikes: PROFANITY_MAX_STRIKES,
      blocked: true,
      blockedUntil: new Date(existing.profanityBlockedUntilMs).toISOString(),
    };
  }
  const expiredBlock =
    existing &&
    existing.profanityBlockedUntilMs !== null &&
    existing.profanityBlockedUntilMs <= nowMs;
  const nextStrikes =
    !existing || expiredBlock ? 1 : Math.min(PROFANITY_MAX_STRIKES, existing.profanityStrikes + 1);
  const blockedUntilMs =
    nextStrikes >= PROFANITY_MAX_STRIKES ? nowMs + TUTOR_BLOCK_DURATION_MS : null;
  localStrikes.set(userId, {
    strikes: existing?.strikes ?? 0,
    blockedUntilMs: existing?.blockedUntilMs ?? null,
    profanityStrikes: nextStrikes,
    profanityBlockedUntilMs: blockedUntilMs,
    updatedAtMs: nowMs,
  });
  pruneLocalStrikes(nowMs);
  return {
    kind: 'profanity',
    strikes: nextStrikes,
    maxStrikes: PROFANITY_MAX_STRIKES,
    blocked: blockedUntilMs !== null,
    blockedUntil: blockedUntilMs !== null ? new Date(blockedUntilMs).toISOString() : null,
  };
}

export async function getModerationStatus(userId: string | null): Promise<ModerationSummary> {
  const key = userId?.trim();
  if (!key) return buildSummary(emptyNotice('off_topic'), emptyNotice('profanity'));
  const admin = UUID_RE.test(key) ? getSupabaseAdminClient() : null;
  if (admin) {
    try {
      const result = await admin.rpc('react_mentor_get_moderation_status', { learner_id: key });
      if (!result.error) {
        const row = Array.isArray(result.data) ? result.data[0] : result.data;
        if (row && typeof row === 'object') {
          const r = row as Record<string, unknown>;
          const otUntil =
            typeof r.off_topic_blocked_until === 'string' ? r.off_topic_blocked_until : null;
          const prUntil =
            typeof r.profanity_blocked_until === 'string' ? r.profanity_blocked_until : null;
          const offTopic: TutorStrikeNotice = {
            kind: 'off_topic',
            strikes:
              typeof r.off_topic_strikes === 'number'
                ? Math.max(0, Math.min(TUTOR_MAX_STRIKES, Math.trunc(r.off_topic_strikes)))
                : 0,
            maxStrikes: TUTOR_MAX_STRIKES,
            blocked: r.off_topic_blocked === true && otUntil !== null,
            blockedUntil: r.off_topic_blocked === true ? otUntil : null,
          };
          const profanity: TutorStrikeNotice = {
            kind: 'profanity',
            strikes:
              typeof r.profanity_strikes === 'number'
                ? Math.max(0, Math.min(PROFANITY_MAX_STRIKES, Math.trunc(r.profanity_strikes)))
                : 0,
            maxStrikes: PROFANITY_MAX_STRIKES,
            blocked: r.profanity_blocked === true && prUntil !== null,
            blockedUntil: r.profanity_blocked === true ? prUntil : null,
          };
          return buildSummary(offTopic, profanity);
        }
      }
    } catch {
      // Fall back to older RPC / local state.
    }
  }
  const offTopic = await getTutorStrikeStatus(key);
  const profanity = getLocalProfanityStatus(key);
  return buildSummary(offTopic, profanity);
}

export async function getTutorStrikeStatus(userId: string | null): Promise<TutorStrikeNotice> {
  const key = userId?.trim();
  if (!key) return emptyNotice('off_topic');
  const admin = UUID_RE.test(key) ? getSupabaseAdminClient() : null;
  if (admin) {
    try {
      const result = await admin.rpc('react_mentor_get_tutor_strike', { learner_id: key });
      if (!result.error) {
        const parsed = normalizeRpcRow(result.data, 'off_topic');
        if (parsed) return parsed;
      }
    } catch {
      // Fall back to process-local state if Supabase RPC is unreachable.
    }
  }
  return getLocalStrikeStatus(key);
}

export async function recordTutorStrike(userId: string | null): Promise<TutorStrikeNotice> {
  const key = userId?.trim() || 'anonymous-local';
  const admin = UUID_RE.test(key) ? getSupabaseAdminClient() : null;
  if (admin) {
    try {
      const result = await admin.rpc('react_mentor_record_tutor_strike', { learner_id: key });
      if (!result.error) {
        const parsed = normalizeRpcRow(result.data, 'off_topic');
        if (parsed) return parsed;
      }
    } catch {
      // Fall back to process-local strike tracking if RPC fails.
    }
  }
  return recordLocalStrike(key);
}

export async function recordProfanityStrike(userId: string | null): Promise<TutorStrikeNotice> {
  const key = userId?.trim() || 'anonymous-local';
  const admin = UUID_RE.test(key) ? getSupabaseAdminClient() : null;
  if (admin) {
    try {
      const result = await admin.rpc('react_mentor_record_profanity_strike', { learner_id: key });
      if (!result.error) {
        const parsed = normalizeRpcRow(result.data, 'profanity');
        if (parsed) return parsed;
      }
    } catch {
      // Fall back to process-local strike tracking if RPC fails.
    }
  }
  return recordLocalProfanityStrike(key);
}

export async function resetUserModeration(userId: string): Promise<boolean> {
  localStrikes.delete(userId);
  const admin = UUID_RE.test(userId) ? getSupabaseAdminClient() : null;
  if (!admin) return true;
  const result = await admin.rpc('react_mentor_reset_moderation', { learner_id: userId });
  if (!result.error) return true;
  // Fallback if newer RPC isn't migrated yet
  const del = await admin.from('react_mentor_tutor_strikes').delete().eq('user_id', userId);
  return !del.error;
}

function formatUnlockDate(blockedUntil: string | null, language: TutorLanguage): string {
  if (!blockedUntil) return '';
  const date = new Date(blockedUntil);
  if (Number.isNaN(date.getTime())) return '';
  const locale =
    language === 'tg'
      ? 'ru-RU'
      : language === 'ru'
        ? 'ru-RU'
        : language === 'es'
          ? 'es-ES'
          : 'en-US';
  try {
    return (
      new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC',
      }).format(date) + ' UTC'
    );
  } catch {
    return blockedUntil.slice(0, 16).replace('T', ' ') + ' UTC';
  }
}

export function tutorStrikeMessage(notice: TutorStrikeNotice, language: TutorLanguage): string {
  if (notice.kind === 'profanity') return profanityStrikeMessage(notice, language);
  const until = formatUnlockDate(notice.blockedUntil, language);
  if (notice.blocked || notice.strikes >= TUTOR_MAX_STRIKES) {
    const suffix = until ? ` (${until})` : '';
    return {
      tg: `⛔ Огоҳӣ 3/3 — дастрасӣ ба AI Tutor ва ёрдамчии овозӣ барои 3 рӯз баста шуд${suffix}. Шумо 3 маротиба берун аз мавзӯи курсҳои DevAtlas дархост фиристодед. Маводи дарсҳо, тестҳо ва ҷавобҳо дар сайт кушода мемонанд.`,
      ru: `⛔ Предупреждение 3/3 — доступ к AI Tutor и голосовому ассистенту заблокирован на 3 дня${suffix}. Вы 3 раза отправили запрос вне тем курсов DevAtlas. Уроки, тесты и ответы на сайте остаются доступны.`,
      en: `⛔ Warning 3/3 — AI Tutor and Voice Instructor access is blocked for 3 days${suffix}. You sent 3 requests outside DevAtlas course topics. Lessons, quizzes and answers on the site remain open.`,
      es: `⛔ Aviso 3/3 — el acceso a AI Tutor y al asistente de voz está bloqueado durante 3 días${suffix}. Enviaste 3 solicitudes fuera de los temas de los cursos de DevAtlas. Las lecciones, pruebas y respuestas siguen disponibles.`,
    }[language];
  }

  if (notice.strikes === 2) {
    return {
      tg: '⚠️ Огоҳии 2/3 (охирин огоҳӣ): Ин мавзӯъ берун аз курсҳои DevAtlas аст. Як қоидавайронкунии дигар — ва AI Tutor барои 3 рӯз баста мешавад. Лутфан танҳо дар бораи курсҳо, дарсҳо ва код савол диҳед (масалан: «HTML чист?» ё «useState-ро фаҳмон»).',
      ru: '⚠️ Предупреждение 2/3 (последнее): эта тема выходит за рамки курсов DevAtlas. Ещё одно нарушение — и AI Tutor будет заблокирован на 3 дня. Спрашивайте только по курсам, урокам и коду (например: «что такое HTML?» или «объясни useState»).',
      en: '⚠️ Warning 2/3 (final warning): this request is outside DevAtlas course topics. One more violation will block AI Tutor for 3 days. Please ask only about DevAtlas courses, lessons and code (e.g. "what is HTML?" or "explain useState").',
      es: '⚠️ Aviso 2/3 (último aviso): esta solicitud está fuera de los cursos de DevAtlas. Una infracción más bloqueará AI Tutor durante 3 días. Pregunta solo sobre cursos, lecciones y código.',
    }[language];
  }

  return {
    tg: '⚠️ Огоҳӣ 1/3: Ин савол берун аз мавзӯи курсҳои DevAtlas аст. Маро барои омӯзиши курсҳо истифода баред — масалан пурсед: «useState чист?», «дарси CSS Flexbox-ро кушо» ё «коди маро фаҳмон». Боз 2 огоҳии дигар шавад, барои 3 рӯз гап зада наметавонед.',
    ru: '⚠️ Предупреждение 1/3: этот вопрос выходит за рамки курсов DevAtlas. Обращайтесь ко мне по темам курсов — например: «что такое useState?», «открой урок CSS Flexbox» или «объясни мой код». Ещё 2 предупреждения — и доступ закроется на 3 дня.',
    en: '⚠️ Warning 1/3: this question is outside DevAtlas courses. Ask me about any course topic — for example: "what is useState?", "open CSS Flexbox", or "explain my code". Two more warnings will block access for 3 days.',
    es: '⚠️ Aviso 1/3: esta pregunta está fuera de los cursos de DevAtlas. Pregúntame sobre los cursos — por ejemplo: "¿qué es useState?" o "explica mi código". Dos avisos más bloquearán el acceso por 3 días.',
  }[language];
}
