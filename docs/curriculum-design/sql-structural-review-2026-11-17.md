# SQL course structural review — 17 ноября 2026

Владелец курса: `sql` (RU/TG/EN), ветка `main`. Проверка выполнена по audit `docs/audits/continuation-quality-2026-11-17.json` (courseId `sql`) и по фактическому loader, до правок: 30 дней, 16 дней с 4 section и 14 дней с 3 section; все 30 дней `questions = 2`; без `hint`/`relatedSection` — 52 из 60 существующих вопросов (8 уже имели обе связки: day-05-q2, day-08-q2, day-09-q1, day-15-q2, day-16-q2, day-17-q2, day-24-q1, day-27-q1); 28 overlap-кандидатов; эвристики `answerSameIdx = 60 %`, `longestCorrectOptionRu = 72 %`.

## Изменённые файлы (только файлы владельца курса)

- `src/content/courses/sql.json`
- этот review-файл

`tests/programming-intros.test.ts`, `tests/sqlite-grader.test.ts`, schema, каталоги, scripts, другие курсы и reports не тронуты. Коммит/push не выполнялись — изменения остаются в рабочем дереве. В рабочем дереве лежат незакоммиченные правки других владельцев (csharp, java, php, ruby, rust, backend-pro); они не затронуты.

## Что было найдено (координаты до правок)

| Находка | Где |
|---|---|
| 14 дней с 3 section: 3, 4, 7, 11, 12, 13, 18, 20, 22, 23, 25, 26, 28, 30 | `daysWithFewerThan4Sections` |
| Все 30 дней имели ровно 2 question: дни 1–2 — `-q`, `-q2`; дни 3–30 — `-q1`, `-q2` | все дни |
| 52 существующих вопроса без `hint`/`relatedSection` (и 30 будущих) | `daysWithMissingLinkedHints` |
| Theory/solution overlap: 28 кандидатов audit-эвристики (`daysWithPracticeSolutionInTheoryCandidates`) | дни 1–24, 26, 27, 29, 30 (без 25 и 28 — письменные) |
| Дублирование пары `correctIndex` у 18 дней `(0,0)`, у 10 дней `(1,1)`, у 9 дней смешанная `(0,1)`/`(1,0)`, у дня 1 — `(1,2)`; `answerSameIdx = 60 %`, longest-RU-option = 72 % — эвристики, правки существующих options не требуются | см. «Оставшаяся работа» |

Runtime для sql существует: `tests/programming-intros.test.ts` («SQL course: every executable day runs in real SQLite and matches its recorded output») исполняет `practice.solution` каждого code-дня в sqlite3 и сверяет stdout с `output.en` первого section с `output`. До правок тест был зелёным (28/28 code-дней + 2 письменных), поэтому все существующие solution/output/code сохранены байт-в-байт.

## Что исправлено

### 1. Четвёртый раздел на 14 днях (3 → 1-то)

По правилу «errors уже есть — «Глубже» ПЕШ аз errors»: контент ошибок lives внутри «Запустите и проверьте» («Частые ошибки: …»), поэтому новый раздел вставлен на позицию 1, ПЕРЕД разделом запуска, сохраняя структуру дня: пример → «Глубже/в реальном проекте» → запуск и проверка → практика. Дни без раздела ошибок (письменные 25 и 28): раздел добавлен в конец (позиция 3).

Темы новых разделов (каждая — edge case + пайванд к соседним дням, без поля `code`/`output`, поэтому recorded-output-привязки не сдвигаются):

- день 3 «WHERE в реальном проекте: границы и NULL» — строгое сравнение на границе, NULL в `<>`, типы `'20'`/20; пайванд к дням 2 и 5;
- день 4 «LIKE и BETWEEN в реальном проекте» — включённые концы BETWEEN, `%a%` без опоры на начало (пайванд к дню 24);
- день 7 «DISTINCT в реальном проекте: комбинации и цена» — multi-column DISTINCT, NULL-группа, отличие от UNIQUE (дни 5, 23);
- день 11 «INSERT в реальном проекте: неполные данные» — DEFAULT/NULL, NOT NULL без DEFAULT (дни 1, 2, 5);
- день 12 «UPDATE в реальном проекте: репетиция условия» — SELECT с тем же WHERE, транзакция (день 27), тихий `changes() = 0`;
- день 13 «Возврат данных после мягкого удаления» — возврат флага, COUNT(*) vs видимый список;
- день 18 «Алиасы в реальном отчёте и неоднозначные столбцы» — ambiguous column name, граница алиаса ORDER BY vs WHERE (день 16);
- день 20 «CASE в реальном отчёте: порядок веток» — перекрывающиеся пороги, ELSE-страховка (дни 3, 5);
- день 22 «Даты в реальном проекте: смешанные форматы» — ISO-текст vs `'01.10.2026'`, NULL от date()/strftime() (дни 5, 6);
- день 23 «Ограничения при изменении живой схемы» — CHECK не чинит старые строки, ALTER TABLE/CREATE UNIQUE INDEX (день 24);
- день 25 «Пределы нормализации: цена в истории заказа» — фиксация цены в order_items, «факт события vs справочник»;
- день 26 «VIEW в реальном проекте: переопределение и зависимости» — DROP VIEW + CREATE VIEW, зависимости по именам, слои отчётов;
- день 28 «Копии в реальном проекте: расписание и учёт» — цена потерянной работы, сверка COUNT(*), дампы без личных данных (дни 23, 27);
- день 30 «Отчёт в реальном проекте: пороги и параметры» — параметры драйвера вместо склейки (день 1), регламент и перекрёстные проверки 216.

