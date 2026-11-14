# DevAtlas — актуальная точка продолжения (generated)

Генератор: `node scripts/delivery-report.mjs`; проверка: `--check`. Последние прямые инструкции пользователя имеют приоритет над историческими документами. Не начинайте проект заново и не объявляйте весь план выполненным по наличию файлов.

Зафиксированный main: `e87fac9d81b9c859ff1b385c9197f19cdf7a6a29`. Фактический каталог: 43 IDs, 38 направлений, 1220 календарных дней, 114 стадий. Источник чисел — действующие loaders, не старый текст отчёта. Полный статус: [DEVATLAS-DELIVERY.md](DEVATLAS-DELIVERY.md), [delivery-state.json](delivery-state.json), [coverage-matrix.json](coverage-matrix.json).

## Сначала

Получите актуальный HEAD, открытые PR и CI. Не повторяйте уже подготовленные изменения. Сливайте только проверенный ожидаемый SHA обычным merge без force-push. Успешный Vercel build не заменяет live-проверку. Не теряйте незавершённую работу и точный checkpoint.

Следующее действие по сохранённому состоянию: Resume Personal Productivity at days 15–18 after its 14-day checkpoint. Reuse docs/curriculum-design/personal-productivity-days-15-17.draft.txt; author day 18 and review the full module, then finish days 19–22. Next unfinished modules start at day 10 for Content Creation, Digital Literacy and Management Foundations, and day 11 for English Foundations. Preserve existing lesson and quiz IDs, option order and learner progress. See AGENTS.md and docs/CURRICULUM-AUDIT-2026-11-15.md.

## Что сохранить

Существующие расширенные курсы, IDs, уроки, проекты, XP, прогресс, заметки, черновики, два ассистента, Aurora, Sidebar и шесть UI-языков. Kotlin уже 30 дней; не генерировать повторно. Исправления фактических ошибок и переводов допустимы с проверками; не переписывать работающие курсы без причины.

HTML day 1: optional learningFlow, восемь типов вопросов, две RU/TG/EN формы, реальная практика и отдельный защищённый журнал. SQLite day 1: локальный WASM worker; статус публикации смотреть в delivery-state.json. Эти пилоты не означают завершение всех учебных программ. Миграция assessment ledger не подтверждена на live Supabase.

## Обязательные незавершённые программы

- digital-literacy: в каталоге 9 из 30 запланированных дней. Осталось подготовить 21 дней, включая самостоятельную практику и итоговый проект.
- management-foundations: в каталоге 9 из 30 запланированных дней. Осталось подготовить 21 дней, включая самостоятельную практику и итоговый проект.

Углубить все 14-дневные курсы: typescript, algorithms, ai-fundamentals, context-engineering, agent-harness. Создать 34 Pro, 37 Expert и 1 отсутствующий Beginner, сохраняя отдельные программы и прогресс. Опубликованная карточка или Coming Soon не является готовым курсом.

## Контракты качества

- Новые уроки публикуются только с полными RU/TG/EN объяснениями, реальными источниками/лицензиями, самостоятельной практикой и оценкой. Не копировать старые дни под новыми номерами и не публиковать пустой syllabus.
- Поток: Learn → Understand → Watch → Try → Practice → Test → Review → Master. Объяснять термины, важные строки, изменения входных данных, ошибки и самостоятельное решение. Сохранять полезную старую теорию.
- Для полноценных дней — 5–10 содержательных проверок, разные варианты повторной попытки, подсказки и ссылки на теорию. Mastered: реальная успешная практика, ≥80%, все критические вопросы. Self Reviewed даёт продолжение, но не Auto Verified; AI Feedback не является Human Reviewed.
- Subjective capstone требует объективных проверок и настоящего уполномоченного human review. Старые checkbox-записи нельзя повышать до новых подтверждённых результатов.
- Beginner FREE. Pro/Expert защищены сервером; готовность к уровню и подписка независимы. Никаких localStorage-entitlements или фиктивной оплаты.
- Не исполнять недоверенный код в основном серверном процессе, не имитировать компиляторы и не утверждать, что установленный Docker означает готовый изолированный runner.
- Не создавать третьего помощника. Объединить архитектуру существующих TutorDrawer/Site Agent: per-account multi-chat, серверная история, guest-local, поиск/удаление, устойчивые квоты и лимиты стоимости. Сохранить бесплатные детерминированные ответы.
- Не подключать новые платные сервисы без разрешения. Billing fail-closed; online AI требует согласованного провайдера и cost caps. Отсутствующие credentials — объективный blocker, а не повод выдумать успешную интеграцию.

## Остальные обязательные этапы

Углубить HTML/JS1/JS2/Git/C++; расширить предметные visualizers и безопасные runtimes; завершить AI Mentor, весь premium design update, мобильную доступность и шрифты (включая ӣ ӯ ҳ қ ҷ ғ), персональную траекторию/placement/repetition, проекты/портфолио, community/study groups и честные completion records. Точный полный перечень фаз и решений хранится в delivery-state.json. Не подменять реализацию очередным аудитом.

## Проверки и сдача

`node scripts/coverage-matrix.mjs --check`; `node scripts/delivery-report.mjs --check`; `node scripts/course-content-quality-report.mjs`; typecheck/lint; тесты по изменениям; production build; browser desktop/mobile и auth-регрессии. Запускайте реальные примеры в доступных безопасных средах. Незапущенный runtime не считается проверенным.

Работайте небольшими завершёнными PR. После зелёных проверок выполняйте обычное слияние и проверяйте CI main/Vercel. Сохраняйте точные SHAs, реальные результаты и остаток задач. Не останавливайтесь на описании плана и не объявляйте завершённым то, что ещё не реализовано.
