Проекти DevAtlas дар `D:/Проектҳо/DevAtlas`-ро аз checkpoint-и ҳамин repo давом деҳ. Ту coordinator ва reviewer ҳастӣ. Мақсад: ҳамаи курсҳоро воқеан санҷида, дар курсҳои нопурра фрагментҳои намерасидагиро бо манбаъҳои дуруст пур кунӣ. Фақат audit ё нақша насоз — кори тасдиқшудаи намерасидагиро иҷро, тафтиш ва нигоҳ дор.

**Аввал контекст ва кори тайёрро хон:**

- `AGENTS.md`, `CLAUDE.md` ва skills-и мувофиқ, аз ҷумла `mansur-frontend-mentor`, `project-coding-rules`.
- `docs/CURRICULUM-CHECKPOINT-2026-11-17.md` — кори сабтшуда, проверка ва маҳдудиятҳо.
- `docs/audits/continuation-quality-2026-11-17.md` ва `.json` — ҳамаи 43 курс; JSON day/question/field-и мушаххасро дорад.
- `docs/course-authoring-prompt.md`, schema ва loader-и воқеии ҳар курс.
- `docs/curriculum-design/short-courses.draft.json`, `docs/coverage-matrix.json`, `docs/audits/2026-10-26-tasks.json` — нақшаҳо ва backlog.

`git status --short --branch`, `git log -5 --oneline`, branch/worktree-ҳо ва open PR-ҳоро санҷ. Ягон кори тайёрро аз нав насоз ва dirty changes-и дигаронро напарто. Ба рақамҳои кӯҳна бовар накун: ҳисобро аз loader-и ҳозира такрор кун. Скрипти portable: `node scripts/continuation-quality-audit.mjs`. React ва Next.js JSON-и оддӣ нестанд; loader ва overlay-и онҳоро истифода бар.

**Ҳолати checkpoint:**

- 43 курс, 38 track, 1 255 рӯзи дарсӣ; 42 stage дорои curriculum ва 72 stage-и Missing.
- Digital Literacy 30/30, Content Creation 30/30, English Foundations 42/42, Personal Productivity 22/22. Management Foundations 23/30: аз рӯзи 24 давом деҳ.
- Draft-и рӯзҳои 24–30-и Management дар `docs/curriculum-design/management-foundations-24-30-recovered.draft.json` нигоҳ дошта шудааст. Онро аз нав нанавис: хон, манбаъ ва мазмунашро санҷ, reference/task-ро мувофиқ кун, rubric-ҳои намерасидаро навис ва танҳо баъд ба loader илова кун. Он ҳафт рӯз ҳоло дар каталог ҳисоб намешавад. Рӯзҳои 16/23-и Management ҳам project rubric-и сесатҳа мехоҳанд; шарҳҳои кӯтоҳи TG-ро аз рӯи маъно тафтиш кун, бо filler дароз накун.
- Ҳамаи 60 рӯзи React ва 20 рӯзи Next.js аллакай камаш чор section ва се question доранд. Гапи кӯҳнаи «React 40 рӯз / Next.js 1–12 ҳоло theory надоранд»-ро такрор накун. Practice, feedback, тарҷума ва далели execution-и онҳоро алоҳида санҷ.

**Subagent-ҳоро параллел идора кун:**

Барои ҳар курси ба кор гирифташуда subagent-и ҷудо таъин кун: як agent — як курс, аз таҳлил то ислоҳ ва проверка. Ба ҳар agent course ID, файлҳои ownership, рӯзҳо/фрагментҳои проблема, source review ва criteria-и анҷомро аниқ деҳ. Ҳар agent course JSON/TS-и худаш, test-и профильӣ ва source-review-и ҳамон курсро кор кунад. Файлҳои умумии catalog, loader config, report, progress semantics ва integration-ро худат идора кун. Ба ду agent иҷозат надеҳ ҳамон файлро якбора иваз кунанд.

Ба ҳар курси воқеан нопурра owner деҳ. Чӣ қадар slot дастрас бошад, ҳамон қадар parallel worker сар кун; боқимондаро дар queue нигоҳ дор ва баъди анҷоми як курс slot-ро ба курси дигар деҳ. Агар environment ҳамагӣ 4 slot дошта бошад, ту + то 3 subagent кор мекунед; 38 agent-ро якбора ваъда надеҳ. Барои ҳамаи 43 курс register дошта бош: owner, status, days/fragments, sources, findings, fixes, tests ва кори боқӣ. Курс бе owner ё бе натиҷаи review гум нашавад.

