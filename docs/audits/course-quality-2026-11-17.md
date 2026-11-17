# Актуальная проверка curriculum DevAtlas — 17 ноября 2026

Числа ниже получены из действующих application loaders. Структура и доступность уроков не подтверждают правильность каждой строки, качество каждого перевода или освоение учеником.

Локально: 43 курса, 38 направлений, 1262 учебных дней. Матрица:114 стадий,42 Published,72 Missing,0 Verified. Все 12 short-course планов достигли запланированного числа дней; Management 30/30 и Digital Literacy 30/30 уже написаны. В пяти Starter-программах 154 дня. Management не нужно заново писать с дня 24.

Загрузчики выявили структурные пропуски в 11 курсах. Всего 36 курсов имеют структурный пропуск или эвристический признак для ручной проверки. [Точные координаты loader-аудита](continuation-quality-2026-11-17.json).

| Курс | Дней | <4 sections | <3 questions | Дней без linked hints | Без practice |
|---|---:|---:|---:|---:|---:|
| html | 30 | 0 | 0 | 0 | 0 |
| css | 30 | 0 | 0 | 0 | 0 |
| javascript-1 | 30 | 0 | 0 | 0 | 0 |
| javascript-2 | 30 | 0 | 0 | 0 | 0 |
| react | 60 | 0 | 0 | отдельная модель | 0 |
| nextjs | 20 | 0 | 0 | 0 | 0 |
| git | 30 | 0 | 0 | 0 | 0 |
| typescript | 14 | 0 | 0 | 0 | 0 |
| algorithms | 14 | 0 | 0 | 0 | 0 |
| python | 30 | 0 | 0 | 0 | 0 |
| backend | 44 | 43 | 0 | 0 | 0 |
| mobile | 44 | 0 | 0 | 0 | 0 |
| cpp | 30 | 0 | 0 | 0 | 0 |
| java | 30 | 0 | 0 | 0 | 0 |
| csharp | 30 | 0 | 0 | 0 | 0 |
| go | 30 | 0 | 0 | 0 | 0 |
| rust | 30 | 0 | 0 | 0 | 0 |
| php | 30 | 0 | 0 | 0 | 0 |
| ruby | 30 | 0 | 0 | 0 | 0 |
| sql | 30 | 0 | 0 | 0 | 0 |
| bash | 30 | 0 | 0 | 0 | 0 |
| nodejs | 30 | 0 | 0 | 0 | 0 |
| mongodb | 30 | 0 | 0 | 0 | 0 |
| swift | 30 | 0 | 0 | 0 | 0 |
| kotlin | 30 | 0 | 0 | 0 | 0 |
| ux-design | 30 | 0 | 0 | 0 | 0 |
| ai-fundamentals | 14 | 14 | 5 | 14 | 0 |
| context-engineering | 14 | 2 | 0 | 14 | 0 |
| agent-harness | 14 | 14 | 3 | 14 | 0 |
| digital-marketing | 30 | 30 | 0 | 30 | 0 |
| data-analytics | 30 | 30 | 0 | 30 | 0 |
| business-foundations | 30 | 30 | 0 | 30 | 0 |
| communication | 30 | 30 | 0 | 30 | 0 |
| content-creation | 30 | 0 | 0 | 0 | 0 |
| english-foundations | 42 | 0 | 0 | 0 | 0 |
| digital-literacy | 30 | 0 | 0 | 0 | 0 |
| personal-productivity | 22 | 0 | 0 | 0 | 0 |
| management-foundations | 30 | 0 | 0 | 0 | 0 |
| javascript-pro | 30 | 0 | 0 | 0 | 0 |
| backend-pro | 30 | 0 | 0 | 0 | 0 |
| architecture-expert | 30 | 28 | 30 | 30 | 0 |
| ux-pro | 30 | 30 | 30 | 30 | 0 |
| business-pro | 30 | 30 | 30 | 30 | 0 |

## Доказательства и границы

Старые React 40/Next 12 gaps устарели: React 60 и Next 20 уже имеют минимум 4 sections и 3 questions в каждом дне. Их дальнейший review касается смысла, практики, assessment и переводов. TypeScript 14 сохраняется.72 Missing stages — отдельные отсутствующие программы, не пропуски параграфов в существующих курсах.

Все текущие курсы доступны бесплатно, включая Pro/Expert; это уровни обучения. Реальная карта доступа MEMBERS_ONLY в src/lib/courses/access.ts пуста. Interface EN/RU/TG/ES; учебный контент RU/TG/EN.

[Реестр 43 задач и реальных owners](course-register-2026-11-17.md) отделяет queued от running/review. [Независимый review и конкретные исправления](pending-batches-review-2026-11-17.md) хранит фактические ошибки, источники и ограничения. Java/C#/Rust и SQL/Node/Mongo имеют ограниченно принятые исправления; это не принятие целого курса. PHP/Ruby/Swift требуют следующих исправлений. Kotlin/UX сохраняют авторские additions и проходят интеграцию.

Root выполнил 27 Java reference-практик на OpenJDK 17 и 26 PHP reference-практик на PHP 8.4.27. Все ожидаемые outputs совпали. Kotlin 1.9.24 выполнил 30 примеров и 30 самостоятельных решений. Общий verifier также проверил граничные аргументы, overflow и обнаружение сломанного удаления. Ruby runtime-проверка продолжается. C#, Rust, Swift и MongoDB execution остаются непроверенными. Последний полный run root перед новыми AI-правками и завершением UX rubric дал 116 файлов, 926 passed, 8 skipped.

Self Reviewed не подтверждает реальные настройки устройства/аккаунта, реальные командные результаты, pronunciation или независимо оценённое mastery. Для оставшегося review нужны task-specific rubrics, независимая практика, sentence-level RU/TG/EN, источники и реальные runtime checks. Green structural tests не заменяют semantic review.

## Продолжение

Продолжать локально на main через авторов и независимых reviewer. Commit/push/PR/merge/deploy запрещены текущим запросом; шеф сам отправит работу. Не использовать stash/reset/clean и не откатывать dirty work. Следующие точные findings — в pending batch review; после текущих исправлений выполнять оставшуюся очередь 43 курсов.

Генераторы: coverage-matrix.mjs, delivery-report.mjs, course-content-quality-report.mjs, audit-backlog.mjs, continuation-quality-audit.mjs. Их успешный run обновляет инвентарь, а не выдаёт образовательную сертификацию.
