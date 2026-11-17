# Java course structural review — 17 ноября 2026

Владелец курса: `java` (RU/TG/EN), ветка `codex/complete-starter-curricula`. Проверка выполнена по действующему loader (`courseContentSchema.parse` при каждом чтении курса, `src/lib/courses/content.ts`) и audit-скрипту `scripts/course-authoring/audit.py`. Координаты до правок: `docs/audits/continuation-quality-2026-11-17.json` → `courseId 'java'` (30 дней <4 sections, 30 дней <3 questions, 30 дней без linked hints, 29 overlap-кандидатов).

Изменённые файлы (только файлы владельца курса):

- `src/content/courses/java.json`
- этот review-файл (новый)

Другие изменённые файлы рабочего дерева (`src/content/courses/backend-pro.json`, `src/content/courses/csharp.json`, untracked `backend-pro-structural-review-2026-11-17.md`) — работа других владельцев курсов в том же checkout, появились в процессе работы, к `java` не относятся и не тронуты. По директиве координатора commit/push не выполнялись.

## Что было найдено (координаты до правок)

| Находка | Где |
|---|---|
| 30 дней имели 3 section вместо 4: у 26 дней секция 2 — errors («Типичные ошибки и практика»), у дней 1–2 — «Запустите и проверьте» + «Среда выполнения», у дня 28 — «Как устроен проект» + «Письменная практика»; errors-секции у 1/2/28 нет | `java-day-01` … `java-day-30` |
| 30 дней имели ровно 2 question; id-шаблоны: дни 1–2 `java-day-0N-q`, `java-day-0N-q2`, дни 3–30 `java-day-NN-q1`, `java-day-NN-q2` | все 30 дней |
| 60 вопросов без `hint`/`relatedSection` (по 2 на день; оба поля добавляются только парой — требование schema superRefine) | все 30 дней |
| 29 overlap-кандидатов (`daysWithPracticeSolutionInTheoryCandidates`, дни 1–27, 29, 30; день 28 — written-практика, не кандидат) | дни 1–27, 29, 30 |
| `learningFlow` у курса отсутствует; дни 1–2 имеют `interview` и `practice.kind === undefined` (28 code-дней с `output` исполняются JDK-тестом) | дни 1–2 |

## Что исправлено

### 1. Четвёртая секция на все 30 дней

- Дни 3–27, 29, 30 (26 дней): новая секция «в глубину / в реальном проекте» вставлена в позицию 2, ПЕРЕД существующей errors-секцией; errors-секция стала четвёртой (шаблон «теория → как работает → в глубину → частые ошибки» сохранён). Существующий текст всех секций сохранён побайтно.
- Дни 1, 2, 28: errors-секции не было, новая секция «Частые ошибки» (3–4 ошибки с причинами) добавлена в конец (позиция 3).
- Каждая новая секция — `{title, body}` на ru/tg/en, проза БЕЗ кода и БЕЗ поля `output` (важно: JDK-тест ищет ПЕРВУЮ секцию с `output.en`; все 28 code-дней сохранили свою output-секцию в позиции 0 — привязки не сдвинуты). RU-длина body 592–696 символов (контракт 250–700); tg — полноценный перевод, tg ≠ ru; заголовки о содержании («Switch в реальном проекте: меню и группировка case», а не «Разберите пример»).

