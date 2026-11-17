# Актуальная проверка curriculum DevAtlas — 16 ноября 2026

Числа получены из действующих application loaders. Структурная проверка показывает доступность уроков, но не подтверждает педагогическую эффективность, качество каждого перевода или освоение учеником.

Локально: 43 курсов, 38 направлений, 1241 учебных дней. В матрице 114 стадий: 42 Published и 72 Missing.

| Курс | В loader / план | Осталось |
|---|---:|---:|
| content-creation | 30 / 30 | 0 |
| english-foundations | 42 / 42 | 0 |
| digital-literacy | 30 / 30 | 0 |
| personal-productivity | 22 / 22 | 0 |
| management-foundations | 9 / 30 | 21 |

В пяти Starter-курсах 133 дней. Для всех двенадцати коротких программ осталось 21 запланированных дней. Существующие дни, prerequisiteDays, quiz IDs и порядок вариантов в первых девяти днях Digital Literacy и Management Foundations сохраняются.

## Что показала повторная проверка

Старые указания про 40 дней React с недостаточной теорией и первые 12 дней Next.js устарели. Реальные источники React (`react-concepts.ts`, `react-walkthroughs.ts`) и Next.js (`nextjs-foundations.ts`, `nextjs-foundation-review.ts`) уже дополняют loader оригинальным материалом. Все 60 дней React имеют минимум четыре раздела и три вопроса. Все 20 дней Next.js имеют четыре раздела и минимум три вопроса; у дней 1–12 разные RU/TG/EN тексты. Это структурный результат, а не независимая сертификация качества.

| Курс | Дней | Дней с <4 разделами | Дней с <3 вопросами | Без практики |
|---|---:|---:|---:|---:|
| html | 30 | 0 | 0 | 0 |
| css | 30 | 0 | 0 | 0 |
| javascript-1 | 30 | 0 | 0 | 0 |
| javascript-2 | 30 | 0 | 0 | 0 |
| react | 60 | 0 | 0 | 0 |
| nextjs | 20 | 0 | 0 | 0 |
| git | 30 | 0 | 0 | 0 |
| typescript | 14 | 0 | 0 | 0 |
| algorithms | 14 | 13 | 0 | 0 |
| python | 30 | 2 | 28 | 0 |
| backend | 44 | 43 | 0 | 0 |
| mobile | 44 | 44 | 0 | 0 |
| cpp | 30 | 0 | 0 | 0 |
| java | 30 | 30 | 30 | 0 |
| csharp | 30 | 30 | 30 | 0 |
| go | 30 | 0 | 0 | 0 |
| rust | 30 | 30 | 30 | 0 |
| php | 30 | 2 | 30 | 0 |
| ruby | 30 | 30 | 30 | 0 |
| sql | 30 | 14 | 30 | 0 |
| bash | 30 | 28 | 30 | 0 |
| nodejs | 30 | 9 | 30 | 0 |
| mongodb | 30 | 13 | 30 | 0 |
| swift | 30 | 30 | 28 | 0 |
| kotlin | 30 | 30 | 30 | 0 |
| ux-design | 30 | 28 | 0 | 0 |
| ai-fundamentals | 14 | 14 | 5 | 0 |
| context-engineering | 14 | 2 | 0 | 0 |
| agent-harness | 14 | 14 | 3 | 0 |
| digital-marketing | 30 | 30 | 0 | 0 |
| data-analytics | 30 | 30 | 0 | 0 |
| business-foundations | 30 | 30 | 0 | 0 |
| communication | 30 | 30 | 0 | 0 |
| content-creation | 30 | 0 | 0 | 0 |
| english-foundations | 42 | 0 | 0 | 0 |
| digital-literacy | 30 | 0 | 0 | 0 |
| personal-productivity | 22 | 0 | 0 | 0 |
| management-foundations | 9 | 0 | 0 | 0 |
| javascript-pro | 30 | 26 | 0 | 0 |
| backend-pro | 30 | 0 | 30 | 0 |
| architecture-expert | 30 | 28 | 30 | 0 |
| ux-pro | 30 | 30 | 30 | 0 |
| business-pro | 30 | 30 | 30 | 0 |

## Новые блоки

Digital Literacy 10–30: поиск и проверка информации; документы и таблицы; защита аккаунта; права доступа, версии и восстановление; итоговый вымышленный цифровой набор. [Проверенные источники и ограничения](../curriculum-design/digital-literacy-10-30-source-review.md).


Новые письменные задания проверяются по критериям и предметным рубрикам. Self Reviewed не подтверждает реальные настройки устройства, защищённость аккаунта, качество работы сотрудников или независимое освоение. Задания не требуют ввода настоящих паролей, кодов и персональных данных.

## Следующая работа

Continue management-foundations at day 10 using docs/curriculum-design/short-courses.draft.json. 21 short-course days remain. Preserve all authored lessons, quiz options and progress IDs. Recheck current loaders before editing other courses.

72 отсутствующие стадии не созданы этой партией. Продолжение пяти 14-дневных программ, независимая языковая/педагогическая проверка, повторные варианты assessment и human review остаются в реестре. Старые датированные отчёты сохраняют исторические результаты; текущие числа брать из loader и свежих coverage/delivery отчётов.

## Воспроизведение

```bash
node scripts/check-short-course-blueprints.mjs
node scripts/coverage-matrix.mjs --check
node scripts/delivery-report.mjs --check
node scripts/audit-backlog.mjs --check
python -I scripts/course-authoring/audit.py digital-literacy
python -I scripts/course-authoring/audit.py management-foundations
npm run test
npm run typecheck
npm run lint
npm run build
npx playwright test e2e/digital-literacy-modules.spec.ts e2e/management-foundations-modules.spec.ts
```

Результаты реально выполненных проверок указаны в описаниях соответствующих PR и source-review. Этот список команд сам по себе не является заявлением об их успешном выполнении.
