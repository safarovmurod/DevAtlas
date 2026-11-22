import type { TutorLanguage } from './scope';
import type { TutorStrikeNotice } from './shared';

export const PROFANITY_MAX_STRIKES = 5 as const;

/**
 * Multi-language profanity and abusive insult detector (Tajik, Russian, English, Spanish).
 * Designed with strict word boundaries so programming terms (class, asset, shell, bash, pass,
 * document, title, fetch, patch, script, git, hello) never trigger false positives.
 */
const PROFANITY_PATTERNS: readonly RegExp[] = [
  // Russian profanity & direct severe insults (Cyrillic + common Latin transliterations)
  /(?:^|[^\p{L}\p{N}])(?:бл+я+[дт]?ь?|бл+я+д(?:ин|ств|ск)|сук+[аиуе]|сучк+[аиу]|ху[йяеюи]|хуёв|хуев|пизд+[аеуыои]|еб+[аоуеёи]|ёб+[ану]|ебан|ёбан|наху[йя]|поху[йя]|заеб|уеб|долбоёб|долбоеб|мудак|мудил|пидор|пидар|гандон|шлюх+[аиу]|мраз[ьи]|урод[ыа]?|дебил[ыа]?|идиот[ыа]?|тупиц[аы]|заткнис[ь]?)(?=[^\p{L}\p{N}]|$)/iu,
  /(?:^|[^\p{L}\p{N}])(?:blya[dt]?|suka|pizd[aeyu]|nahu[iy]|pohu[iy]|ebat|yebat|mudak|pidor|gandon|shlyuha|dolboeb)(?=[^\p{L}\p{N}]|$)/iu,
  // Tajik severe insults & profanity (Cyrillic + Latin)
  /(?:^|[^\p{L}\p{N}])(?:кунте|кунти|қунте|куси?\s*оча|кс[иа]?\s*оча|кер[аи]м|керам|керм|гом|мегом|мегоям|гоидан|харомзода|ҳаромзода|лаънат[иӣ]|гуҳ\s*х[ӯу]р|гух\s*хур|сагбача|беномус|аҳмақ|ахмак|беақл|беакл|шайтонбача|даф\s*шав|гум\s*шав\s*аз\s*ин\s*ҷо)(?=[^\p{L}\p{N}]|$)/iu,
  /(?:^|[^\p{L}\p{N}])(?:kunte|kunti|kusi\s*ocha|keram|megom|megoyam|haromzoda|ahmaq|axmaq|beakl|beaql|daf\s*shav)(?=[^\p{L}\p{N}]|$)/iu,
  // English profanity & severe insults (whole-word boundaries only)
  /(?:^|[^\p{L}\p{N}])(?:f+u+c+k+(?:ing|er|ed|s|off)?|f\*+c?k|sh+i+t+(?:ty|head|s)?|s\*+t|b+i+t+c+h+(?:es|y)?|a+s+s+h+o+l+e+s?|motherfucker|mofo|bastard|dickhead|dumbass|jackass|bullshit|cunt|whore|slut|retard(?:ed)?|stfu|gtfo)(?=[^\p{L}\p{N}]|$)/iu,
  // Spanish profanity & severe insults (whole-word boundaries only)
  /(?:^|[^\p{L}\p{N}])(?:puta|puto|hijo\s+de\s+puta|cabr[oó]n|pendej[oa]|mierda|joder|coño|gilipollas|imb[eé]cil|est[uú]pid[oa]|maric[oó]n|chinga(?:r|do|da)?|verga)(?=[^\p{L}\p{N}]|$)/iu,
];

function normalizeForModeration(raw: string): string {
  return raw
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/[!|]/g, 'i')
    .replace(/\s+/g, ' ')
    .trim();
}

/** True when user text contains profanity or abusive insults. */
export function containsProfanity(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (PROFANITY_PATTERNS.some((pattern) => pattern.test(trimmed))) return true;
  const normalized = normalizeForModeration(trimmed);
  return PROFANITY_PATTERNS.some((pattern) => pattern.test(normalized));
}

function formatUnlockUtc(blockedUntil: string | null, language: TutorLanguage): string {
  if (!blockedUntil) return '';
  const date = new Date(blockedUntil);
  if (Number.isNaN(date.getTime())) return '';
  const locale =
    language === 'tg' || language === 'ru' ? 'ru-RU' : language === 'es' ? 'es-ES' : 'en-US';
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

export function profanityStrikeMessage(notice: TutorStrikeNotice, language: TutorLanguage): string {
  const until = formatUnlockUtc(notice.blockedUntil, language);
  const count = Math.min(PROFANITY_MAX_STRIKES, Math.max(1, notice.strikes));
  const left = Math.max(0, PROFANITY_MAX_STRIKES - count);

  if (notice.blocked || count >= PROFANITY_MAX_STRIKES) {
    const suffix = until ? ` (${until})` : '';
    return {
      tg: `⛔ Огоҳӣ ${PROFANITY_MAX_STRIKES}/${PROFANITY_MAX_STRIKES} — барои ҳақорат ва дағалӣ дастрасӣ ба чат, AI Tutor ва ёрдамчии овозӣ барои 3 рӯз баста шуд${suffix}. Лутфан таймери поёнро бинед ва баъди кушода шудан эҳтиромро риоя кунед.`,
      ru: `⛔ Предупреждение ${PROFANITY_MAX_STRIKES}/${PROFANITY_MAX_STRIKES} — за оскорбления доступ к чату, AI Tutor и голосовому ассистенту заблокирован на 3 дня${suffix}. Смотрите таймер ниже и соблюдайте уважительное общение.`,
      en: `⛔ Warning ${PROFANITY_MAX_STRIKES}/${PROFANITY_MAX_STRIKES} — access to Community Chat, AI Tutor, and Voice Instructor is blocked for 3 days due to abusive language${suffix}. Check the countdown timer below.`,
      es: `⛔ Aviso ${PROFANITY_MAX_STRIKES}/${PROFANITY_MAX_STRIKES} — el acceso al chat, AI Tutor y asistente de voz está bloqueado durante 3 días por lenguaje ofensivo${suffix}. Revisa la cuenta regresiva abajo.`,
    }[language];
  }

  return {
    tg: `⚠️ Огоҳии ҳақорат ${count}/${PROFANITY_MAX_STRIKES}: Дар DevAtlas ҳақорат ва суханони дағал манъ аст. Боз ${left} огоҳии дигар мондааст — баъди ${PROFANITY_MAX_STRIKES} огоҳӣ дастрасӣ барои 3 рӯз баста мешавад. Лутфан бо эҳтиром муроҷиат кунед.`,
    ru: `⚠️ Предупреждение за оскорбление ${count}/${PROFANITY_MAX_STRIKES}: в DevAtlas запрещены мат и оскорбления. Осталось предупреждений: ${left} — после ${PROFANITY_MAX_STRIKES} доступ блокируется на 3 дня. Пожалуйста, общайтесь уважительно.`,
    en: `⚠️ Conduct warning ${count}/${PROFANITY_MAX_STRIKES}: profanity and insults are prohibited on DevAtlas. ${left} remaining before a 3-day block. Please communicate respectfully.`,
    es: `⚠️ Aviso por lenguaje ofensivo ${count}/${PROFANITY_MAX_STRIKES}: los insultos están prohibidos en DevAtlas. Quedan ${left} avisos antes de un bloqueo de 3 días. Por favor, comunícate con respeto.`,
  }[language];
}
