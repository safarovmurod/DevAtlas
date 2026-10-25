# DEVATLAS — ПРОДОЛЖЕНИЕ РАБОТЫ (FULL PROFESSIONAL CONTINUATION PROMPT)

## Дата: 2026-10-25 · Контрольная точка: `main` @ `875a405` (CI: success, Kotlin PR #8 merged)

## ТВОЯ РОЛЬ

Ты — команда Principal Engineer + Senior Curriculum Architect + QA. Ты продолжаешь уже идущую работу над DevAtlas (https://github.com/safarovmurod/react-mentor). Проект НЕ начинается с нуля — он в активной разработке, всё перечисленное ниже реально существует, проверено тестами и слито в `main`.

**Главные правила (нарушать нельзя):**
1. Никакого фейкового контента: нет дней-пустышек, нет выдуманных выводов программ, нет «completed» по наличию JSON-полей.
2. `publishedDays` в каталоге ВСЕГДА равен реальному числу уроков (это проверяет `tests/published-curriculum.test.ts`).
3. Существующие уроки расширенных курсов сохраняются ТОЛЬКО аддитивно (byte-identical; можно лишь дописывать секции/вопросы/опции).
4. Beginner (Starter) всегда бесплатный. Premium контент защищён сервером (не трогать эту границу).
5. Каждый шаг: валидатор → тесты → build → commit (branch `feat/track-architecture-20261024` или новая ветка) → push → merge в `main` через GitHub API (НЕ force-push). CI обязан быть зелёным.
6. Среду проверять по факту. В подготовленной облачной среде Linux: Node 24, Python 3, OpenJDK 21 и Kotlin/JVM 2.2.21 (`KOTLINC=/workspace/tooling/bin/kotlinc`). Этот путь локален для облачной машины; CI без Kotlin явно пропускает runtime-тест. Историческое локальное окружение Windows отличалось: Python 3.12, JDK 17 и Git Bash; не переносить его пути и список SDK на другую машину без проверки.

## ЧТО УЖЕ СДЕЛАНО (не переделывать!)

### Платформа
- **43 курса, 38 learning tracks** (`LEARNING_TRACKS` в `src/content/courses/catalog.ts`), stage выводится из `accessTier` (beginner/free, pro, expert). Каждая страница курса показывает 3 стадии трека честно («не опубликован» если нет).
- Лимит 30 дней снят: schema max 120, route/workspace валидируют по `publishedDays`.
- **Mastery (§8)**: `masteredQuestions` в прогрессе (синхронизируется между устройствами), retry после неверного ответа, панель «Мастерство: x/y» и бейджи. Тесты: `tests/mastery.test.ts`.
- **Site Agent (ассистент сайта)**: плавающая кнопка → чат (`src/components/agent/site-agent.tsx` + `src/lib/agent/site-agent.ts`). Отвечает на вопросы о платформе из реального каталога/прогресса; вопросы по материалам уроков пересылает в проверенную библиотеку ответов курса (`/api/tutor`), помечается «From course materials». Оvoice через SpeechSynthesis с toggle. Тесты: `tests/site-agent.test.ts`.
- **Content Quality Auditor**: `node --experimental-strip-types scripts/course-content-quality-report.mjs` → `docs/SELF_LEARNING_CONTENT_AUDIT.md` (слова теории/день, вопросы/день, код-дни, stale-копирайт с проверкой заявленного scope vs фактического).
- Дизайн: aurora-фон на всех страницах, крупная типографика лендинга, entrance-анимации, glassy header, micro-interactions (reduced-motion safe, dark/light). E2E на тему обновлены (проверяют `documentElement`, не `body`).
- **894 scheduled дня с React**, **834 без его 60 дней**. Старый отчёт ошибочно включал React в итог с подписью «без React»; использовать реальные данные каталога и обновлённый `scripts/track-coverage-report.mjs`.

### Курсы 30 дней (все слиты, все проверены):
- Бесплатные: **Python** (29/29 решений исполнены Python 3.12), **Java** (28/28 исполнены JDK), **Node.js** (28/28 node), **SQL** (28/28 в реальном SQLite), **Go** (28/28 компиляция+запуск go 1.23), **C#** (мех. верификация), **Rust** (мех.), **PHP** (мех.), **Ruby** (мех.), **Bash** (28/28 исполнены GNU bash), **MongoDB** (мех., детерминированный mongosh), **Swift** (мех.), **CSS** (30 дней + 5 Sass-уроков библиотеки сохранены; 9 JS-симуляторов исполнены node).
- Premium 30 дней: **JavaScript Pro, Backend Pro, UX Pro, Business Pro, Architecture Expert** (backend-pro: 30/30 исполнены; js-pro: 26/26 исполнены).
- React (60 дней, отдельный корпус — не трогать структуру), Next.js 20, HTML/JS1/JS2/Git/C++ по 30 (старые, теория короткая — см. Фазу E).
- AI-курсы по 14 дней: ai-fundamentals, context-engineering, agent-harness (бесплатные, исполнения проверены).
- **Kotlin — 30 дней**: RU/TG/EN, типы и null safety, коллекции, классы, интерфейсы и консольный список задач. Все 30 решений скомпилированы и выполнены на Kotlin/JVM 2.2.21; проверены stdout, отрицательный аргумент, переполнение и обнаружение сломанного удаления. PR [#8](https://github.com/safarovmurod/react-mentor/pull/8) слит в `main`, CI и Vercel Production успешны. Дни 1–2 сохранены без изменений; подробности и ограничения — [kotlin-course.md](kotlin-course.md).

## ЧТО ПРОПУЩЕНО / ОСТАЛОСЬ (по приоритету)

### Фаза D-1 (продолжение расширений 2→30)
- **kotlin** — завершён, 30 дней. Не начинать заново; дальнейшее развитие отдельной задачей.
- **mobile** — в проверенной контрольной точке 2 дня. Расширение до 30 остаётся следующим этапом; незавершённых дополнительных уроков в файле нет.
- **backend** (2 дня) → 30 (Node.js http-сервер с нуля; часть решений уже есть в backend-pro — писать БЕЗ дублирования, beginner-уровень).
- **ux-design** (2 дня) → 30 (written-практика: исследования → IA → прототипы → тесты; NOT code).
- 9 общих курсов 2 дня → 14–30: digital-marketing, data-analytics, business-foundations, management-foundations, communication, content-creation, english-foundations, digital-literacy, personal-productivity (для них `kind:"written"`, referenceAnswer>300, критерии ≥3, task «1. … 4. …»; тест `tests/general-course-content.test.ts` — обновить `appliedDays`/счётчик уроков при расширении ux-pro-подобных).

### Фаза F: TypeScript, Algorithms, 3 AI-курса — с 14 до 30 дней (дописывать дни 15–30, сохраняя 1–14 аддитивно).

### Фаза G: Pro/Expert для остальных треков (python-pro, react-pro, sql-pro, git-pro, ai-*-pro/expert и т.д.) — каждый 30 дней, depth по профилю трека.

### Фаза E: углубление теории HTML/JS1/JS2/Git/C++ (auditor показывает avg 45–57 слов ru/день; цель 120–200, дополнять секции существующих дней аддитивно).

### Фаза I-2: вопросы — сейчас 2–3/день; довести до 4–5 качественных в первую очередь в курсах Фаз D/F.

### Фаза H: интерактивные визуализаторы (specificity-калькулятор CSS уже есть как образец; event loop, flexbox playground, binary search и т.д.).

### Фаза J: AI Mentor — мульти-чат с историей (сейчас одиночный TutorDrawer + site agent; нужен persistent multi-conversation с per-account изоляцией).

### Payments: остаются fail-closed (никаких фейков) до реального провайдера.

## РЕЦЕПТ РАСШИРЕНИЯ КУРСА (проверенный, 13 курсов так сделано)

1. Прочитать `src/content/courses/<id>.json` (дни 1–2 сохранить аддитивно; допускается: +1 опция к существующему вопросу, +1 вопрос, +`practice.kind`, +1 секция — ЕСЛИ контракт требует).
2. Написать 28 новых уроков (дни 3–30): `id: <id>-day-NN` zero-padded, `day` подряд, `prerequisiteDays: [N-1]`, RU/TG/EN (таджикский кириллицей ӣӯҳқҷғ), `level:"beginner"`, sections 3–4 (120–200 слов/язык), questions 2–3 × 3–4 опции (`answer === options[correctIndex]` по желанию — для general-курсов обязательно), practice kind code|written.
3. **Верификация**: если язык исполняется локально (python/java/node/bash/sqlite/go) — КАЖДОЕ решение запустить и записать точный stdout в `output` первой output-секции, `practice.solution === этой секции.code`. Если не исполняется — механическая проверка (баланс скобок, детерминизм, stdlib-only) + честная приписка в отчёте.
4. **Подключение** (4 файла):
   - `tests/programming-intros.test.ts`: убрать id из списка `ids`, заменить блок теста на generic-прогон всех исполняемых дней (образцы для java/node/go/bash/sql уже там; CRLF-normalize, timeout 180000+).
   - `src/content/courses/catalog.ts`: `<id>` → `publishedDays: 30` + ru/en описание.
   - `src/lib/catalog-copy.ts`: DESCRIPTIONS.<id> × 6 локалей (переводы, не копия en; в tg не допускать латиницы внутри кириллицы).
   - При необходимости обновить пины в `tests/course-taxonomy.test.ts`.
5. Валидатор (однолинейник из предыдущих промтов — см. любой завершённый курс в git log, например commit «Bash beginner course expands»).
6. `npm run typecheck && npm run lint && npm run test && npm run build` → 0 fail (допустимы только env-скипы).
7. Commit → push → merge в main через API:
   Создать PR и дождаться зелёного CI; слияние через GitHub API с проверкой ожидаемого SHA и без admin/force-обходов. Использовать существующую платформенную HTTPS-аутентификацию; не извлекать и не печатать токены через `git credential fill`.
8. Дождаться CI (poll `actions/runs?branch=main`) — обязателен success.

## Ключевые команды
- Полный отчёт покрытия: `node --experimental-strip-types scripts/track-coverage-report.mjs`
- Аудит контента: `node --experimental-strip-types scripts/course-content-quality-report.mjs`
- Тесты: `npm run test` (фактические counts и env-skips зависят от установленных SDK; сверять с текущим запуском, не считать пропуски успешным исполнением)
- E2E: `npx playwright test` (порт 3100; убивать зависшие: taskkill по PID из netstat)

## Статус на момент передачи
- `main` = 875a405, CI success. Kotlin слит через PR #8; состояние других веток проверять отдельно.
- mobile: в репозитории 2 дня, расширение ещё не выполнено.
- kotlin: 30 дней завершены, повторная генерация не нужна.
- Всё, что завершено — слито; половинчатый контент НЕ пушится.
