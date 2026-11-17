# DevAtlas: parallel course completion — local files only

Дар `D:/Проектҳо/DevAtlas` аз кори воқеии нигоҳдошта давом деҳ. Ин вазифа иҷрои кор аст: курсҳои мавҷударо аз рӯи манбаъ, мазмун, практика ва санҷиш пурра кун. Бо audit ё нақша истода намон.

## 1. Нақши ту: фақат coordinator ва reviewer

Ту худат дарс, код, тарҷума ва fix нанавис. Кори иҷроиро ба subagent-ҳо деҳ. Худат agent-ҳоро сар кун, owner/status-ро назорат кун, файл ва далели онҳоро хон, санҷишро иҷро кун ва натиҷаро қабул ё барои ислоҳ баргардон. Навсозии report/register/catalog-ро ҳам ба integration agent супор. Reviewer ё coordinator муаллифи пинҳонии ислоҳи худаш нашавад.

**Ягон commit, push, PR, merge ё deploy накун.** Ҳамаи agent-ҳо ҳамин маҳдудиятро доранд. Кор фақат дар файлҳои локалии ҳамин проект бошад; шеф худаш push мекунад. Git-ро барои хондани status/log/diff истифода бар. No stash/reset/clean, force operation, history rewrite, branch deletion ё баргардондани файли дигарон. Dirty work-и мавҷударо нигоҳ дор. Кори иҷрошуда дар файл мемонад; маҳдудияти commit баҳона барои напурра мондан нест.

## 2. Аввал ҳолати воқеиро санҷ

AGENTS.md, CLAUDE.md, skills-и мувофиқ, package.json, schema ва actual loaders-ро хон. Пеш аз кодҳои Next.js relevant guide-и `node_modules/next/dist/docs/`-ро хон. `git status --short --branch`, `git log -12 --oneline` ва agent-ҳои воқеан фаъолро бин. Кори agent-и чати дигарро дубли накун.

Checkpoint-и таърихӣ дар commit `9826d8a7e5ea51e2687705cf81a4da205d1a2ad7`:

- 43 курс, 38 track, 1 262 рӯзи дарсӣ; catalog ва loader мувофиқанд.
- Ҳамаи 12 нақшаи short-course ба шумораи рӯзҳои нақша расидаанд. Management ва Digital Literacy ҳар кадом 30/30 мебошанд. Management-ро аз рӯзи24 аз нав нанавис.
- Дар ин партия 6 курс batch-и қабулшуда доранд: `management-foundations`, `python`, `mobile`, `javascript-pro`, `bash`, `algorithms`. Ин маънои «ҳамаи мазмун, тарҷума ва натиҷаи омӯзиш пурра Verified» надорад.
- Санҷиши нави чор suite-и пештар ноком (`introductory-tracks`, `mobile-draft`, `premium-curriculum`, `programming-intros`): 27 passed, 7 skipped, 0 failed. Full suite дар ин санҷиши ҳолат иҷро нашудааст; skip execution-и runtime-ро исбот намекунад.
- 37 курс ҳанӯз аз ин даври коркард нагузаштаанд: 23 курс камбудии сохторӣ доранд, 9-то heuristic review ва 5-то semantic/source/translation/practice review мехоҳанд.
- 72 Missing stage барномаҳои алоҳидаи ҳанӯз сохтанашудаанд; онҳоро бо фрагменти намерасидаи курси мавҷуда омехта накун.
- Interface чор забон дорад: EN/RU/TG/ES; дарсҳо RU/TG/EN. Аз source-и ҳозира санҷ. Ҳамаи курсҳои ҳозира бепуланд; Pro/Expert дар course metadata сатҳи омӯзиш аст, на далели бастани дастрасӣ. Номи course ID-ро тағйир надеҳ.

Манбаъҳои кор:

- `docs/audits/course-register-2026-11-17.md`;
- `docs/audits/continuation-quality-2026-11-17.json` ва `.md`;
- `docs/curriculum-design/*structural-review-2026-11-17.md`;
- source-review-и Management24–30 ва курсҳои анҷомшуда;
- `docs/course-authoring-prompt.md`, `docs/curriculum-design/short-courses.draft.json`;
- `docs/coverage-matrix.json`, `docs/audits/2026-10-26-tasks.json`.

