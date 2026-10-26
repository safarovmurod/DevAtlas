# Your personal task API / API задач / API-и вазифаҳо

RU: Реализуйте четыре модуля сами. Интерфейсы и разобранный вариант находятся в reference. Не оставляйте re-export reference: цель — собственное решение. Запускайте `node check-project.mjs project --phase 40`, затем 41–44. Начальный вариант намеренно падает. Тесты выполняют ваш локальный код с вашими правами; запускайте только собственные файлы. Это локальная проверка, не серверный Mastery и не проверка production.

TG: Чор модулро худ созед. Интерфейс ва мисоли шарҳшуда дар reference аст. reference-ро re-export накунед: мақсад ҳалли худ аст. `node check-project.mjs project --phase 40`, баъд 41–44 иҷро кунед. Оғоз қасдан меафтад. Тест рамзи маҳаллиро бо ҳуқуқи шумо иҷро мекунад; танҳо файли худро кушоед. Ин санҷиши маҳаллист, на Mastery-и сервер ё production.

EN: Implement all four modules yourself. Interfaces and the worked implementation are in reference. Do not leave re-exports of reference: the goal is your own solution. Run `node check-project.mjs project --phase 40`, then 41–44. Starters intentionally fail. Tests execute local code with your permissions; run only your own files. Results are local checks, not server Mastery or production verification.

## Deliverables / Результаты / Натиҷаҳо (Self Reviewed)

- RU: Опишите два сценария A/B, ожидаемые статусы и фактический вывод. Объясните каждую проверку owner_id, границу 120/121 и rollback.
- TG: Ду сенарияи A/B, ҳолати интизор ва натиҷаи воқеиро нависед. Ҳар санҷиши owner_id, ҳудуди 120/121 ва rollback-ро шарҳ диҳед.
- EN: Record two A/B scenarios, expected statuses and actual output. Explain every owner_id predicate, the 120/121 boundary and rollback.
- RU: Сохраните вывод фазы 44, инструкцию запуска и перезапуска, ограничения безопасности и один найденный/исправленный дефект. Не публикуйте пароли и cookie.
- TG: Натиҷаи фазаи 44, роҳнамои оғозу оғози нав, маҳдудияти амният ва як нуқсони ёфтаву ислоҳшударо нигоҳ доред. Паролу cookie нашр накунед.
- EN: Include phase-44 output, startup/restart instructions, security limits and one defect you found and fixed. Publish no passwords or cookies.

Objective gates: real HTTP contract, owner isolation, database constraints, persistence, error privacy, expiry and rate limits. Written explanation and usability remain Self Reviewed, never Human Reviewed or Auto Verified.
