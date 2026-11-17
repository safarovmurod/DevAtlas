# Swift course structural review — 17 ноября 2026

Владелец курса: `swift` (RU/TG/EN), ветка `main`. Проверка выполнена по действующему loader (`courseContentSchema.parse` — финальная проверка после правок: `schema parse ok: true`) и координатам audit `docs/audits/continuation-quality-2026-11-17.json` → `courseId 'swift'` (30 дней <4 sections, 28 дней <3 questions, 30 дней без linked hints, 27 overlap-кандидатов, answerSameIdx 94%, longest RU 94%).

Изменённые файлы (только файлы владельца курса):

- `src/content/courses/swift.json`
- этот review-файл (новый)

Другие изменённые файлы рабочего дерева (`csharp.json`, `java.json`, `nodejs.json`, `php.json`, `ruby.json`, `rust.json`, `sql.json`, `tests/programming-intros.test.ts`, их review-файлы, `mongodb-content-dump.txt`) — работа других владельцев курсов в том же checkout, к `swift` не относятся и не тронуты. По директиве координатора commit/push не выполнялись.

## Что было найдено (координаты до правок)

| Находка | Где |
|---|---|
| 30 дней имели ровно 3 section; дни 3–27, 29–30 заканчивались секцией «Частые ошибки и самопроверка», дни 1, 2 — «Среда выполнения», день 28 — «Как выполнять это задание» | все 30 дней |
| 28 дней имели ровно 2 question; id-шаблоны: день 1 `swift-day-01-q`, `swift-day-01-q2`, дни 2, 4–29 `swift-day-NN-q1`, `swift-day-NN-q2`; дни 3 и 30 уже имели по 3 вопроса | дни 1, 2, 4–29 |
| 60 существующих вопросов без `hint`/`relatedSection` (оба поля добавляются только парой — superRefine схемы, `src/lib/courses/schema.ts:180-193`) | все 30 дней |
| 27 overlap-кандидатов (`daysWithPracticeSolutionInTheoryCandidates`: дни 2–16, 18–27, 29, 30) | перечисленные дни |
| Swift runtime в среде проверки недоступен (`swift: command not found`), `tests/programming-intros.test.ts:148` для swift — `it.skip` (placeholder «await an available local runtime»); runtime-execution теста для swift нет → исполнение кода курса SKIPPED/UNVERIFIED, в код не заглядывали как в «проверенный вывод» | среда, tests/ |

## Что исправлено

### 1. Четвёртая секция на все 30 дней

Новая секция «Глубже: …» добавлена по правилу координатора: на днях 3–27, 29–30 — ПЕРЕД существующей errors-секцией «Частые ошибки и самопроверка» (позиция 2, errors сдвигается на позицию 3); на днях 1, 2, 28 (errors-секции нет) — в конец (позиция 3). Существующий текст секций сохранён (единственные исключения — п.4 ниже). Каждая новая секция — `{title, body}` на ru/tg/en, БЕЗ `code`/`output`. RU-длина body после двух проходов ужесточения 561–699 символов (контракт 250–700, проверено скриптом); tg — полноценный перевод, tg ≠ ru (проверено скриптом); заголовки о содержании («Глубже: цена принудительной распаковки», «Глубже: пустой список в отчёте», а не «Разберите пример»). Каждая секция содержит граничный случай темы дня (ошибка компилятора `cannot assign to value: 'price' is a 'let' constant`, неперехваченная ошибка без catch, off-by-one диапазонов, вечный while, index out of bounds, filter на пустом массиве, `let` у класса против структуры, инвариант override, несоответствие протоколу, `default` в исчерпывающем switch, else guard-а обязан покинуть область, ошибка без подходящего catch, `T: Comparable` на собственном типе, `&` у inout, пустой запрос `contains("")`, reduce/деление на пустом списке, переименование main.swift, «старая» схема запуска, Self Reviewed-пределы и т.п.) + явный пайванд с пройденными днями (day1: пайвандов нет, только внутридневные; day2→day1; day3→day1/2; day4→day3; day5→day4; day6→day4/day21(позже); day7→day3/day6/day10(позже); day8→day4; day9→day8/day9→day22(позже); day10→day3/day8/day25–27(позже); day11→day7/day10/day15; day12→day8/day10/day27; day13→day10/day12; day14→day16(позже)/day25; day15→day11/day14; day16→day3/day4/day17; day17→day16/day18(позже); day18→day17; day19→day16/day18; day20→day16/day19; day21→day4/day6; day22→day2/day9; day23→day2/day8/day21/day22; day24→day18/day19/day10–12; day25→day10/day16/day17; day26→day8/day10/day11/day22; day27→day11/day29; day28→day1/day25–27; day29→day11/day12/day16/day28; day30→day1(«Среда выполнения»)/day8–9/day16/day19/day25–28).

