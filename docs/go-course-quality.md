# Go: ҳисоботи ислоҳи курс

Сана: 2026-11-02. Branch: `content/go`; base-и PR: `main`.
`origin/main` дар `a420d976f7dfbfcc9cc19f54c657a44488dc14e4` бо commit-и `98aa73b`
бе ихтилоф merge шуд. Ҳамаи тағйироти main нигоҳ дошта шуданд.
Baseline-и audit аз `959dc9b176109879549b9e195de1960f375c1333` аст;
файли Go дар main бо он baseline айнан якхела буд.

Ҳамаи 30 рӯз таҳрир шуданд. `id`, `day`, `prerequisiteDays`, `sourceIds`, манбаъҳо,
файлҳои курс ва ID-и саволҳои мавҷуда нигоҳ дошта шуданд.

## Audit пеш ва баъд

Фармон: `python3 -I scripts/course-authoring/audit.py go`.
Шумораҳо шумораи дарсҳои мушкилдор мебошанд, магар сутунҳои фоизӣ ва `autoGraded`.

| Нишондод | Пеш | Баъд |
| --- | ---: | ---: |
| Дарс / рӯз | 30 / 30 | 30 / 30 |
| `template` | 0 | 0 |
| `sec<4` | 2 | 0 |
| `q<3` | 30 | 0 |
| `noHint` | 30 | 0 |
| `noEN` | 0 | 0 |
| `tg=ru` | 0 | 0 |
| `badCrit` | 28 | 0 |
| `genericCrit` | 26 | 0 |
| `shortSol` | 1 | 0 |
| `autoGraded` | 0 | 0 |
| `answerSameIdx%` | 100 | 33 |
| `answerLongest%` | 80 | 22 |
| `solInLesson%` | 80 | 0 |
| `repeatTitles%` | 94 | 0 |
| `copyTask%` | 86 | 0 |

Ин audit санҷиши эвристикӣ аст. Ба ғайр аз он, мазмун ва код алоҳида санҷида шуданд.
Ҳоло 90 савол ҳаст: ҷавоби дуруст дар ҷойҳои 1, 2 ва 3 маҳз 30-тоӣ аст.
Ҳар дарс 3 савол бо подсказка ва пайванд ба қисми мувофиқ дорад. Дар RU/TG/EN
таносуби дарозтарин вариант ба кӯтоҳтарин аз 1.8 зиёд нест; ҷавоби дурусти
дарозтарин дар ҳар забон аз 45% кам аст.

Ҳар дарс 4 қисм дорад: мисоли зиндагӣ, шарҳи механизм, ҳолатҳои ҳудудӣ ва хатоҳо.
Ҳар яке аз 120 шарҳ дар ҳар забон 250–700 аломат аст. Сарлавҳаҳои қисмҳо такрор
намешаванд. Практикаҳо 4 қадам, 2 подсказка ва 3 критерияи мушаххас доранд.
Solution дар блоки ҷудои практика аст ва натиҷаи интизории худро дар `// Output:` дорад.

Рӯзҳои 10 ва 20 мини-лоиҳаҳои хароҷот ва фармоиш доранд. Рӯзҳои 29–30 TODO-ро
бо ID, санҷиши ном, анҷоми такрорӣ, ҳисобот, JSON ва тестҳо месозанд.
Рӯзҳои 22, 23 ва 30 файлҳои воқеии модул доранд, ки бо `// File:` ҷудо шудаанд.

## Санҷиш баъди ҳар қисм

| Қисм | Go solution | Мисоли дарс | Schema ва quality guard |
| --- | ---: | ---: | ---: |
| Рӯзҳои 1–10 | 10 гузашт | 10 гузашт | 50 гузашт |
| Рӯзҳои 11–20 | 10 гузашт | 10 гузашт | 50 гузашт |
| Рӯзҳои 21–30 | 10 гузашт | 10 гузашт | 50 гузашт |

Барои ҳар қисм иҷро шуд:

