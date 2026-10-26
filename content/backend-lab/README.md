# DevAtlas Backend Beginner — local laboratory / маҳаллӣ / локально

Original educational source code. No dependencies or paid services. Node.js **22.13+ or 24 LTS**; `node:sqlite` is experimental on Node 22. This is a loopback learning service, not a production security certification. The published course currently contains days 1–9; the task API is a separate working reference for later study, not 44 completed lessons.

## English

1. Extract the entire archive, including `reference`, `starter` and `test`. Open a terminal in that folder. `node --version` must show 22.13+ or 24. Paths containing spaces and Tajik letters are supported.
2. Run `npm test`. The **six starter tests initially FAIL on purpose**: they exercise unfinished learner functions, not a broken platform. Implement one function at a time in `starter/functions.mjs`. Read expected/actual in failures and rerun. No installation is needed.
3. Days 3–7: implement the five corresponding function contracts. Day 8: split invoice code into a module and import it; use `node --test starter/functions.test.mjs`. Day 9: implement `safeName(load)`, including a rejecting loader. The browser exercises cover only supported pure-function cases; they do not pretend to run Node's HTTP or SQLite modules.
4. `npm run test:reference` tests the supplied task API against real local HTTP and SQLite, including two distinct owners, invalid inputs, transactions and persistence. Green reference tests mean the supplied example works; **they do not grade your own project**. To test your API, change the test imports to your files and retain the negative cases. Deliberately break an ownership predicate: the two-owner test must fail. Restore it.
5. To start the API, choose a local demonstration password (never reuse a real account password). PowerShell: `$env:DEMO_PASSWORD='a-new-local-password'; node reference/server.mjs --seed`. Bash: `DEMO_PASSWORD='a-new-local-password' node reference/server.mjs --seed`. The username is `learner`. After seeding, unset DEMO_PASSWORD. Without `--seed`, no account is created. The SQLite file `tasks.sqlite` persists tasks; sessions intentionally live only in memory and are lost on restart. Do not commit the database or environment secrets.
6. In a second terminal use `curl.exe` on Windows PowerShell 5.1, or `curl` elsewhere. Commands below use JSON quoting suitable for Bash; use the PowerShell alternative that follows if native quoting differs. Stop with Ctrl+C. All writes require the exact Origin header; missing or different origins are rejected. The server only listens on 127.0.0.1.

```sh
curl -i http://127.0.0.1:3001/health
curl -i -c local-cookies.txt -H 'Origin: http://127.0.0.1:3001' -H 'Content-Type: application/json' -d '{"name":"learner","password":"a-new-local-password"}' http://127.0.0.1:3001/login
curl -i -b local-cookies.txt -H 'Origin: http://127.0.0.1:3001' -H 'Content-Type: application/json' -d '{"title":"Read HTTP contract"}' http://127.0.0.1:3001/tasks
curl -i -b local-cookies.txt 'http://127.0.0.1:3001/tasks?limit=10&offset=0'
curl -i -b local-cookies.txt -H 'Origin: http://127.0.0.1:3001' -X POST http://127.0.0.1:3001/logout
```

PowerShell 5.1/7 avoids native JSON quoting entirely:

```powershell
$headers = @{ Origin = 'http://127.0.0.1:3001' }
$login = @{ name = 'learner'; password = 'a-new-local-password' } | ConvertTo-Json -Compress
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:3001/login -Headers $headers -ContentType 'application/json' -Body $login -SessionVariable localSession
$task = @{ title = 'Read HTTP contract' } | ConvertTo-Json -Compress
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:3001/tasks -Headers $headers -ContentType 'application/json' -Body $task -WebSession $localSession
Invoke-RestMethod -Uri http://127.0.0.1:3001/tasks -WebSession $localSession
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:3001/logout -Headers $headers -WebSession $localSession
```

Contract: `GET /health` → 200; `POST /login` → 200 + HttpOnly SameSite=Strict session cookie; `POST /logout` → 204; `GET /tasks?limit=10&offset=0` → `{items:[]}`; `POST /tasks` with only `title` → 201 + Location; `GET/PATCH/DELETE /tasks/:id` → 200/200/204 for the owner. Missing or another owner's task → 404. Missing session → 401. Invalid Origin → 403. Bad JSON → 400, type → 415, >4096 bytes → 413, invalid title → 422, unsupported task method → 405. Login is limited to five attempts per minute per socket IP in this one process. There is no proxy-header trust, cross-process quota, public registration or payment.

Capstone extension: build your own task API with the same contract. Submit source, executable tests, a restart demonstration, two-owner denial demonstration, and a short README explaining schema and limitations. Add PATCH and DELETE negative tests for another owner, invalid JSON, whitespace title, duplicate query parameters, logout and session expiration. Explain every important line before using the reference. A passing test is objective local evidence; architectural clarity and explanation require a separate rubric review. No checkbox, local test, reference run or project upload grants server-verified Mastered or an official certificate.

## Русский

Лаборатория запускается на вашем компьютере, без установки пакетов и платных сервисов. Нужен Node.js 22.13+ или 24 LTS; модуль SQLite в Node 22 экспериментальный. Весь архив распакуйте в отдельную папку и откройте в ней терминал. `node --version` проверяет версию. `npm test` сначала **обязан упасть в шести стартовых тестах**: ученик ещё не реализовал функции. Работайте в `starter/functions.mjs`, по одной функции, сверяя задания дней 3–9. При ошибке прочитайте expected/actual, исправьте причину и повторите. День 8 дополнительно требует вынести расчёт в отдельный модуль, а не только получить правильное число.