### 2. Третий вопрос на 28 дней

- id по шаблону существующих: `swift-day-01-q3`, `swift-day-02-q3`, `swift-day-NN-q3` для дней 4–29 (90 вопросов, дубликатов нет — проверено скриптом).
- 3 option на ru/tg/en с реальными beginner-дистракторами; у новых вопросов `answer` = текст correct-опции (шаблон большинства вопросов курса).
- `correctIndex` каждого нового вопроса отличается от индексов существующих вопросов того же дня (проверено скриптом; дни 3 и 30 не трогались — у них уже было по 3 вопроса). Новая дистрибуция correctIndex по 90 вопросам: 58/20/12 — доминирующая позиция 64% задана 58 предсуществующими вопросами с ответом на позиции 0 (heuristic, зафиксирован в audit; существующие options не изменялись).
- Мавзӯъ = тема ҳамин рӯз: d1 вывод типа для целого литерала; d2 какой catch обработает total(12,-1); d4 type(of:) для строкового литерала; d5 uppercased() и исходная строка; d6 switch без default; d7 сколько итераций while; d8 ?? при nil; d9 nickName(for: guest) ?? guest; d10 first пустого массива; d11 тип результата map; d12 присваивание по новому ключу; d13 contains у множества; d14 вызов с пропуском параметра со значением по умолчанию; d15 второй короткий аргумент замыкания; d16 изменение поля у let-экземпляра; d17 c1.x после c2.x = 99; d18 override без пометки; d19 тип не реализует метод протокола; d20 хранимое свойство в extension; d21 trips[1]; d22 ticketPrice(for: 0); d23 register при возрасте 15; d24 biggest("apple", "pear"); d25 & у inout; d26 completeTask(at: 5); d27 reduce на пустом массиве; d28 точка входа Command Line Tool; d29 filter/map в passedNames.
- Каждый новый вопрос имеет `hint` (не раскрывает ответ) и `relatedSection` (валидный индекс финальной раскладки; schema-пара соблюдена).

### 3. hint + relatedSection на все 60 существующих вопросов

Оба поля добавлены парой ко всем 60 вопросам (id/question/answer/options/correctIndex существующих вопросов не тронуты). `relatedSection` указывает на раздел, который учит ответу, в ФИНАЛЬНОЙ раскладке (после вставки новых секций: для дней 3–27, 29–30 errors-секция = индекс 3). Подсказки направляют (например, d17 q2: «Константа у класса фиксирует ссылку, а не содержимое объекта; вспомните пример с двумя ссылками»), но не содержат текста ответа и не называют его.

### 4. Overlap-кандидаты (27 дней) и повторная проверка

Посимвольная проверка всех содержательных строк `practice.solution` против `code`-блоков и прозы (ru+tg+en) всех секций каждого дня, до и после правок:

- 18 дней из 27: пересечение ТОЛЬКО с `code`-блоком секции-примера (пример == основа решения; решение в прозе отсутствует) — классифицировано как trust-example, не изменено (правило координатора): дни 2, 3, 5, 6, 7, 9, 10, 11, 14, 15, 18, 20, 22, 24, 26, 27, 29, 30.
- 9 дней содержали строки решения в прозе — проза переформулирована без потери смысла, дословные строки решения удалены (33 замены): день 4 («let area: Double = 142.5», «print(area)»), день 8 («var middleName: String? = "Rahmonovich"», «middleName = nil»), день 12 («ages["Alisher"] = 25»), день 13 («var visited: Set<String> = [...]»), день 16 («task.done = true» — в двух секциях), день 21 («case bus(number: Int)»), день 23 («throw RegistrationError.emptyName»), день 25 («var tasks: [Task] = []»), день 19 («var name: String { get }» в errors-секции, найден повторной проверкой). Примеры: «Объявление var middleName: String? = "Rahmonovich" создаёт коробку…» → «Объявление опционала с начальным значением создаёт коробку…»; «Хранилище — var tasks: [Task] = [], пустой растущий массив…» → «Хранилище — пустой растущий массив задач…».
- Финальная проверка: ни одна содержательная строка решения не встречается в прозе ни одной секции (только в `code`-блоках примеров).
- Новые секции authored без дословных цитат строк решения (повторная проверка это подтверждает). День 28 не был overlap-кандидатом и не изменён.