```bash
python3 -I scripts/course-authoring/verify_go.py --from-day 1 --to-day 10
npm test -- tests/published-curriculum.test.ts tests/course-quality-guard.test.ts --maxWorkers=2
```

Барои қисмҳои дигар ҳудудҳо `11–20` ва `21–30` буданд. Пас аз иловаи guard-и Go
ва таҳрири охирини шарҳҳо, schema ва quality guard **52 тестро** гузаронданд.

## Санҷиши воқеии Go

Муҳит: Linux amd64, `go version go1.27.3 linux/amd64`. Toolchain аз бастаи расмии
`go1.27.3.linux-amd64.tar.gz` гирифта шуд; SHA-256 бо рӯйхати расмии
<https://go.dev/dl/?mode=json> муқоиса шуд:
`65efbc80fdc1fa2cd2631cad5b481777a68e8725f34e89f50fc6ac714e379b40`.

Ҳар solution ва ҳар мисол дар ҷузвдони муваққатии ҷудо бо `go run main.go`
ё `go run .` иҷро шуд. `stdout` бо натиҷаи эълоншуда муқоиса шуд; `stderr` холӣ буд.
Ҳамагӣ **30 solution + 30 мисол** гузаштанд. Код бо `gofmt` формат шудааст.

Verifier-и нав барои такрори ҳамин санҷиш:

```bash
# Go-и воқеӣ ва Python 3.10+ бояд дар PATH бошанд.
python3 -I scripts/course-authoring/verify_go.py
```

Дар ҳамин муҳити cloud, toolchain дар `/workspace/toolchains/go` насб шудааст.
Барои такрор аз shell-и нав:

```bash
PATH=/workspace/toolchains/go/bin:$PATH GOCACHE=/workspace/go-authoring/go-cache \
  python3 -I scripts/course-authoring/verify_go.py
```

Verifier танҳо коди боэътимоди репозиториро иҷро мекунад; барои коди воридкардаи
хонанда пешбинӣ нашудааст. Он файлҳои модулро ҷудо мекунад, маҳдудияти вақт дорад
ва барои bundle-и дорои `_test.go`, `go test -count=1 -v ./...`-ро ҳам иҷро мекунад.
Vitest-и Go ҳамин verifier-ро истифода мебарад. Ҳалли практика дигар бо баромади
мисоли назариявӣ муқоиса намешавад: ҳар кадом натиҷаи алоҳида дорад.

Санҷишҳои иловагӣ:

- Рӯзҳои 22, 23, 30: `go build ./...` ва `go vet ./...` гузаштанд.
- Рӯзи 23: `TestCost` ҳолатҳои одӣ, сифр ва ҳар ду вуруди манфиро санҷид.
  Ивази муваққатии `price * quantity` ба `price + quantity` тестро шикаст;
  баъди барқарор кардани код тест гузашт.
- Рӯзи 30: тестҳои рӯйхати холӣ, номи холӣ, ID, анҷоми такрорӣ ва JSON гузаштанд.
- Рӯзҳои 24–26: `go run -race main.go` бо баромади интизорӣ гузашт;
  race ё паёми хато ёфт нашуд.

## Санҷиши лоиҳа ва браузер пеш аз merge-и main

- `npm test -- --maxWorkers=2`: **493 гузашт, 8 skip**, 83 файли тест.
- Санҷиши такрории verifier ва guard баъди такмили UTF-8: **15 гузашт, 6 skip**.
- `npm run typecheck`: гузашт; production build низ санҷиши TypeScript-ро гузаронд.
- `npm run lint`: гузашт.
- `npm run build`: гузашт, аз ҷумла бо матнҳои ниҳоии шарҳҳо.
- `PLAYWRIGHT_PROD_SERVER=true npm run test:e2e -- e2e/go-course.spec.ts e2e/courses.spec.ts`:
  **24 гузашт** дар Chromium desktop/mobile.
- E2E-и Go тарҷумаҳои RU/TG/EN, ҷудо будани solution, 2 подсказка, 3 критерий,
  ҷавоби нодуруст, пайванди бозгашт ба шарҳ ва ҷавобҳои дурусти ҳар се саволро санҷид.
