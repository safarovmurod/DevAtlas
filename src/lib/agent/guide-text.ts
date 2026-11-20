// What the site guide recognises and what it answers. The guide only speaks
// about DevAtlas itself; lesson questions go to the course answer library.
import type { InterfaceLocale } from '@/lib/locale';

/** Languages the guide is written in: all four interface languages. */
export type GuideLanguage = 'ru' | 'tg' | 'en' | 'es';

export type IntentKey =
  | 'whereCourses'
  | 'nextStep'
  | 'howMastery'
  | 'wherePractice'
  | 'whereTests'
  | 'whereNotes'
  | 'wherePlans'
  | 'whereTutor'
  | 'whereCommunity';

export interface GuideContext {
  language: InterfaceLocale;
  selectedCourse: string;
  currentCourseTitle?: string;
  currentDay?: number;
  masteredRatio?: number;
  hasProgress?: boolean;
  trackSummary: string;
  nextStep: string;
  selectedCourseHint: string;
}

export function guideLanguage(language: InterfaceLocale): GuideLanguage {
  return language;
}

/** Phrases that start each guide topic, per language. Checked in this order. */
export const INTENT_PATTERNS: Record<IntentKey, Record<GuideLanguage, RegExp>> = {
  whereCourses: {
    ru: /где.*(курс|направлен)|какой курс|с чего начать|что изучать|список курсов|какие курсы/i,
    tg: /курсҳо дар куҷо|аз куҷо оғоз|қадамҳои аввал|курсҳои мо|фиҳрист/i,
    en: /where.*(course|track)|which course|how (do i )?start|what (should i )?(learn|study)|course list/i,
    es: /d[oó]nde.*(curso|ruta|categor)|qu[eé] curso|por d[oó]nde (empiezo|empezar)|c[oó]mo (empiezo|empezar)|qu[eé] (debo |puedo )?(aprender|estudiar)|lista de cursos|qu[eé] cursos/i,
  },
  nextStep: {
    ru: /что.*(дальше|делать)|продолжить|рекоменд|мой прогресс|где я остановил|следующий шаг/i,
    tg: /чи дароз|ч[иӣ] кунам|минбаъд|баъд чӣ|идома|тавсия|пешрафти ман|қадами навбатӣ/i,
    en: /what.*(next|now)|continue|recommend|my progress|where was i|next step/i,
    es: /qu[eé].*(sigue|hago|hacer|ahora)|continuar|recomiend|mi progreso|d[oó]nde (me )?qued[eé]|siguiente paso/i,
  },
  howMastery: {
    ru: /мастерство|как.*(прогресс|подтвержд|заверш)|считается|xp|очки/i,
    tg: /мастерство|азхудкунӣ|чӣ тавр.*(пешрафт|тасдиқ)|ҳисоб мешавад/i,
    en: /mastery|how.*(progress|confirm|complete)|counts as|\bxps?\b/i,
    es: /dominio|c[oó]mo.*(progreso|confirm|complet)|c[oó]mo se cuenta|\bxp\b|puntos/i,
  },
  wherePractice: {
    ru: /где.*(практ|упражн)|как.*(практ|решать задач)/i,
    tg: /где.*(практ|машқ)|машқ(ҳо)? дар куҷо/i,
    en: /where.*(practice|exercises)|how.*(practice|solve)/i,
    es: /d[oó]nde.*(pr[aá]ctic|ejercicio)|c[oó]mo.*(practic|resolver)/i,
  },
  whereTests: {
    ru: /где.*(тест|экзамен|интервью)|(подготов|готов|репетиц).*(интервью|собеседов)|собеседован|интервью/i,
    tg: /где.*(тест|интервью)|санҷишҳо дар куҷо|мусоҳиба|интервью/i,
    en: /where.*(test|exam|interview)|interview prep/i,
    es: /d[oó]nde.*(prueba|examen|entrevista)|preparar.*entrevista|entrevista/i,
  },
  whereNotes: {
    ru: /заметк|конспект/i,
    tg: /қайд|ёддошт/i,
    en: /\bnotes?\b/i,
    es: /\bnotas?\b|apuntes/i,
  },
  wherePlans: {
    ru: /подписк|тариф|сколько стоит|цена|оплат|premium|ultra|ультра|pro доступ/i,
    tg: /обуна|тариф|нарх|чанд аст|пардохт|ultra|pro дастрас/i,
    en: /subscri|pricing|how much|price|payment|premium|ultra|pro access/i,
    es: /suscripci|planes|precio|cu[aá]nto cuesta|pago|premium|ultra|acceso pro|tarifa/i,
  },
  whereTutor: {
    ru: /ai\s*tutor|тьютор|тютор|репетитор|чат с (ai|ии|ай)/i,
    tg: /ai\s*tutor|тутор|тьютор|чат бо (ai|ии)/i,
    en: /ai\s*tutor|\btutor\b/i,
    es: /ai\s*tutor|\btutor\b/i,
  },
  whereCommunity: {
    ru: /сообществ|чат|другие ученики|форум/i,
    tg: /ҷомеа|ҷамоат|чат|дигарон/i,
    en: /community|chat with|forum|other learners/i,
    es: /comunidad|chat con|foro|otros (estudiantes|alumnos)/i,
  },
};