### 5. Предсуществующие особенности (зафиксированы, НЕ изменялись)

- День 3 q1/q2 и день 5 q2: `answer` — более развёрнутый текст, чем точная correct-опция («Ошибка компиляции: присваивать нельзя» против опции «Ошибка компиляции»; «Интерполяция: "Возраст: \(age)"» против опции `"Возраст: \(age)"`). Это шаблон самих существующих вопросов; текст и опции не изменялись.
- Дни 3 и 30: предсуществующий третий вопрос каждого дня имеет correctIndex 0, как и остальные вопросы дня. Новые вопросы на эти дни не добавлялись (они уже имели по 3 вопроса), существующие индексы не менялись.
- answerSameIdx 94% и longest RU 94% — параметры существующих вопросов (позиции и длины опций) не изменялись; новые вопросы написаны без повторения паттерна (правильная опция не самая длинная; из 28 новых вопросов 16 получили correctIndex 1 и 12 — correctIndex 2, итоговая дистрибуция по 90 вопросам [58, 20, 12]).

## Верификация источников (The Swift Programming Language, прочитано через WebFetch)

Сайт `docs.swift.org/swift-book/...` (SPA) отдаёт скрейперам только подвал — страницы `.../thebasics/` и корень не содержат текста главы (РУСТ сабт: URL открыт, контент не получен). Использованы официальные исходные markdown главы TSPL из репозитория `swiftlang/swift-book`:

| URL | Что подтверждено |
|---|---|
| https://raw.githubusercontent.com/swiftlang/swift-book/main/TSPL.docc/LanguageGuide/TheBasics.md | nil — «absence of a value»; force unwrap nil → «runtime error» (~fatalError); if let — временная константа внутри ветки; guard-константы доступны после guard; let «can't be changed once set», рекомендация объявлять константы |
| .../LanguageGuide/ControlFlow.md | switch «must be exhaustive», default «must always appear last»; else guard-а «must transfer control to exit the code block» (return/break/continue/throw/fatalError); closed range `...` включителен, `..<` исключает правую границу; while «until a condition becomes false» |
| .../LanguageGuide/StringsAndCharacters.md | интерполяция `\(...)`; count считает Character (grapheme clusters), не совпадает с NSString length; конкатенация `+` |
| .../LanguageGuide/CollectionTypes.md | append в конец; индексация с 0; выход за границы → «runtime error»; Set — «distinct values… with no defined ordering», contains; словарь — subscript «returns an optional value», присваивание по новому ключу добавляет пару |
| .../LanguageGuide/Functions.md | аргумент-метки обязательны на месте вызова; значения по умолчанию можно опускать; inout требует `&` у переменной; именованные части кортежа доступны через точку |
| .../LanguageGuide/Closures.md | shorthand $0/$1, arity по старшему используемому; sorted(by:) как пример; замыкание — передаваемый код |
| .../LanguageGuide/ClassesAndStructures.md | структуры — value types «copied when assigned»; классы — reference types; «All structures have an automatically generated memberwise initializer»; let у класса фиксирует ссылку, свойства менять можно; «prefer structures» |
| .../LanguageGuide/Protocols.md | протокол — «blueprint of methods, properties, and other requirements»; соответствие через двоеточие; массивы протокольных типов с box-косвенным |
| .../LanguageGuide/Extensions.md | extension добавляет computed properties/методы/init; «can't add stored properties», не умеет override |
| .../LanguageGuide/Enumerations.md | enum с associated values; извлечение через `case .x(let v)`; switch по enum обязан быть исчерпывающим |
| .../LanguageGuide/ErrorHandling.md | ошибки — типы, соответствующие Error; throw только в throws-функциях; try на каждом вызове; catch-шаблоны проверяются по порядку, первый подходящий обрабатывает; неперехваченная ошибка поднимается дальше |
| .../LanguageGuide/Generics.md | T — «actual type… determined each time the function is called»; ограничения `T: Equatable`/Comparable после двоеточия; generic-типы (Stack) |
| .../LanguageGuide/BasicOperators.md | `a ?? b` — «unwraps an optional a if it contains a value, or returns a default value b» |

