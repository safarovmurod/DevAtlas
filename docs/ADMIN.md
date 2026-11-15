# Админ-панели DevAtlas

Саҳифа: `/admin`. Дар menu банди «Админ» танҳо барои аккаунтҳое пайдо мешавад, ки `app_role = admin` доранд. Ин танҳо тугмаи роҳнамост; ҳуқуқро ҳар дафъа server месанҷад.

## Нақшҳо

| Нақш   | Чӣ тавр пайдо мешавад                                                 | Чӣ карда метавонад                                                                  |
| ------ | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Соҳиб  | `app_metadata.app_owner = true` **ва** `app_role = admin`, танҳо бо SQL | Ҳама корҳои админ + додан/гирифтани нақши админ. Ӯро ҳеҷ кас тағйир дода наметавонад. |
| Админ  | `app_metadata.app_role = admin` (соҳиб медиҳад)                       | Подписка, блок, паём, нест кардани корбари одӣ, дидани журнал                        |
| Корбар | —                                                                     | Ба `/api/admin/*` дастрасӣ надорад                                                   |

Қоидаҳо (дар server, `src/lib/account/admin-users.ts` → `forbiddenReason`):

- Соҳибро разжаловат, блок, нест кардан ва подпискаашро бекор кардан **мумкин нест** (`owner_protected`). Подпискаи ӯро дароз кардан мумкин аст.
- Нақши админро танҳо соҳиб медиҳад ё мегирад (`owner_required`). Аз худ гирифтан мумкин нест.
- Админ худашро ва админи дигарро блок ё нест карда наметавонад (`cannot_target_self`, `admin_protected`). Аввал соҳиб нақши админро мегирад.
- Корбари email-тасдиқнашуда ё блокшударо админ кардан мумкин нест.

UI тугмаҳои манъшударо пинҳон мекунад, вале қарорро ҳамеша server мебарорад.

## Ҳамааш аз куҷо меояд

| Чӣ                       | Дар куҷо                                                                      |
| ------------------------ | ----------------------------------------------------------------------------- |
| Рӯйхати корбарон         | Supabase Auth (`auth.users`), хондан бо service-role дар server              |
| Подписка (Pro / Ultra)   | `public.react_mentor_memberships` (`expert` = Ultra) + `source`, `granted_by`, `granted_at` |
| Нақш ва соҳиб            | `auth.users.raw_app_meta_data` → `app_role`, `app_owner`                     |
| Блок                     | Supabase Auth `banned_until` (тавассути `ban_duration`)                      |
| Паёмҳо ба корбар         | `public.react_mentor_notifications`                                          |
| Журнали амалҳо           | `public.react_mentor_admin_audit`                                            |
| 2FA                      | Supabase Auth MFA (TOTP), сатҳи `aal2`                                       |

## Муҳофизат

Ҳар дархости `/api/admin/*` аз `requireAdmin` (`src/lib/account/require-admin.ts`) мегузарад, **пеш** аз ҳар дастрасӣ ба маълумот:

1. Токен бо `auth.getUser` санҷида мешавад; нақш аз auth-server хонда мешавад, на аз JWT. Агар `app_role` гирифта шавад, ҳуқуқ дарҳол мегурезад, ҳатто агар токени кӯҳна дар браузер бошад.
2. Аккаунти блокшуда (`banned_until` дар оянда) рад мешавад (`account_banned`).
3. Аккаунт бояд email-тасдиқшуда ва на anonymous бошад.
4. Session бояд `aal2` бошад (коди authenticator ворид шудааст).
5. Танҳо баъд аз ин service-role (`SUPABASE_SERVICE_ROLE_KEY`) истифода мешавад. Он танҳо дар server ва Vercel Production ҳаст, ба браузер намеравад.

Ҳамаи body-ҳо бо zod санҷида мешаванд ва андозаашон маҳдуд аст (413 барои калон).

## Маршрутҳо

| Маршрут                         | Method | Body / параметрҳо                                                     |
| ------------------------------- | ------ | --------------------------------------------------------------------- |
| `/api/admin/users`              | GET    | `page`, `filter` = all / paid / expired / admins / banned, `q` (email) |
| `/api/admin/users`              | DELETE | `{ userId, confirmEmail }`                                            |
| `/api/admin/memberships`        | POST   | `grant {userId, tier: pro\|expert, days}`, `extend {userId, days}`, `revoke {userId}` |
| `/api/admin/roles`              | POST   | `{ userId, action: grant\|revoke }` — танҳо соҳиб                      |
| `/api/admin/bans`               | POST   | `ban {userId, days: 1–3650 \| null}` (null = доимӣ), `unban {userId}` |
| `/api/admin/notifications`      | POST   | `{ userId, message }` (1–500 аломат, матни одӣ)                       |
| `/api/admin/audit`              | GET    | `limit` (1–100, пешфарз 30)                                           |

