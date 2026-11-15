import type { InterfaceLocale } from '@/lib/locale';

/** Text of the AI Tutor chat that is not in the shared learning copy. */
export const TUTOR_COPY: Record<InterfaceLocale, { welcome: string }> = {
  ru: {
    welcome:
      'Здравствуйте! Я AI Tutor. Пишите вопросы по курсу своими словами, даже с опечатками. Ответ ищу в материалах курса.',
  },
  tg: {
    welcome:
      'Салом! Ман AI Tutor ҳастам. Саволҳоро дар бораи курс бо суханони худ нависед, ҳатто бо хатои имлоӣ. Ҷавобро дар маводи курс меҷӯям.',
  },
  en: {
    welcome:
      'Hello! I am AI Tutor. Ask about your course in your own words, typos included. I look for the answer in the course materials first.',
  },
  es: {
    welcome:
      '¡Hola! Soy AI Tutor. Pregúntame sobre tu curso con tus propias palabras, aunque tengas errores de escritura. Primero busco la respuesta en los materiales del curso.',
  },
};
