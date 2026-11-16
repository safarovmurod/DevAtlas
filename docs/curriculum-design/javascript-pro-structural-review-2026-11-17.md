# JavaScript-pro course structural review — 2026-11-17

Владелец курса: `javascript-pro` (RU/TG/EN), ветка `codex/complete-starter-curricula`. Проверка по
действующему loader и audit-скрипту, до правок: `sec<4 = 26`, `noHint = 30` (75 вопросов),
`solInLesson`-кандидатов 24. Рабочая партия закрывает structural-пробелы из
`docs/audits/continuation-quality-2026-11-17.json` (courses → javascript-pro).

Изменённые файлы (только файлы владельца курса):

- `src/content/courses/javascript-pro.json`
- `tests/premium-curriculum.test.ts` — только ветка `javascript-pro trusted examples…` (общая для
  трёх premium-курсов логика assertion (b)); тесты backend-pro/architecture-expert не менялись —
  для них решение == пример, условие равенства сохраняет прежнее поведение
- этот review-файл

Другие изменённые файлы в рабочем дереве (`src/content/courses/bash.json` — работа владельца
bash в том же checkout, параллельная сессия) к javascript-pro не относятся и не тронуты.

## Что было найдено (координаты до правок)

| Находка | Где |
|---|---|
| 26 дней имели 3 section вместо 4 (шаблон: теория / «Исполняемый пример» / «Выполните самостоятельно»; у дня 22 третий раздел — «Что ждёт медленный получатель») | дни 1–8, 10–12, 14–24, 26–28, 30 (`daysWithFewerThan4Sections`); дни 9, 13, 25, 29 — письменные, уже 4 section |
| 75 вопросов без `hint`/`relatedSection` из 90 (точные id — в audit-JSON `daysWithMissingLinkedHints`); существующие 15 с hint: 14 × relatedSection 0, 1 (день 4 q2) × 1 | все 30 дней |
| 24 overlap-кандидата (`daysWithPracticeSolutionInTheoryCandidates`), у каждого `matchingSolutionLines == substantiveSolutionLines` | дни 1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 14–21, 23, 24, 26–28, 30 |
| Независимые решения практики (не равны примеру) на code-днях | день 04 (1470 симв., трасса порядка с assert-ами) и день 22 (1510 симв., конвейер потоков с pipeline/objectMode/flush) — падение теста «trusted examples» |
| Падающий тест: `expect(lesson.practice!.solution).toBe(example.code)` запрещал независимые решения | `tests/premium-curriculum.test.ts`, assertion (b) |

## Что исправлено

### 1. Тест: независимые решения практик разрешены и обязаны выполняться (по решению координатора)

Assertion (b) заменён на ветвление: если `practice.solution === example.code` — прежнее
утверждение (trust-example день); если решение независимо — оно **дополнительно** исполняется
через `runReviewedFixture` с требованием чистого выхода (нет `error`, `status === 0`). Тест стал
строже: теперь исполняются и примеры, и все независимые решения; для backend-pro/architecture-expert
(у всех решение == пример) поведение не изменилось. Дни 04 и 22 сохранены в их authored-виде —
task/criteria/solution не переписывались и не превращались обратно в copy-practice.

### 2. 26 дней: четвёртый раздел «Частые ошибки …» (дописывание, без сдвига существующих)

Каждому из 26 дней добавлен один раздел `{title, body}` (ru/tg/en) **в конец** списка разделов
(позиция 4). Существующие разделы не сдвигались, поэтому 15 ранее заданных `relatedSection` (0 и 1)
остались валидными без пересчёта. Заголовки содержательные («Частые ошибки при …» — своя тема на
каждый день; повторяющегося «голого» шаблона нет). В каждом разделе 3–4 реальные ошибки новичка
с причиной: например, день 4 — метка, напечатанная в момент планирования вместо исполнения;
process.nextTick как «контракт»; asserts на реальные миллисекунды; день 22 — `pipe()` без
переноса ошибок, `highWaterMark` как «лимит памяти», потерянный хвост без `flush()`, игнор
`write() === false`. Новые разделы не содержат поля `code`, поэтому привязка теста
«первый раздел с code+output» не сместилась. RU-длина всех 26 тел — 250–700 символов
(фактически 515–677), TG — осмысленный перевод (нигде не равен RU), EN — полный.

### 3. `hint` + `relatedSection` для 75 существующих вопросов

Оба поля добавлены одновременно (schema: либо оба, либо ни одного; `relatedSection <
sections.length`) в конец объекта вопроса — как у уже существующих заполненных вопросов этого
курса. Hint — наводящий, не повторяющий ответ дословно. Распределение `relatedSection`:
0 → 39, 1 → 5, 2 → 4, 3 → 42; указатель ведёт на раздел, который учит ответу (теория —
контракт/знание, пример — наблюдаемое поведение в коде, раздел 3 — типовые ошибки;
у письменных дней 9/13/25/29 — их третий раздел: «Анатомия цикла», «Как пишут замечания»,
«Границы применения», «Направление зависимостей»). Существующие hint-поля 15 вопросов сохранены
как были.

