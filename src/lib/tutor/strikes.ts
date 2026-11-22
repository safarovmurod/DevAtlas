import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { TutorStrikeNotice } from './shared';
import type { TutorLanguage } from './scope';

export const TUTOR_MAX_STRIKES = 3 as const;
export const TUTOR_BLOCK_DURATION_MS = 3 * 24 * 60 * 60 * 1000;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_LOCAL_STRIKE_ENTRIES = 5000;

type LocalStrikeRecord = { strikes: number; blockedUntilMs: number | null; updatedAtMs: number };
const localStrikes = new Map<string, LocalStrikeRecord>();

function pruneLocalStrikes(nowMs: number) {
  if (localStrikes.size <= MAX_LOCAL_STRIKE_ENTRIES) return;
  for (const [key, entry] of localStrikes) {
    if (
      (entry.blockedUntilMs !== null && entry.blockedUntilMs <= nowMs) ||
      nowMs - entry.updatedAtMs > TUTOR_BLOCK_DURATION_MS
    ) {
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

function normalizeRpcRow(data: unknown): TutorStrikeNotice | null {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== 'object') return null;
  const record = row as { strikes?: unknown; blocked?: unknown; blocked_until?: unknown };
  const strikes =
    typeof record.strikes === 'number' && Number.isFinite(record.strikes)
      ? Math.max(0, Math.min(TUTOR_MAX_STRIKES, Math.trunc(record.strikes)))
      : 0;
  const blockedUntil = typeof record.blocked_until === 'string' ? record.blocked_until : null;
  const blocked = record.blocked === true && blockedUntil !== null;
  return {
    strikes,
    maxStrikes: TUTOR_MAX_STRIKES,
    blocked,
    blockedUntil: blocked ? blockedUntil : null,
  };
}

function getLocalStrikeStatus(userId: string, nowMs = Date.now()): TutorStrikeNotice {
  const entry = localStrikes.get(userId);
  if (!entry) {
    return { strikes: 0, maxStrikes: TUTOR_MAX_STRIKES, blocked: false, blockedUntil: null };
  }
  if (entry.blockedUntilMs !== null) {
    if (entry.blockedUntilMs > nowMs) {
      return {
        strikes: TUTOR_MAX_STRIKES,
        maxStrikes: TUTOR_MAX_STRIKES,
        blocked: true,
        blockedUntil: new Date(entry.blockedUntilMs).toISOString(),
      };
    }
    localStrikes.delete(userId);
    return { strikes: 0, maxStrikes: TUTOR_MAX_STRIKES, blocked: false, blockedUntil: null };
  }
  return {
    strikes: Math.max(0, Math.min(TUTOR_MAX_STRIKES, entry.strikes)),
    maxStrikes: TUTOR_MAX_STRIKES,
    blocked: false,
    blockedUntil: null,
  };
}

function recordLocalStrike(userId: string, nowMs = Date.now()): TutorStrikeNotice {
  const existing = localStrikes.get(userId);
  if (existing && existing.blockedUntilMs !== null && existing.blockedUntilMs > nowMs) {
    return {
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
    updatedAtMs: nowMs,
  });
  pruneLocalStrikes(nowMs);
  return {
    strikes: nextStrikes,
    maxStrikes: TUTOR_MAX_STRIKES,
    blocked: blockedUntilMs !== null,
    blockedUntil: blockedUntilMs !== null ? new Date(blockedUntilMs).toISOString() : null,
  };
}

export async function getTutorStrikeStatus(userId: string | null): Promise<TutorStrikeNotice> {
  const key = userId?.trim();
  if (!key) {
    return { strikes: 0, maxStrikes: TUTOR_MAX_STRIKES, blocked: false, blockedUntil: null };
  }
  const admin = UUID_RE.test(key) ? getSupabaseAdminClient() : null;
  if (admin) {
    try {
      const result = await admin.rpc('react_mentor_get_tutor_strike', { learner_id: key });
      if (!result.error) {
        const parsed = normalizeRpcRow(result.data);
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
        const parsed = normalizeRpcRow(result.data);
        if (parsed) return parsed;
      }
    } catch {
      // Fall back to process-local strike tracking if RPC fails.
    }
  }
  return recordLocalStrike(key);
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
  const until = formatUnlockDate(notice.blockedUntil, language);
  if (notice.blocked || notice.strikes >= TUTOR_MAX_STRIKES) {
    const suffix = until ? ` (${until})` : '';
    return {
      tg: `⛔ Огоҳӣ 3/3 — дастрасӣ ба AI Tutor барои 3 рӯз баста шуд${suffix}. Шумо 3 маротиба берун аз мавзӯи курсҳои DevAtlas дархост фиристодед. Маводи дарсҳо, тестҳо ва ҷавобҳо дар сайт кушода мемонанд.`,
      ru: `⛔ Предупреждение 3/3 — доступ к AI Tutor заблокирован на 3 дня${suffix}. Вы 3 раза отправили запрос вне тем курсов DevAtlas. Уроки, тесты и ответы на сайте остаются доступны.`,
      en: `⛔ Warning 3/3 — AI Tutor access is blocked for 3 days${suffix}. You sent 3 requests outside DevAtlas course topics. Lessons, quizzes and answers on the site remain open.`,
      es: `⛔ Aviso 3/3 — el acceso a AI Tutor está bloqueado durante 3 días${suffix}. Enviaste 3 solicitudes fuera de los temas de los cursos de DevAtlas. Las lecciones, pruebas y respuestas siguen disponibles.`,
    }[language];
  }

  if (notice.strikes === 2) {
    return {
      tg: '⚠️ Огоҳии 2/3 (охирин огоҳӣ): Ин мавзӯъ берун аз курсҳои DevAtlas аст. Як қоидавайронкунии дигар — ва AI Tutor барои 3 рӯз баста мешавад. Лутфан танҳо дар бораи курсҳо, дарсҳо ва код савол диҳед.',
      ru: '⚠️ Предупреждение 2/3 (последнее): эта тема выходит за рамки курсов DevAtlas. Ещё одно нарушение — и AI Tutor будет заблокирован на 3 дня. Задавайте вопросы только по курсам, урокам и коду.',
      en: '⚠️ Warning 2/3 (final warning): this request is outside DevAtlas course topics. One more violation will block AI Tutor for 3 days. Please ask only about DevAtlas courses, lessons and code.',
      es: '⚠️ Aviso 2/3 (último aviso): esta solicitud está fuera de los cursos de DevAtlas. Una infracción más bloqueará AI Tutor durante 3 días. Pregunta solo sobre cursos, lecciones y código.',
    }[language];
  }

  return {
    tg: '⚠️ Огоҳӣ 1/3: Ин савол берун аз мавзӯи курсҳои DevAtlas аст (ё дархости сохтани файлу маводи бегона мебошад). Лутфан танҳо дар бораи курсҳои сайт савол диҳед — баъди 3 огоҳӣ AI Tutor барои 3 рӯз баста мешавад.',
    ru: '⚠️ Предупреждение 1/3: этот вопрос выходит за рамки курсов DevAtlas (или запрашивает создание постороннего файла/материала). Задавайте вопросы только по курсам сайта — после 3 предупреждений AI Tutor блокируется на 3 дня.',
    en: '⚠️ Warning 1/3: this request is outside DevAtlas courses (or asks to create an unrelated file/document). Please ask only about DevAtlas courses — after 3 warnings AI Tutor is blocked for 3 days.',
    es: '⚠️ Aviso 1/3: esta solicitud está fuera de los cursos de DevAtlas (o pide crear un archivo/material ajeno). Pregunta solo sobre los cursos del sitio: tras 3 avisos, AI Tutor se bloquea por 3 días.',
  }[language];
}
