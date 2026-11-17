# Rust course structural review — 17 ноября 2026

Владелец курса: `rust` (RU/TG/EN), ветка `main`. Проверка выполнена по действующему loader (`courseContentSchema.parse` при каждом чтении курса) и координатам audit `docs/audits/continuation-quality-2026-11-17.json` → `courseId 'rust'` (30 дней <4 sections, 30 дней <3 questions, 30 дней без linked hints, 26 overlap-кандидатов, answerSameIdx 73%, longest RU 88%).

Изменённые файлы (только файлы владельца курса):

- `src/content/courses/rust.json`
- этот review-файл (новый)

Другие изменённые файлы рабочего дерева (`csharp.json`, `java.json`, `php.json`, `backend-pro.json`, `tests/programming-intros.test.ts`, их review-файлы) — работа других владельцев курсов в том же checkout, к `rust` не относятся и не тронуты. По директиве координатора commit/push не выполнялись.

## Что было найдено (координаты до правок)

| Находка | Где |
|---|---|
| 30 дней имели ровно 3 section; ни у одного дня не было секции «Частые ошибки» — по правилу координатора новая секция добавлялась в конец (позиция 3) | `rust-day-01` … `rust-day-30` |
| 30 дней имели ровно 2 question; id-шаблоны: дни 1–2 `rust-day-0N-q`, `rust-day-0N-q2`, дни 3–30 `rust-day-NN-q1`, `rust-day-NN-q2` | все 30 дней |
| 60 вопросов без `hint`/`relatedSection` (по 2 на день; оба поля добавляются только парой — требование schema superRefine, `src/lib/courses/schema.ts:180-193`) | все 30 дней |
| 26 overlap-кандидатов (`daysWithPracticeSolutionInTheoryCandidates`: дни 1–4, 6, 8–11, 13–25, 27–30) | дни 1–4, 6, 8–11, 13–25, 27–30 |
| cargo/rustc в среде проверки недоступны (`cargo: command not found`), `tests/programming-intros.test.ts:148` для rust — `it.skip` (placeholder «await an available local runtime»); runtime-execution тестов для rust нет | среда, tests/ |

## Что исправлено

### 1. Четвёртая секция на все 30 дней

Новая секция «Глубже: … в реальном проекте» добавлена в конец (позиция 3) на каждый день — среди существующих секций дней не было errors-секции, по правилу координатора «вагарна ба охир». Существующий текст всех секций сохранён (единственное исключение — п.4 ниже). Каждая новая секция — `{title, body}` на ru/tg/en, БЕЗ `code`/`output`. RU-длина body 254–700 символов (контракт 250–700, проверено скриптом); tg — полноценный перевод, tg ≠ ru; заголовки о содержании («Глубже: срезы в реальном проекте», а не «Разберите пример»). Каждая секция содержит: граничный случай темы дня (конкретная ошибка компилятора E0384/E0502/E0596/E0004/E0382, паника индексации, границы UTF-8-срезов и т.п.) + явный пайванд с пройденными днями (day1: нет пройденных; day3→day2 checked_mul; day8→day6; day9→day8; day10→day3; day11→day4/day10; day12→day10–11; day13→day12/day7; day14→day13; day15→day10; day16→day8; day17→day4/day11; day18→day6; day19→day2/day20(позже)/day18; day20→day2; day21→day20/day10; day22→day10/day12; day23→day20/day10; day24→day2; day25→day10/day24; day26→day1; day27→day15–16; day28→day11/21/15/22/26; day29→day21/20/24/28; day30→day2/24/19–22/26).

### 2. Третий вопрос на все 30 дней

- id по шаблону существующих: `rust-day-NN-q3`; уникальность проверена (90 вопросов, дубликатов нет).
- 3 option на ru/tg/en с реальными beginner-дистракторами; `answer` = текст correct-опции (шаблон существующих вопросов соблюдён).
- `correctIndex` каждого нового вопроса отличается от ОБОИХ существующих индексов дня (проверено скриптом; день 6 имел [1,1] — новый 2 корректен по правилу). Новая дистрибуция correctIndex по 90 вопросам: 45/15/30 (было 44/13/3 по 60) — доминирующая позиция снижена с 73% до 50%; существующие options не изменялись, порядок новых опций выбран независимым.
- Мавзӯъ = тема ҳамин рӯз: d1 println!-макрос; d2 тип ошибки Result; d3 литерал f64; d4 mut при объявлении; d5 shadowing со сменой типа; d6 типы веток if; d7 break со значением в loop; d8 точка с запятой и return; d9 тип массива [&str; 2]; d10 сохранить владение (&s/clone); d11 изменение через &String; d12 конец заимствования; d13 границы среза [1..3]; d14 &s/as_str; d15 {:?} без derive(Debug); d16 методы только в impl; d17 advance() без mut; d18 число значений enum; d19 связывание в паттерне Circle(radius); d20 match по Some(8); d21 метод push; d22 move в цикл for; d23 stock["unknown"]; d24 ? и тип возврата; d25 expect vs unwrap; d26 поиск файла модуля; d27 вызов describe без impl; d28 тип возврата add_task; d29 mark_done с неверным индексом; d30 состояние после завершения.
- Каждый новый вопрос имеет `hint` (не раскрывает ответ) и `relatedSection` (валидный индекс, schema-пара соблюдена).