- Баъди таҳрири ниҳоии шарҳҳо, `e2e/go-course.spec.ts` боз **6/6** гузашт;
  рӯзи 1 ва лоиҳаи рӯзи 30 ба ҳар се забон санҷида шуданд.
- `node scripts/course-authoring/verify_js.mjs src/content/courses/go.json`:
  `checked 0 executable lessons, 0 problems`. Ин натиҷа тасдиқи иҷрои Go ҳисоб намешавад.

## Санҷиш баъди merge-и main

Санҷишҳо дар commit-и merge `98aa73b` аз нав иҷро шуданд. Танҳо ҳамин ҳисобот баъд
нав шуд; коди санҷидашуда дигар нашуд.

| Санҷиш | Натиҷа |
| --- | --- |
| `npm run typecheck` | Гузашт |
| `npm run lint` | 0 error, 1 warning-и мавҷудаи main |
| `npm test -- --maxWorkers=2` бо Go дар PATH | 534 passed, 8 skipped; 88 файл |
| `npm run build` | Гузашт |
| `python3 -I scripts/course-authoring/audit.py go` | Ҳамон натиҷаи сутуни «Баъд» |
| `python3 -I scripts/course-authoring/verify_go.py` | 30 solution, 30 мисол, 0 мушкил |
| Playwright desktop/mobile, 7 spec-и вобаста | 73 passed, 1 skipped |

Warning-и lint: `completionSchema` дар `src/app/api/tutor/route.ts:37` истифода
нашудааст. Ин файл аз main бетағйир гирифта шуд.
Skip-и E2E ба санҷиши махсуси mobile дар project-и desktop тааллуқ дорад;
ҳамон санҷиш дар mobile гузашт. Ҳамаи 6 ҳолати E2E-и Go гузаштанд.

```bash
PLAYWRIGHT_PROD_SERVER=true npm run test:e2e -- \
  e2e/go-course.spec.ts e2e/courses.spec.ts e2e/lesson-flow.spec.ts \
  e2e/catalog-platform.spec.ts e2e/learning-experience.spec.ts \
  e2e/design-upgrade.spec.ts e2e/server-smoke.spec.ts
```

## Хатоҳои ислоҳшуда ва маҳдудиятҳо

Дар матни пешина баҳои `82` ба шохаи нодурусти `switch` нисбат дода мешуд;
ҳоло натиҷа `B` аст. Барои `шӯрак` дарозии UTF-8 **10 байт ва 5 руна** аст,
на 12 байт. Ин ҳисобҳо бо Go-и воқеӣ санҷида шуданд.
Дар solution-ҳои нав ихтилофи натиҷаи эълоншуда бо иҷро ёфт нашуд.
Дар таҳрири охир вариантҳои аз ҳад кӯтоҳи чанд савол низ ҳамдарозтар шуданд.

Дар доираи 30 дарси Go кори номукаммал намонд. Автосанҷиши Go дар браузер **0 рӯз**
аст: курс иҷрои маҳаллии Go ва самопроверкаро истифода мебарад. Ба ҷойи Go
автогрейдери JavaScript илова нашуд.

8 skip ба Go тааллуқ надоранд: C#, Rust, PHP, Ruby, MongoDB, Swift, Kotlin ва
санҷиши PowerShell. Windows ва дигар системаҳо дар ин муҳити Linux иҷро нашуданд;
mobile дар Chromium-и тақлидшуда санҷида шуд, на дастгоҳи ҷисмонӣ.
Deploy ва merge-и PR иҷро нашуданд. Натиҷаҳои маҳаллӣ тасдиқи тамоми pipeline-и
сервери CI нестанд.

Манбаъҳои санҷиши мафҳумҳо: [Go specification](https://go.dev/ref/spec),
[Effective Go](https://go.dev/doc/effective_go), ҳуҷҷат ва коди стандартии
`sync`, `os`, `encoding/json`, `testing` дар toolchain-и расмӣ.
