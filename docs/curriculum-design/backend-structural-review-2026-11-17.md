# backend — структурный review и repair курса, 17–18 ноября 2026

Владелец курса: `backend` (RU/TG/EN), ветка `main`. Проверка выполнена по audit `docs/audits/continuation-quality-2026-11-17.json` (courseId `backend`) и по фактическому файлу курса до правок. Изменены только два файла владельца: `src/content/courses/backend.json` и этот review-файл. Остальные dirty-файлы (agent-harness, business-foundations, communication, data-analytics, landing-файлы) не тронуты; commit/push/ветки не выполнялись.

## Состояние до правок (audit 2026-11-17, подтверждено программно)

| Находка audit | Подтверждение скриптом |
|---|---|
| 44 published days, 43 дня с <4 section (дни 2–44 по 3 section; день 1 — 4) | подтверждено: `sections` = 3 у дней 2–44, 4 у дня 1 |
| `daysWithFewerThan3Questions: []` | подтверждено: во всех 44 днях по 5 вопросов (220 всего) |
| `daysWithMissingLinkedHints: []` | подтверждено: у всех 220 вопросов есть `hint` (ru/tg/en непустые) и `relatedSection` (0/1/2), пары hint↔relatedSection полные |
| `practiceSolutionInTheoryCandidates`: дни 1, 6, 7 | подтверждено и разобрано ниже — это trust-example, НЕ проза |
| `duplicatePracticeSolutionCandidates`: [40,44], [41,43] | зарегистрировано как сигнал ручного review; решения не тронуты (менять их — вне границы задачи и сломало бы исполняемые тесты) |
| эвристики: `correctIndex=1` в 48 %, longest-RU-option 64 % | зарегистрировано как эвристика; существующие `correctIndex`/options по handoff не менялись |
| `equalBodyCandidates: []`, `missingTranslations: []`, `copyingTaskCandidates: []` | подтверждено скриптом (tg≠ru, en≠ru, en≠tg по всем section/question) |

### Overlap дни 1, 6, 7 — verdict «trust-example», не проза

Эвристика audit сравнивает строки решения (>30 символов) с `sections[].code + sections[].body.ru`. Разбор построчно (2026-11-17):

- **День 1**: 8 из 10 содержательных строк решения совпадают с `code` раздела «Разбор сервера по строкам» (published example); в `body.ru` — 0 совпадений. Две несовпадающие строки — это самостоятельное добавление ученика (`/about`), заданное практикой.
- **День 6**: 2 из 3 строк совпадают с `code` раздела «Лимит запросов»; `body.ru` — 0.
- **День 7**: 2 из 2 строк совпадают с `code` раздела «Фильтрация владельца и безопасный ответ»; `body.ru` — 0.

Вывод: решение практической задачи расширяет опубликованный пример (solution == пример + ученическая надстройка), проза не содержит кода решения. По инструкции владельца («trust-example — сабт кун, тағйир надиҳ») зафиксировано, проза дней 1/6/7 не менялась.

## Проверка привязки тестов к backend.json

`grep -rn "backend" tests/`: специализированные `tests/backend-course.test.ts`, `tests/backend-pro-factual-repairs.test.ts`; списочные `tests/introductory-tracks.test.ts`, `tests/catalog-copy.test.ts`, `tests/track-coverage.test.ts`, `tests/course-taxonomy.test.ts`, `tests/onboarding.test.ts`, `tests/placement.test.ts`, `tests/premium-*.test.ts`, `tests/admin-api.test.ts`. Тесты не изменялись. Ключевые инварианты, которые ограничивали размещение новых разделов:

- `sections[1]` должен оставаться разделом с `code` (published example) для дней 10+; у дня 1 `code` в `sections[2]`.
- `learningFlow.walkthroughSections = [1]` — не смещать индексы 0–1.
- `relatedSection` (0/1/2) должен оставаться < `sections.length` и указывать на тот же раздел.
- `body` каждого раздела: три различных строки (ru/tg/en), каждая >120 символов.

## Что исправлено

**Один новый раздел «Глубже/в реальном проекте» для каждого из 43 дней (2–44)** — суммарно 43 раздела × RU/TG/EN. Требования владельца выполнены:

- `{title, body}` ru/tg/en; RU body 250–700 символов (факт: 250–700, проверено скриптом), tg/en >120, все три строки попарно различны; tg≠ru на всех уровнях.
- Заголовки — «о мазмун» (о содержании дня), не общие: «Статусы и когда их брать» (11), «UPDATE без WHERE» (21), «Порядок строк никто не обещал» (17), «Кто владеет файлом базы» (18), «Порт 0 и конец теста» (32), «Три состояния запуска: работает, завис, упал» (37) и т.д. Полный список — в diff.
- Без `code`/`output` в новых разделах (решения и примеры валидны и исполняются тестами как были).
- Каждый раздел: конкретный edge case дня + пайванд с прошлыми днями (например, день 36 ссылается на день 3 «строки вместо чисел» для PORT, день 43 — на дни 18 и 28, день 44 — на день 35 и на исходные документы курса).
- Дублирования с существующими разделами нет: перед авторингом прочитаны sec[2] всех дней 2–44, углы подобраны так, чтобы не повторять «Разбор и проверка примера» и существующие секции (например, день 15 — «что писать в отказе» вместо повторения «разбор прошёл, запись отклонена»).

**Размещение (по правилу владельца «errors мавжуд — Глубже ПЕШ аз errors, вагарна ба охир»):**

