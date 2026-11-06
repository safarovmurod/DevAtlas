'use client';
import { courseText, type CourseText } from '@/lib/courses/schema';
import type { InterfaceLocale } from '@/lib/locale';
import { useLearningStore } from '@/stores/learning-store';

/** Text of the guided lesson flow in all six interface languages. */
const t = (
  ru: string,
  tg: string,
  en: string,
  uk: string,
  ja: string,
  ko: string,
): Record<InterfaceLocale, string> => ({ ru, tg, en, uk, ja, ko });
const labels = {
  learn: t('Изучите', 'Омӯзед', 'Learn', 'Вивчіть', '学ぶ', '배우기'),
  understand: t('Поймите', 'Фаҳмед', 'Understand', 'Зрозумійте', '理解する', '이해하기'),
  watch: t('Посмотрите', 'Бинед', 'Watch', 'Подивіться', '見る', '살펴보기'),
  try: t(
    'Попробуйте с подсказкой',
    'Бо маслиҳат санҷед',
    'Try with guidance',
    'Спробуйте з підказкою',
    'ガイド付きで試す',
    '안내에 따라 시도',
  ),
  practice: t(
    'Практикуйтесь самостоятельно',
    'Мустақилона машқ кунед',
    'Practice independently',
    'Практикуйте самостійно',
    '自分で演習',
    '독립적으로 실습',
  ),
  test: t('Проверьте себя', 'Худро санҷед', 'Test', 'Перевірте себе', '確認する', '평가하기'),
  review: t('Повторите', 'Такрор кунед', 'Review', 'Повторіть', '復習する', '복습하기'),
  master: t(
    'Подтвердите освоение',
    'Азхудкуниро тасдиқ кунед',
    'Master',
    'Підтвердьте опанування',
    '習得を確認',
    '숙달 확인',
  ),
  goals: t('Цели дня', 'Ҳадафҳои рӯз', 'Daily objectives', 'Цілі дня', '今日の目標', '오늘의 목표'),
  real: t(
    'Где это пригодится',
    'Ин дар куҷо лозим мешавад',
    'A real-world use',
    'Де це знадобиться',
    '実際の使い道',
    '실제 활용',
  ),
  route: t(
    'Учебный маршрут',
    'Масири омӯзиш',
    'Learning route',
    'Навчальний маршрут',
    '学習ルート',
    '학습 경로',
  ),
  predict: t(
    'Сначала выберите прогноз',
    'Аввал пешгӯиро интихоб кунед',
    'Choose your prediction first',
    'Спочатку оберіть прогноз',
    'まず予想を選ぶ',
    '먼저 결과 예상하기',
  ),
  hint: t('Подсказка', 'Маслиҳат', 'Hint', 'Підказка', 'ヒント', '힌트'),
  correct: t(
    'Прогноз верный',
    'Пешгӯӣ дуруст аст',
    'Correct prediction',
    'Прогноз правильний',
    '予想は正解',
    '올바른 예상',
  ),
  retry: t(
    'Попробуйте ещё раз',
    'Боз кӯшиш кунед',
    'Try again',
    'Спробуйте ще раз',
    'もう一度試す',
    '다시 시도',
  ),
  tab: t(
    'Вкладка браузера',
    'Варақаи браузер',
    'Browser tab',
    'Вкладка браузера',
    'ブラウザーのタブ',
    '브라우저 탭',
  ),
  node: t(
    'Текст выбранного элемента',
    'Матни унсури интихобшуда',
    'Selected element text',
    'Текст вибраного елемента',
    '選択した要素のテキスト',
    '선택한 요소의 텍스트',
  ),
  simplified: t(
    'Упрощённое дерево элементов этого примера: служебные meta и текстовые узлы не показаны. Нажмите title, h1 или p.',
    'Дарахти содакардашудаи унсурҳои ин мисол: meta ва гиреҳҳои матнӣ нишон дода нашудаанд. title, h1 ё p-ро пахш кунед.',
    'Simplified element tree for this example: meta and text nodes are omitted. Select title, h1 or p.',
    'Спрощене дерево прикладу: meta й текстові вузли не показані. Оберіть title, h1 або p.',
    '簡略化した要素ツリーです。metaとテキストノードは省略しています。title、h1、pを選択してください。',
    '이 예제의 단순화한 요소 트리입니다. meta와 텍스트 노드는 생략했습니다. title, h1, p를 선택하세요.',
  ),
  code: t(
    'Код документа',
    'Рамзи ҳуҷҷат',
    'Document code',
    'Код документа',
    'ドキュメントのコード',
    '문서 코드',
  ),
  preview: t(
    'Результат HTML',
    'Натиҷаи HTML',
    'HTML result',
    'Результат HTML',
    'HTMLの表示結果',
    'HTML 결과',
  ),
  challenge: t(
    'Мини-задача',
    'Масъалаи хурд',
    'Mini challenge',
    'Мінізавдання',
    'ミニチャレンジ',
    '미니 과제',
  ),
  example: t(
    'Пример для самопроверки',
    'Намуна барои худсанҷӣ',
    'Self-review example',
    'Приклад для самоперевірки',
    '自己確認の例',
    '자체 검토 예시',
  ),
  open: t(
    'Открыть редактор и проверку',
    'Муҳаррир ва санҷишро кушоед',
    'Open editor and assessment',
    'Відкрити редактор і перевірку',
    'エディターと確認を開く',
    '편집기와 평가 열기',
  ),
  summary: t(
    'Что нужно запомнить',
    'Чиро дар хотир нигоҳ доред',
    'What to remember',
    'Що запам’ятати',
    '覚えておくこと',
    '기억할 내용',
  ),
  threshold: t(
    'Для Mastered нужны успешная проверка практики, ≥80% ответов и все обязательные вопросы. Самопроверка и этот прогноз не начисляют подтверждённое освоение. Ошибки можно исправлять без штрафа.',
    'Барои Mastered санҷиши дурусти машқ, ≥80% ҷавобҳо ва ҳамаи саволҳои ҳатмӣ лозиманд. Худсанҷӣ ва ин пешгӯӣ азхудкунии тасдиқшуда намедиҳанд. Хатоҳоро бе ҷарима ислоҳ кардан мумкин.',
    'Mastered requires passing practice, ≥80% and every critical question. Self review and this prediction do not grant verified mastery. Correct mistakes without a penalty.',
    'Для Mastered потрібні практика, ≥80% і всі обов’язкові питання. Самоперевірка та прогноз не надають підтвердженого опанування. Помилки можна виправляти без штрафу.',
    'Masteredには演習合格、80%以上、必須問題すべての正解が必要です。自己確認や予想だけでは達成を証明できません。減点なしで再挑戦できます。',
    'Mastered에는 실습 통과, 80% 이상 및 모든 필수 문제 정답이 필요합니다. 자체 검토나 예상만으로 숙달이 인증되지 않습니다. 감점 없이 수정할 수 있습니다.',
  ),
  next: t(
    'Дальше по программе',
    'Баъдан дар барнома',
    'Next in the syllabus',
    'Далі за програмою',
    '次の学習内容',
    '다음 학습 내용',
  ),
  end: t(
    'Это последний урок курса. Завершите проект и проверку, затем повторите темы, в которых остались ошибки. Конец программы сам по себе не подтверждает освоение.',
    'Ин дарси охирини курс аст. Лоиҳа ва санҷишро анҷом диҳед, сипас мавзӯъҳои хато доштаро такрор кунед. Анҷоми барнома худ аз худ азхудкуниро тасдиқ намекунад.',
    'This is the final lesson. Finish the project and assessment, then review topics where you made mistakes. Reaching the end alone does not certify mastery.',
    'Це останній урок. Завершіть проєкт і перевірку, потім повторіть теми з помилками. Кінець програми сам собою не підтверджує опанування.',
    '最後のレッスンです。プロジェクトと評価を終え、間違えた内容を復習してください。最後まで進むだけでは習得の証明になりません。',
    '마지막 수업입니다. 프로젝트와 평가를 마치고 틀린 주제를 복습하세요. 끝에 도달하는 것만으로 숙달이 인증되지는 않습니다.',
  ),
};

