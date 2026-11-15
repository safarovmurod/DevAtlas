# Админ-панель DevAtlas

Саҳифа: `/admin`. Дар menu банди «Админ» танҳо барои соҳиби сайт пайдо мешавад. Ин танҳо тугмаи роҳнамост; ҳуқуқро ҳар дафъа server месанҷад.

## Ҳамааш аз Supabase меояд

| Чӣ                       | Дар куҷо нигоҳ дошта мешавад                                         |
| ------------------------ | -------------------------------------------------------------------- |
| Рӯйхати корбарон         | Supabase Auth (`auth.users`), хондан бо service-role дар server      |
| Подписка (Pro / Ultra)   | ҷадвали `public.react_mentor_memberships` (`expert` = Ultra)         |
| Нақши админ              | `auth.users.raw_app_meta_data.app_role = "admin"`                    |
| 2FA                      | Supabase Auth MFA (TOTP), сатҳи `aal2`                               |

## Чӣ тавр муҳофизат шудааст

Ҳар дархости `/api/admin/*` аз `requireAdmin` (`src/lib/account/require-admin.ts`) мегузарад:

1. Токен бо `auth.getUser` санҷида мешавад; нақш аз auth-server хонда мешавад, на аз токени кӯҳна. Агар `app_role`-ро гирӣ, ҳуқуқ дарҳол мегурезад.
2. Аккаунт бояд email-тасдиқшуда ва на anonymous бошад.
3. Session бояд `aal2` бошад, яъне код аз authenticator воридшуда.
4. Танҳо баъд аз ин service-role (`SUPABASE_SERVICE_ROLE_KEY`) истифода мешавад. Он танҳо дар server ва Vercel Production ҳаст, ба браузер намеравад.

Корбари одӣ `app_metadata`-ро худаш тағйир дода наметавонад.

## Корҳое, ки админ карда метавонад

- Рӯйхати корбарон бо ҷустуҷӯ ва саҳифабандӣ (50 дона).
- Додани подписка (Pro ё Ultra, 1–3660 рӯз), дароз кардан (аз санаи тамомшавӣ), бекор кардан.
- Нест кардани аккаунт бо навиштани email-и пурра. Ҳамаи маълумоти ӯ нест мешавад ва барнамегардад. Админро (аз ҷумла худро) нест кардан мумкин нест.

## Танзим

- Vercel → Environment Variables: `SUPABASE_SERVICE_ROLE_KEY` (Production, Sensitive). Баъд аз тағйир deploy-и нав лозим.
- Аккаунти админ бояд дар Settings 2FA фаъол кунад ва баъд аз ворид шудан бо код тасдиқ шавад.

## Админи нав ё гирифтани ҳуқуқ

Танҳо дар Supabase SQL Editor, бо эҳтиёт. Пеш аз тағйир SELECT кун.

```sql
-- Дидан
select id, email, raw_app_meta_data ->> 'app_role' as app_role from auth.users where email = 'EMAIL';

-- Додани ҳуқуқ (иваз кун EMAIL)
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"app_role": "admin"}'::jsonb
where email = 'EMAIL' and email_confirmed_at is not null;

-- Гирифтани ҳуқуқ
update auth.users
set raw_app_meta_data = raw_app_meta_data - 'app_role'
where email = 'EMAIL';
```

Баъд аз додани ҳуқуқ корбар бояд аз сайт баромада дубора ворид шавад.

## Ҳудудҳо

- Журнали амалиёти админ нест. Танҳо `console.info` дар лог-и server.
- Ҷустуҷӯ танҳо дар саҳифаи кушодашуда кор мекунад.
- RLS-и ҷадвали `react_mentor_memberships` тағйир нашудааст: навиштан танҳо тавассути service-role дар server.