**Навбати кор аз audit:**

1. Management — ҳафт рӯзи охир ва rubric-ҳои нотамом.
2. Ин 28 курс камбудии сохтории мушоҳидашуда доранд: `algorithms`, `python`, `backend`, `mobile`, `java`, `csharp`, `rust`, `php`, `ruby`, `sql`, `bash`, `nodejs`, `mongodb`, `swift`, `kotlin`, `ux-design`, `ai-fundamentals`, `context-engineering`, `agent-harness`, `digital-marketing`, `data-analytics`, `business-foundations`, `communication`, `javascript-pro`, `backend-pro`, `architecture-expert`, `ux-pro`, `business-pro`. Барои ҳар кадом section/question/hint-и намерасидагиро аз JSON-и audit гир ва бо owning source тасдиқ кун.
3. Ин 9 курс нишонаи review доранд: `html`, `javascript-1`, `javascript-2`, `react`, `nextjs`, `git`, `typescript`, `cpp`, `content-creation`. Якхела будани position, дарозии correct option ё монандии solution ба мисол худ аз худ bug нест. Agent аввал task, example, solution ва UI-ро хонад, баъд камбудии воқеиро ислоҳ кунад. Ҳамин тавр, 29 курс кори аниқи authoring/structure ва 38 курс навбати priority бо heuristic review доранд; ин «38 курс ҳамааш хато» намегӯяд.
4. Панҷ курси боқӣ — `css`, `go`, `english-foundations`, `digital-literacy`, `personal-productivity` — аз review-и маъно, манбаъ, тарҷума, практика ва интегратсия нагузаранд. Барои зиёд кардани commit онҳоро беҳуда тағйир надеҳ.
5. Continuation-и панҷ курси 14-рӯзӣ (`typescript`, `algorithms`, `ai-fundamentals`, `context-engineering`, `agent-harness`) дар backlog мемонад. Аз нақшаи қабулшуда давом деҳ; барои ҳамаи онҳо худсарона 30/60 рӯз интихоб накун.
6. 72 stage-и Missing барномаҳои ҳанӯз мавҷуднабудаанд. Онҳоро аз камбудии дарси мавҷуда ҷудо дар register нигоҳ дор. Пас аз курсҳои мавҷуда, ҳар stage-ро бо syllabus-и алоҳида, prerequisite ва progress-и алоҳида кор кун, агар нақшаи он аллакай қабул шудааст. Талаб ё интихоби муҳими номаълум бошад, як саволи конкретӣ деҳ ва кори мустақили дигарро давом деҳ. Барномаи навро бо нусхаи курси Beginner ё Coming Soon пуршуда нишон надеҳ.

**Вазифаи ҳатмии ҳар course agent:**

- Ҳамаи рӯзҳо, section-ҳо, саволҳо, hint/feedback, task, solution, criteria, project ва тарҷумаҳои курси худашро санҷ; танҳо чанд дарси аввалро sample карда тамоми курсро «тайёр» нагӯ.
- Манбаъҳоро аз интернет ёб ва воқеан хон: official documentation, primary source, китоб ё муассисаи соҳиби мавод. URL, version/date ва маҳдудияти манбаъро дар source-review сабт кун. URL-и дар sources бударо далели хондан ҳисоб накун. Манбаи кушоданаш ношуда «санҷида шуд» нашавад.
- Матни аслии RU/TG/EN, шарҳи барои beginner фаҳмо, мисоли корӣ, edge case ва хатои маъмул навис. Мавзӯъро бо фрагменти намерасида пур кун; матни тайёри хубро аз нав нанавис.
- Practice кори мустақил бошад: input/сенарияи нав, task-и аниқ, ду hint, solution-и ҷудо ва criteria-и санҷиданӣ. Нусхабардории мисоли боло practice-и мустақил нест.
- Саволҳо фаҳмишро санҷанд, distractor-ҳо хатои воқеии beginner бошанд. Feedback сабаб ва section-и мувофиқро нишон диҳад. Чор section ва се question минимум аст; барои full delivery санҷишҳои бештар, retry variant ва project-и маънодорро мувофиқи contract соз, бе саволи такрорӣ ва filler.
- Ҳар коди иловашуда ва натиҷаи ҳисобро бо runtime-и мувофиқ иҷро кун. Compiler/runtime дастрас набошад, рост «unverified» навис ва қисми дигари корро идома деҳ. Editor доштан далели иҷро шудани Java/Python/SQL нест.
- Written/project rubric дар ҳамаи се level ба худи task мувофиқ бошад. Reference тамоми талаботи task-ро иҷро кунад. Self Reviewed-ро Auto Verified ё Human Reviewed нагӯ; кори банақшагирифта иҷрошуда ҳисоб нашавад.
- Existing IDs, prerequisiteDays, progress, quiz IDs ва original option order-ро нигоҳ дор. Рӯзҳои навро фақат ба охир илова кун. Design, stack, router, auth, billing, DB ва backend-ро бе зарурати ҳамин task тағйир надеҳ.

