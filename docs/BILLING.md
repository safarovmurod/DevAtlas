# Пардохти воқеӣ: Dodo Payments

Pro ($5/моҳ) ва Ultra ($12/моҳ) тавассути [Dodo Payments](https://docs.dodopayments.com) харида мешаванд. Dodo — Merchant of Record: худи Dodo пардохт, андоз ва ҳисобномаро идора мекунад. Саҳифа: `/plans`.

**Қоидаи асосӣ:** ба браузер бовар намекунем. Дастрасӣ танҳо тавассути сатри `react_mentor_memberships` дар база муайян мешавад, ва ин сатрро **танҳо webhook-и имзошудаи Dodo** менависад. Redirect баъди пардохт чизеро фаъол намекунад: саҳифа аз база мепурсад.

**Бехатарӣ бе танзим:** то даме ки панҷ переменнаи Dodo (поён) пурра гузошта нашаванд, ҳама чиз мисли пештара аст: `/api/billing/checkout` ҷавоби `billing_not_configured` (503) медиҳад, пул гирифта намешавад, тугмаҳо «Пардохт пайваст нашудааст» мегӯянд.

## Чӣ тавр кор мекунад

1. Корбар дар `/plans` «Обуна шудан»-ро пахш мекунад → `POST /api/billing/checkout {tier}` (бо токени Supabase).
2. Server дар Dodo checkout-session месозад (`POST /checkouts`): маҳсулоти тариф аз env, `customer.email`, `metadata {user_id, tier}`, `return_url`, `cancel_url`. Ҷавоб: `{url}` — клиент redirect мекунад.
3. Корбар дар саҳифаи Dodo пардохт мекунад. Баъд ба `/plans?checkout=return&plan=...` бармегардад.
4. Dodo ба `POST /api/billing/webhook` events мефиристад. Server имзоро месанҷад, корбарро месанҷад ва `react_mentor_memberships`-ро дар **як transaction** нав мекунад (`react_mentor_apply_payment_event`).
5. Саҳифа ҳар 3 сония (то 1 дақиқа) `/api/billing/status`-ро мепурсад. Танҳо вақте ки база тариф дорад, «Пардохт тасдиқ шуд» нишон дода мешавад.
6. «Идоракунии обуна» → `POST /api/billing/portal` → портали Dodo (бекор кардан, иваз кардани корт, ҳисобномаҳо). Баъди бекор кардан дастрасӣ то охири давраи пардохтшуда мемонад.

| Файл | Нақш |
| --- | --- |
| `src/lib/billing/dodo-config.ts` | Хондани env, `productId → tier` |
| `src/lib/billing/dodo-client.ts` | `fetch` бо timeout ба Dodo: checkout, change-plan, portal (бе SDK) |
| `src/lib/billing/webhook-signature.ts` | Санҷиши имзо (Standard Webhooks) |
| `src/lib/billing/subscription-events.ts` | Event → қарор (додан / қатъ / фақат статус) |
| `src/lib/billing/webhook-handler.ts` | Тартиби пурраи webhook |
| `src/app/api/billing/{checkout,portal,status,webhook}/route.ts` | Маршрутҳо |
| `supabase/migrations/20261117000000_billing_dodo.sql` | Ҷадвалҳо ва функсияи навиштан |

## Қадамҳои соҳиб (шеф)

### 1. Маҳсулотҳо дар Dodo (test mode)

Dodo → Products → Add product. Барои **ҳар ду** (Pro ва Ultra):

- **Pricing type: Subscription**.
- **Price**: Pro = `5.00` USD, Ultra = `12.00` USD. Ин нарх бояд бо `PLAN_PRICE_USD` дар `src/lib/billing/plans.ts` яксон бошад (он танҳо ёддошт дар саҳифа аст; пулро Dodo бо нархи маҳсулот мегирад).
- **Repeat payment every: 1 Month**.
- **Subscription Period: 20 Years.** Ин ҷо хато накунед: агар давр 1 моҳ бошад, обуна баъди як пардохт `expired` мешавад ва тамдид намешавад.
- **Trial Period Days: 0**.
- **Tax Category**: категорияи наздиктарин ба хизматрасонии онлайн/SaaS. Dodo андозро худаш ҳисоб мекунад. Дар preview-и маҳсулот андоз (масалан 10%) ба нарх илова мешавад: корбар `$5 + андоз` медиҳад. Агар мехоҳед «нарх бо андоз», дар маҳсулот **Tax Inclusive Pricing**-ро фаъол кунед. Матни саҳифа мегӯяд: «Андоз, агар татбиқ шавад, ҳангоми пардохт илова мешавад».
- Баъд аз сохтан `pdt_...`-ро нусха кунед.

### 2. Калид ва webhook дар Dodo

- Developer → API Keys → калиди **test mode** (бо префикси `dodo_test_`).
- Developer → Webhooks → Add endpoint: URL `https://react-mentor-opal.vercel.app/api/billing/webhook`. Events-и обуна: `subscription.active`, `subscription.updated`, `subscription.renewed`, `subscription.plan_changed`, `subscription.update_payment_method`, `subscription.past_due`, `subscription.on_hold`, `subscription.paused`, `subscription.unpaused`, `subscription.cancelled`, `subscription.failed`, `subscription.expired`. (Events-и дигарро server бо 200 мегирад ва нодида мегирад.)
- Баъд аз сохтан дар Overview-и endpoint **signing secret** (`whsec_...`) пайдо мешавад.

### 3. Переменнаҳо

Дар Vercel → Project → Settings → Environment Variables (**Production**, **Sensitive**) ва дар `.env.local` барои кори маҳаллӣ. Қимматҳоро дар chat, commit ё скриншот нагузоред.

| Переменна | Чӣ |
| --- | --- |
| `DODO_PAYMENTS_API_KEY` | Калиди API (`dodo_test_...` дар test mode, `dodo_live_...` дар live) |
| `DODO_PAYMENTS_WEBHOOK_KEY` | Signing secret-и endpoint (`whsec_...`) |
| `DODO_PAYMENTS_ENVIRONMENT` | `test_mode` ё `live_mode` (дигар қимат = пардохт хомӯш) |
| `DODO_PRODUCT_PRO` | `pdt_...`-и Pro |
| `DODO_PRODUCT_ULTRA` | `pdt_...`-и Ultra |

Қоидаҳои бехатарӣ дар `getDodoConfig`: ҳамаи панҷто лозиманд (бе калиди webhook пул мегирифтем, вале дастрасӣ намедодем); калиди `dodo_test_` бо `live_mode` (ва баръакс) қабул намешавад; `pdt_` ва ду маҳсулоти гуногун лозим. Баъд аз тағйири env, Vercel-ро redeploy кунед.

### 4. Миграцияи база

Supabase MCP ба ин лоиҳа ҳуқуқ надод, барои ҳамин миграция **татбиқ нашудааст**. Дар Supabase → SQL Editor мазмуни `supabase/migrations/20261117000000_billing_dodo.sql`-ро иҷро кунед (бехатар аст, бори дуюм ҳам мегузарад). Пеш аз он `20261116000000_admin_tools.sql` бояд татбиқ шуда бошад (сутунҳои `source`, `granted_by`, `granted_at`).

Санҷиши фақат-хондан:

```sql
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'react_mentor_memberships'
  and column_name in ('provider','provider_customer_id','provider_subscription_id',
                      'provider_status','cancel_at_period_end','provider_event_at');
-- 6 сатр

select to_regclass('public.react_mentor_webhook_events') is not null as table_exists;
select proname from pg_proc where proname = 'react_mentor_apply_payment_event';
```

Баъди пардохти санҷишӣ:

```sql
select u.email, m.tier, m.source, m.expires_at, m.provider_status,
       m.cancel_at_period_end, m.provider_subscription_id
from public.react_mentor_memberships m
join auth.users u on u.id = m.user_id
where m.source = 'payment' order by m.updated_at desc limit 20;

select id, type, received_at from public.react_mentor_webhook_events
order by received_at desc limit 20;
```

## Санҷиш дар test mode

1. Env-ро бо калидҳои test гузоред, миграцияро татбиқ кунед, redeploy кунед.
2. Бо аккаунти оддӣ ба `/plans` дароед: нархҳои `$5` ва `$12` ва тугмаи «Обуна шудан» бояд намоён бошанд.
3. Pro-ро пахш кунед. Корти санҷишӣ (ҳуҷҷати Dodo, «Testing Process»): `4242 4242 4242 4242`, муҳлат `06/32`, CVV `123`.
4. Баъд аз бозгашт банер «Тасдиқи пардохтро интизорем…» мегӯяд ва баъд аз чанд сония «Пардохт тасдиқ шуд. Тарифи Pro то … фаъол аст». Дар Dodo → Developer → Webhooks → Logs бояд `subscription.active` бо ҷавоби 200 бошад. SELECT-и боло сатри `source = payment`-ро нишон медиҳад.
5. Ultra-ро харед (аз Pro): тугма «Гузаштан ба Ultra» аст. Ин **ҳамон обунаро** иваз мекунад (change-plan, фарқият ҳозир гирифта мешавад), обунаи дуюм сохта намешавад. Ultra баъд аз тасдиқи пардохт фаъол мешавад; агар корт рад шавад, тариф Pro мемонад.
6. «Идоракунии обуна»: портал кушода мешавад. «Cancel at next billing date» → дастрасӣ то санаи охир мемонад (дар `/plans`: «Обуна бекор шуд. Дастрасӣ то …»).
7. Нокомии тамдид: корти `4000000000000341` (12/34, 123) дар портал гузоред ва `next_billing_date`-ро тавассути Dodo API ба оянда наздик кунед (ҳуҷҷати Dodo «Testing Renewal Failures»). Бояд `subscription.on_hold` биёяд: дастрасӣ дароз намешавад.
8. Баъд аз санҷиш обунаҳои санҷиширо дар Dodo бекор кунед: тамдидҳои test mode идома меёбанд.

## Events → база

| Event / ҳолат | Чӣ мешавад |
| --- | --- |
| `active`, `renewed`, `plan_changed`, `updated`, `unpaused` (ҳолат `active`) | `tier` аз `product_id`; `expires_at = next_billing_date`; `source = payment` |
| Бекор кардан «дар санаи оянда» (`cancel_at_next_billing_date`) | Дастрасӣ то `next_billing_date`; `cancel_at_period_end = true` |
| Бекор кардани фаврӣ, `expired`, `paused` | `expires_at` ба ҳозир (танҳо ба пеш кашида мешавад, ҳеҷ гоҳ дароз намешавад) |
| `on_hold`, `failed` | Фақат `provider_status`; санаи нав дода намешавад |
| `past_due` (давраи grace) | То `past_due_ends_at` дастрасӣ мемонад |
| Event-и номаълум, маҳсулоти ношиносе | 200, нодида гирифта мешавад |

Қоидаҳои бехатарӣ:

- **Имзо:** `webhook-id.webhook-timestamp.body` (body хом), калид = base64 аз secret бе `whsec_`, HMAC-SHA256, муқоисаи constant-time, timestamp ±5 дақиқа. Имзои нодуруст → 401 бе ягон тағйир.
- **Тариф** аз `product_id` муайян мешавад, на аз `metadata.tier`.
- **`user_id`** аз metadata гирифта мешавад, вале (а) бояд UUID бошад, (б) `auth.admin.getUserById` бояд корбарро ёбад, (в) агар обуна аллакай ба корбари дигар тааллуқ дошта бошад, event нодида гирифта мешавад (`user_mismatch`).
- **Такрор:** `webhook-id` дар `react_mentor_webhook_events` дар ҳамон transaction бо навсозии membership сабт мешавад. Агар навиштан хато кунад, id сабт намешавад ва ретраи Dodo такроран коркард мешавад. Ҷавоби 2xx танҳо баъди навиштани муваффақ.
- **Тартиб:** event-и кӯҳнатар (`timestamp`) аз навтар болотар навишта намешавад (`stale`).
- **Обунаи дуюм:** агар корбар ду маротиба пардохт кунад (масалан ду tab), обунаи дуюм дастрасии фаъолро иваз намекунад (`conflict`). Дар log (Vercel) сатри `billing conflict: refund may be needed` пайдо мешавад: пулро дар Dodo баргардонед.

## Ultra ↔ Pro

- Pro → Ultra: аз `/plans`, дар ҳамон обуна (`POST /subscriptions/{id}/change-plan`, `prorated_immediately`, `on_payment_failure: prevent_change`). Давраи ҳисобкунӣ аз рӯзи ивазкунӣ нав мешавад.
- Ultra → Pro: худкор нест. Корбар Ultra-ро дар портал «дар санаи оянда» бекор мекунад ва баъд аз тамом шудан Pro мегирад (портали Dodo ивазкунии тарифро танҳо бо Product Collection ва «Allow Subscription Updates» медиҳад; мо онро фаъол накардаем).
- Агар обуна `on_hold`/`past_due` ё бекоршаванда бошад, сервер хариди нав намедиҳад (`manage_in_portal`): аввал дар портал ҳал кунед.
- Корбар бо тарифи ҳозира ё болотар дубора харида наметавонад (`already_subscribed`).

## Live mode

1. Dodo-ро ба live бигузаронед (Account Verification, «Product Information Form», пайвасти бонк). Payout ба Тоҷикистон дар рӯйхати кишварҳои Dodo ҳаст; шартҳои ҷорӣро худи Dodo тасдиқ мекунад.
2. Дар **live mode** маҳсулотҳоро дубора созед (ё test-ро «copy to live» кунед), калиди `dodo_live_...`, endpoint-и нави webhook бо ҳамон URL ва signing secret-и нав созед.
3. Панҷ переменнаро дар Vercel иваз кунед (`DODO_PAYMENTS_ENVIRONMENT=live_mode`), redeploy кунед.
4. Як пардохти воқеӣ бо корти худатон кунед, санҷед (SELECT, Logs), баъд баргардонед ва обунаро бекор кунед.
5. Калиди `dodo_test_` бо `live_mode` кор намекунад (ва баръакс): ин қасдан аст.

## Админ: баргардонидани пул ва бекор кардан

Панели админ танҳо **базаи мо**-ро тағйир медиҳад ва обунаи Dodo-ро бекор намекунад. Сабаб: бекор кардан дар провайдер амали берунӣ ва бебозгашт аст; ба админ ҳуқуқи пулӣ намедиҳем. Барои ҳамин:

- Сатрҳои `source = payment` дар рӯйхат бо нишони **«Пардохт»** меоянд.
- «Бекор кардани подписка» ва «Кам кардани рӯзҳо» барои подпискаи пулакӣ огоҳӣ медиҳанд: Dodo дар санаи оянда боз пул мегирад ва webhook дастрасиро барқарор мекунад, то даме ки муштарӣ онро дар «Идоракунии обуна» бекор кунад. «Дароз кардан» низ огоҳӣ дорад: рӯзҳои иловашуда дар тамдиди оянда бо санаи Dodo иваз мешаванд.
- Журнали `react_mentor_admin_audit` тағйир намеёбад.

Баргардонидани пул ё бекор кардани обуна: Dodo dashboard → Sales/Subscriptions. Тартиби тавсияшуда: (1) дар Dodo обунаро бекор кунед (ва агар лозим бошад пулро баргардонед), (2) баъд дар панел дастрасиро бекор/кам кунед. Агар дастрасиро фақат дар панел бекор кунед, обуна дар Dodo идома меёбад.

## Маҳдудиятҳо ва чизҳои санҷиднашуда

- Ҳамаи санҷишҳои автоматӣ бо mock-ҳои HTTP ба Dodo кор мекунанд ва SQL дар PostgreSQL-и воқеӣ (PGlite) иҷро мешавад. **Пардохти воқеӣ дар Dodo test mode ҳоло санҷида нашудааст**: ин баъд аз гузоштани калидҳо ба дасти соҳиб аст. Номи майдонҳо аз ҳуҷҷати расмии Dodo гирифта шудаанд; агар дар санҷиши аввал фарқият пайдо шавад, Dodo → Webhooks → Logs payload-и воқеиро нишон медиҳад.
- `expires_at` = охири давраи пардохтшуда бе муҳлати изофа. Пардохти тамдид одатан дар сонияҳо мегузарад; корти Ҳиндустон то ~48 соат метавонад бошад ва дар ин вақт дастрасӣ кӯтоҳ қатъ мешавад.
- Як корбар = як сатри membership = як обунаи пулакӣ дар як вақт.
- Нархи нишондодашуда дар саҳифа (`PLAN_PRICE_USD`) ёддошт аст: онро бо нархи маҳсулот дар Dodo мувофиқ нигоҳ доред.
- Ҷадвали `react_mentor_webhook_events` ҳеҷ гоҳ тоза намешавад; сатрҳои аз 30 рӯз кӯҳна бе зарар нест кардан мумкин аст: `delete from public.react_mentor_webhook_events where received_at < now() - interval '30 days';`
- Throttle дар `allowProviderCall` (5 дархост/дақиқа барои як корбар) дар хотираи як instance аст ва ҳимояи пурра нест.

## Хатоҳоро ёфтан

- Dodo → Developer → Webhooks → Logs: ҷавоби endpoint-и мо барои ҳар event (401 = secret нодуруст, 503 = env/база, 500 = навиштан хато кард ва ретра мешавад).
- Vercel → Logs: ҷустуҷӯи `billing`. Сатрҳо: `billing webhook ignored` (бо `reason`), `billing webhook write failed`, `billing provider call failed` (бо `status` ва `code`, бе калид ва email), `billing conflict`.
- `/api/billing/status` ҳолати базаро барои корбари воридшуда нишон медиҳад.
