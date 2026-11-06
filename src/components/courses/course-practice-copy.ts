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
  uk: {
    doctype: 'Оголошено документ HTML: <!doctype html>',
    language: 'Для html указано мову lang',
    encoding: 'Указано кодування UTF-8',
    viewport: 'Додано viewport із width=device-width',
    title: 'Сторінка має непорожній title',
    heading: 'У main є непорожній заголовок h1',
    paragraph: 'У main є абзац p з вашим текстом',
    link: 'Є змістовне HTTPS-посилання на документацію',
  },
  ja: {
    doctype: 'HTML文書を宣言する：<!doctype html>',
    language: 'htmlのlang属性に言語を指定する',
    encoding: '文字コードUTF-8を指定する',
    viewport: 'viewportにwidth=device-widthを指定する',
    title: 'ページに空でないtitleを付ける',
    heading: 'main内に空でないh1見出しを置く',
    paragraph: 'main内のp要素に自分の文章を書く',
    link: '説明文のあるHTTPSのドキュメントリンクを追加する',
  },
  ko: {
    doctype: 'HTML 문서 선언: <!doctype html>',
    language: 'html의 lang 속성에 언어 지정',
    encoding: 'UTF-8 문자 인코딩 지정',
    viewport: 'viewport에 width=device-width 추가',
    title: '비어 있지 않은 페이지 title 작성',
    heading: 'main 안에 비어 있지 않은 h1 제목 추가',
    paragraph: 'main 안의 p 요소에 내 문장 작성',
    link: '설명 텍스트가 있는 HTTPS 문서 링크 추가',
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
    passed: 'Все проверки пройдены. Практика сохранена.',
    failed: 'Исправьте отмеченные требования и проверьте ещё раз.',
    note: 'Проверяем структуру страницы, а не совпадение с примером. Ваши слова и оформление могут отличаться.',
    local: 'Учебная проверка в браузере. Это не серверная аттестация.',
    serverVerified: 'Решение подтверждено сервером. XP начислен в защищённом журнале.',
    serverUnavailable:
      'Серверная проверка недоступна. Учебный результат сохранён только локально; попробуйте позже.',
  },
  tg: {
    instructions: 'Шарти супориш',
    verify: 'Санҷидани ҳалли масъала',
    passed: 'Ҳамаи санҷишҳо гузаштанд. Практика сабт шуд.',
    failed: 'Талаботи ишорашударо ислоҳ карда, боз санҷед.',
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
    passed: 'All checks passed. Practice saved.',
    failed: 'Fix the highlighted requirements and try again.',
    note: 'We check document structure, not a match with the reference. Your wording and styling may differ.',
    local: 'Learning check in your browser, not a server-verified assessment.',
    serverVerified: 'Server verified. XP recorded in the protected ledger.',
    serverUnavailable:
      'Server assessment unavailable. Your learning result is local only; retry later.',
  },
  uk: {
    instructions: 'Умова завдання',
    verify: 'Перевірити розв’язання',
    passed: 'Усі перевірки пройдено. Практику збережено.',
    failed: 'Виправте позначені вимоги й перевірте ще раз.',
    note: 'Перевіряємо структуру сторінки, а не збіг із прикладом. Ваші слова й оформлення можуть відрізнятися.',
    local: 'Навчальна перевірка в браузері. Це не серверне оцінювання.',
    serverVerified: 'Розв’язання підтверджено сервером. XP нараховано в захищеному журналі.',
    serverUnavailable:
      'Серверна перевірка недоступна. Навчальний результат збережено лише локально; спробуйте пізніше.',
  },
  ja: {
    instructions: '課題の説明',
    verify: '解答を確認',
    passed: 'すべての確認項目を満たしました。演習を保存しました。',
    failed: '指摘された項目を修正して、もう一度確認してください。',
    note: '解答例との一致ではなく、ページの構造を確認します。文章や見た目は異なっていても構いません。',
    local: 'ブラウザー内の学習用チェックです。サーバーによる評価ではありません。',
    serverVerified: 'サーバーで解答を確認しました。保護された台帳にXPを記録しました。',
    serverUnavailable:
      'サーバーで評価できませんでした。学習結果はローカルにのみ保存されています。後で再試行してください。',
  },
  ko: {
    instructions: '과제 설명',
    verify: '풀이 확인',
    passed: '모든 확인 항목을 통과했습니다. 실습을 저장했습니다.',
    failed: '표시된 요구 사항을 수정하고 다시 확인하세요.',
    note: '예시와의 일치 여부가 아닌 페이지 구조를 확인합니다. 문장이나 디자인은 달라도 됩니다.',
    local: '브라우저 내 학습용 확인입니다. 서버에서 검증한 평가는 아닙니다.',
    serverVerified: '서버에서 풀이를 검증했습니다. 보호된 원장에 XP를 기록했습니다.',
    serverUnavailable:
      '서버 평가를 이용할 수 없습니다. 학습 결과는 로컬에만 저장되었습니다. 나중에 다시 시도하세요.',
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