| День | Новая секция (ru) | Тип / содержание |
|---|---|---|
| 1 | Частые ошибки первой программы | ошибки: имя файла ≠ имени public-класса; javac не печатает; регистр в терминале; забытая точка с запятой |
| 2 | Частые ошибки метода и проверки аргументов | non-static из static-контекста; вызов без try/catch; проверка после расчёта; общий Exception прячет причину |
| 3 | Выбор типа в реальном проекте: границы значений | смысл значения → тип; деньги — целые вохидные единицы; var когда тип очевиден |
| 4 | Форматирование в реальном проекте: ширина, локаль и читатель | %5d-ширина; Locale.US закрепляет точку; читаемость шаблона |
| 5 | Числа в реальном проекте: деньги, средние и округление | (a+b)/2.0; 0.1+0.2 = 0.30000000000000004; Math.round/%.2f против хранения |
| 6 | Switch в реальном проекте: меню и группировка case | меню; группировка case; стрелочная форма Java 14 без fall-through |
| 7 | Циклы в реальном проекте: вложенность и выход | двойной цикл; break/continue; забытое n-- |
| 8 | Массивы в реальном проекте: печать, копии и ссылки | println массива даёт `[I@…`; Arrays.copyOf; передача по ссылке |
| 9 | Методы в реальном проекте: имя, одна задача и ранний return | глагол-имя; проверки первыми строками; копия параметра |
| 10 | Строки в реальном проекте: цепочки методов и экранирование | chain trim().toLowerCase(); экранирование \" и \\; StringBuilder в цикле |
| 11 | Объекты в реальном проекте: ссылки и общее состояние | присваивание не копирует; конструктор — место валидации |
| 12 | Инкапсуляция в реальном проекте: инварианты и одна точка контроля | инвариант живёт в методе; final-поля; минимум public |
| 13 | Static в реальном проекте: константы, утилиты и цена общего состояния | три честные роли static; изменяемое общее состояние путает тесты |
| 14 | Наследование в реальном проекте: проверка «является» и композиция | is-a тест; has-a поле; цепочка до Object |
| 15 | Абстракция в реальном проекте: общие поля и шаблонный метод | база хранит общий код; template method; выбор abstract класс vs интерфейс |
| 16 | Интерфейсы в реальном проекте: List, Comparable и код против контракта | List как объявление; Comparable; javadoc |
| 17 | Полиморфизм в реальном проекте: обработчики и instanceof | список обработчиков; instanceof-паттерн Java 16; сигнал поднять метод в базу |
| 18 | Исключения в реальном проекте: свои типы и понятные сообщения | свой тип исключения; сообщение для лога; граница обработки |
| 19 | Списки в реальном проекте: List, неизменяемые источники и выбор | код против интерфейса; List.of без add; массив vs список |
| 20 | Словари в реальном проекте: счётчики, группировка и ключи | getOrDefault-счётчик; группировка; выбор ключа; LinkedHashMap/TreeMap |
| 21 | Множества в реальном проекте: дедупликация и пересечения | new ArrayList<>(new HashSet<>(…)); retainAll/removeAll/addAll |
| 22 | Дженерики в реальном проекте: свой Box и границы стирания | свой Box&lt;T&gt;; type erasure: instanceof List&lt;String&gt; невозможно |
| 23 | Лямбды в реальном проекте: Comparator.comparing и ссылки на методы | comparing(String::length); граница лямбда/метод |
| 24 | Потоки в реальном проекте: ленивость, anyMatch и граница читаемости | anyMatch останавливается на первом совпадении; классификация терминалов; читаемость |
| 25 | Файлы в реальном проекте: кодировка, большие файлы и жизненный цикл | UTF-8 и кириллица; lines() для больших файлов; close при любом исходе |
| 26 | Record в реальном проекте: ключи словаря и компактный конструктор | equals/hashCode по компонентам; компактный конструктор; граница изменяемости |
| 27 | Отладка в реальном проекте: воспроизведение, гипотезы и чтение до конца | повторение по команде; сокращение примера; Caused by |
| 28 | Частые ошибки с пакетами и import | package ≠ папка; java.util.* и свой List; java shop.Product из корня; java.lang автоматом |
| 29 | Модель и сервис в реальном проекте: границы ответственности | сервис не печатает; контракт null; поле против вычисления |
| 30 | Проект в реальной жизни: состояния, идентификаторы и следующие шаги | рассинхрон доступные/выданные; id вместо названия; сохранение в файл; dev.java/learn |

### 2. Третий вопрос (`q3`) на все 30 дней

