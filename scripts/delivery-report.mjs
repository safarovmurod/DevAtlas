import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {loadAuditData} from './lib/load-course-audit.mjs';
import {reportMatches} from './lib/report-text.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const {rows,tracks,matrix}=await loadAuditData();
const state=JSON.parse(await readFile(path.join(root,'docs/delivery-state.json'),'utf8'));
const total=rows.reduce((sum,row)=>sum+row.publishedDays,0),free=rows.filter(row=>row.tier==='starter'),paid=rows.filter(row=>row.tier!=='starter');
const days=items=>items.reduce((sum,row)=>sum+row.publishedDays,0);
const short=rows.filter(row=>row.publishedDays===2),fourteen=rows.filter(row=>row.publishedDays===14);
const missing=matrix.filter(row=>row.status==='Missing');
const stageCount=stage=>missing.filter(row=>row.stage===stage).length;
const stale=rows.reduce((sum,row)=>sum+row.staleHits.length,0);
const fullyPublished=tracks.filter(track=>matrix.filter(row=>row.trackId===track.id).every(row=>row.courseIds.length>0)).length;
const validation=state.validationCheckpoint??state.activeWork?.sqlRuntime?.validation;
const delivery=[
 '# DevAtlas delivery status (generated)',
 '',
 'Regenerate: `node scripts/delivery-report.mjs`. CI checks `--check`. Inventory comes from every real catalog/content loader, including React and Next.js. Checkpoint metadata comes from [delivery-state.json](delivery-state.json); it is a recorded checkpoint, not a live deployment assertion.',
 '',
 `Recorded main checkpoint: \`${state.baselineCommit}\`. ${rows.length} course IDs; ${tracks.length} tracks; ${matrix.length} stage requirements; ${total} actual scheduled days (${days(free)} free, ${days(paid)} premium). ${free.length} Starter, ${rows.filter(row=>row.tier==='pro').length} Pro and ${rows.filter(row=>row.tier==='expert').length} Expert course IDs.`,
 '',
 `${matrix.filter(row=>row.status==='Published').length} stages have published curricula; ${missing.length} stages are missing (${stageCount('beginner')} Beginner, ${stageCount('pro')} Pro, ${stageCount('expert')} Expert). ${fullyPublished} tracks have all three stages published. Source availability is not Verified educational completion; the generated matrix grants no Verified status. JavaScript 1 and 2 are two IDs in one Beginner stage.`,
 '',
 'Current P0/P1/P2 tasks, acceptance criteria and blockers: [full audit register](audits/2026-10-26-tasks.md). Historical checklists are dated evidence, not today’s completion status.',
 '',
 '## Published inventory',
 '',
 '| Course ID | Access tier | Actual days |',
 '|---|---|---:|',
 ...rows.map(row=>`| ${row.courseId} | ${row.tier} | ${row.publishedDays} |`),
 '',
 '## Implemented and bounded',
 '',
 '- Existing catalog, tracks, accounts, progress, notes, drafts, Monaco, themes, Aurora, sidebar and six UI languages are retained. Authored new lesson material requires RU/TG/EN. Older incomplete translations keep visible fallback.',
 '- HTML day 1 has a compatible Learn → Understand → Watch → Try → Practice → Test → Review → Master pilot, real sandboxed HTML exploration and two authored eight-question assessment forms. Quiz result badges are distinct from full mastery. Wider lesson-flow rollout remains unfinished.',
 '- Mastered requires successful assessed practice, ≥80% and every critical question. Self review allows study continuation but cannot mint protected mastery. Late account results are isolated; legacy progress/XP is preserved. Readiness never grants or revokes paid content access.',
 '- The protected assessment ledger has server-derived grading, own-account/MFA reads and service-only idempotent writes. Its migration has PostgreSQL-compatible tests; live Supabase application is not verified. Missing configuration does not fabricate persistence.',
 '- The SQLite pilot checks day 1 in a disposable browser worker with real WASM SQLite, changed datasets, constraints, expected/actual output and execution/output limits. It is local assessment, not server attestation. Other SQL days remain local CLI exercises. See [SQLITE-PRACTICE.md](SQLITE-PRACTICE.md) and the recorded publication status in delivery-state.json.',
 '- Communication day 1 has a versioned written rubric with three-language performance descriptors and required reflection. Reviews bind to the exact answer hash and existing account-scoped drafts. Self Reviewed remains separate from Auto Verified, AI Feedback and Human Reviewed; it never mints verified Mastered. Wider written-rubric rollout and authorized human review remain pending.',
 '- React function labs retain their existing isolated browser runner. Other native languages are not advertised as browser-compiled merely because an editor exists. Provision and test isolated trusted runners before enabling them.',
 '- Existing TutorDrawer and Floating Site Agent remain the two assistants. Owner-scoped local Agent history, cancellation and mandatory persistent AI budget reservations are implemented; live budget migration/configuration and shared persistent multi-chat remain pending. Do not represent local chat history as complete server history.',
 '- Beginner remains free. Pro/Expert bodies, solutions, tutor references and paid attachments retain server authorization and private/no-store caching. Billing remains billing_not_configured; a browser flag or fake redirect never grants membership.',
 '',
 '## Required remaining work',
 '',
 `All ${short.length} two-day programs still require full authored expansion: ${short.map(row=>`\`${row.courseId}\``).join(', ')}.`,
 '',
 `All ${fourteen.length} fourteen-day programs still require a reviewed continuation: ${fourteen.map(row=>`\`${row.courseId}\``).join(', ')}.`,
 '',
 `Complete the ${missing.length} missing programs in the track/stage matrix, deepen HTML/JS1/JS2/Git/C++ and other thin explanations, and roll out meaningful assessments/projects across full curricula. Do not publish a plan as a lesson or duplicate days to reach a number.`,
 '',
 'Subject visualizers, complete AI Mentor history and live quota activation, the full platform design update, personalized roadmap/placement/repetition, project portfolios and remaining product functions still require implementation and verification. Human review authority cannot come from learner-editable metadata. Subjective mastery needs actual authorized human review.',
 '',
 '## Validation and deployment evidence',
 '',
 `Current source audit finds ${stale} stale duration claims. This measures wording, not overall teaching quality; thin-theory and quiz-density findings remain in [SELF_LEARNING_CONTENT_AUDIT.md](SELF_LEARNING_CONTENT_AUDIT.md).`,
 '',
 ...(validation?[`Recorded local validation checkpoint: ${validation.unitPassed} tests passed, ${validation.unitSkipped} skipped; ${validation.playwrightPassed} targeted desktop/mobile cases passed (${validation.browserScope??'SQLite'}); dependency audit ${validation.auditVulnerabilities} known vulnerabilities. Typecheck, lint and production build passed at the recorded checkpoint. Skipped runtimes are not executed proof; consult current CI for the exact head.`, '']:[]),
 'PRs, merge SHAs and pending work are recorded in delivery-state.json. Vercel success metadata is separate from live HTTP/browser proof. Direct deployment HTTP was blocked by this workspace CONNECT proxy (403); live database, payment and online-AI configuration are not inferred from successful builds.',
 '',
 '## Local setup and trust boundaries',
 '',
 'Use the repository lockfile and Node 24 in this workspace: `npm ci --cache /workspace/.npm-cache`, then `npm run dev`. Predev/prebuild package ignored same-origin Monaco and SQLite assets with license notices. Run `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, `npm run test:e2e` and `npm run test:auth` as appropriate. Playwright owns port 3100; stop owned dev servers before rebuilding production outputs.',
 '',
 'Kotlin example execution uses the separately installed local KOTLINC path when available. SDK paths are machine-specific; missing compilers must be reported as skipped, not simulated.',
 '',
 'Follow [accounts-setup.md](accounts-setup.md) and [LAUNCH-STEPS-RU.md](LAUNCH-STEPS-RU.md). Review migrations in order in a test database, including 20261026000000_assessment_evidence.sql and 20261026010000_tutor_budgets.sql after account/session migrations. Never expose SUPABASE_SERVICE_ROLE_KEY or provider secrets to the browser. No live migration is claimed here. Payments require a real provider, agreed prices/currencies and verified lifecycle webhooks; online AI requires approved provider configuration and durable cost controls.',
 '',
 'Repository changes, environment configuration drafts and production publication are separate operations. Preserve existing useful work; correct factual errors without regenerating completed courses. Do not force-push or bypass failed CI.',
 '',
];
const continuation=[
 '# DevAtlas — актуальная точка продолжения (generated)',
 '',
 'Генератор: `node scripts/delivery-report.mjs`; проверка: `--check`. Последние прямые инструкции пользователя имеют приоритет над историческими документами. Не начинайте проект заново и не объявляйте весь план выполненным по наличию файлов.',
 '',
 `Зафиксированный main: \`${state.baselineCommit}\`. Фактический каталог: ${rows.length} IDs, ${tracks.length} направлений, ${total} календарных дней, ${matrix.length} стадий. Источник чисел — действующие loaders, не старый текст отчёта. Полный статус: [DEVATLAS-DELIVERY.md](DEVATLAS-DELIVERY.md), [delivery-state.json](delivery-state.json), [coverage-matrix.json](coverage-matrix.json).`,
 '',
 '## Сначала',
 '',
 'Получите актуальный HEAD, открытые PR и CI. Не повторяйте уже подготовленные изменения. Сливайте только проверенный ожидаемый SHA обычным merge без force-push. Успешный Vercel build не заменяет live-проверку. Не теряйте незавершённую работу и точный checkpoint.',
 '',
 `Следующее действие по сохранённому состоянию: ${state.resume.nextAction}`,
 '',
 '## Что сохранить',
 '',
 'Существующие расширенные курсы, IDs, уроки, проекты, XP, прогресс, заметки, черновики, два ассистента, Aurora, Sidebar и шесть UI-языков. Kotlin уже 30 дней; не генерировать повторно. Исправления фактических ошибок и переводов допустимы с проверками; не переписывать работающие курсы без причины.',
 '',
 'HTML day 1: optional learningFlow, восемь типов вопросов, две RU/TG/EN формы, реальная практика и отдельный защищённый журнал. SQLite day 1: локальный WASM worker; статус публикации смотреть в delivery-state.json. Эти пилоты не означают завершение всех учебных программ. Миграция assessment ledger не подтверждена на live Supabase.',
 '',
 '## Обязательные незавершённые программы',
 '',
 ...short.map(row=>`- ${row.courseId}: сейчас ${row.publishedDays} дня; нужен полноценный beginner syllabus и оригинальные уроки, практика, feedback, тесты, мини-проекты и capstone.`),
 '',
 `Углубить все 14-дневные курсы: ${fourteen.map(row=>row.courseId).join(', ')}. Создать ${stageCount('pro')} Pro, ${stageCount('expert')} Expert и ${stageCount('beginner')} отсутствующий Beginner, сохраняя отдельные программы и прогресс. Опубликованная карточка или Coming Soon не является готовым курсом.`,
 '',
 '## Контракты качества',
 '',
 '- Новые уроки публикуются только с полными RU/TG/EN объяснениями, реальными источниками/лицензиями, самостоятельной практикой и оценкой. Не копировать старые дни под новыми номерами и не публиковать пустой syllabus.',
 '- Поток: Learn → Understand → Watch → Try → Practice → Test → Review → Master. Объяснять термины, важные строки, изменения входных данных, ошибки и самостоятельное решение. Сохранять полезную старую теорию.',
 '- Для полноценных дней — 5–10 содержательных проверок, разные варианты повторной попытки, подсказки и ссылки на теорию. Mastered: реальная успешная практика, ≥80%, все критические вопросы. Self Reviewed даёт продолжение, но не Auto Verified; AI Feedback не является Human Reviewed.',
 '- Subjective capstone требует объективных проверок и настоящего уполномоченного human review. Старые checkbox-записи нельзя повышать до новых подтверждённых результатов.',
 '- Beginner FREE. Pro/Expert защищены сервером; готовность к уровню и подписка независимы. Никаких localStorage-entitlements или фиктивной оплаты.',
 '- Не исполнять недоверенный код в основном серверном процессе, не имитировать компиляторы и не утверждать, что установленный Docker означает готовый изолированный runner.',
 '- Не создавать третьего помощника. Объединить архитектуру существующих TutorDrawer/Site Agent: per-account multi-chat, серверная история, guest-local, поиск/удаление, устойчивые квоты и лимиты стоимости. Сохранить бесплатные детерминированные ответы.',
 '- Не подключать новые платные сервисы без разрешения. Billing fail-closed; online AI требует согласованного провайдера и cost caps. Отсутствующие credentials — объективный blocker, а не повод выдумать успешную интеграцию.',
 '',
 '## Остальные обязательные этапы',
 '',
 'Углубить HTML/JS1/JS2/Git/C++; расширить предметные visualizers и безопасные runtimes; завершить AI Mentor, весь premium design update, мобильную доступность и шрифты (включая ӣ ӯ ҳ қ ҷ ғ), персональную траекторию/placement/repetition, проекты/портфолио, community/study groups и честные completion records. Точный полный перечень фаз и решений хранится в delivery-state.json. Не подменять реализацию очередным аудитом.',
 '',
 '## Проверки и сдача',
 '',
 '`node scripts/coverage-matrix.mjs --check`; `node scripts/delivery-report.mjs --check`; `node scripts/course-content-quality-report.mjs`; typecheck/lint; тесты по изменениям; production build; browser desktop/mobile и auth-регрессии. Запускайте реальные примеры в доступных безопасных средах. Незапущенный runtime не считается проверенным.',
 '',
 'Работайте небольшими завершёнными PR. После зелёных проверок выполняйте обычное слияние и проверяйте CI main/Vercel. Сохраняйте точные SHAs, реальные результаты и остаток задач. Не останавливайтесь на описании плана и не объявляйте завершённым то, что ещё не реализовано.',
 '',
];
for(const [relative,lines] of [['docs/DEVATLAS-DELIVERY.md',delivery],['docs/CONTINUATION-PROMPT.md',continuation]]){
 const filename=path.join(root,relative),contents=lines.join('\n');
 if(process.argv.includes('--check')){
  if(!reportMatches(await readFile(filename,'utf8'),contents))throw new Error(`Stale delivery report: ${relative}. Run node scripts/delivery-report.mjs.`);
 }else await writeFile(filename,contents);
}
console.log(JSON.stringify({courses:rows.length,tracks:tracks.length,days:total,freeDays:days(free),premiumDays:days(paid),missingStages:missing.length,staleDurationClaims:stale}));
