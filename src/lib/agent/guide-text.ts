// What the site guide recognises and what it answers. The guide only speaks
// about DevAtlas itself; lesson questions go to the course answer library.
import type { InterfaceLocale } from '@/lib/locale';

/** Languages the guide is written in. Other interface languages use English. */
export type GuideLanguage = 'ru' | 'tg' | 'en';

export type IntentKey =
  | 'whereCourses'
  | 'nextStep'
  | 'howMastery'
  | 'wherePractice'
  | 'whereTests'
  | 'whereNotes'
  | 'wherePlans'
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
  return language === 'ru' || language === 'tg' ? language : 'en';
}

/** Phrases that start each guide topic, per language. Checked in this order. */
export const INTENT_PATTERNS: Record<IntentKey, Record<GuideLanguage, RegExp>> = {
  whereCourses: {
    ru: /где.*(курс|направлен)|какой курс|с чего начать|что изучать|список курсов|какие курсы/i,
    tg: /курсҳо дар куҷо|аз куҷо оғоз|қадамҳои аввал|курсҳои мо|фиҳрист/i,
    en: /where.*(course|track)|which course|how (do i )?start|what (should i )?(learn|study)|course list/i,
  },
  nextStep: {
    ru: /что.*(дальше|делать)|продолжить|рекоменд|мой прогресс|где я остановил|следующий шаг/i,
    tg: /чи дароз|ч[иӣ] кунам|минбаъд|баъд чӣ|идома|тавсия|пешрафти ман|қадами навбатӣ/i,
    en: /what.*(next|now)|continue|recommend|my progress|where was i|next step/i,
  },
  howMastery: {
    ru: /мастерство|как.*(прогресс|подтвержд|заверш)|считается|xp|очки/i,
    tg: /мастерство|азхудкунӣ|чӣ тавр.*(пешрафт|тасдиқ)|ҳисоб мешавад/i,
    en: /mastery|how.*(progress|confirm|complete)|counts as|\bxps?\b/i,
  },
  wherePractice: {
    ru: /где.*(практ|упражн)|как.*(практ|решать задач)/i,
    tg: /где.*(практ|машқ)|машқ(ҳо)? дар куҷо/i,
    en: /where.*(practice|exercises)|how.*(practice|solve)/i,
  },
  whereTests: {
    ru: /где.*(тест|экзамен|интервью)|(подготов|готов|репетиц).*(интервью|собеседов)|собеседован|интервью/i,
    tg: /где.*(тест|интервью)|санҷишҳо дар куҷо|мусоҳиба|интервью/i,
    en: /where.*(test|exam|interview)|interview prep/i,
  },
  whereNotes: { ru: /заметк|конспект/i, tg: /қайд|ёддошт/i, en: /\bnotes?\b/i },
  wherePlans: {
    ru: /подписк|тариф|сколько стоит|цена|оплат|premium|pro доступ/i,
    tg: /обуна|тариф|нарх|чанд аст|пардохт|pro дастрас/i,
    en: /subscri|pricing|how much|price|payment|premium|pro access/i,
  },
  whereCommunity: {
    ru: /сообществ|чат|другие ученики|форум/i,
    tg: /ҷомеа|ҷамоат|чат|дигарон/i,
    en: /community|chat with|forum|other learners/i,
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
        'Каждое направление — это learning track: начальный уровень всегда бесплатный, а Pro и Expert публикуются по мере готовности (на карточках видно честно).',
        'Совет: выберите направление в каталоге — платформа сама откроет план по дням и будет вести от урока к практике.',
      ),
    tg: (c) =>
      lines(
        'Ҳамаи самтҳо дар каталоги «Курсҳо» ҷамъ шудаанд: ' + c.trackSummary,
        'Ҳар самт як learning track аст: сатҳи асосӣ ҳамеша ройгон аст, Pro ва Expert баъди омода шудан нашр мешаванд.',
        'Маслиҳат: дар каталог як самт интихоб кунед — платформа нақшаро аз рӯи рӯзҳо мекушояд ва аз дарс ба машқ мебарад.',
      ),
    en: (c) =>
      lines(
        'All directions live in the Courses catalog: ' + c.trackSummary,
        'Every direction is a learning track: the beginner stage is always free, while Pro and Expert stages are published honestly as they become ready.',
        'Tip: pick a direction in the catalog — the platform opens the day-by-day plan and walks you from reading to practice.',
      ),
  },
  nextStep: {
    ru: (c) => c.nextStep,
    tg: (c) => c.nextStep,
    en: (c) => c.nextStep,
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
  },
  whereNotes: {
    ru: () =>
      'Заметки — отдельный раздел «Заметки» в боковом меню. У каждого курса свои заметки: переключите курс, и вы увидите его конспекты.',
    tg: () =>
      'Ёддоштҳо — бахши алоҳидаи «Ёддоштҳо» дар менюи паҳлӯ. Ҳар курс ёддоштҳои худро дорад: курсро иваз кунед, ёддоштҳояшро мебинед.',
    en: () =>
      'Notes have their own sidebar section. Notes are per course: switch the course to see its notes.',
  },
  wherePlans: {
    ru: () =>
      lines(
        'Начальный уровень всех направлений полностью бесплатный и остаётся бесплатным.',
        'Платные уровни Pro и Expert существуют как курсы, но оплата пока намеренно не подключена: оформление заказа честно сообщает «сервис недоступен», пока не будет настроен реальный провайдер платежей. Никаких «фейковых оплат» на сайте нет — уровни можно посмотреть в разделе «Тарифы».',
      ),
    tg: () =>
      lines(
        'Сатҳи асосии ҳамаи самтҳо пурра ройгон аст ва ройгон мемонад.',
        'Сатҳҳои Pro ва Expert ҳамчун курс мавҷуданд, вале пардохт қасдан пайваст нашудааст: саҳифаи пардохт ростгӯёна мегӯяд «хидмат дастрас нест». Сатҳҳоро дар бахши «Тарифҳо» мебинед.',
      ),
    en: () =>
      lines(
        'The beginner stage of every direction is fully free and stays free.',
        'Paid Pro and Expert stages exist as courses, but payment is intentionally not connected: checkout honestly reports the service is unavailable until a real payment provider is configured. Plans are listed in the Plans section.',
      ),
  },
  whereCommunity: {
    ru: () =>
      'Раздел «Сообщество» в боковом меню открывает сообщество платформы: обсуждения и чат для подписчиков. Чат требует реальной активной подписки на сервере — без неё интерфейс честно объясняет, что сервис недоступен.',
    tg: () =>
      'Бахши «Ҷомеа» дар менюи паҳлӯ ҷомеаи платформаро мекушояд. Чат обунаи воқеиро талаб мекунад — бе он интерфейс ростгӯёна мефаҳмонад, ки хидмат дастрас нест.',
    en: () =>
      'The Community sidebar section opens platform discussions and the subscriber chat. The chat requires a real active server-side membership — without one the UI explains honestly that the service is unavailable.',
  },
};