- id по существующему шаблону: `java-day-NN-q3`; ровно 3 варианта; correctIndex нового вопроса отличается от correctIndex обоих существующих (у дней с существующими [1,1] или [0,0] — новый 2, у дня 18 с [0,2] — новый 1; распределение: 2 → 29 дней, 1 → день 18). Порядок существующих options и их correctIndex не тронуты; `answer === options[correctIndex]` у нового вопроса во всех трёх языках (конвенция курса, проверена скриптом).
- Тема каждого q3 привязана к теме дня: d1 имя файла/класса, d2 static-вызов, d3 var, d4 `"5"+5`, d5 честное деление 7.0/2, d6 порядок else-if, d7 бесконечный while, d8 length-поле, d9 сигнатура, d10 неизменяемость toUpperCase, d11 чтение локальной переменной до присваивания, d12 точка контроля инкапсуляции, d13 static-поле у каждого объекта, d14 одиночное наследование, d15 конструктор абстрактного класса, d16 new Greeter(), d17 instanceof+приведение, d18 checked-исключения, d19 names[0], d20 getOrDefault, d21 нет get(0), d22 алмазный оператор, d23 effectively final, d24 терминальные операции, d25 AutoCloseable, d26 record как ключ HashMap, d27 parseInt("12a"), d28 java.lang, d29 println без toString, d30 boolean-возврат checkout/returnBook.

### 3. `hint` + `relatedSection` для всех 60 существующих вопросов

Оба поля добавлены одновременно, после `correctIndex` (раскладка поля, как в принятой партии algorithms). Hint — наводящий указатель на раздел, не раскрывающий вариант («Ошибка вторая в разделе ошибок — как раз про скобки у length; в каком виде length работает, а в каком ломается?»); длины hint ru 77–123 символов; tg ≠ ru, en ≠ ru. Ни один вопрос до правок `relatedSection` не имел, поэтому сдвиг errors-секции с индекса 2 на 3 не сломал ни одной существующей привязки. Распределение relatedSection по ФИНАЛЬНОЙ раскладке (0 = теория с кодом, 1 = «Как это работает»/«Запустите и проверьте», 2 = новая секция, 3 = errors): 0 → 48, 1 → 27, 3 → 15.

### 4. Каноническое сохранение файла (без перезаписи)

Файл изменён строково-вставочным способом (скрипт-сканер позиций, вставки от конца файла к началу): нерегулярный отступ исходных строк сохранён, diff содержит только вставки и 96 переставленных контекстных строк (`"correctIndex": N` → `"correctIndex": N,` + hint-блок; `},` последних элементов). Программная сверка против `git show HEAD:src/content/courses/java.json` подтверждает побайтную идентичность (на уровне parsed JSON): sources, files, все поля уроков (id, day, prerequisiteDays, title, summary, level, sourceIds, interview, practice), секции 0–1 всех дней, errors-секция каждого дня, все question/answer/options/correctIndex существующих вопросов, порядок дней и вопросов.

## Семантический review overlap-кандидатов (без правок)

29 кандидатов проверены точно (нормализация пробелов; сравнение `practice.solution` с кодом и прозой всех секций ru/tg/en):

- Все 29 дней: `practice.solution` посимвольно совпадает с `sections[0].code` — осознанный trust-example-дизайн («перепечатай — запусти — сверь с разделом — предскажи — измени и проверь»), ранее принятый вердикт для партий python/javascript-pro/algorithms. Решение показано как учебный пример с записанным `output` и исполняется реальным JDK (vitest).
- Полное решение НЕ напечатано в прозе ни одного дня. Парные фрагменты (файл аудита считал их «solution in theory») — короткие inline-цитаты показанного примера или сообщений об ошибках, а не ответ практики: день 8, sec0 — `int[] scores = {10, 20, 30};` и `scores[1] = 25;` (объяснение объявления и замены элемента у уже показанного примера); день 15, sec2 — `double area() {` внутри разбора запрещённого тела `abstract double area() { return 0; }`; день 16, sec0 — `void greet(String name);` (сигнатура интерфейса из показанного кода); день 19, sec0/sec2 — `ArrayList<String> names = new ArrayList<>();` и `import java.util.ArrayList;` (объяснение объявления и упоминание забытого import).
- Независимая часть практики в прозе не раскрыта: день 8 — максимум массива и for-each с номером; день 15 — класс Square; день 16 — CasualGreeter и второй интерфейс; день 19 — longest и удаление чётных с конца; у остальных дней аналогично (добавление элемента, новые методы, граничные вызовы). Ответы независимой части в уроке не напечатаны.
- Итог: механически исправляемого дефекта («solution напечатан как проза-ответ») нет; список 29 дней сохранён как кандидат на отдельную партию независимых решений — требует решения владельца и исполнения каждого нового решения.

