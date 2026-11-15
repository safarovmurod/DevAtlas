'use client';
import { courseText, type CourseText } from '@/lib/courses/schema';
import type { InterfaceLocale } from '@/lib/locale';
import { useLearningStore } from '@/stores/learning-store';

/** Text of the guided lesson flow in all four interface languages. */
const t = (ru: string, tg: string, en: string, es: string): Record<InterfaceLocale, string> => ({
  ru,
  tg,
  en,
  es,
});
const labels = {
  learn: t('Изучите', 'Омӯзед', 'Learn', 'Estudia'),
  understand: t('Поймите', 'Фаҳмед', 'Understand', 'Entiende'),
  watch: t('Посмотрите', 'Бинед', 'Watch', 'Observa'),
  try: t(
    'Попробуйте с подсказкой',
    'Бо маслиҳат санҷед',
    'Try with guidance',
    'Prueba con una guía',
  ),
  practice: t(
    'Практикуйтесь самостоятельно',
    'Мустақилона машқ кунед',
    'Practice independently',
    'Practica por tu cuenta',
  ),
  test: t('Проверьте себя', 'Худро санҷед', 'Test', 'Ponte a prueba'),
  review: t('Повторите', 'Такрор кунед', 'Review', 'Repasa'),
  master: t('Подтвердите освоение', 'Азхудкуниро тасдиқ кунед', 'Master', 'Confirma el dominio'),
  goals: t('Цели дня', 'Ҳадафҳои рӯз', 'Daily objectives', 'Objetivos del día'),
  real: t(
    'Где это пригодится',
    'Ин дар куҷо лозим мешавад',
    'A real-world use',
    'Dónde se usa en la vida real',
  ),
  route: t('Учебный маршрут', 'Масири омӯзиш', 'Learning route', 'Ruta de estudio'),
  predict: t(
    'Сначала выберите прогноз',
    'Аввал пешгӯиро интихоб кунед',
    'Choose your prediction first',
    'Primero elige tu predicción',
  ),
  hint: t('Подсказка', 'Маслиҳат', 'Hint', 'Pista'),
  correct: t('Прогноз верный', 'Пешгӯӣ дуруст аст', 'Correct prediction', 'Predicción correcta'),
  retry: t('Попробуйте ещё раз', 'Боз кӯшиш кунед', 'Try again', 'Inténtalo de nuevo'),
  tab: t('Вкладка браузера', 'Варақаи браузер', 'Browser tab', 'Pestaña del navegador'),
  node: t(
    'Текст выбранного элемента',
    'Матни унсури интихобшуда',
    'Selected element text',
    'Texto del elemento elegido',
  ),
  simplified: t(
    'Упрощённое дерево элементов этого примера: служебные meta и текстовые узлы не показаны. Нажмите title, h1 или p.',
    'Дарахти содакардашудаи унсурҳои ин мисол: meta ва гиреҳҳои матнӣ нишон дода нашудаанд. title, h1 ё p-ро пахш кунед.',
    'Simplified element tree for this example: meta and text nodes are omitted. Select title, h1 or p.',
    'Árbol simplificado de elementos de este ejemplo: no se muestran los meta ni los nodos de texto. Pulsa title, h1 o p.',
  ),
  code: t('Код документа', 'Рамзи ҳуҷҷат', 'Document code', 'Código del documento'),
  preview: t('Результат HTML', 'Натиҷаи HTML', 'HTML result', 'Resultado del HTML'),
  challenge: t('Мини-задача', 'Масъалаи хурд', 'Mini challenge', 'Minirreto'),
  example: t(
    'Пример для самопроверки',
    'Намуна барои худсанҷӣ',
    'Self-review example',
    'Ejemplo para autoevaluarte',
  ),
  open: t(
    'Открыть редактор и проверку',
    'Муҳаррир ва санҷишро кушоед',
    'Open editor and assessment',
    'Abrir el editor y la comprobación',
  ),
  summary: t(
    'Что нужно запомнить',
    'Чиро дар хотир нигоҳ доред',
    'What to remember',
    'Qué debes recordar',
  ),
  threshold: t(
    'Для Mastered нужны успешная проверка практики, ≥80% ответов и все обязательные вопросы. Самопроверка и этот прогноз не начисляют подтверждённое освоение. Ошибки можно исправлять без штрафа.',
    'Барои Mastered санҷиши дурусти машқ, ≥80% ҷавобҳо ва ҳамаи саволҳои ҳатмӣ лозиманд. Худсанҷӣ ва ин пешгӯӣ азхудкунии тасдиқшуда намедиҳанд. Хатоҳоро бе ҷарима ислоҳ кардан мумкин.',
    'Mastered requires passing practice, ≥80% and every critical question. Self review and this prediction do not grant verified mastery. Correct mistakes without a penalty.',
    'Para obtener Mastered hacen falta una práctica superada, al menos un 80 % de respuestas correctas y todas las preguntas obligatorias. La autoevaluación y esta predicción no dan un dominio verificado. Puedes corregir los errores sin penalización.',
  ),
  next: t(
    'Дальше по программе',
    'Баъдан дар барнома',
    'Next in the syllabus',
    'Lo que sigue en el programa',
  ),
  end: t(
    'Это последний урок курса. Завершите проект и проверку, затем повторите темы, в которых остались ошибки. Конец программы сам по себе не подтверждает освоение.',
    'Ин дарси охирини курс аст. Лоиҳа ва санҷишро анҷом диҳед, сипас мавзӯъҳои хато доштаро такрор кунед. Анҷоми барнома худ аз худ азхудкуниро тасдиқ намекунад.',
    'This is the final lesson. Finish the project and assessment, then review topics where you made mistakes. Reaching the end alone does not certify mastery.',
    'Esta es la última lección del curso. Termina el proyecto y la comprobación y luego repasa los temas en los que fallaste. Llegar al final del programa no certifica por sí solo el dominio.',
  ),
};