## Проверки

1. `npx vitest run tests/course-quality-guard.test.ts tests/course-taxonomy.test.ts tests/programming-intros.test.ts` — 3 файлов, 22 passed | 7 skipped (swift в skip-плейсхолдере runtime-интро; runtime-execution теста для swift в tests/ нет — подтверждено grep). НОКОМ шуд.
2. `npx tsc --noEmit` — exit 0. `npm run lint` (eslint src/) — exit 0.
3. `courseContentSchema.safeParse(JSON.parse(swift.json))` — `schema parse ok: true` (в т.ч. superRefine hint/relatedSection парами и границами relatedSection).
4. Собственный структурный скрипт: 30 дней × 4 sections × 3 questions; все RU-боди новых секций 250–700; все боди ≥80 символов; tg ≠ ru на секциях и вопросах; hint ≥16 символов на ru/tg/en у всех 90 вопросов; relatedSection < sections.length; id уникальны; correctIndex новых вопросов отличается от существующих своего дня; answer новых вопросов = correct-опция; ни одной строки решения в прозе.
5. Swift runtime: `swift`/`swiftc` отсутствуют в среде проверки (`swift: command not found`) — исполнение примеров и вопросов SKIPPED/UNVERIFIED, зарегистрировано; самообман не создавался (тексты не утверждают проверенного вывода).

## Кори боқимонда (remaining work)

- Runtime-execution тест для swift появится, когда среда с toolchain станет доступной; placeholder `tests/programming-intros.test.ts:148` остаётся `it.skip`.
- Heuristics answerSameIdx/longest-RU остались на предсуществующих 60 вопросах (94%); пересмотр позиций/длин существующих опций вне рамок этой задачи (координатор: options не менять).
- При пересчёте loaders/coverage нужно перегенерировать счётчики курс-отчётов по общей процедуре (это касается владельцев всех курсов, не только swift).

## Follow-up factual corrections — 17 November 2026

This follow-up addresses the seven coordinates found by independent review. It supersedes the earlier blanket statements about literal type mismatches, mutable parameter copies, array protection, division and entry-point filenames. The earlier structural batch retains its recorded scope and execution limits.

| Day and fields | Confirmed issue and correction |
| --- | --- |
| 4, sections 0/2/3, q2 prompt/hint, task, criterion 3 and solution | The prior text called bare `5 + 2.5` a compile error. Numeric literals infer a common floating-point type in context. The deliberate error now uses `whole: Int` and `fraction: Double`, and the repair converts `whole`. The reference includes the temperature extension and both valid 7.5 expressions. The question keeps its answer and all option positions. |
| 16, section 3 | Named labels identify arguments while their order still follows the parameter list. The lesson now contrasts `Task(done: false, title: "x")` with the declared `Task(title:done:)` order. |
| 24, sections 2/3, q2 prompt/hint | The generic mismatch example now uses already typed Int and Double variables. Both parameters need one T for the call. Contextual inference for bare literals is distinguished without claiming a locally executed result for `biggest(3, 4.5)`. |
| 25, sections 2/3, q1/q3 hints | Removing inout while retaining append produces an immutable-parameter diagnostic. A separate `var copy = list` is required for a mutable local copy. Keeping inout and removing the call-site ampersand is a distinct compile-time error. The task already requested reading this error and restoring both markers. |
| 26, section 2 | Swift array subscripting checks bounds and traps on invalid indices. The example's guard supplies a recoverable false result before indexing. The prior description of subscripting as unprotected was corrected. |
| 27, section 2 | The reference already checks `totalMinutes > 0`. Zero planned minutes selects its fallback without division. The explanation now distinguishes ordinary integer division-by-zero trapping from Double NaN and signed infinity. |
| 28, section 3, q3 prompt/hint | `main.swift` is presented as the illustrated Command Line Tool template and a compiled multi-file top-level entry mechanism. The lesson allows scripts named `lesson.swift` and the `@main` entry mechanism. The q3 prompt is explicitly about the illustrated template. |