`npm run test:reference` проверяет предоставленный образец API через настоящий локальный HTTP и SQLite. Эти зелёные тесты не оценивают вашу работу. Для своего проекта измените импорты тестов на свои файлы и сохраните негативные случаи. Временно уберите проверку владельца: тест двух пользователей должен упасть. Верните защиту. После перезапуска задачи сохраняются в tasks.sqlite, сессии в памяти сбрасываются — это намеренное ограничение учебного примера.

Запуск с начальным пользователем в PowerShell: `$env:DEMO_PASSWORD='a-new-local-password'; node reference/server.mjs --seed`; в Bash: `DEMO_PASSWORD='a-new-local-password' node reference/server.mjs --seed`. Имя пользователя — learner. Это отдельный локальный пароль, не используйте настоящий пароль аккаунта. Затем удалите переменную окружения. Без --seed пользователь не создаётся. Примеры curl и PowerShell выше показывают вход, cookie, создание задачи, список и выход; на PowerShell 5.1 используйте curl.exe или блок Invoke-RestMethod. Сервер слушает только 127.0.0.1; Ctrl+C останавливает его. Для изменений требуется точный Origin; это защита от нежелательного межсайтового запроса, а не замена проверки сессии.

Самостоятельный итоговый проект: свой API задач с тем же договором маршрутов. Представьте код, тесты, демонстрацию сохранения после перезапуска, запрет чтения/изменения/удаления чужой записи и README. Проверьте 200/201/204, 400/401/403/404/405/413/415/422/429. В ответ не должны попадать хеши паролей, cookie или внутренний стек; журнал содержит лишь requestId, method, status. Объясните SQL-параметры, транзакцию, различие аутентификации и авторизации и ограничения однопроцессного лимита. Проверка объяснения — Self Reviewed, пока нет настоящего уполномоченного рецензента. Локальные тесты не дают серверный Mastered. Публичный деплой требует HTTPS, Secure-cookie, проверенного хостинга, постоянных сессий/лимитов, резервного копирования и отдельного security review; этот образец не готов к публичному размещению. Опубликованы пока дни 1–9, а не весь 44-дневный курс.

## Тоҷикӣ

Лаборатория дар компютери худатон бе насби бастаҳо ва хизматҳои пулакӣ кор мекунад. Node.js 22.13+ ё 24 LTS лозим; SQLite дар Node 22 таҷрибавӣ аст. Тамоми бойгониро дар ҷузвдони алоҳида кушода, терминалро дар ҳамон ҷо оғоз кунед. `node --version` версияро месанҷад. `npm test` аввал **бояд дар шаш тести ибтидоӣ ноком шавад**: функсияҳои хонанда ҳанӯз сохта нашудаанд. Дар `starter/functions.mjs` аз рӯи супоришҳои рӯзҳои 3–9 як функсияро нависед. Ҳангоми хато expected/actual-ро хонда, сабабро ислоҳ ва боз санҷед. Рӯзи 8 ҷудо кардани ҳисоб ба модулро ҳам талаб мекунад, на танҳо адади дурустро.

`npm run test:reference` намунаи додашудаи API-ро бо HTTP-и воқеии маҳаллӣ ва SQLite месанҷад. Сабз шудани он кори шуморо арзёбӣ намекунад. Барои лоиҳаи худ импорти тестҳоро ба файлҳои худ равона карда, ҳолатҳои манфиро нигоҳ доред. Санҷиши соҳибро муваққатан гиред: тести ду корбар бояд ноком шавад. Муҳофизатро баргардонед. Баъди оғози нав вазифаҳо дар tasks.sqlite мемонанд; сессияҳои хотира гум мешаванд — ин маҳдудияти ошкори намуна аст.

Оғоз бо корбари аввал дар PowerShell: `$env:DEMO_PASSWORD='a-new-local-password'; node reference/server.mjs --seed`; дар Bash: `DEMO_PASSWORD='a-new-local-password' node reference/server.mjs --seed`. Номи корбар learner аст. Ин пароли ҷудои маҳаллӣ аст: пароли ҳисоби воқеиро истифода набаред. Сипас тағйирёбандаи муҳитро тоза кунед. Бе --seed корбар сохта намешавад. Фармонҳои curl ва PowerShell-и боло воридшавӣ, cookie, сохтани вазифа, рӯйхат ва баромадро нишон медиҳанд. Дар PowerShell 5.1 curl.exe ё блоки Invoke-RestMethod гиред. Сервер танҳо 127.0.0.1-ро гӯш мекунад; Ctrl+C қатъ мекунад. Барои тағйир Origin-и дақиқ лозим аст; ин муҳофизати дархости байнисайтӣ аст, на ивази санҷиши сессия.

Лоиҳаи мустақили ниҳоӣ: API-и вазифаҳои худ бо ҳамон шартномаи роҳҳо. Рамз, тестҳо, намоиши нигоҳдории дода баъди оғози нав, манъи хондан/тағйир/ҳазфи сабти каси дигар ва README супоред. 200/201/204 ва 400/401/403/404/405/413/415/422/429-ро санҷед. Ҷавоб набояд хеши парол, cookie ё стеки дохилӣ диҳад; журнал танҳо requestId, method, status дорад. Параметрҳои SQL, транзаксия, фарқи шиносоӣ ва иҷозатдиҳӣ ва маҳдудияти якравандиро шарҳ диҳед. Шарҳ то рецензенти воқеии ваколатдор Self Reviewed мемонад. Тестҳои маҳаллӣ Mastered-и сервер намедиҳанд. Нашри оммавӣ HTTPS, Secure-cookie, хостинги санҷидашуда, сессия/лимити доимӣ, нусхаи эҳтиётӣ ва санҷиши ҷудои амният мехоҳад; намуна барои нашри оммавӣ омода нест. Ҳоло танҳо рӯзҳои 1–9 нашр шудаанд, на тамоми курси 44-рӯза.