/** Notes for lessons whose assessment exists only in the browser. */
export const localAssessment = t(
  'Квиз и тесты здесь учебные. Объяснение и локальный Node.js-проект оцениваются отдельно как Self Reviewed. Серверной аттестации Backend пока нет; эти действия не присваивают Mastered.',
  'Квиз ва тестҳо омӯзишӣ мебошанд. Шарҳ ва лоиҳаи маҳаллии Node.js алоҳида ҳамчун Self Reviewed арзёбӣ мешаванд. Тасдиқи серверии Backend ҳоло нест; ин амалҳо Mastered намедиҳанд.',
  'The quiz and tests here are learning checks. Review explanations and the local Node.js project separately as Self Reviewed. Backend server attestation is not available yet; these actions do not grant Mastered.',
  'El cuestionario y las pruebas de aquí son de estudio. La explicación y el proyecto local de Node.js se evalúan aparte como Self Reviewed. Backend aún no tiene evaluación en el servidor; estas acciones no otorgan Mastered.',
);
export const localReview = t(
  'Квиз и практика — учебные проверки. Практическую работу оцените самостоятельно: Self Reviewed не присваивает подтверждённый Mastered.',
  'Квиз ва машқ санҷиши омӯзишӣ аст. Кори амалиро худ санҷед: Self Reviewed Mastered-и тасдиқшуда намедиҳад.',
  'Quiz and practice are learning checks. Review practical work yourself: Self Reviewed does not grant verified Mastered.',
  'El cuestionario y la práctica son comprobaciones de estudio. Evalúa tú mismo el trabajo práctico: Self Reviewed no otorga un Mastered verificado.',
);

/** Buttons and note of the step-by-step code walkthrough. */
export const traceCopy = {
  note: t(
    'Пошаговый разбор заданного примера, не выполнение вашего кода. Для настоящего запуска следуйте инструкциям упражнения.',
    'Шарҳи қадамии мисоли додашуда, на иҷрои рамзи шумо. Барои иҷрои воқеӣ дастури машқро иҷро кунед.',
    'A step-by-step explanation of the given example, not execution of your code. Follow the exercise instructions for actual execution.',
    'Explicación paso a paso del ejemplo dado; no se ejecuta tu código. Para ejecutarlo de verdad, sigue las instrucciones del ejercicio.',
  ),
  previous: t('Предыдущий шаг', 'Қадами пешина', 'Previous step', 'Paso anterior'),
  next: t('Следующий шаг', 'Қадами оянда', 'Next step', 'Paso siguiente'),
};