Дар `main`-и маҳаллӣ ҳолати охирин дар [реестри курсҳо](audits/course-register-2026-11-17.md) ва [audit аз loader](audits/continuation-quality-2026-11-17.md) сабт шудааст. Реестр batch-ҳои қаблан қабулшудаи Algorithms, Management, Python, Mobile, JS Pro ва Bash-ро бо кори боқимонда нишон медиҳад. Барои рақамҳои нав audit-ро аз loader гиред. Ҳолати санҷишҳоро аз run-и охир хонед.

## 3. Ҳамин аввал 20 task-ро ба register гузор

Ба ҳар курс owner-и алоҳида деҳ. Ҳар owner курси худашро аз аввал то охир мегирад, на фақат як section.

Task01 `backend-pro`
Task02 `java`
Task03 `csharp`
Task04 `rust`
Task05 `php`
Task06 `ruby`
Task07 `sql`
Task08 `nodejs`
Task09 `mongodb`
Task10 `swift`
Task11 `kotlin`
Task12 `ux-design`
Task13 `ai-fundamentals`
Task14 `context-engineering`
Task15 `agent-harness`
Task16 `digital-marketing`
Task17 `data-analytics`
Task18 `business-foundations`
Task19 `communication`
Task20 `backend`

Сипас ҳамон queue-ро давом деҳ:

Task21 `architecture-expert`
Task22 `ux-pro`
Task23 `business-pro`
Task24 `html`
Task25 `javascript-1`
Task26 `javascript-2`
Task27 `react`
Task28 `nextjs`
Task29 `git`
Task30 `typescript`
Task31 `cpp`
Task32 `content-creation`
Task33 `css`
Task34 `go`
Task35 `english-foundations`
Task36 `digital-literacy`
Task37 `personal-productivity`

Backend Pro дар скриншоти пешина in-progress буд, аммо дар register queued. Пеш аз Task01 owner-и фаъол ё натиҷаи сабтшударо аниқ кун: кори фаъолро давом деҳ, agent-и дубли ҳамон файлро насоз.

## 4. Parallel pool: slot холӣ намонад

Дар оғози кор agent-ҳои мавҷударо бо инструменти воқеии environment санҷ. Агар ҳеҷ subagent набошад, худаш онҳоро соз ва фавран task-ҳои аввалро сар кун; фақат номи owner-ҳоро дар ҷадвал навишта истода намон. Агар agent-и мувофиқ мавҷуду idle бошад, task-ро ба ҳамон agent фирист ва фаъол кун. Агар agent ҳоло кор кунад, owner ва файли ӯро дубли накун. Дар register actual agent ID ва ҳолати running-ро аз натиҷаи инструмент сабт кун.

Ҳар task қабул шуд, agent-и озодро барои task-и навбатӣ истифода бар ё subagent-и нав созу сар кун. Барои сохтани ҳар subagent аз шеф тасдиқ напурс: ҳамин промт иҷозати тақсим ва иҷрои вазифаҳоро медиҳад. Агар худи environment умуман инструменти subagent надошта бошад, agent-и сохта ё «20 worker running»-и дурӯғ эълон накун; маҳдудияти воқеиро рост хабар деҳ. Аз худ имкони tool, model ё лимити нав насоз.

Мақсад 10–20 task-и омода ва ҳарчанд agent-и ҳамзамони воқеан дастрас аст. Агар environment20 worker иҷозат диҳад, pool-ро то20 пур кун. Агар лимит4 agent бошад, coordinator яке аз онҳост ва то3 worker ҳамзамон кор мекунанд. Лимитро пинҳон накун ва agent-и queued-ро running нишон надеҳ. Шумораи task-ҳои register аз шумораи worker-и воқеӣ ҷудо аст.

Агар background agent дастгирӣ мешавад, agent-ҳоро background сар кун. Ҳар worker анҷом дод → натиҷаро ба review фирист → slot-и холиро фавран бо task-и навбатӣ пур кун. Барои ҳар курс аз шеф «давом диҳам?» напурс. Ба рақами10 ё20 расидан сабаби бозистодан нест: queue то ҳамаи43 курс идома меёбад.

