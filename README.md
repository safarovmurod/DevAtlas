# DevAtlas

Платформаи омӯзишӣ бо курсҳо, дарсҳо, машқҳои код, тестҳо ва пайгирии пешрафт.

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS · Zustand · Supabase.
Desktop-и Login/Register: Embla Carousel ва Three.js (WebGL), гардиши объект бо клик.
Mobile: блоки статикӣ, бе carousel ва WebGL.

## Оғози маҳаллӣ

```bash
npm ci
cp -n .env.example .env.local
npm run dev
```

Дар `.env.local` URL ва Publishable Key-и Supabase-ро гузоред. Сайт: http://localhost:3000.
`.env.local` ва secret-ҳоро ба GitHub нафиристед. `.env.example` танҳо намуна аст.

## Воридшавӣ

Email/password ва тугмаҳои Google, GitHub ва Facebook мавҷуданд. OAuth provider-ҳо,
callback URLs ва env-ҳои Vercel бояд алоҳида танзим шаванд. Мавҷуд будани тугма
кор кардани live login-ро тасдиқ намекунад. Барои профил ва sync мигратсияҳои Supabase лозиманд.

## Санҷиш

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Ҳуҷҷатҳо

- [Танзими аккаунтҳо](docs/accounts-setup.md)
- [Ҳолати лоиҳа ва маҳдудиятҳо](docs/DEVATLAS-DELIVERY.md)
- [Аудити курсҳо](docs/CURRICULUM-AUDIT-2026-11-15.md)
- [Корҳои боқимонда](docs/audits/2026-10-26-tasks.md)

Live OAuth, пардохтҳо ва омодагии пурраи production ҳанӯз тасдиқ нашудаанд.