/** Notes for lessons whose assessment exists only in the browser. */
export const localAssessment = t(
  'Квиз и тесты здесь учебные. Объяснение и локальный Node.js-проект оцениваются отдельно как Self Reviewed. Серверной аттестации Backend пока нет; эти действия не присваивают Mastered.',
  'Квиз ва тестҳо омӯзишӣ мебошанд. Шарҳ ва лоиҳаи маҳаллии Node.js алоҳида ҳамчун Self Reviewed арзёбӣ мешаванд. Тасдиқи серверии Backend ҳоло нест; ин амалҳо Mastered намедиҳанд.',
  'The quiz and tests here are learning checks. Review explanations and the local Node.js project separately as Self Reviewed. Backend server attestation is not available yet; these actions do not grant Mastered.',
  'Квіз і тести навчальні. Пояснення та локальний Node.js-проєкт оцінюються окремо як Self Reviewed. Серверне підтвердження Backend поки недоступне; ці дії не надають Mastered.',
  'クイズとテストは学習用です。説明とローカルのNode.jsプロジェクトはSelf Reviewedとして別に確認してください。Backendのサーバー認証は未対応で、Masteredは付与されません。',
  '퀴즈와 테스트는 학습용입니다. 설명과 로컬 Node.js 프로젝트는 Self Reviewed로 별도 검토하세요. Backend 서버 인증은 아직 없으며 Mastered를 부여하지 않습니다.',
);
export const localReview = t(
  'Квиз и практика — учебные проверки. Практическую работу оцените самостоятельно: Self Reviewed не присваивает подтверждённый Mastered.',
  'Квиз ва машқ санҷиши омӯзишӣ аст. Кори амалиро худ санҷед: Self Reviewed Mastered-и тасдиқшуда намедиҳад.',
  'Quiz and practice are learning checks. Review practical work yourself: Self Reviewed does not grant verified Mastered.',
  'Квіз і практика — навчальні перевірки. Практичну роботу оцініть самостійно: Self Reviewed не надає підтверджений Mastered.',
  'クイズと練習は学習用です。実習の作業は自己確認となり、認証済みMasteredは付与されません。',
  '퀴즈와 실습은 학습용입니다. 실습 작업은 자체 검토이며 인증된 Mastered가 부여되지 않습니다.',
);

