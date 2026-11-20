# architecture-expert — структурный review и repair курса, 17–18 ноября 2026

Владелец курса: `architecture-expert` (RU/TG/EN), ветка `main`. Проверка выполнена по audit `docs/audits/continuation-quality-2026-11-17.json` (courseId `architecture-expert`) и по фактическому файлу курса до правок. Изменены только два файла владельца: `src/content/courses/architecture-expert.json` и этот review-файл. Остальные dirty-файлы (backend, business-foundations, communication, data-analytics, agent-harness, landing/workspace-файлы, тесты) не тронуты; commit/push/ветки не выполнялись.

## Состояние до правок (audit 2026-11-17, подтверждено программно)

| Находка audit | Подтверждение скриптом до правок |
|---|---|
| `daysWithFewerThan4Sections`: 28 дней (все, кроме 14 и 30; у дней 1–3 по 3 section, у дней 4–13 и 15–29 по 3) | подтверждено: у каждого дня из списка ровно 3 section |
| `daysWithFewerThan3Questions`: все 30 дней | подтверждено: во всех 30 днях ровно 2 вопроса (60 всего); id-шаблоны: дни 1–3 `…-day-NN-q/q2`, дни 4+ `…-day-NN-q1/q2` |
| `daysWithMissingLinkedHints`: 30 дней, все 60 вопросов | подтверждено: ни у одного вопроса не было `hint`+`relatedSection` (кроме `architecture-expert-day-14-q1`, у которого пара уже была) |
| эвристики: dominant correct position 58 % (index 0 у 34/60), longest-RU-option 92 % | зарегистрированы как эвристика «только қайд»; существующие options/`correctIndex`/порядок опций не менялись |
| `daysWithPracticeSolutionInTheoryCandidates: []` | подтверждено независимым trigram-тестом: перекрытие `practice.solution`/`referenceAnswer` с prose section ≤ 25 % нигде |
| `missingTranslations: []`, `equalBodyCandidates: []` | подтверждено скриптом (tg≠ru, en≠ru, en≠tg) |

### Overlap solution ↔ prose — verdict

Все 30 дней имеют `practice.kind === 'written'`, у каждого `solution` — проза, `referenceAnswer` — её RU/TG/EN-версия. Курс не имеет code-practice дней, поэтому contract `practice.solution === example.code` из `tests/premium-curriculum.test.ts` к нему не применяется (тест «trusted examples execute» пропускает written-дни; defect-тесты дней 1–3 используют только `sections[].code`). Независимая проверка trigram-перекрытием строк решения с телами всех section: кандидатов нет. Ничего не изменено и не «сливалось»: solution/referenceAnswer сохранены байт-в-байт (проверено сравнением с `git show HEAD:…`).

## Инварианты premium-тестов, которые ограничивали правки

`tests/premium-curriculum.test.ts` (не изменялся) для architecture-expert: 30 дней по порядку с `prerequisiteDays=[day-1]`; `practice` обязателен, `kind='written'` с `referenceAnswer>300` симв. × 3 языка; `sections[0].body` > 150 симв. × 3 языка; код дней 1–3 должен содержать контрольные строки `idempotent !== true`, `entitlement.userId !== principal.userId`, `evidence.restoreTested !== true` и падать на мутациях с `AssertionError`. Отсюда: code-разделы дней 1–3 не тронуты, новые разделы не содержат `code`/`output`.

Инвариант схемы (`src/lib/courses/schema.ts`): `hint` и `relatedSection` у вопроса обязаны присутствовать вместе; `relatedSection < sections.length`.

## Что исправлено

**1. По одному новому разделу «Глубже/в реальном проекте» для каждого из 28 дней (1–13, 15–29)** — суммарно 28 разделов × RU/TG/EN. Дни 14 и 30 уже имели 4 section и не менялись. Требования владельца выполнены:

- `{title, body}` ru/tg/en; RU body 640–700 символов (проверено скриптом, окно 250–700), tg 664–869, en 722–887; все три строки попарно различны.
- Заголовки «о мазмун», конкретные: «Тайм-аут после списания: неизвестный исход» (1), «Просроченный entitlement и подменённый JSON» (2), «p95 без выборки и restore не на тех данных» (3), «Обратимое на вид, необратимое по данным» (4), «ADR, который противоречит коду» (5), «Компенсация, которая возвращает дважды» (13), «Дубликат, который приходит раньше оригинала» (15), «Предохранитель, который открылся молча» (19), «Триггер, который сработал молча» (29) и т.д. Полный список — в diff.
- Без `code`/`output` в новых разделах.
- Каждый раздел: крайний случай дня + пайванд с предыдущими днями (например, день 2 ссылается на идемпотентность дня 1, день 15 — на компенсации дня 13, день 25 — на expand/contract дня 24, день 29 — на счёт дня 26; у дня 1 связь с рамкой самого дня и вперёд к дню 13).
- Размещение по правилу владельца «errors мавҷуд — «Глубже» ПЕШ аз errors, вагарна ба охир»: у дней 4–13 и 15–29 раздел вставлен на индекс 2, перед «Кейс и частые ошибки»; у дней 1–3 (errors-раздела нет, есть «Выполните самостоятельно») — в конец, индекс 3.
- Смещение индексов проверено: в этих днях до правки не было ни одного `relatedSection`, поэтому ни одна существующая ссылка не могла сломаться; все новые/добавленные `relatedSection` указывают < `sections.length` (после вставки 4).