Каждый раздел: `title`/`body` в ru/tg/en; RU body 250–700 символов (проверено скриптом после двух итераций сокращения — 14/14 OK); TG — осмысленный перевод, не копия RU; заголовок про содержание. Проверка tg≠ru по телам и заголовкам — пройдена.

### 2. Третий вопрос на всех 30 днях

- Дни 1–2: id `sql-day-01-q3`, `sql-day-02-q3` (продолжение шаблона `-q`/`-q2`); дни 3–30: `sql-day-NN-q3` (продолжение `-q1`/`-q2`).
- Ровно 3 option; дистракторы — реальные заблуждения новичка («BETWEEN работает только с текстом», «строка перезапишет старую при занятом id», «заказ вставится молча без FK», «JOIN без ON вернёт одну строку», «view хранит снимок», «изменения закрепятся без COMMIT», «копию достаточно сравнить по размеру файла»).
- Тема каждого вопроса — тема дня: NULL-сравнение (1, 5, 17, 19, 20, 26), COUNT(*) vs COUNT(col) (5, 7, 8, 30), GROUP BY + HAVING (9), JOIN-дубли (16, 21), ORDER BY NULL/стабильность (6), LIKE vs = (4, 24), индексы (24), AUTOINCREMENT/PRIMARY KEY (14), транзакции (27), DISTINCT (7), плюс профильные темы остальных дней (WHERE-границы, INSERT, UPDATE-репетиция, мягкое удаление, FK, алиасы, CASE, даты, ограничения, схема, view, копии, отчёты).
- `correctIndex` нового вопроса отличается от обоих существующих `correctIndex` того же дня: день 1 (существующие `(1,2)`) → 0; дни 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30 → 2. Итоговое распределение по 90 вопросам: `{0: 37, 1: 23, 2: 30}` — доминирование позиции снизилось с 60 % до 41 %. Существующие options не менялись; эвристика longest-RU-option помечена audit-ом как «только запись».
- Метод: `answer` = точный текст выбранного option (ru/tg/en), как в существующих вопросах (проверено assert-ом).

### 3. `hint` + `relatedSection` для всех 90 вопросов

Поля добавлены одновременно (требование schema: `(hint === undefined) !== (relatedSection === undefined)` запрещено; `relatedSection < sections.length` после вставки). 52 существующих вопроса получили только эти два поля — `id`, `question`, `answer`, `options`, `correctIndex` не тронуты; 8 вопросов с существующими hint и 8 существующих `relatedSection` сохранены как были. Hint — наводящий, не раскрывающий ответ дословно (проверка `hint.ru == answer.ru` — 0 совпадений; hint-ы не содержат точного текста правильного option). `relatedSection` указывает на раздел, который учит ответу: пример дня (0), новый «Глубже»-раздел (1), «Запустите и проверьте»/«Практика» (2–3), тематический четвёртый раздел (3) — например, `sql-day-16-q3` (строки INNER JOIN) → «Сколько строк даёт JOIN», `sql-day-27-q3` (закрытие без COMMIT) → «Когда изменения становятся постоянными», `sql-day-10-q3` (два товара по минимальной цене) → «Почему самая низкая цена может дать два товара».

## Семантический review overlap-кандидатов (28, без правок)

Точная проверка по каждому из 28 дней (все code-дни 1–24, 26, 27, 29, 30; письменные 25 и 28 в кандидаты не входят): `practice.solution` совпадает строка-в-строку с кодом показанного примера в первом разделе дня (`sections[0].code`) — `sol == example.code: True` на всех 28. Пример кода НЕ присутствует ни в одном `section.body` (prose) — проверено точным поиском каждой строки решения длиннее 30 символов по всем body: `inProseOnly = 0` везде. Дни 25 и 28 — письменные, их решения (эталонные ответы) тоже не дублируются в прозе (`inProseOnly = 0`). По правилу курса это trust-example: решение — показанный пример, а не дубликат прозы. Вердикт: **записано, не менялось**; ни один body не переписывался, ни один solution/output не тронут.