Барои review ва integration низ task/owner таъин кун. Reviewer бо муаллифи ҳамон batch як кас набошад. Агар slot кам бошад, worker-и озодро муваққатан reviewer ё integrator кун; task-ҳоро бо навбат гузарон, на бо дубора навиштани курс аз тарафи coordinator. Full build/full tests-ро integration agent якбор дар ҳолати мувофиқи файлҳо иҷро кунад;20 agent build/test-и умумиро ҳамзамон насозанд.

## 5. Ownership ва шартномаи ҳар owner

Ба ҳар worker чунин contract деҳ:

«Курси ту: <courseId>. Танҳо course source-и худ, test-и махсуси худ ва source-review-и худатро таҳрир кун. Ҳамаи рӯзҳо, шарҳҳо, мисолҳо, саволҳо, hint/feedback, practice, reference, criteria, rubric, project ва RU/TG/EN-ро санҷ. Фақат sample-и чанд дарсро санҷида тамоми курсро қабулшуда нагӯ. Existing behavior/design/IDs/progress-ро нигоҳ дор. Commit/push накун. Кори тайёрро дар файл навис ва review evidence деҳ.»

Course ID, lesson ID, quiz ID, day order, prerequisiteDays, route ва learner progress-ро тағйир надеҳ. Навро append кун. Existing option order-ро танҳо барои рақами зебои audit ҷунбон накун; ҷавоби воқеан нодуруст бо evidence ислоҳ шавад. Агар манъи мушаххаси мавҷуда ислоҳи заруриро боздорад, blocker-ро бо таъсири дақиқ сабт кун ва қисми мустақили дигарро иҷро кун.

Ба ду worker ҳамон файлро надиҳ. Catalog, navigation, translation dictionaries-и умумӣ, shared tests, schema, report ва configuration ownership-и integration agent аст. Course worker барои онҳо delta/request тайёр кунад. React/Next.js ва Mobile draft/published пайвастагии махсус доранд: owners ва integrator пешакӣ ҳудуди файлҳоро мувофиқа кунанд. Ягон муаллиф курсҳои дигарро аз рӯи «best practice» refactor накунад.

## 6. Definition of done: дарс воқеан омӯзонад

Барои ҲАР рӯзи курс инҳоро тафтиш кун:

1. Topic ва prerequisite ба ҳам мувофиқанд. Beginner метавонад аз шарҳи мавҷуда task-ро фаҳмад. Калима ё формулаи нав пеш аз истифода шарҳ дорад.
2. Шарҳи RU/TG/EN маънои якхела дорад, табиӣ ва фаҳмост. TG нусхаи русӣ нест; EN кӯтоҳшуда нест. Тарҷумаи худатро «independent native review» нагӯ.
3. Теория «барои чӣ → чӣ хел → мисоли аниқ → маҳдудият/хатои маъмул»-ро дорад. Чор section minimum аст, на кафолати сифат. Параграфи умумӣ ё section-и такрорӣ барои шумора илова накун.
4. Мисол code-и пурра ё demonstration-и мувофиқи фан дорад. Бизнес, забон ва UX-ро ба code editor маҷбур накун. Барои claim-и техникӣ runtime/version-ро аниқ кун.
5. Practice мустақил аст: ҳамон усул, вале input/сенария/шарти нав. «Коди мисолро нусха карда run кун» танҳо машқи роҳнамо аст; ҷойи independent practice-ро пур намекунад. Машқи guided-и фоиданокро нигоҳ дор ва қисми мустақил илова кун.
6. Task ҳамаи додаҳои лозим, натиҷаи интизорӣ ва criteria-и санҷиданӣ дорад. Reference ҲАМАИ шартҳои task-ро иҷро мекунад. Натиҷаи ҳисоб, output, path, formula, unit ва edge case ростанд.
7. Саволҳо фаҳмишро месанҷанд; distractor хатои воқеӣ аст. Hint сабабро фаҳмидан ёрӣ медиҳад; relatedSection ба қисми воқеан таълимдиҳанда меравад. Саволи такрорӣ ё ҷавоби аз рӯи дарозӣ аён насоз. Minimum3 question; мувофиқи contract assessment/retry variant-и маънодорро пур кун.
8. Project ва рубрика ба худи task мувофиқанд. Ҳар сатҳи0/1/2 deficit ё evidence-и конкретӣ дорад. Ҷумлаҳои якхелаи «кам аст/хуб аст» rubric-и пурра нестанд.
9. Code-и навро воқеан дар runtime-и мувофиқ иҷро кун; барои task-и тағйирдода solution ва starter/negative case-ро низ санҷ. Хатои роҳ, dependency ё fixture-ро ба content bug нисбат надеҳ, то сабаб тасдиқ нашавад.
10. Амали воқеии дастгоҳ, account, team, pronunciation ё usability аз рӯи ҷавоби хаттӣ тасдиқ намешавад. Self Reviewed / Auto Verified / Human Reviewed / UNVERIFIED-ро рост ҷудо кун. Password/code/private data-и ҳақиқӣ талаб накун.