## Источники (открыты и прочитаны через WebFetch 2026-11-17)

- https://dev.java/learn/ — открыт; подтверждена структура обучения: first steps → language basics/OOP → generics/lambda → collections/streams → I/O; материал, заявленный в `sources` курса, соответствует содержимому (обзорные ссылки для дней курса).
- https://docs.oracle.com/javase/tutorial/ — открыт (live, «Last Updated 2024-10-25»); подтверждены трейлы Learning the Java Language / Essential Java Classes / Collections; предупреждение об эпохе JDK 8 в tutorial и отсылка к dev.java для новых релизов (учтено: новые формы в текстах датированы — switch-выражение Java 14, текстовые блоки Java 15, instanceof-паттерн Java 16, record Java 16).
- https://docs.oracle.com/javase/tutorial/java/nutsandbolts/switch.html — подтверждено: без break «statements in switch blocks fall through: all statements after the matching case label are executed … until a break statement is encountered»; switch работает с byte/short/char/int, enum, String и обёртками; группировка `case 1: case 3:` (день 6).
- https://docs.oracle.com/javase/tutorial/java/data/autoboxing.html — подтверждено: autoboxing — «automatic conversion … between the primitive types and their corresponding object wrapper classes»; компилятор превращает `li.add(i)` в `li.add(Integer.valueOf(i))` (дни 19, 22, 24).
- https://docs.oracle.com/javase/specs/jls/se21/html/jls-5.html#jls-5.1.7 — JLS подтверждено: боксинг константных значений −128..127 (int/short/byte), `'\u0000'..'\u007f'` (char), true/false обязан давать идентичные ссылки; §5.1.8: «If r is null, unboxing conversion throws a NullPointerException» (фактическая база вопросов про `Integer ==` и распаковку; в текстах курса использована без утверждения о диапазоне за пределами JLS).
- https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html — подтверждено: ресурсы — объекты AutoCloseable; закрытие «whether the try block completes normally or abruptly», в обратном порядке создания; suppressable close-исключения; рекомендация «use a try-with-resources statement instead of a finally block» (день 25).
- https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/package-summary.html — подтверждено: «Intermediate operations … are always lazy»; «Traversal of the pipeline source does not begin until the terminal operation»; после терминальной операции pipeline «consumed, and can no longer be used» (день 24).
- https://docs.oracle.com/javase/tutorial/java/data/strings.html — подтверждено: «The String class is immutable, so that once it is created a String object cannot be changed»; «what these methods really do is create and return a new string» (день 10).
- https://docs.oracle.com/javase/tutorial/java/generics/erasure.html — подтверждено: «Replace all type parameters in generic types with their bounds or Object if the type parameters are unbounded»; «generics incur no runtime overhead» (день 22).

Один URL не открылся с содержимым: https://dev.java/learn/api/streams/ — страница вернулась пустой (записано здесь); Streams-факты дня 24 подтверждаются javadoc'ом java.util.stream (выше). Недоступных доменов не было; контент новых секций опирается на перечисленные страницы без цитирования дословно.

## Локальная верификация кода (OpenJDK 17.0.20, `java`/`javac`)

Новые секции — проза без кодовых блоков (полей `output` не добавлено), но фактические утверждения новых вопросов/секций проверены запуском. Все конструкции, упомянутые в текстах (стрелочный switch, instanceof-паттерн, record, List.of, Files.writeString), доступны в JDK 17; курс требует JDK 21+ для запуска — все проверенные факты действительны и там (ни один не зависит от поведения после 17).

- Рантайм-проверки (23 факта, все OK): var выводит int; `"5" + 5` → "55"; `7.0/2` → 3.5; `0.1+0.2` → 0.30000000000000004; стрелочный switch с `case 6, 7 ->`; `println(scores)` → `[I@…`; `Arrays.copyOf` независимая копия; `toUpperCase()` не меняет оригинал; `Book b2 = b1` делит объект; static-счётчик общий; `String` final; абстрактный класс наследует готовый метод; интерфейсная ссылка хранит реализацию; instanceof-паттерн с переменной; своё исключение с сообщением; `List.of` immutable (`UnsupportedOperationException`); `getOrDefault`; свой `Box<T>` с распаковкой; `Comparator.comparing(String::length)`; UTF-8 round-trip «Салом Душанбе»; record как ключ HashMap; `Integer.parseInt("12a")` → `NumberFormatException`; println без toString → `Plain@…`.
- Компиляционные проверки (3, точные тексты ошибок совпадают с текстами секций): public-класс в файле с другим именем → «class Main is public, should be declared in a file named Main.java»; вызов обычного метода из main → «non-static method helper() cannot be referenced from a static context»; `new Greeter()` для интерфейса → «Greeter is abstract; cannot be instantiated».