Дополнительная проверка целостности: посимвольное сравнение всех 2723 листовых значений исходного JSON с итоговым — **ни одно исходное значение не потеряно и не изменено** (922 новых листа добавлены; сдвиги путей — только следствие вставки разделов на позицию 1).

## Источники (открыты и сверены через WebFetch)

| URL | Что подтверждено |
|---|---|
| https://www.sqlite.org/lang.html | перечень statement-ов курса (SELECT, INSERT, UPDATE, DELETE, CREATE TABLE/INDEX/VIEW, BEGIN/COMMIT/ROLLBACK, PRAGMA) |
| https://www.sqlite.org/lang_select.html | WHERE «only rows for which the WHERE clause expression evaluates to true are included» (false и NULL отбрасываются); HAVING фильтрует группы и может содержать агрегаты; DISTINCT убирает дубликаты, два NULL равны; ORDER BY по нескольким ключам + LIMIT; «NULLs naturally appear at the beginning of an ASC order-by and at the end of a DESC order-by»; скалярные подзапросы в сравнениях |
| https://www.sqlite.org/lang_aggfunc.html | «count(X) … the number of times that X is not NULL», «count(*) … total number of rows»; «If there are no non-NULL input rows then sum() returns NULL»; «result of avg() is NULL if there are no non-NULL inputs»; «result of avg() is always a floating point value» |
| https://www.sqlite.org/lang_expr.html | операторы с NULL-операндом дают NULL; IS/IS NOT как NULL-безопасная проверка; LIKE: «%» — «any sequence of zero or more characters», «_» — «any single character», case-insensitive для ASCII; CASE: первая истинная ветка, без ELSE — NULL |
| https://www.sqlite.org/lang_createtable.html | INTEGER PRIMARY KEY — алиас rowid и авто-назначение номера; грамматика column-constraint (NOT NULL, UNIQUE, CHECK, REFERENCES, AUTOINCREMENT); «If the CHECK expression evaluates to NULL … it is not a constraint violation» |
| https://www.sqlite.org/pragma.html#pragma_foreign_keys | внешние ключи по умолчанию OFF, включаются per-connection `PRAGMA foreign_keys = ON`, no-op внутри транзакции |
| https://www.sqlite.org/lang_datefunc.html | «SQLite does not have a dedicated date/time datatype»; ISO-8601 TEXT сортируется лексикографически как хронология; date() с модификаторами `+N days`, strftime `%Y-%m`, julianday() |
| https://www.sqlite.org/lang_transaction.html | BEGIN/COMMIT/ROLLBACK; «a transaction will also ROLLBACK if the database is closed» — изменения без COMMIT пропадают |

Все URL открыты и прочитаны; ни один не потребовал отметки «не открылся».

## Проверки

1. `npx vitest run tests/programming-intros.test.ts` — **5 passed / 7 skipped / 0 failed**; «SQL course: every executable day runs in real SQLite» — зелёный, 28/28 code-дней сверены с recorded output (solution/output не менялись).
2. `npx tsc --noEmit` — 0 ошибок; `npm run lint` — чисто.
3. `npx vitest run tests/sqlite-grader.test.ts` — 4 passed (побочный тест курса, не менялся).
4. Скрипт-сверка: 30 дней × ≥4 section × 3 question; hint+relatedSection у всех 90 вопросов; `options[correctIndex] == answer` у всех 90; tg≠ru для новых тел/заголовков/вопросов/подсказок; RU-длина 14 новых тел 250–700; `relatedSection < sections.length` у всех.
5. sqlite3/python: новый `code` не добавлялся ни в один раздел, поэтому запускать нечего; существующие solution-ы переисполнены тестом п. 1 (28/28).

## Оставшаяся работа

- Эвристики `answerSameIdx`/`longestCorrectOptionRu` снижены (60 % → 41 % доминирование позиции), но существующие option-порядки сознательно не менялись (правило «options мавҷудро тағйир надиҳ»). Остаточные паттерны — запись, не правка.
- Наличие hint-ов не доказывает реальную аттестацию: Self Reviewed не доказывает работу на реальных устройствах/аккаунтах и самостоятельно оценённое владение; счёт ведётся только по урокам, загруженным приложением.
- После синхронизации счётчиков владельцем линии — пересборка `catalog-other.ts`, localized scope copy, тестов и матриц (`coverage-matrix.mjs`, `delivery-report.mjs`, `course-content-quality-report.mjs`, `audit-backlog.mjs`) выполняется централизованно и в эту правку не входит.