## 7. Research-и воқеӣ

Ҳар owner манбаъҳои намерасидагии фанашро аз интернет ёбад ва матни мувофиқро воқеан хонад. Technical facts — official docs/spec/source code; мавзӯи ғайрибарномасозӣ — primary institution, textbook ё standard-и мувофиқ. Search snippet ё URL дар sources далели research нест.

Source-review бояд exact URL, date/version, claim-и санҷидашуда, рӯзи истифода, натиҷа ва маҳдудият дошта бошад. 403/404 ва URL-и ивазшударо сабт кун; манбаи нахондаро read тасвир накун. Матн, мисол ва саволҳои DevAtlas аслӣ бошанд; source prose/media-ро бе ҳуқуқ нусха накун. Санаи review-ро худсарона имрӯз ҳисоб накун — вақти воқеии иҷроишро истифода бар.

## 8. Шаш курси қабулшуда кори боқӣ доранд

Task38 `management-foundations`: аз нав30 рӯз насоз. Sentence-level RU/TG/EN, cross-day coherence, тасдиқи label-и GovS version ва маҳдудияти rubric/source evidence-ро санҷ.
Task39 `python`: 28 машқи type-along/reference-и ҳаммонандро хон; қисми independent practice ва changed inputs-ро пур кун. Day30 output-и ислоҳшударо нигоҳ дор.
Task40 `mobile`: overlap-и practice/example, actual React Native/Expo behavior, draft/published equality ва code/runtime evidence. Native-device run набошад, онро гузашт нагӯ.
Task41 `javascript-pro`: guided/trusted-example-ҳоро аз independent task ҷудо кун; test-и қавишударо нигоҳ дор. Answer-pattern/feedback ва run-и changed-input-ро санҷ.
Task42 `bash`: мустақилияти practice ва distractor-ҳоро хон. Day30 no-arg fixture ва rejection-и path-и нодуруст нигоҳ дошта шавад.
Task43 `algorithms`: 13 practice-и type-along-ро пурра independent кун, бо input/edge case ва execution. 13 section ва42 hint-и навро аз нав насоз.

Ин scope пур кардани қисми мустақили practice ва маънои нопурраро дар бар мегирад. «Ин guided design аст» набояд сабаб шавад, ки course умуман independent practice надошта бошад. Қисми хуби guided-ро ҳифз карда, task-и нави мустақилу санҷида илова кун. Талаби нигоҳ доштани IDs/progress ва маҳдудиятҳои воқеии schema риоя шавад.

## 9. Даври review ва ислоҳ

Owner натиҷа медиҳад → independent reviewer source ва diff-ро мехонад → coordinator далел ва санҷишро месанҷад.

Finding бояд ҳамин формат дошта бошад: course/day/file/fragment → мушкили мушоҳидашуда → далел → сабаби тасдиқшуда ё UNKNOWN → fix-и даркор → санҷиши қабул.

Агар чизе хато ё нопурра бошад, ба ҲАМОН owner баргардон. Рӯзи проблема, prerequisites, explanation, example, task, solution ва quiz-и вобастаро якҷо аз сар санҷад; тамоми курси хубро аз нав нанависад. Баъди fix reviewer санҷишро такрор кунад. Тестро суст/skip накун ва expected-ро бе санҷиши actual behavior иваз накун.