- Дни 2–30, 32–33, 35–44: раздел добавлен в конец (индекс 3).
- День 31: добавлен на индекс 2, ПЕРЕД завершающим разделом «Ожидаемое значение и ошибка теста». Проверено: ни один вопрос дня 31 не ссылается на индекс 2 (все relatedSection 0/1), walkthroughSections=[1].
- День 34: добавлен на индекс 2, ПЕРЕД завершающим «Одинаковый сбой в каждом тесте». Та же проверка пройдена.
- Дни 16 и 42: error-тематические разделы стоят на индексе 0 («Единые ошибки и первый API-проект», «Проект: отказы и защита границ»). Вставка перед индексом 0 невозможна без сдвига example из `sections[1]` — жёсткий инвариант тестов. Раздел добавлен в конец; «Глубже» оказывается после error-разделов, что сохраняет смысл правила (errors не завершают день). Зафиксировано как осознанное отклонение от буквального правила для этих двух дней.

**Ни один существующий элемент не изменён**: id дней/вопросов, порядок опций, `correctIndex`, `answer`, `hint`, `relatedSection`, тексты существующих разделов, `practice` (task/hint/solution/execution/tests), `learningFlow`, `sources`, `files`, `interview`, `prerequisiteDays`, порядок дней и prerequisites — всё сохранено. Diff файла: 516 добавленных строк, 0 удалённых/изменённых (формат 2-space + CRLF сохранён байт-в-байт).

## Источники, проверенные открыто (WebFetch, 2026-11-18)

| URL | Что подтверждено |
|---|---|
| https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview | клиент всегда инициирует запрос; структура запроса (метод, путь, заголовки, тело) и ответа (статус, заголовки, тело); семейства 2xx/3xx/4xx/5xx; stateless, но не sessionless (cookies); расширяемость через заголовки; прокси |
| https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods | GET безопасен/идемпотентен и только читает; POST меняет состояние и не идемпотентен; PUT/DELETE идемпотентны; HEAD/OPTIONS; тела запроса у POST/PUT/PATCH |
| https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie | HttpOnly запрещает чтение через Document.cookie; Secure — только https; SameSite Strict/Lax/None против CSRF; Max-Age/Expires; Domain/Path |
| https://nodejs.org/api/http.html | createServer(requestListener); IncomingMessage: method/url/headers (имена в нижнем регистре); тело запроса — поток («never buffer entire requests»); ServerResponse: writeHead один раз до end, statusCode по умолчанию 200, end() обязателен; listen(port, host, callback); requestTimeout → 408 |
| https://www.postgresql.org/docs/current/tutorial-concepts.html | relation = таблица; «Each table is a named collection of rows… each column is of a specific data type»; порядок строк не гарантирован; таблицы→базы→кластер |
| https://www.postgresql.org/docs/current/tutorial-table.html | CREATE TABLE: имена колонок и типы; ключевые слова нечувствительны к регистру; DROP TABLE (ограничения — в главе 5, на этой странице их нет — зафиксировано честно) |
| https://www.postgresql.org/docs/current/tutorial-transactions.html | транзакция «all-or-nothing»; BEGIN/COMMIT/ROLLBACK; атомарность («either happens completely or not at all»); промежуточные состояния невидимы; пример банковского перевода; savepoints |

Примечание: OWASP-листы сессий/авторизации уже входят в `sources` курса и не переоткрывались; факты про флаги cookie взяты из проверенной страницы MDN Set-Cookie. Все URL открылись; неудачных обращений не было.

## Тесты и проверки (выполнены, 2026-11-18)

1. `npx vitest run tests/introductory-tracks.test.ts` — **6/6 зелёные**, включая «backend validation rejects invalid types…» и «published HTTP example responds with real JSON…» (существующие solution-исполнения не изменены).
2. `npx vitest run tests/course-quality-guard.test.ts tests/course-audit.test.ts` — **17/17 зелёные**.
3. Дополнительно прогнаны затрагивающие backend: `tests/backend-course.test.ts` — **3/3** (включая исполнение примеров в реальном Node и red/green starter-тестов), `tests/backend-pro-factual-repairs.test.ts` + `tests/track-coverage.test.ts` + `tests/catalog-copy.test.ts` — **20/20**.
4. `node scripts/course-authoring/verify_js.mjs src/content/courses/backend.json` — **0 problems** (20 executable lessons).
5. `npx tsc --noEmit` — **0 ошибок**; `npm run lint` — **чисто**.
6. Скрипт-инвариант (отдельный): 44 дня × 4 section; в новых разделах нет code/output; ru/tg/en попарно различны и >120; RU новых разделов 250–700; у всех 220 вопросов полный hint (ru/tg/en) + корректный relatedSection < sections.length; walkthroughSections и relatedSection 0/1/2 не смещены; tg≠ru на всех текстах. **0 проблем** (после исключения ложных срабатываний на существующих code-разделах).

## Оставшаяся работа (вне границы этой задачи)

- Регенерация отчётов (`coverage-matrix.mjs`, `delivery-report.mjs`, `course-content-quality-report.mjs`, `audit-backlog.mjs`, `continuation-quality-audit.mjs`) после изменения счётчиков — по AGENTS.md зона одного integration-owner; не выполнялась, чтобы не трогать чужие dirty-файлы.
- `duplicatePracticeSolutionCandidates` [40,44] и [41,43]: решения дней 40/44 и 41/43 совпадают по структуре (проектные фазы). Требуется ручное semantic review решений; замена решений сломала бы исполняемые тесты — не тронуто.
- Эвристики 48 % / 64 %: ребалансировка `correctIndex`/длин опций по handoff не входила в задачу владельца backend; остаётся для отдельной ревизии квизов.
- Дни 1/6/7 overlap и дубликаты решений — задокументированы выше для независимого reviewer'а.
- Production-запуск, deploy и реальные сетевые операции — Self Reviewed предел сохранён (честно описан в самом курсе, день 37/44).