**2. Третий вопрос в каждый из 30 дней** — 30 вопросов × {question, answer, 3 options, hint, relatedSection} × RU/TG/EN:

- id по существующему шаблону: `architecture-expert-day-NN-q3`.
- `correctIndex` выбран так, чтобы три индекса дня не были одинаковыми (владельческое «correctIndex-и нав фарқ кунад»); распределение новых: 0 → 6 дней, 1 → 8 дней, 2 → 16 дней.
- Дистракторы — реальные ошибки новичка по теме того же дня: двойное списание после тайм-аута (1), решение из кэша клиента (2), скриншот панели backup как доказательство RPO (3), записанные данные делают откат миграцией (4), редактирование ADR задним числом (5), «удаление — дело базы» (6), исходящий вебхук не актор (7), разрез по слоям (8), цикл модулей (9), конверсия единиц вне границы (10), порт-зеркало SDK (11), копия без правила обновления (12), компенсация без идемпотентности (13), общая зависимость ломает перемножение доступностей (14), устаревший повтор события (15), персональные данные в общем ключе кэша (16), веер по шардам (17), узлы зелёные — путь сломан (18), предохранитель без метрики (19), алертная усталость (20), тест на тёплом кэше (21), повтор вебхука без дедупликации (22), кэш без арендатора (23), забытый ночной скрипт (24), тень на записи (25), «экономия» без строки времени людей (26), рендер без синтаксической проверки (27), защита вместо пересчёта (28), план без процессного сигнала (29), слот занят — платёж проверяется (30).
- Каждый вопрос: `hint` (указывает на рассуждение, не на ответ) + `relatedSection` на раздел-носитель ответа (у дней с новым разделом — индекс 2 «Глубже», дни 1–3 — 3, день 14 — 3 «Что теряется в цепочке», день 30 — 3 «Место занято, платёж ещё проверяется»).

**3. `hint` + `relatedSection` добавлены ко всем 59 вопросам, у которых их не было** (все, кроме `day-14-q1`; у него пара уже была и сохранена):

- У дней 1–3: q → 0 (теория), q2 → 1 (исполняемый пример с функцией `retryPlan`/`decidePaidAccess`/`releaseDecision`).
- У дней 4–29: индекс 0 (теория) или 1 (рамка) по месту, где фактически преподаётся проверяемое понятие; день 30: q1 → 0, q2 → 2 («Как проваливают capstone»). День 14: q2 → 1.
- Все подсказки × ru/tg/en, длина > 15 символов, не содержат правильного ответа; терминология TG согласована с существующими текстами курса («фосилаи вақт» = окно, «брон», «зеркашӣ», «обуна ба ҳодиса», «аз рӯйи»).

**Ни один существующий элемент не изменён** (проверено сравнением с `git show HEAD:src/content/courses/architecture-expert.json`): id дней/вопросов, порядок и тексты опций, `correctIndex`, `answer`, тексты существующих разделов, `code`/`output` дней 1–3, `practice` целиком (task/hint/solution/referenceAnswer/criteria), `interview`, `sources`, `files`, `prerequisiteDays`, порядок дней. Скрипт-сверка вернул «PRESERVATION OK: all original content intact».

**Формат файла**: пересериализация `JSON.stringify(…, indent=1)` + CRLF; единственные побочные изменения — 54 строки с прежним неравномерным отступом приведены к общему стилю файла (содержание строк идентично, 0 content-diff при прямом сравнении). Итог diff: 1929 добавленных строк, 129 удалённых (все — строки-отступы, содержание которых воспроизведено без изменений).

## Источники, проверенные открыто (WebFetch, 2026-11-17/18)