### 4. Каноническая перезапись файла

Файл перезаписан канонически (`JSON.stringify(indent 1)` + CRLF). Побочный эффект: нормализованы
12 строк с нерегулярным отступом (только пробелы; построчная проверка показала, что все 12
расхождений — whitespace-only, содержимое строк идентично). Тот же приём использован в
python-structural-review-2026-11-17.

## Семантический review overlap-кандидатов (без правок)

Все 24 кандидата проверены точно: у каждого дня `practice.solution` **байт-в-байт** совпадает с
кодом исполняемого примера (`sections[1].code`), а в прозе разделов (body ru/tg/en) решение не
встречается — `sol_in_prose: false` на всех 30 днях. Это осознанный trust-example дизайн
premium-курса, закреплённый тестом «trusted examples execute and produce their stated output»:
урок показывает работающий пример, ученик печатает и запускает его, решение практики — тот же
пример. По директиве координатора такой паттерн для premium разрешён и не менялся.

**Trust-example дни (24, сохранены как есть):** 1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 14, 15, 16, 17,
18, 19, 20, 21, 23, 24, 26, 27, 28, 30.

Независимые практики вне кандидатов: день 04 и день 22 (code), дни 09/13/25/29 — письменные
(reference-ответ, тестом не исполняются). Решения дней 04 и 22 исполнены локально `node` —
exit 0, без ошибок, вывод соответствует трассам; то же делает и обновлённый тест.

## Источники (открыты и прочитаны через WebFetch 2026-11-17, последовательно)

Новый текст (RU/TG/EN) написан заново; источники подтверждают фактические утверждения в
разделах/подсказках. Все URL открылись успешно — ни одного недоступного.

- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map — ключи
  любого вида, у Map нет ключей по умолчанию (безопасен для "__proto__"); порядок вставки
  сохраняется; `set()` по существующему ключу **не** перемещает запись (день 1, 23 — LRU
  требует delete+set).
- https://developer.mozilla.org/en-US/docs/Web/API/fetch — fetch не отклоняет промис на
  HTTP-ошибке (404/503), нужно проверять `Response.ok`; отклонение — сетевой сбой (день 2).
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise —
  all отклоняется первым отказом; allSettled не отклоняется и отдаёт объекты статусов; any —
  первый успех, при полном отказе AggregateError со всеми причинами (день 5).
- https://developer.mozilla.org/en-US/docs/Web/API/AbortController и
  https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal — «An AbortSignal can only be used
  once. After it is aborted, any fetch call using the same signal will be immediately rejected»;
  рекомендованный паттерн — проверка `aborted`/`throwIfAborted()` до подписки (день 6).
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop — один поток; длинный
  синхронный код блокирует обработку; микрозадачи осушаются до следующей макрозадачи; job
  выполняется до конца (день 4).
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator —
  значения не вычисляются до next() («potentially infinite data structure»); return()/throw()
  вставляются как будто в точке остановки (день 8).
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols —
  next() → IteratorResult; после конца `{ value: undefined, done: true }`; при break в for...of
  вызывается return(); у генератора finally гарантированно выполняется (день 19).
- https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone — глубокое клонирование;
  несериализуемое (функции) → DataCloneError; transfer отсоединяет объект у источника (день 17).
  Примечание: «заморозка не переносится на клон» на странице не написано — это подтверждено
  исполняемым примером дня 17 (assert в lesson.mjs, прогоняется тестом), не цитатой MDN.
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap —
  ключи только объекты (или non-registered symbols); перечисление запрещено, потому что список
  зависел бы от состояния сборщика (день 18).
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures — замыкание = функция +
  лексическое окружение; удержание окружения влияет на память (день 10).