**Чор нокомии воқеии test-ро аз даст надеҳ:**

Дар checkpoint full Vitest: 879 passed, 8 skipped, 4 failed. Файлҳои ин чор соҳа дар ин партия тағйир наёфтаанд; baseline алоҳида санҷида нашудааст. Owner-и ҳар курс сабабро тасдиқ ва ҳал кунад:

- `tests/introductory-tracks.test.ts`: Python day30 output-и воқеӣ 45/25, output-и эълоншуда 88/45 ва формати дигар.
- `tests/mobile-draft.test.ts`: Mobile day10 бо draft фарқ дорад (`correctIndex` 1 бар зидди 0); option ва answer-и воқеиро санҷ.
- `tests/premium-curriculum.test.ts`: JavaScript Pro test practice solution-ро айнан example.code талаб мекунад; ин талабро бо contract-и practice-и мустақил муқоиса кун.
- `tests/programming-intros.test.ts`: Bash example бо `Usage: bash report.sh <readable log file>` ва exit1 меафтад; input/fixture ва code-ро санҷ.

Барои сабз кардани CI assertion-ро кӯрона суст ё test-ро skip накун. Фарқи bug-и content, test-и кӯҳна ва маҳдудияти runtime-ро бо далел нишон деҳ.

**Review ва қабул вазифаи худи туст:**

Ҳар agent натиҷа дод → diff ва худи дарсҳоро хон → primary sources-и claim-ҳои муҳимро санҷ → task-ро бо reference ва rubric муқоиса кун → test/runtime-ро иҷро кун. Finding-ро бо file/day/fragment ва сабаб ба ҳамон owner баргардон. Баъди ислоҳ аз нав санҷ. Танҳо «agent гуфт тайёр» қабул нест. Ягон section, locale, task ё талаби register бе санҷиш гум нашавад. Agent-и иловагии read-only reviewer-ро дар slot-и холӣ истифода бурда метавонӣ.

Баъди integration catalog/count/copy/test/backlog-ро мувофиқ кун ва report-ҳоро regenerate намо: `coverage-matrix.mjs`, `delivery-report.mjs`, `course-content-quality-report.mjs`, `audit-backlog.mjs`, `continuation-quality-audit.mjs`; blueprint ва freshness check-ҳоро иҷро кун. React quiz тағйир ёфт → `build-learning-index.cjs`-ро ҳам нав кун. `npm run lint`, `npm run typecheck`, test-ҳои профильӣ, full tests ва build-ро иҷро кун. Дар браузери desktop/mobile дарси тағйирёфта, feedback, direct URL, reload, нигоҳ мондани draft ва status-и ростро санҷ.

Кори санҷидашударо бо commit/checkpoint-и равшан нигоҳ дор; кори нотамомро ҳамчун draft бо next action сабт кун. Аз backup-и worktree кори навро кӯрона overwrite накун. Push, merge ва deploy амали ҷудоянд; аз худ иҷозати нав насоз. Ба сабаби лимит model/account-ро иваз ё маҳдудиятро давр назан: ҳолати корро нигоҳ дор ва blocker-ро рост навис.

Ба шеф кӯтоҳ update деҳ: кадом agent кадом курсро дорад, чӣ ёфт, чӣ ислоҳ шуд ва чӣ санҷида шуд. Бо ҳар қадами оддӣ тасдиқ напурс. Натиҷаи охир бояд register-и ҳамаи 43 курс, тағйироти воқеӣ, далели проверка ва рӯйхати дақиқи кори боқиро дошта бошад; танҳо шумораи section-ҳоро «курс полноценный» ҳисоб накун.