Status-ҳо: QUEUED → RUNNING → REVIEW → FIX_REQUIRED → RETEST → ACCEPTED ё VERIFIED_WITH_LIMITS. BLOCKED танҳо бо сабаби мушаххас ва кори боқӣ. «Agent гуфт тайёр», word count ё screenshot-и ҷадвали сабз қабул нест. Ягон section, locale, source claim ё талаби task аз review напарад. Ҳеҷ вақт «100% бе bug» ваъда надеҳ; доираи санҷидашуда ва маҳдудиятро нишон деҳ.

## 10. Integration ва санҷиш

Integration agent каталог/count/copy/test/report/register-ро аз loader-и ҳозира мувофиқ мекунад. Interface EN/RU/TG/ES ва lesson RU/TG/EN-ро нигоҳ дор. Промтҳои кӯҳнаи ReactMentor,6забон,Management23 ё «Pro course ҳатман paid» ҳақиқати source-и ҳозираро override накунанд. Курс ё сатҳи коркунандаро аз рӯи номи Pro удалит накун.

Санҷишҳо мувофиқи тағйир:

- actual course schema/loaders, imports ва ID/progress preservation;
- `node scripts/check-short-course-blueprints.mjs`;
- regenerate ва check-и coverage-matrix, delivery-report, course-content-quality-report, audit-backlog ва continuation-quality-audit;
- React quiz тағйир ёфт: `node scripts/build-learning-index.cjs`;
- course-specific tests ва воқеан иҷро шудани examples/solutions/negative cases;
- typecheck, lint, full tests ва production build баъди integration-и партия;
- desktop/mobile: lesson rendering, quiz feedback/anchor, practice, direct URL/reload, draft persistence, rubric ва status-и рост.

Full checks-ро serialized иҷро кун, то concurrent worker муҳити тест/build-ро вайрон накунад. Чор suite-и собиқ нокомро аз нав санҷ; «пештар failed буд» далели нокомии ҳозира нест. Runtime-и дастнорасро SKIPPED/UNVERIFIED сабт кун. Live AI, DB migration, billing, real message/send ё deploy қисми ин content task нест.

## 11. Register ва идомаи кор

Integration agent register-и ҳамаи43 курсро ҳамеша нав нигоҳ дорад: owner/actual agent id, status, current day/module, source evidence, changed files, test command+result, review finding, fix/retest, residual work. Номи owner-и аз худ навишташуда actual running agent ҳисоб нашавад.

Coordinator ҳар анҷоми task-ро мехонад, finding-ро бармегардонад ва slot-и холиро бо кори нав пур мекунад. Ба шеф update-и кӯтоҳи маънодор деҳ: воқеан running/accepted/remaining, кадом хатои мазмун ёфт ва чӣ ислоҳ шуд. Як соат бе update ё пайдарпай пурсидани permission-и қадами оддӣ лозим нест.

Агар context/лимит/қатъи иҷборӣ расид, owner кори иҷрошуда ва exact next action-ро дар файл нависад. Model/account-ро пинҳонӣ иваз ё quota-ро давр назан. Пас аз идома ҳамон кори сабтшударо истифода бар. Ягон commit/push барои checkpoint насоз.

## 12. Scope-и баъди ҳамаи43 курс

Панҷ курси14-рӯзӣ аз рӯи нақшаи қабулшуда continuation доранд; duration-и нави30/60рӯзиро аз худ насоз. 72 Missing stage-ро бо syllabus/prerequisite/progress-и алоҳида дар backlog нигоҳ дор. Онҳо бо «23 курси дорои structural gap» як рақам ё як task нестанд. Нақшаи stage аллакай қабул шудааст — authoring-ро бо owner-и ҷудо давом деҳ; қарор ё requirement-и муҳим намерасад — сабаб ва саволи конкретиро сабт карда кори мустақили дигарро иҷро кун. Coming Soon ё нусхаи Beginner барномаи тайёри нави Pro/Expert нест.

Дар охир: register-и ҳамаи43 курс, натиҷаи сохторӣ ва маъноӣ, exact tests/sources, ҳамаи fix/retest ва маҳдудиятҳои боқӣ. Кор дар проект локалӣ тайёр бошад. **Commit, push, PR, merge ва deploy накун — шеф худаш иҷро мекунад.**