## Проверки (выполнены)

- `python -I scripts/course-authoring/audit.py java` — до правок: `sec<4 = 30, q<3 = 30, noHint = 30, noEN = 0, tg=ru = 0, answerSameIdx% = 56, answerLongest% = 75, solInLesson% = 96, repeatTitles% = 60`; после правок: `sec<4 = 0, q<3 = 0, noHint = 0, noEN = 0, tg=ru = 0, answerSameIdx% = 38, answerLongest% = 73, solInLesson% = 96, repeatTitles% = 45`. SolInLesson и genericCrit (29) не изменились — по контракту батча и вердикту trust-example выше.
- Контрольный скрипт структуры: 30 дней × 4 section × 3 question; у каждого из 90 вопросов `hint` (ru/tg/en) и валидный `relatedSection < 4`; `tg ≠ ru` у title/body новых секций и у question/answer/options/hint новых вопросов; id всех 90 вопросов уникальны; RU-длина новых body 592–696; `answer === options[correctIndex]` у всех новых вопросов; q3 correctIndex не совпадает с двумя существующими.
- `npx vitest run tests/programming-intros.test.ts` — 5 passed / 7 skipped / 0 failed; java-тест «every executable day runs with the real JDK» зелёный (28 исполняемых дней против записанного output; после правок прогнан дважды, включая финальный файл).
- `npx vitest run tests/course-quality-guard.test.ts tests/course-taxonomy.test.ts tests/published-curriculum.test.ts tests/track-coverage.test.ts tests/learning-path.test.ts tests/course-progress.test.ts tests/written-review.test.ts` — 81 passed / 0 failed (включая java в published-curriculum и quality-guard «balances correct positions and gives every question a usable hint»; первая попытка дала 1 непоянтный сбой из-за одновременной правки backend-pro/csharp другими владельцами в том же checkout — повторный прогон полностью зелёный).
- `npx vitest run tests/general-course-content.test.ts tests/course-day-plan.test.ts` — 17 passed.
- `npx tsc --noEmit` — чисто (exit 0).
- `npm run lint` (eslint src/) — чисто (exit 0).
- Сверка против `git HEAD`: только ожидаемые дельты (см. п. 4); контрольная пересборка воспроизводит файл байт-в-байт.

## Оставшаяся работа

1. Переделка 29 практик под независимые решения (дни 1–27, 29, 30) — отдельная партия с исполнением каждого нового решения и пересчётом `output`; снизит `solInLesson% = 96`. Записана как кандидат, по вердикту trust-example-дизайна в текущем батче не тронута.
2. `answerLongest% = 73` и `copyTask% = 53`/`genericCrit = 29` (шаблонность criteria) — кандидаты на будущую партию формулировок; требуют правки порядка options/correctIndex и practice-полей, запрещённой контрактом этого батча («id, question, answer, options, correctIndex, solution, task — дамнапарест»).
3. Дни 1–2 сохраняют `practice.kind === undefined` (решение не исполняется JDK-тестом) — кандидат на будущее приведение к code-практике с `output`; требует решения владельца, в контракт батча не входит.
4. Не подтверждено этой партией: независимая педагогическая/языковая вычитка RU/TG/EN (таджикские тексты написаны как полноценный перевод, терминология выровнена с существующими заголовками курса — Инкапсулятсия, Абстрактсия, Мерос, Полиморфизм — но не вычитана носителем), Verified-learning завершение, реальные device/account-операции практики. Только loader-структура, schema, исполнение кода и тесты проверены.
5. Коммит/PR не выполнялись по директиве координатора; файлы лежат в рабочем дереве рядом с in-flight работой других владельцев курсов.