### 3. hint + relatedSection на все 60 существующих вопросов

Оба поля добавлены парой ко всем 60 вопросам (id/question/answer/options/correctIndex существующих вопросов не тронуты). `relatedSection` указывает на раздел, который учит ответу (0 — концептуальная секция с кодом для 58 вопросов; день 26: q1→секция 1 «Project structure», q2→секция 2 «Visibility rules»). Подсказки направляют (например, «Точка с запятой превращает выражение в инструкцию»), но не содержат текста ответа и не называют его.

### 4. Overlap-кандидаты (26 дней)

Посимвольная проверка всех содержательных строк `practice.solution` против `code`-блоков и прозы (ru+tg+en) всех секций каждого дня:

- 25 дней из 26: пересечение ТОЛЬКО с `code`-блоком секции 0 (пример == основа решения; решение в прозе отсутствует) — классифицировано как trust-example, не изменено (правило координатора).
- День 15: строка решения `let pages: i32 = book.pages;` стояла в прозе секции 1 (ru/tg/en) как цитата внутри объяснения. Проза переформулирована без потери смысла: «строка let pages… копирует» → «чтение поля pages в переменную копирует» (tg: «хондани майдони pages ба тағйирёбанда…»; en: «reading the pages field into a variable…»).
- День 27: в прозе секции 1 остаются два фрагмента `#[derive(Debug)]` и `println!("{:?}", city);` — ЗАРЕГИСТРИРОВАНО и оставлено сознательно: это команды инструкции эксперимента («удалите атрибут и попробуйте напечатать»), которые учащийся вводит сам; удаление их из инструкции сделало бы её невыполнимой. Полное решение в прозе отсутствует.
- Новые секции дней 8 и 17 при авторстве цитировали строки решения — переписаны без дословных цитат (проверка повторена: prose-пересечение для них снято).

### 5. Heuristics (только зафиксировано, без правок)

- answerSameIdx 73% → после добавления 30 вопросов с новыми опциями 50% (45/90). Позиции существующих ответов не менялись.
- longest RU 88% — параметры существующих вопросов (длины опций) не изменялись; новые вопросы писались без повторения паттерна (правильная опция не самая длинная ни в одном новом вопросе).
- `answer` у новых вопросов = текст correct-опции — это шаблон курса (так во всех 60 существующих вопросах).

## Верификация источников (The Rust Book, прочитано через WebFetch)