Ҳар амали тағйирдиҳанда корбари навшударо бармегардонад (`{ user }`), ва панел танҳо ҳамон сатрро иваз мекунад — бе бор кардани тамоми рӯйхат.

## Подписка

- **Додан**: Pro ё Ultra, 1–3660 рӯз. `source = 'admin'`, `granted_by` = админ, `granted_at` = ҳозир. Подпискаи кӯҳна иваз мешавад.
- **Дароз кардан**: аз санаи тамомшавӣ (агар ҳанӯз фаъол бошад) ё аз имрӯз. Тариф ва «кӣ дод» нигоҳ дошта мешаванд.
- **Бекор кардан**: сатр нест мешавад (барои соҳиб манъ аст).
- Дар корт: тариф, ҳолат (фаъол / мӯҳлат гузашт), чанд рӯз монд, санаи тамомшавӣ, манбаъ, кӣ ва кай дод.
- **Пардохти воқеӣ ҳоло нест** (`/api/billing/checkout` ҷавоби `billing_not_configured` медиҳад). Ҳамаи подпискаҳо аз ҷониби админ дода шудаанд. Сатрҳои пеш аз ин миграция `source = admin` гирифтанд, вале `granted_by`/`granted_at` холӣ мемонанд — дар панел «Номаълум».

## Филтр ва ҷустуҷӯ

- «Ҳама» бе ҷустуҷӯ — саҳифаҳои Supabase Auth (50 нафар).
- Филтр ё ҷустуҷӯ — server корбаронро саҳифа-саҳифа (то 5 × 1000 = 5000 нафар) мехонад ва дар server филтр мекунад. Агар корбарон бештар бошанд, панел огоҳӣ медиҳад (`truncated`).

## Блок

`ban_duration` дар Supabase Auth (`'168h'`, доимӣ `'876000h'` — мисоли ҳуҷҷати Supabase; бардоштан `'none'`).

Чӣ рӯй медиҳад:

- Корбар дигар ворид шуда наметавонад ва токенашро нав карда наметавонад (Supabase хатои `user_banned` медиҳад).
- API-и мо (`requireAdmin`, `authenticatedUser`) ӯро дарҳол рад мекунад.
- RLS дар база ҳам дарҳол рад мекунад: `react_mentor_session_allowed()` акнун `auth.users.banned_until`-ро месанҷад (миграцияи `20261116000000_admin_tools.sql`). Прогресс, профил, подписка, чат ва паёмҳо барои ӯ баста мешаванд.

**Маҳдудият (ростқавлона):**

- Supabase session-и кушодаро маҷбуран намебандад. Access token-и ҳозира то мӯҳлаташ (одатан то 1 соат) ҳамчун JWT эътибор дорад. Ҳамаи policy-ҳои ҷадвалҳо ва Storage-и аватарҳо дар ин проект `react_mentor_session_allowed()`-ро месанҷанд, бинобар ин маълумот дарҳол баста мешавад; вале чизи нав, ки ин функсияро истифода намебарад, то тамом шудани токен кушода мемонад.
- Саҳифаи кушода дар браузери ӯ худ ба худ пӯшида намешавад; дархостҳо хато медиҳанд ва навсозии токенро Supabase рад мекунад. Чӣ тавр сайт ин ҳолатро ба корбар нишон медиҳад, дар браузер санҷида нашудааст.
- Дар Supabase-и воқеӣ санҷида нашудааст, ки `auth.getUser` барои корбари блокшуда маҳз чӣ бармегардонад. Барои ҳамин код `banned_until`-ро худаш месанҷад ва ба он такя намекунад.

## Паём ба корбар

- Админ дар корт «Паём фиристодан»-ро пахш мекунад ва то 500 аломат менависад.
- Server бо service-role ба `react_mentor_notifications` менависад. Корбар танҳо паёмҳои худашро мебинад (RLS) ва танҳо онҳоро бо RPC `react_mentor_mark_notification_read` хондашуда қайд мекунад. `created_by` ба корбар нишон дода намешавад.
- Браузер ҳар 10 сония (танҳо вақте ки вкладка намоён аст ва корбар ворид шудааст) паёмҳои нахондаро мепурсад. Агар корбар дар сайт бошад, паём дар 0–10 сония (бо шабака то ~15) ҳамчун toast пайдо мешавад, ҳангоми пайдо шудан хондашуда қайд мешавад ва баъд аз 8 сония худаш нест мешавад.
- Матн ҳамчун text нишон дода мешавад (React), HTML кор намекунад. Аломатҳои идоракунӣ дар server тоза мешаванд.
- Агар ҷадвал ҳанӯз набошад, toaster ором қатъ мегардад ва хатогӣ намепартояд.