/** Short text of the one-page day: Learn → Practice → Check, in all six interface languages. */
export const dayCopy = {
  learn: t('Изучить', 'Омӯзиш', 'Learn', 'Estudiar'),
  practice: t('Практика', 'Машқ', 'Practice', 'Práctica'),
  check: t('Проверить', 'Санҷиш', 'Check', 'Comprobar'),
  steps: t('Шаги дня', 'Қадамҳои рӯз', 'Steps of the day', 'Pasos del día'),
  nowLearn: t(
    'Начните отсюда: прочитайте урок.',
    'Аз ин ҷо оғоз кунед: дарсро хонед.',
    'Start here: read the lesson.',
    'Empieza aquí: lee la lección.',
  ),
  nowPractice: t(
    'Теперь сделайте задание.',
    'Акнун вазифаро иҷро кунед.',
    'Now do the task.',
    'Ahora haz la tarea.',
  ),
  nowCheck: t(
    'Ответьте на вопросы теста.',
    'Ба саволҳои тест ҷавоб диҳед.',
    'Answer the quiz questions.',
    'Responde a las preguntas de la prueba.',
  ),
  nowConfirm: t(
    'Всё готово. Подтвердите день.',
    'Ҳама тайёр аст. Рӯзро тасдиқ кунед.',
    'All set. Confirm the day.',
    'Todo listo. Confirma el día.',
  ),
  nowDone: t(
    'День завершён. Отличная работа!',
    'Рӯз анҷом ёфт. Офарин!',
    'Day complete. Great work!',
    'Día completado. ¡Buen trabajo!',
  ),
  goals: t(
    'Цели и зачем это нужно',
    'Ҳадаф ва барои чӣ лозим аст',
    'Goals and why it matters',
    'Objetivos y por qué importan',
  ),
  example: t('Посмотреть на примере', 'Дар мисол бинед', 'See an example', 'Míralo en un ejemplo'),
  guess: t('Проверьте догадку', 'Тахминро санҷед', 'Test your guess', 'Comprueba tu intuición'),
  game: t('Мини-игра', 'Бозии хурд', 'Mini game', 'Minijuego'),
  warmup: t(
    'Разминка с подсказкой',
    'Машқи омодагӣ бо маслиҳат',
    'Warm-up with hints',
    'Calentamiento con pistas',
  ),
  noPractice: t(
    'Сегодня без практики. Переходите к проверке.',
    'Имрӯз машқ нест. Ба санҷиш гузаред.',
    'No practice today. Go to the check.',
    'Hoy no hay práctica. Pasa a la comprobación.',
  ),
  quiz: t('Тест дня', 'Тести рӯз', 'Quiz of the day', 'Prueba del día'),
  quizScore: t('Верно', 'Дуруст', 'Correct', 'Correcto'),
  noQuiz: t(
    'Для этого дня нет вопросов.',
    'Барои ин рӯз савол нест.',
    'No questions for this day.',
    'No hay preguntas para este día.',
  ),
  expand: t('Открыть все', 'Ҳамаро кушодан', 'Open all', 'Abrir todo'),
  collapse: t('Свернуть', 'Печондан', 'Collapse', 'Contraer'),
  qa: t(
    'Вопросы и ответы дня',
    'Саволу ҷавобҳои рӯз',
    'Questions and answers of the day',
    'Preguntas y respuestas del día',
  ),
  ready: t(
    'Урок и практика готовы. Подтвердите день.',
    'Дарс ва машқ омодаанд. Рӯзро тасдиқ кунед.',
    'Lesson and practice are done. Confirm the day.',
    'La lección y la práctica están listas. Confirma el día.',
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

/** Text of the one-page day in the interface language. */
export function useDayCopy() {
  const ui = useLearningStore((state) => state.language);
  return (key: keyof typeof dayCopy) => dayCopy[key][ui];
}