/** Buttons and note of the step-by-step code walkthrough. */
export const traceCopy = {
  note: t(
    'Пошаговый разбор заданного примера, не выполнение вашего кода. Для настоящего запуска следуйте инструкциям упражнения.',
    'Шарҳи қадамии мисоли додашуда, на иҷрои рамзи шумо. Барои иҷрои воқеӣ дастури машқро иҷро кунед.',
    'A step-by-step explanation of the given example, not execution of your code. Follow the exercise instructions for actual execution.',
    'Покроковий розбір прикладу, а не виконання вашого коду. Для виконання дотримуйтеся інструкцій вправи.',
    '指定例の解説であり、入力コードの実行ではありません。実行するには演習の手順に従ってください。',
    '제시된 예제의 단계별 해설이며 입력 코드의 실행이 아닙니다. 실제 실행은 실습 안내를 따르세요.',
  ),
  previous: t(
    'Предыдущий шаг',
    'Қадами пешина',
    'Previous step',
    'Попередній крок',
    '前のステップ',
    '이전 단계',
  ),
  next: t(
    'Следующий шаг',
    'Қадами оянда',
    'Next step',
    'Наступний крок',
    '次のステップ',
    '다음 단계',
  ),
};

/** Lesson text follows the content language; interface labels follow the interface language. */
export function useFlowText() {
  const language = useLearningStore((state) => state.contentLanguage),
    ui = useLearningStore((state) => state.language);
  return {
    language,
    ui,
    text: (value: CourseText) => courseText(value, language),
    label: (key: keyof typeof labels) => labels[key][ui],
  };
}
