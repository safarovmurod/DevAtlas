import type { HTML_CHECK_IDS } from '@/lib/grading/html-grader';
import type { InterfaceLocale } from '@/lib/locale';

export type HtmlCheckId = (typeof HTML_CHECK_IDS)[number];
/** What the automatic HTML check looks for, as a checklist. */
export const RUBRIC: Record<InterfaceLocale, Record<HtmlCheckId, string>> = {
  ru: {
    doctype: 'Объявлен документ HTML: <!doctype html>',
    language: 'У html указан язык lang',
    encoding: 'Указана кодировка UTF-8',
    viewport: 'Добавлен viewport с width=device-width',
    title: 'У страницы есть непустой title',
    heading: 'В main есть непустой заголовок h1',
    paragraph: 'В main есть абзац p с вашим текстом',
    link: 'Есть непустая ссылка на документацию с HTTPS',
  },
  tg: {
    doctype: 'Ҳуҷҷати HTML эълон шудааст: <!doctype html>',
    language: 'Забони lang дар html навишта шудааст',
    encoding: 'Рамзгузории UTF-8 нишон дода шудааст',
    viewport: 'Viewport дорои width=device-width аст',
    title: 'Саҳифа title-и холӣ надорад',
    heading: 'Дар main сарлавҳаи h1 ҳаст',
    paragraph: 'Дар main матни шумо дар p ҳаст',
    link: 'Пайванди HTTPS ба ҳуҷҷатҳо ҳаст',
  },
  en: {
    doctype: 'Declare an HTML document: <!doctype html>',
    language: 'Set the html lang attribute',
    encoding: 'Declare UTF-8 encoding',
    viewport: 'Add a viewport with width=device-width',
    title: 'Give the page a nonempty title',
    heading: 'Add a nonempty h1 inside main',
    paragraph: 'Add your own paragraph inside main',
    link: 'Add a meaningful HTTPS documentation link',
  },
  es: {
    doctype: 'Declara el documento HTML: <!doctype html>',
    language: 'Indica el idioma con el atributo lang en html',
    encoding: 'Declara la codificación UTF-8',
    viewport: 'Añade un viewport con width=device-width',
    title: 'Da a la página un title que no esté vacío',
    heading: 'Añade un encabezado h1 con texto dentro de main',
    paragraph: 'Añade dentro de main un párrafo p con tu propio texto',
    link: 'Añade un enlace HTTPS con texto a la documentación',
  },
};

type PracticeCopy = Record<
  | 'instructions'
  | 'verify'
  | 'passed'
  | 'failed'
  | 'note'
  | 'local'
  | 'serverVerified'
  | 'serverUnavailable',
  string
>;
/** Text around the practice editor and its checks. */
export const PRACTICE_COPY: Record<InterfaceLocale, PracticeCopy> = {
  ru: {
    instructions: 'Условие задания',
    verify: 'Проверить решение',
    passed: 'Верно. Практика сохранена.',
    failed: 'Неверно. Исправьте:',
    note: 'Проверяем структуру страницы, а не совпадение с примером. Ваши слова и оформление могут отличаться.',
    local: 'Учебная проверка в браузере. Это не серверная аттестация.',
    serverVerified: 'Решение подтверждено сервером. XP начислен в защищённом журнале.',
    serverUnavailable:
      'Серверная проверка недоступна. Учебный результат сохранён только локально; попробуйте позже.',
  },
  tg: {
    instructions: 'Шарти супориш',
    verify: 'Санҷидани ҳалли масъала',
    passed: 'Дуруст. Практика сабт шуд.',
    failed: 'Нодуруст. Ислоҳ кунед:',
    note: 'Сохтори саҳифа санҷида мешавад, на монандии код ба мисол. Матн ва ороиш метавонанд дигар бошанд.',
    local: 'Санҷиши омӯзишӣ дар браузер. Ин аттестатсияи серверӣ нест.',
    serverVerified:
      'Ҳалли масъала аз тарафи сервер тасдиқ шуд. XP дар сабти муҳофизатшуда нигоҳ дошта шуд.',
    serverUnavailable:
      'Санҷиши серверӣ дастрас нест. Натиҷаи омӯзишӣ танҳо маҳаллӣ сабт шуд; баъдтар санҷед.',
  },
  en: {
    instructions: 'Task instructions',
    verify: 'Check solution',
    passed: 'Correct. Practice saved.',
    failed: 'Incorrect. Fix:',
    note: 'We check document structure, not a match with the reference. Your wording and styling may differ.',
    local: 'Learning check in your browser, not a server-verified assessment.',
    serverVerified: 'Server verified. XP recorded in the protected ledger.',
    serverUnavailable:
      'Server assessment unavailable. Your learning result is local only; retry later.',
  },
  es: {
    instructions: 'Enunciado de la tarea',
    verify: 'Comprobar la solución',
    passed: 'Correcto. Práctica guardada.',
    failed: 'Incorrecto. Corrige:',
    note: 'Comprobamos la estructura de la página, no que coincida con el ejemplo. Tus palabras y tu estilo pueden ser distintos.',
    local: 'Comprobación de estudio en el navegador. No es una evaluación del servidor.',
    serverVerified: 'El servidor verificó la solución. El XP se registró en el libro protegido.',
    serverUnavailable:
      'La comprobación del servidor no está disponible. El resultado de estudio solo se guardó en local; inténtalo más tarde.',
  },
};

/** File name shown above the editor, by editor language. */
const FILE_NAMES: Record<string, string> = {
  html: 'index.html',
  css: 'styles.css',
  cpp: 'main.cpp',
  python: 'main.py',
  shell: 'commands.sh',
  java: 'Main.java',
  csharp: 'Program.cs',
  go: 'main.go',
  rust: 'main.rs',
  php: 'main.php',
  ruby: 'main.rb',
  sql: 'lesson.sql',
  javascript: 'solution.js',
  swift: 'main.swift',
  kotlin: 'Main.kt',
};

/** Courses whose files differ from the default for their editor language. */
const COURSE_FILE_NAMES: Record<string, string> = {
  nodejs: 'main.mjs',
  mongodb: 'main.js',
  bash: 'main.sh',
};

export function practiceFileName(courseId: string, editorLanguage: string) {
  return COURSE_FILE_NAMES[courseId] ?? FILE_NAMES[editorLanguage] ?? 'solution.ts';
}
