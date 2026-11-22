import type { InterfaceLocale } from '@/lib/locale';

/** Text of the AI Tutor chat that is not in the shared learning copy. */
export const TUTOR_COPY: Record<
  InterfaceLocale,
  {
    welcome: string;
    resize: string;
    sendHint: string;
    openLesson: string;
    openAnswers: string;
    warningBadge: string;
    blockedBanner: string;
    webSources: string;
  }
> = {
  ru: {
    welcome:
      'Здравствуйте! Я AI Tutor DevAtlas. Задавайте вопросы по любому из 43 курсов своими словами — сразу найду нужный урок с прямой ссылкой или объясню с примером. Пожалуйста, оставайтесь в рамках курсов (3 предупреждения = блок на 3 дня).',
    resize: 'Изменить ширину чата',
    sendHint: 'Enter — отправить · Shift+Enter — новая строка',
    openLesson: 'Открыть урок',
    openAnswers: 'Ответы и разбор',
    warningBadge: 'Предупреждение',
    blockedBanner: 'AI Tutor временно заблокирован на 3 дня (3/3 предупреждения).',
    webSources: 'Источники из сети:',
  },
  tg: {
    welcome:
      'Салом! Ман AI Tutor-и DevAtlas ҳастам. Дар бораи ҳар яке аз 43 курс бо суханони худ савол диҳед — фавран аз дарс бо ссылкаи мустақим меёбам ё бо мисол мефаҳмонам. Танҳо дар доираи курсҳо нависед (3 огоҳӣ = басташавӣ барои 3 рӯз).',
    resize: 'Тағйир додани паҳнои чат',
    sendHint: 'Enter — фиристодан · Shift+Enter — сатри нав',
    openLesson: 'Кушодани дарс',
    openAnswers: 'Ҷавобҳо ва таҳлил',
    warningBadge: 'Огоҳӣ',
    blockedBanner: 'AI Tutor барои 3 рӯз баста шудааст (3/3 огоҳӣ).',
    webSources: 'Манбаъҳои интернет:',
  },
  en: {
    welcome:
      'Hello! I am AI Tutor for DevAtlas. Ask about any of our 43 courses in your own words — I will link straight to the lesson or explain with clear examples. Please stay within course topics (3 warnings = 3-day block).',
    resize: 'Resize chat panel',
    sendHint: 'Enter to send · Shift+Enter for a new line',
    openLesson: 'Open lesson',
    openAnswers: 'Q&A & breakdown',
    warningBadge: 'Warning',
    blockedBanner: 'AI Tutor is blocked for 3 days (3/3 warnings).',
    webSources: 'Web references:',
  },
  es: {
    welcome:
      '¡Hola! Soy AI Tutor de DevAtlas. Pregunta sobre cualquiera de nuestros 43 cursos con tus propias palabras: enlazo directo a la lección o explico con ejemplos. Mantente en los temas de los cursos (3 avisos = bloqueo de 3 días).',
    resize: 'Ajustar el ancho del chat',
    sendHint: 'Enter para enviar · Shift+Enter para una línea nueva',
    openLesson: 'Abrir lección',
    openAnswers: 'Respuestas',
    warningBadge: 'Aviso',
    blockedBanner: 'AI Tutor está bloqueado durante 3 días (3/3 avisos).',
    webSources: 'Fuentes web:',
  },
};