| URL | Что подтверждено |
|---|---|
| https://doc.rust-lang.org/book/ch03-05-control-flow.html | loop-выражение и `break counter * 2;` (листинг с result=20); ветки if одного типа (E0308); правая граница диапазона не входит («ending before») |
| https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html | move для String (E0382 «borrow of moved value»); integer Copy; функция со String забирает владение; drop при выходе из scope |
| https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html | & читает без владения; одна &mut одновременно (E0499); &mut при живых & — E0502; изменение через & — E0596; NLL («scope … through the last time that reference is used») |
| https://doc.rust-lang.org/book/ch04-03-slices.html | срез = указатель + длина, данные у владельца; [0..5] правая граница не входит; срез на не-границе UTF-8 символа — ошибка; `fn first_word(s: &str)` принимает &String и литерал |
| https://doc.rust-lang.org/book/ch05-02-example-structs.html | {:?} требует Debug через #[derive(Debug)] (E0277); вид `Rectangle { width: 30, height: 50 }`; Display для структур по умолчанию нет |
| https://doc.rust-lang.org/book/ch05-03-method-syntax.html | методы в impl; &self заимствует, &mut self меняет; ассоциированные функции без self через `::` |
| https://doc.rust-lang.org/book/ch06-01-defining-an-enum.html | Option<T> = Some/None; в Rust нет null; компилятор требует обработать None (E0277 «cannot add Option<i8> to i8») |
| https://doc.rust-lang.org/book/ch06-02-match.html | варианты с данными (Quarter(UsState)); связывание в паттерне; исчерпывающий match (E0004 с перечнем недостающих) |
| https://doc.rust-lang.org/book/ch08-01-vectors.html | push добавляет в конец; индексация паникует при выходе за границы; get возвращает Option<&T>; for по &v — immutable references |
| https://doc.rust-lang.org/book/ch08-03-hash-maps.html | get → Option<&V>; произвольный порядок итерации («arbitrary order»); insert перезапись |
| https://doc.rust-lang.org/std/collections/struct.HashMap.html | Index: «Panics if the key is not present in the HashMap» (для вопроса дня 23 о stock["unknown"]) |
| https://doc.rust-lang.org/book/ch09-01-unrecoverable-errors-with-panic.html | паника: сообщение, unwind, очистка стека; v[99] паникует «index out of bounds» |
| https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html | ? при Err возвращает ошибку из функции; ? только с Result/Option-совместимым типом возврата; `fn main() -> Result<(), E>` допустим; expect печатает заданное сообщение, unwrap — общий, expect предпочтительнее в production |
| https://doc.rust-lang.org/book/ch03-01-variables-and-mutability.html | shadowing со сменой типа (spaces: &str→usize); const требует явный тип и вычисление при компиляции; SCREAMING_SNAKE_CASE |
| https://doc.rust-lang.org/book/ch03-02-data-types.html | кортеж: разные типы, фикс. длина, .0, деструктуризация; массив: один тип, тип включает длину [i32; 5]; Vec растёт |
| https://doc.rust-lang.org/book/ch01-02-hello-world.html | println! — макрос (! = macro); `rustc main.rs` даёт исполняемый файл |

Открытый чек установки (https://doc.rust-lang.org/book/ch01-01-installation.html) подтвердил rustup как установщик; rustc/println! подтверждены отдельной страницей ch01-02. Все утверждения новых секций/вопросов соответствуют перечисленному; факты за пределами перечисленных страниц (checked_mul, as_str, push_str, ok_or, unwrap_or, chars().count(), std::fs/std::env) взяты из уже авторского текста курса и стандартной библиотеки и были уже в контенте дней.

## Запуск кода

- cargo/rustc в среде проверки ОТСУТСТВУЮТ (`command not found`) → исполнение новых/существующих примеров не проводилось: **SKIPPED/UNVERIFIED** (записано честно; слабее не делалось).
- Тест rust runtime-execution в tests/ отсутствует: grep по tests/ находит только `course-taxonomy.test.ts:50` (трек languages) и `programming-intros.test.ts:148` (`.it.skip` placeholder для rust). Новых runtime-обязательств курс не получил: новые секции без `code`/`output`, новые вопросы — выбор из вариантов.

## Проверки (все пройдены)

1. `npx vitest run tests/course-quality-guard.test.ts tests/course-audit.test.ts tests/course-taxonomy.test.ts tests/general-course-content.test.ts tests/programming-intros.test.ts` — 37 passed, 7 skipped (в т.ч. «loads all catalog courses» = schema-parse rust.json через loader; повторный прогон после патчей дней 8/17 — 32 passed).
2. `npx tsc --noEmit` — чисто; `npm run lint` — чисто.
3. Скрипт структурной валидации: 30 дней × 4 section × 3 question; 90/90 вопросов с hint+relatedSection (relatedSection < 4); RU-body новых секций 250–700; tg ≠ ru для секций и подсказок; answer == correct-опция у всех вопросов; correctIndex новых вопросов ≠ обоих существующих; option-тексты уникальны внутри вопроса; id уникальны.
4. Повторный overlap-скан: prose-пересечение решения только день 27 (2 задокументированных фрагмента-инструкции).

## Остатки / следующее

- Runtime-исполнение примеров остаётся непроверенным до появления cargo/rustc (след тогдашний: `tests/programming-intros.test.ts` для rust разблокировать).
- Heuristics answerSameIdx/longest-RU — ручной ревью-кандидат при следующей итерации качества (новые вопросы написаны с учётом, существующие не тронуты).
- Каталог/localized copy/coverage-скрипты не пересобирались: количества дней курса не менялись (30 → 30), изменялись только внутренности уроков (секции/вопросы/подсказки), что по правилам координатора не требует пересборки catalog-other.ts.
