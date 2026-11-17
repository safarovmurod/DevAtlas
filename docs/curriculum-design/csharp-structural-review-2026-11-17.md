# C# course structural review — 17 ноября 2026

Владелец курса: `csharp` (RU/TG/EN), целевая ветка `codex/complete-starter-curricula`. Проверка выполнена по audit `docs/audits/continuation-quality-2026-11-17.json` (courseId `csharp`) и по фактическому loader, до правок: 30 дней, все 30 дней `sections = 3` и `questions = 2`; все 60 существующих вопросов без `hint`/`relatedSection`; 26 overlap-кандидатов; эвристики `answerSameIdx = 55 %`, `longestCorrectOptionRu = 67 %`.

## Изменённые файлы (только файлы владельца курса)

- `src/content/courses/csharp.json`
- этот review-файл

Каталоги, schema, scripts, тесты, другие курсы и reports не тронуты. Коммит не выполнялся — изменения остаются в рабочем дереве. Примечание по checkout: рабочее дерево физически стоит на ветке `main`, потому что там лежат незакоммиченные правки `backend-pro.json` другой работы, и переключение ветки их бы задело; `src/content/courses/csharp.json` между `main` и `codex/complete-starter-curricula` байт-в-байт идентичен (`git diff main codex/complete-starter-curricula -- src/content/courses/csharp.json` пуст), поэтому содержимое правок не зависит от ветки, а незакоммиченный результат переносится без потерь.

## Что было найдено (координаты до правок)

| Находка | Где |
|---|---|
| Все 30 дней имели 3 section (шаблон дней 3–30: пример / «Частые ошибки» / «Запуск и практика»; дней 1–2: пример / «Запустите и проверьте» / «Среда выполнения») | `csharp-day-01` … `csharp-day-30` |
| Все 30 дней имели ровно 2 question: дни 1–2 — `-q`, `-q2`; дни 3–30 — `-q1`, `-q2` | все дни |
| Все 60 существующих вопросов без `hint`/`relatedSection` | все вопросы |
| Theory/solution overlap: 26 кандидатов audit-эвристики (`daysWithPracticeSolutionInTheoryCandidates`) | дни 1–5, 8–10, 12–26, 28–30 |
| Дублирование пары `correctIndex` у 8 дней `(1,1)`, у 11 дней `(0,0)`, у 11 дней смешанная `(0,1)`/`(1,0)`; `answerSameIdx = 55 %`, longest-RU-option = 67 % — эвристики, правки существующих options не требуются | см. «Оставшаяся работа» |

Runtime-execution для csharp не существует: `grep -rn "csharp" tests/` даёт только `tests/programming-intros.test.ts` (там csharp объявлен в `it.skip.each([...])` как «await an available local runtime»), `tests/course-taxonomy.test.ts` (статическая таксономия треков) и `tests/course-quality-guard.test.ts` (универсальный placeholder-guard, csharp не упоминает). В audit `javascriptExecutionDays: 0`. Значит, распределять время под runtime-тест не нужно.

## Что исправлено

### 1. Четвёртый раздел на всех 30 днях

У всех дней было по 3 section, поэтому добавлен один раздел (по правилу «при 3 section — 1-то»):

- Дни 3–30: «Глубже»-раздел вставлен ПЕРЕД «Частые ошибки» (позиция 1), сохраняя структуру дня: пример → глубже/в реальном проекте → частые ошибки → запуск и практика.
- Дни 1–2 (без раздела ошибок): раздел добавлен в конец (позиция 3).

Каждый раздел: `title`/`body` в ru/tg/en; RU body 250–700 символов (проверено скриптом); TG — осмысленный перевод, не копия RU; заголовок про содержание («Глубже: var фиксирует тип один раз», «Глубже: using закрывает файл сам», «Глубже: объект, файл и обратно»), не «Разберите пример». Каждая тема включает edge case (переполнение int, каст до деления, границы диапазонов, `is`/`as` вместо сырого каста, `int?` для значимых типов, `GetValueOrDefault` в счётчике, пустые коллекции у агрегатов, `Task.WhenAll` как знакомство, круг «объект → JSON → файл → объект») и пайванд к соседним дням (день 2 → 17, 3 → 5, 8 → 10/16, 9 → 29, 12 → 11, 17 → 2/24, 18 → 20, 19 → 22, 21 → 19, 22 → 29, 23 → 26, 24 → 25, 28 → 21, 29 → 9, 30 → 12/25/27). Новые разделы без поля `code` — исполняемый пример остаётся в первом разделе дня, поэтому recorded-output-привязки не сдвигаются.

### 2. Третий вопрос на всех 30 днях

- Дни 1–2: id `csharp-day-01-q3`, `csharp-day-02-q3` (продолжение шаблона `-q`/`-q2`); дни 3–30: `csharp-day-NN-q3` (продолжение `-q1`/`-q2`).
- Ровно 3 option; дистракторы — реальные заблуждения новичка («тип var меняется на string», «Trim убирает регистр», «словарь сам создаст ключ при `+=`», «Remove принимает условие», «второй Task.Delay короче, поэтому B раньше», «(Rect)s — приведение не может упасть»).
- `correctIndex` нового вопроса гарантированно отличается от обоих существующих `correctIndex` того же дня (проверено assert в скрипте): там, где существующая пара `(0,1)`/`(1,0)`, использовано 2; на днях с дублирующейся парой — 0/1/2 по смыслу. Итоговое распределение по 90 вопросам: `{0: 37, 1: 33, 2: 20}` — доминирование позиции снизилось с 55 % до 41 %. Эвристика longest-RU-option в audit помечена как «только запись» — существующие options не менялись, новые варианты написаны соразмерно.
- Метод: `answer` = точный текст выбранного option (ru/tg/en), как в существующих вопросах.