- https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage — значения в UTF-16
  строках; данные живут между сессиями; SecurityError при заблокированном хранилище (день 3).
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn —
  только собственные свойства; надёжнее obj.hasOwnProperty (null-prototype, переопределённый
  метод); for...in захватывает унаследованные, Object.keys — нет (день 27).
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions и
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Quantifiers —
  якоря ^/$ в примере валидации; квантификаторы жадные по умолчанию, `?` — ленивый. Примечание:
  катастрофический откат/ReDoS на этих страницах не описан — формулировка дня 24 опирается на
  уже написанный авторский текст урока (ограничение размера ввода, простой шаблон), не на цитату.
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace —
  таблица спецпаттернов ($$, $&, $`, $', $n, $<Name>) и прямое указание: «The above-mentioned
  special replacement patterns do not apply for strings returned from the replacer function»
  (день 24, вставка пользовательского текста функцией замены).
- https://developer.mozilla.org/en-US/docs/Web/API/Performance/now — высокоточное монотонное
  время, не зависит от перевода часов, пригодно для длительностей (день 28).
- https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html — «// @ts-check to the first
  line in your .js files»; JSDoc-аннотации задают типы. Примечание: «аннотации стираются,
  рантайм-валидация нужна» на странице не сформулировано — это положение уже авторского текста
  дня 15 и стандартное поведение TS.
- https://nodejs.org/api/stream.html — pipeline() «forwarding errors and properly cleaning up»,
  закрывает все потоки при ошибке, у pipe() получатель не закрывается сам; write() → false и
  «drain»; «The highWaterMark option is a threshold, not a limit» (день 22).
- https://nodejs.org/api/worker_threads.html — workerData это клон (structured clone);
  transferList отсоединяет буфер у отправителя; terminate()/unref(); совет использовать пул,
  «overhead of creating Workers would likely exceed their benefit»; воркеры не помогают I/O (день 21).
- https://nodejs.org/api/process.html — значения process.env — строки (или undefined);
  Number("") === 0 — семантика JS, поэтому пустая строка окружения молча даёт 0 (день 26).
- https://nodejs.org/api/test.html — it() alias test(); под-тесты; поимённый отчёт каждого случая
  (день 12).
- https://nodejs.org/api/packages.html — «exports» инкапсулирует подпути
  (ERR_PACKAGE_PATH_NOT_EXPORTED), «not a strong encapsulation», exports старше main (день 29).

Ни один URL не оказался недоступным; локальный рантайм — Node 24.x (в репозитории); решения
дней 04/22 и все примеры исполнены тестом и точечным `node`-запуском.

## Проверки (выполнены)

- `npx vitest run tests/premium-curriculum.test.ts` — 15/15 зелёные; «javascript-pro trusted
  examples execute and produce their stated output» исполняет все примеры **и** независимые
  решения дней 04/22.
- `npx vitest run tests/course-quality-guard.test.ts` — 9/9 зелёные (javascript-pro в нём
  отсутствует, но guard парсит все course-JSON — схема и маркеры-заглушки чисты).
- Контрольные файлы, ссылающиеся на курс: `tests/course-taxonomy.test.ts`,
  `tests/catalog-copy.test.ts`, `tests/free-courses.test.ts`, `tests/assessment-routes.test.ts`,
  `tests/premium-course-access.test.ts`, `tests/premium-content-channels.test.ts`,
  `tests/placement.test.ts` — 55/55 зелёные.
- `npx tsc --noEmit` — чисто. `npm run lint` — чисто.
- `python -I scripts/course-authoring/audit.py javascript-pro` — после правок: `template 0`,
  `sec<4 0`, `q<3 0`, `noHint 0`, `noEN 0`, `tg=ru 0`, `badCrit 0`, `shortSol 0`,
  `autoGraded 0`. Столбцы-паттерны: `answerSameIdx%` 56 (было 57 по
  `correctPositionCounts [51,27,12]`), `answerLongest%` 84 (было 87) — существующие
  `correctIndex` и порядок options не трогались по директиве, остаточный перекос задан
  существующими вопросами (см. «Оставшаяся работа»). `solInLesson%` 80 — это 24 trust-example
  дня, дизайн курса (см. выше), правки не требовались. `repeatTitles%` 65 (было 87) —
  сохранились повторяющиеся заголовки первых разделов «Модель и границы» (28), «Исполняемый
  пример» (26), «Выполните самостоятельно» (24) — authored-текст, не тронут; новые 26 заголовков
  уникальны.
- Скрипт структуры: 30 дней × 4 section; у всех 90 вопросов `hint` (ru/tg/en) и валидный
  `relatedSection` (<4); tg ≠ ru во всех разделах; RU 250–700 на всех 26 новых разделах; id
  вопросов уникальны; новые разделы не имеют `code`.
- Инварианты до/после (программно): lesson id, day, prerequisiteDays, title, sourceIds,
  вопрос (id/question/answer/options/correctIndex), practice.task/solution/criteria — байт-в-байт
  без изменений; порядок options и `correctIndex` не тронуты.
- `node` запуск решений дня 04 и дня 22 — exit 0, вывод соответствует ожидаемым трассам.

## Оставшаяся работа

1. Перекос `answerSameIdx%` (56) и `answerLongest%` (84) остаётся: правка потребовала бы
   перестановки существующих options/correctIndex, что запрещено директивой сохранения. Если
   владелец разрешит — достаточно 1–2 перестановок на день на части дней.
2. 24 trust-example дня оставлены по дизайну курса. Если когда-нибудь потребуется снизить
   `solInLesson%`, это отдельная партия: переписывание практик на независимые данные с
   исполнением каждого нового решения и пересмотром теста «trusted examples» (он закрепляет
   равенство решение==пример).
3. Не подтверждено этой партией: независимая педагогическая/языковая вычитка RU/TG/EN,
   Verified-learning завершение, реальные операции. Только loader-структура, схема и исполнение
   кода проверены.
4. Каталог/обложки/покрытия не пересчитывались: количество дней/вопросов/ID не изменилось
   (30 дней, 90 вопросов, те же id) — согласно директиве «каталог и скрипты не трогать»
   пересинхронизация не требуется.