| URL | Что подтверждено |
|---|---|
| https://docs.aws.amazon.com/wellarchitected/ | документация Well-Architected открыта; шесть pillar по именам: operational excellence, security, reliability, performance efficiency, cost optimization, sustainability; Framework разделён на Cloud Foundations и Cloud Workloads |
| https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html | HTTP 404 — URL не открылся, зафиксировано честно (актуальная точка входа — корень и /latest/framework/) |
| https://docs.aws.amazon.com/wellarchitected/latest/framework/framework-design-principles.html | страница отдал только заголовок без текста; цитаты принципов из неё взять нельзя — зафиксировано; содержательное подтверждение взято из reliability-pillar ниже |
| https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html | определение resilience; четыре области (Foundations, Workload architecture, Change management, Failure management) и capabilities REL01–REL13, включая «Test reliability» (REL12), «Plan for Disaster Recovery» (REL13), «Design interactions in a distributed system to prevent/mitigate failures» (REL04/05); цитата Werner Vogels о неизбежности отказов |
| https://learn.microsoft.com/en-us/azure/architecture/ | Azure Architecture Center открыт: каталог reference architectures, decision guides, cloud design patterns; выравнивание на Azure Well-Architected Framework и Cloud Adoption Framework |
| https://learn.microsoft.com/en-us/azure/well-architected/pillars | пять pillar Azure по именам: Reliability, Security, Cost Optimization, Operational Excellence, Performance Efficiency; матрица «pillar → workload concern → principles → tradeoffs»; ссылка на «Ten design principles for Azure applications» |
| https://martinfowler.com/articles/microservices.html | decentralized data management (сервис владеет своей БД, polyglot persistence, bounded context); «transactionless coordination… consistency may only be eventual consistency… compensating operations»; «smart endpoints, dumb pipes»; «Synchronous calls considered harmful» — умножение downtime, практика The Guardian/Netflix; Conway's Law и monolith-first |
| https://martinfowler.com/bliki/CircuitBreaker.html | три состояния `closed`/`open`/`half-open`; открытое состояние возвращает ошибку без обращения к защищаемому вызову; тайм-аут превращает зависание в отказ; порог по счётчику отказов; цель — предотвращение cascading failures |
| https://martinfowler.com/bliki/StranglerFigApplication.html | метафора удушающей фиговницы; поэтапная замена вместо big-bang rewrite; «seams», постепенное перехватывание маршрутов, transitional architecture; слово про перехват запросов фасадом/прокси на этой странице отсутствует — зафиксировано честно |

Подтверждённые формулировки использованы как опора для углов новых разделов и вопросов: деградация и быстрый отказ (19), сложение доступностей цепочки (14), eventual consistency и компенсации (13), теневой режим и поэтапный перехват (25), минимум простоя при синхронных вызовах (8, 14).

## Проверки (выполнены, 2026-11-18)

| Проверка | Результат |
|---|---|
| `npx vitest run tests/premium-curriculum.test.ts` | 15/15 passed (architecture-expert без изменений в наборе; дни 1–3 defect-мутации падают с AssertionError) |
| `npx vitest run tests/course-quality-guard.test.ts tests/course-audit.test.ts` | 17/17 passed (9 + 8) |
| `npx tsc --noEmit` | чисто |
| `npm run lint` | чисто |
| Скрипт-контракт (по логике `scripts/continuation-quality-audit.mjs`): 30 дней × ≥4 section × ≥3 questions; 90/90 вопросов с `hint`(ru/tg/en)+`relatedSection` в диапазоне; tg≠ru/en≠ru по всем section | все условия выполнены: 30×4×3, 0 нарушений |
| Сравнение с `git show HEAD:…` | PRESERVATION OK — исходное содержимое сохранено целиком |
| Схема `courseContentSchema` | валидация выполняется в premium-тесте при загрузке (parse) — зелёная |

Метрики эвристик после правки (существующие опции не тронуты): доля `correctIndex=0` снижена 57 % → 45,6 % (41/90); доля «правильный ответ — самый длинный RU» 92 % → 91,1 % — дальнейшее снижение возможно только правкой существующих опций, что владельцем запрещено («options мавҷудро тағйир надиҳ»).

## Границы и оставшаяся работа

- Структурные contract-метрики закрыты; это не подтверждает семантику, педагогику, освоение учеником или runtime-исполнение (written-курс, исполняемых практик нет; код дней 1–3 выполнялся только через defect-тесты premium-набора).
- Перегенерация отчётов (`coverage-matrix.mjs`, `delivery-report.mjs`, `course-content-quality-report.mjs`, `audit-backlog.mjs`, `continuation-quality-audit.mjs`) — в зоне одного integration-owner по handoff; этот агент их не запускал и файлы `docs/audits/*` не менял. По логике загрузчика после правок ожидается: `<4 sections` → [], `<3 questions` → [], `daysWithMissingLinkedHints` → [], overlap-кандидаты → [].
- Семантический/rubric/source-review проход для всей очереди premium-курсов остаётся в реестре (`docs/audits/pending-batches-review-2026-11-17.md`); независимый reviewer может вернуть конкретные находки автору без ослабления тестов.