### 3. `hint` + `relatedSection` для всех 90 вопросов

Поля добавлены одновременно (требование schema: либо оба, либо ни одного; `relatedSection < sections.length` после вставки). 60 существующих вопросов получили только эти два поля — `id`, `question`, `answer`, `options`, `correctIndex` не тронуты. Hint — наводящий, не раскрывающий ответ дословно («Sum складывает и не находит ничего — что вернёт сумма нуля слагаемых?»). `relatedSection` указывает на раздел, который учит ответу: пример (0), новый «Глубже» (1), «Частые ошибки» (2), «Запуск и практика» (3) — например, `csharp-day-03-q1` (const) → 2, `csharp-day-27-q2` (NuGet) → 3.

## Семантический review overlap-кандидатов (26, без правок)

Точная проверка по каждому из 26 дней (1–5, 8–10, 12–26, 28–30): `practice.solution` совпадает строка-в-строку с кодом показанного примера в первом разделе дня (`sections[0].code`; день 27 — письменный, решения-кода не имеет и в кандидаты не входит). Пример кода НЕ присутствует ни в одном `section.body` (prose) — проверено точным поиском полного текста решения по всем body трёх языков: `solInBody = False` везде. По правилу курса это trust-example: решение — показанный пример, а не дубликат прозы. Вердикт: **записано, не менялось**; ни один body не переписывался. Дополнительно зафиксировано: ещё у 3 дней, не попавших в список кандидатов (6, 7, 11), `practice.solution` тоже равен коду примера — тот же trust-example, ни один из них прозой решения не дублирует; день 27 — единственный день, чьё решение не является кодом примера.

## Источники (открыты и сверены)

| URL | Что подтверждено |
|---|---|
| https://learn.microsoft.com/en-us/dotnet/csharp/linq/ | «A query isn't executed until you iterate over the query variable, for example in a `foreach` statement» — отложенное выполнение дня 21 |
| https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/tuples | кортежи с именованными элементами, `Item1`/`Item2` без имён, деструктуризация, `with` — дни 9, 29 |
| https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-value-types | `T?` = значения `T` плюс `null`, `HasValue`, оператор `??`, явный каст при null → `InvalidOperationException` — день 18 |
| https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/records | record: компиляторное равенство по свойствам (два разных объекта с одинаковыми данными равны), `with` — день 16 |
| https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/types/boxing-and-unboxing | определение boxing (`int` → `object`, копия на heap) — используется как фон дня 10/16 |
| https://learn.microsoft.com/en-us/dotnet/csharp/how-to/compare-strings (canonical: fundamentals/strings/common-tasks/compare) | `Equals` и `==` — case-sensitive ordinal по умолчанию; `StringComparison.OrdinalIgnoreCase` игнорирует регистр — день 4 |

Остальной новый контент опирается на уже объявленные в `sources` курса страницы (tour-of-csharp, language-reference, collections, linq, exceptions, nullable reference types, io, system-text-json, asynchronous-programming, testing) и на фактологию существующих разделов курса; новых URL в `sources` не добавлялось.

## Проверки

- `npx vitest run tests/course-quality-guard.test.ts tests/general-course-content.test.ts tests/published-curriculum.test.ts tests/course-taxonomy.test.ts` — 4 файла, 68 тестов, все прошли (schema-парс курса входит в нагрузку).
- `npx tsc --noEmit` — 0 ошибок; `npm run lint` — exit 0.
- Скрипт-проверка структуры: 30 дней × 4 section × 3 question; у всех 90 вопросов есть `hint` и `relatedSection < 4`; `answer[locale] == options[correctIndex][locale]` во всех трёх языках; options уникальны; `prerequisiteDays`, id дней и порядок не изменены; tg-тексты новых разделов ≠ ru.
- Диф-проверка против бэкапа до правок: `sources`, `files`, `title`, `summary`, `level`, `sourceIds`, `interview`, `practice`, все существующие разделы и вопросы (включая порядок и текст options) — байт-в-байт совпадают; добавлены только новые разделы, новые вопросы и пары `hint`+`relatedSection`.
- Line endings файла нормализованы обратно в CRLF, как в оригинале (round-trip идентичен по содержимому).
- `dotnet` в среде недоступен (`which dotnet` — нет). Запуск нового кода через компилятор не выполнялся: помечено **SKIPPED/UNVERIFIED**; фактологический уровень новых разделов сверен с открытыми страницами Microsoft Learn выше, csharp и ранее не имел runtime-тестов (`it.skip.each`).

## Оставшаяся работа

- Эвристики `answerSameIdx` (55 % → 41 % после правок) и longest-RU-option (67 %) остаются помеченными как «эвристика, только запись»: полная балансировка позиций требует правки существующих options, что запрещено рамками задачи.
- День 27 — письменный день без `rubric` (`writtenDaysWithRubric: 0` в audit) — вне объёма этой структурной задачи; рубрика требует отдельной авторской работы.
- Runtime-верификация (компиляция примеров/решений реальным SDK) — при появлении доступного `dotnet` в среде; при этом стоит раскомментировать csharp в `it.skip.each` `tests/programming-intros.test.ts`.
- Повторный прогон audit-скриптов (`course-content-quality-report.mjs`, `continuation-quality-2026-11-17`) после синхронизации каталогов — общескладская операция, не в объёме владельца курса.