type Answer = (context: GuideContext) => string;
const lines = (...parts: string[]) => parts.join('\n');

/** The guide's answer for each topic. Section names match the real menu labels. */
export const GUIDE_TEXT: Record<IntentKey, Record<GuideLanguage, Answer>> = {
  whereCourses: {
    ru: (c) =>
      lines(
        'Все направления собраны в каталоге «Курсы»: ' + c.trackSummary,
        'Каждое направление — это learning track: уровни Beginner, Pro и Expert бесплатны и появляются по мере готовности (на карточках видно честно).',
        'Совет: выберите направление в каталоге — платформа сама откроет план по дням и будет вести от урока к практике.',
      ),
    tg: (c) =>
      lines(
        'Ҳамаи самтҳо дар каталоги «Курсҳо» ҷамъ шудаанд: ' + c.trackSummary,
        'Ҳар самт як learning track аст: сатҳҳои Beginner, Pro ва Expert ройгонанд ва баъди омода шудан нашр мешаванд.',
        'Маслиҳат: дар каталог як самт интихоб кунед — платформа нақшаро аз рӯи рӯзҳо мекушояд ва аз дарс ба машқ мебарад.',
      ),
    en: (c) =>
      lines(
        'All directions live in the Courses catalog: ' + c.trackSummary,
        'Every direction is a learning track: the Beginner, Pro and Expert levels are all free and appear honestly as they become ready.',
        'Tip: pick a direction in the catalog — the platform opens the day-by-day plan and walks you from reading to practice.',
      ),
    es: (c) =>
      lines(
        'Todas las rutas están en el catálogo «Cursos»: ' + c.trackSummary,
        'Cada ruta es un learning track: los niveles Beginner, Pro y Expert son gratuitos y aparecen a medida que están listos (en las tarjetas se ve con claridad).',
        'Consejo: elige una ruta en el catálogo y la plataforma abrirá el plan día a día y te llevará de la lección a la práctica.',
      ),
  },
  nextStep: {
    ru: (c) => c.nextStep,
    tg: (c) => c.nextStep,
    en: (c) => c.nextStep,
    es: (c) => c.nextStep,
  },
  howMastery: {
    ru: () =>
      lines(
        'Прогресс дня считается честно: урок нужно отметить изучённым и сдать практику, после чего день можно подтвердить.',
        'Отдельно считается мастерство — вопросы дня из раздела «Тесты»: каждый правильный ответ сохраняется, и когда отвечены все вопросы дня, появляется статус «Мастерство пройдено». Ошибиться не страшно: неправильный ответ можно переответить в тот же день.',
        'XP начисляется за разные действия (урок, практика, верный ответ), и одно и то же действие не приносит очки повторно. Гостевой прогресс живёт в браузере, а с аккаунтом синхронизируется между устройствами.',
      ),
    tg: () =>
      lines(
        'Пешрафти рӯз ростгӯёна ҳисоб мешавад: дарсро ҳамчун омӯхташуда қайд кунед, машқро супоред ва баъд рӯзро тасдиқ кунед.',
        'Азхудкунӣ алоҳида ҳисоб мешавад — саволҳои рӯз дар бахши «Санҷишҳо»: ҳар ҷавоби дуруст нигоҳ дошта мешавад ва вақте ба ҳамаи саволҳои рӯз дуруст ҷавоб диҳед, нишони «гузашт» пайдо мешавад. Хато кардан тарс надорад — ба саволи нодуруст дар ҳамон рӯз аз нав ҷавоб додан мумкин.',
        'XP барои ҳар амали алоҳида дода мешавад ва як амал дубора очко намедиҳад. Пешрафти меҳмон дар браузер нигоҳ дошта мешавад, бо аккаунт байни дастгоҳҳо ҳамоҳанг мешавад.',
      ),
    en: () =>
      lines(
        'Day progress is measured honestly: mark the lesson as studied, complete its practice, then confirm the day.',
        'Mastery is tracked separately through the day quiz in the Tests section: every correct answer is stored, and once all of the day’s questions are answered correctly the day shows as mastered. Wrong answers are never punishing — you can retry within the day.',
        'XP is granted per distinct action (lesson, practice, correct answer) and the same action never pays out twice. Guest progress lives in the browser; with an account it syncs across devices.',
      ),
    es: () =>
      lines(
        'El progreso del día se cuenta con honestidad: marca la lección como estudiada y entrega la práctica; después ya puedes confirmar el día.',
        'El dominio se cuenta aparte, con las preguntas del día de la sección «Pruebas»: cada respuesta correcta se guarda y, cuando respondes bien todas las preguntas del día, aparece el resultado «todas las preguntas del día superadas». Equivocarse no pasa nada: puedes volver a responder la pregunta fallada el mismo día.',
        'El XP se concede por acciones distintas (lección, práctica, respuesta correcta) y una misma acción no suma puntos dos veces. El progreso de invitado vive en el navegador y, con una cuenta, se sincroniza entre dispositivos.',
      ),
  },
  wherePractice: {
    ru: () =>
      lines(
        'Практика живёт в двух местах: внутри курса (кнопка «Практика этого дня» на каждом дне) и в общем разделе «Практика» в боковом меню, где собраны задания всех курсов.',
        'Задания бывают двух типов: код (пишется в редакторе с проверкой или самопроверкой) и письменные (эссе, разбор кейса) — они честно помечены как самопроверка.',
      ),
    tg: () =>
      lines(
        'Машқ дар ду ҷо аст: дар дохили курс (тугмаи «Машқи ин рӯз») ва дар бахши умумии «Машқ» дар менюи паҳлӯ.',
        'Супоришҳо ду навъанд: код (дар муҳаррир) ва хаттӣ (эссе, таҳлил) — хаттиҳо ростгӯёна ҳамчун худсанҷӣ қайд шудаанд.',
      ),
    en: () =>
      lines(
        'Practice lives in two places: inside the course (the “Practice for this day” button) and the shared Practice section in the sidebar listing assignments from every course.',
        'Assignments come in two kinds: code (typed in the editor with checks or self-review) and written (essays, case analysis) — the latter are honestly labeled self-reviewed.',
      ),
    es: () =>
      lines(
        'La práctica está en dos sitios: dentro del curso (el botón «Práctica de este día» de cada día) y en la sección general «Práctica» del menú lateral, donde se reúnen las tareas de todos los cursos.',
        'Las tareas son de dos tipos: de código (se escriben en el editor con comprobación o autoevaluación) y escritas (ensayos, análisis de casos), que se marcan con honestidad como autoevaluación.',
      ),
  },
  whereTests: {
    ru: (c) =>
      lines(
        'К каждому дню курса прилагаются тесты и учебное интервью: откройте курс → «Тесты и интервью» (или добавьте ?day=N в адрес).',
        'Интервью-режим спрашивает «помните ли вы» и честно помечает самопроверку — это репетиция собеседования, а не экзамен с оценкой.',
        c.selectedCourseHint,
      ),
    tg: (c) =>
      lines(
        'Ба ҳар рӯзи курс санҷиш ва мусоҳибаи таълимӣ замима шудааст: курсро кушоед ва бахши «Санҷишҳо ва мусоҳиба»-ро интихоб кунед.',
        'Режими мусоҳиба мепурсад «дар ёд доред?» ва натиҷаро ростгӯёна ҳамчун худсанҷӣ нишон медиҳад — ин тамрини мусоҳиба аст, на имтиҳон бо баҳо.',
        c.selectedCourseHint,
      ),
    en: (c) =>
      lines(
        'Every course day carries a quiz and a study interview: open the course → Tests & interview (or add ?day=N to the URL).',
        'Interview mode asks “do you remember?” and honestly labels the result as self-review — it is rehearsal, not a graded exam.',
        c.selectedCourseHint,
      ),
    es: (c) =>
      lines(
        'Cada día del curso trae pruebas y una entrevista de estudio: abre el curso → «Pruebas y entrevista» (o añade ?day=N a la dirección).',
        'El modo entrevista pregunta «¿lo recuerdas?» y marca el resultado con honestidad como autoevaluación: es un ensayo de entrevista, no un examen con nota.',
        c.selectedCourseHint,
      ),
  },
  whereNotes: {
    ru: () =>
      'В учебном меню больше нет заметок. Результаты и ошибки по курсу есть в «Прогрессе» и «Повторении».',
    tg: () =>
      'Дар меню дигар бахши ёддоштҳо нест. Натиҷа ва хатоҳоро аз «Пешрафт» ё «Такрор» бинед.',
    en: () =>
      'Notes are no longer in the sidebar. See course results and mistakes in Progress and Review.',
    es: () =>
      'Las notas ya no están en el menú. Consulta tus resultados y errores en Progreso y Repaso.',
  },
  wherePlans: {
    ru: () =>
      lines(
        'Есть три тарифа: Start, Pro и Ultra.',
        'Start бесплатный: знакомство с платформой, базовые уроки и проверка знаний в редакторе.',
        'Pro — основной: глубокое изучение, все курсы, практические задания, сертификат и чат с AI Tutor.',
        'Ultra — максимум: помощь наставника, проверка проектов, подготовка к работе и голосовой ассистент.',
        'Оплата пока не подключена, ничего не списывается, а все текущие курсы остаются открытыми. Подробности — в разделе «Тарифы».',
      ),
    tg: () =>
      lines(
        'Се тариф ҳаст: Start, Pro ва Ultra.',
        'Start ройгон аст: шиносоӣ бо платформа, дарсҳои асосӣ ва санҷиши дониш дар муҳаррир.',
        'Pro — асосӣ: омӯзиши амиқ, ҳамаи курсҳо, супоришҳои амалӣ, сертификат ва чат бо AI Tutor.',
        'Ultra — ҳадди аксар: кӯмаки мураббӣ, санҷиши лоиҳаҳо, тайёрӣ ба кор ва ёрдамчии овозӣ.',
        'Пардохт ҳоло пайваст нашудааст, ҳеҷ чиз гирифта намешавад ва ҳамаи курсҳои ҳозира кушода мемонанд. Тафсилот — дар бахши «Тарифҳо».',
      ),
    en: () =>
      lines(
        'There are three plans: Start, Pro and Ultra.',
        'Start is free: an introduction to the platform, basic lessons and knowledge checks in the editor.',
        'Pro is the main plan: deep study, all courses, practical assignments, a certificate and the AI Tutor chat.',
        'Ultra is the maximum: mentor help, project review, job preparation and the voice assistant.',
        'Payments are not connected yet, nothing is charged, and all current courses stay open. See the Plans section for details.',
      ),
    es: () =>
      lines(
        'Hay tres planes: Start, Pro y Ultra.',
        'Start es gratis: introducción a la plataforma, lecciones básicas y comprobación de conocimientos en el editor.',
        'Pro es el principal: estudio a fondo, todos los cursos, tareas prácticas, certificado y chat con AI Tutor.',
        'Ultra es el máximo: ayuda de un mentor, revisión de proyectos, preparación para el trabajo y asistente de voz.',
        'Los pagos aún no están conectados, no se cobra nada y todos los cursos actuales siguen abiertos. Los detalles están en la sección «Planes».',
      ),
  },
  whereTutor: {
    ru: () =>
      'AI Tutor — это чат для вопросов. Откройте его кнопкой «AI Tutor» (значок с искрой) внизу экрана, рядом с ассистентом, и пишите своими словами: он отвечает на приветствия и вопросы по курсам, а сначала ищет ответ в материалах курса. Чат входит в тариф Pro.',
    tg: () =>
      'AI Tutor — чат барои саволҳо аст. Онро бо тугмаи «AI Tutor» (нишони шарора) дар поёни экран, назди ёрдамчӣ кушоед ва бо суханони худ нависед: ба салом ва саволҳои курс ҷавоб медиҳад ва аввал дар маводи курс меҷӯяд. Чат ба тарифи Pro дохил аст.',
    en: () =>
      'AI Tutor is the chat for questions. Open it with the “AI Tutor” button (the sparkle icon) at the bottom of the screen, next to the assistant, and write in your own words: it replies to greetings and course questions, looking in the course materials first. The chat is part of the Pro plan.',
    es: () =>
      'AI Tutor es el chat para tus preguntas. Ábrelo con el botón «AI Tutor» (el icono de destello) en la parte inferior de la pantalla, junto al asistente, y escribe con tus propias palabras: responde a saludos y a preguntas de los cursos, y primero busca la respuesta en los materiales del curso. El chat forma parte del plan Pro.',
  },
  whereCommunity: {
    ru: () =>
      'Раздел «Сообщество» в боковом меню открывает общий чат для всех, кто вошёл в аккаунт: текст, фото, видео и код.',
    tg: () =>
      'Бахши «Ҷомеа» дар менюи паҳлӯ чати умумиро барои ҳамаи воридшудагон мекушояд: матн, сурат, видео ва код.',
    en: () =>
      'The Community sidebar section opens the shared chat for everyone who is signed in: text, photos, videos and code.',
    es: () =>
      'La sección «Comunidad» del menú lateral abre el chat común para todos los que han iniciado sesión: texto, fotos, vídeos y código.',
  },
};