All corrections have full RU/TG/EN text. The course keeps its 30-day sequence, original lesson and question IDs, prerequisites and source IDs. A direct comparison with HEAD preserved all 62 pre-existing question answers, options and correct indices. The 28 questions added by the structural batch remain in place with their original indices. The follow-up changes no quiz option text or order. Existing executable examples remain intact, with the day-4 solution extended to satisfy the corrected practice task.

### Official sources read during this follow-up

These exact resources were opened on 17 November 2026. The Swift Book and source repositories use mutable `main` URLs. The notes report a source review against that material and make no claim about a pinned local compiler version.

- [The Swift Programming Language, The Basics](https://raw.githubusercontent.com/swiftlang/swift-book/main/TSPL.docc/LanguageGuide/TheBasics.md) explains contextual inference when integer and floating-point literals share an expression, explicit conversion of already typed numeric values, and floating-point special values. It supports the day-4 correction and the numeric distinction in day 27.
- [Functions](https://raw.githubusercontent.com/swiftlang/swift-book/main/TSPL.docc/LanguageGuide/Functions.md) requires argument order to match the parameter list and describes ordinary parameters as immutable and inout calls as using the ampersand. It supports days 16 and 25.
- [Generics](https://raw.githubusercontent.com/swiftlang/swift-book/main/TSPL.docc/LanguageGuide/Generics.md) states the shared T constraint, and [Collection Types](https://raw.githubusercontent.com/swiftlang/swift-book/main/TSPL.docc/LanguageGuide/CollectionTypes.md) describes an out-of-range array subscript as a runtime error. These support days 24 and 26.
- [Swift integer implementation](https://raw.githubusercontent.com/swiftlang/swift/main/stdlib/public/core/Integers.swift) and the Swift Book numerical discussion were checked for integer division protection and the distinction from floating-point values. The actual day-27 reference was inspected and its existing ternary guard retained.
- [Declarations](https://raw.githubusercontent.com/swiftlang/swift-book/main/TSPL.docc/ReferenceManual/Declarations.md) lists alternative top-level entry mechanisms. The official [Swift driver](https://raw.githubusercontent.com/swiftlang/swift-driver/main/Sources/SwiftDriver/Driver/Driver.swift) selects immediate mode for interactive invocation with an input. [Build a Command-line Tool](https://www.swift.org/getting-started/cli-swiftpm/) shows an executable with an @main entry type. These qualify day 28's filename statement.

New course explanations are original wording. The [Swift Book repository licence](https://raw.githubusercontent.com/swiftlang/swift-book/main/LICENSE.txt) was inspected and states Apache 2.0 with the runtime exception. No chapter text or media was imported. An attempted `ImmediateJob.swift` source path returned 404 and was not used. The driver mode logic was read at the working Driver.swift path.

### Checks and remaining execution limits

- `python -I scripts/course-authoring/audit.py swift` completed with 30 days, no section/question/hint/translation gaps, and 90 questions. It still flags 18 days with repeated criteria, one short solution and guided/reference overlap of 86%. This scoped factual follow-up does not constitute complete independent-practice acceptance.
- `npx vitest run tests/general-course-content.test.ts tests/course-quality-guard.test.ts tests/programming-intros.test.ts` passed 21 tests with 7 skipped in three files. The published schema loader passed. These tests check content structure and the available language cases. Swift execution remains skipped.
- `git diff --check -- src/content/courses/swift.json` passed. The preservation comparison checked IDs, days, prerequisites, sources, all 62 HEAD answer/option contracts, the 90 feedback destinations and the existing day-27 zero guard.
- `Get-Command swift,swiftc` found neither executable. The exact corrected Swift cases have not compiled or executed in this environment. Required future runtime checks include the valid literal sum, typed mismatch and conversion, memberwise argument order, typed generic mismatch, both inout diagnostics, invalid-index recovery and raw bounds trap, zero-minute report fallback and renamed script execution. Xcode and an Apple device were unavailable for this follow-up.