## Журнали амалҳо

`react_mentor_admin_audit`: кӣ (id, email), чӣ, бар кӣ (id, email), кай, тафсилот (тариф, рӯзҳо, дарозии паём — **на матни паём**). RLS фаъол, policy нест; танҳо service-role `select` ва `insert` дорад — таърихро тағйир додан ё нест кардан аз server мумкин нест. Ҷадвал foreign key надорад, то сабт баъд аз нест кардани аккаунт боқӣ монад. Панел 30 сабти охиринро нишон медиҳад.

Агар навиштани журнал хато диҳад, амал аллакай иҷро шудааст; хато дар log-и server (`admin audit write failed`) навишта мешавад.

## Миграция

Файл: `supabase/migrations/20261116000000_admin_tools.sql` (idempotent — якчанд бор иҷро кардан бехатар аст). Дар Supabase SQL Editor тамоми файлро иҷро кунед.

Санҷиши read-only баъд аз миграция:

```sql
select
  to_regclass('public.react_mentor_notifications') is not null as notifications_table,
  to_regclass('public.react_mentor_admin_audit') is not null as audit_table,
  (select relrowsecurity from pg_class where oid = 'public.react_mentor_notifications'::regclass) as notifications_rls,
  (select relrowsecurity from pg_class where oid = 'public.react_mentor_admin_audit'::regclass) as audit_rls,
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'react_mentor_memberships'
      and column_name in ('source', 'granted_by', 'granted_at')) as membership_columns,
  (select count(*) from pg_policies
    where schemaname = 'public' and tablename = 'react_mentor_admin_audit') as audit_policies,
  position('banned_until' in pg_get_functiondef('public.react_mentor_session_allowed()'::regprocedure)) > 0 as ban_check,
  has_table_privilege('anon', 'public.react_mentor_notifications', 'select') as anon_reads_notifications,
  has_table_privilege('authenticated', 'public.react_mentor_admin_audit', 'select') as users_read_audit;
```

Интизор: `true, true, true, true, 3, 0, true, false, false`.

## Соҳиби сайт (як маротиба, бо SQL)

Байрақи `app_owner` танҳо дар SQL Editor гузошта мешавад. Аввал SELECT, баъд UPDATE. `USER_ID`-ро иваз кунед.

```sql
-- 1) Санҷиш: бояд як сатр бо app_role = admin бошад
select id, email, raw_app_meta_data ->> 'app_role' as app_role, raw_app_meta_data ->> 'app_owner' as app_owner
from auth.users
where id = 'USER_ID';

-- 2) Соҳиб кардан (танҳо агар аллакай админ бошад)
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"app_owner": true}'::jsonb
where id = 'USER_ID' and raw_app_meta_data ->> 'app_role' = 'admin'
returning id, email, raw_app_meta_data ->> 'app_role' as app_role, raw_app_meta_data ->> 'app_owner' as app_owner;
```

Баъд аз ин дар панел дар назди соҳиб бейҷи «Соҳиб» пайдо мешавад ва тугмаҳои «Админ кардан» кушода мешаванд. Сафҳаро нав кунед.

## Танзим

- Vercel → Environment Variables: `SUPABASE_SERVICE_ROLE_KEY` (Production, Sensitive). Баъд аз тағйир deploy-и нав лозим.
- Аккаунти админ бояд дар Settings 2FA фаъол кунад ва бо код ворид шавад.

## Чӣ санҷида шуд ва чӣ не

- Тестҳои vitest: `tests/admin-api.test.ts` (ҳамаи маршрутҳо бо Supabase-и қалбакӣ), `tests/admin-database.test.ts` (SQL-и миграция дар PGlite: RLS, grants, ban, RPC, журнал), `tests/admin-ui.test.tsx` (ду тасдиқи нест кардан, корт, toast).
- Дар браузер бо логини воқеӣ ва дар Supabase-и production санҷида **нашудааст**. Пеш аз истифода миграцияро иҷро кунед ва як бор ҳар амалро бо аккаунти санҷишӣ тафтиш кунед.
