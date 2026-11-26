#!/usr/bin/env node
/**
 * Configures @devatlas_official_bot via Telegram Bot API:
 * - Bot description & short description
 * - Slash commands menu (/start, /courses, /workshops, /career, /arena, /plans, /remind, /help)
 * - Blue Mini App Menu Button ("DevAtlas App") when an HTTPS site URL is provided
 * - Production Webhook with X-Telegram-Bot-Api-Secret-Token when an HTTPS site URL is provided
 *
 * Usage:
 *   npm run telegram:setup
 *   npm run telegram:setup -- --url=https://your-devatlas-domain.vercel.app
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && !(key in process.env)) process.env[key] = val;
  }
}

loadEnvLocal();

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
if (!token) {
  console.error('Missing TELEGRAM_BOT_TOKEN in .env.local or environment.');
  process.exit(1);
}

const urlArg = process.argv.find((a) => a.startsWith('--url='))?.slice(6)?.trim() || '';
const siteUrl = (urlArg || process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '');
const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim() || '';
const isHttps = /^https:\/\/[^/\s]+/i.test(siteUrl) && !/localhost|127\.0\.0\.1/i.test(siteUrl);

async function tg(method, payload) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.ok) {
    throw new Error(`${method} failed: ${data.description || JSON.stringify(data)}`);
  }
  return data.result;
}

async function main() {
  const me = await tg('getMe', {});
  console.log(`Connected bot: @${me.username} (${me.first_name})`);

  await tg('setMyShortDescription', {
    short_description:
      'DevAtlas — 43 курси IT, AI, дизайн ва бизнес, 6 воркшопи нав, QR-сертификат, Портфолио CV ва Ҷанги Код 1v1.',
  });

  await tg('setMyDescription', {
    description:
      'Хуш омадед ба DevAtlas 🚀\n\n' +
      '• 43 курси ройгон ва Pro (React, Next.js, Python, Backend, SQL, AI, UX, Маркетинг)\n' +
      '• 6 воркшопи нав: Telegram-ботҳо, Фриланс, AI барои бизнес, No-Code, Excel+AI, Кӯдакон\n' +
      '• QR-сертификат, созандаи Резюме (CV) ва Аренаи Ҷанги Код 1v1\n\n' +
      'Тугмаи START-ро пахш кунед!',
  });

  await tg('setMyCommands', {
    commands: [
      { command: 'start', description: '🚀 Оғоз ва кушодани DevAtlas App' },
      { command: 'courses', description: '📚 43 курс ва Code Sandbox' },
      { command: 'workshops', description: '🔥 6 дарси нав (Ботҳо, Фриланс, AI, Кӯдакон)' },
      { command: 'career', description: '🧭 Тести 2-дақиқаии интихоби касб' },
      { command: 'arena', description: '⚡ Ҷанги код 1v1 ва рейтинг' },
      { command: 'plans', description: '👑 Тарифҳои Pro & Ultra' },
      { command: 'remind', description: '🔔 Фаъол/хомӯш кардани ёдраскунии дарсҳо' },
      { command: 'help', description: '💬 Кӯмак ва рӯйхати командаҳо' },
    ],
  });
  console.log('✓ Description, short description, and 8 commands configured.');

  if (isHttps) {
    await tg('setChatMenuButton', {
      menu_button: {
        type: 'web_app',
        text: 'DevAtlas App',
        web_app: { url: `${siteUrl}/courses` },
      },
    });
    console.log(`✓ Mini App Menu Button configured -> ${siteUrl}/courses`);

    await tg('setWebhook', {
      url: `${siteUrl}/api/integrations/telegram/webhook`,
      ...(webhookSecret ? { secret_token: webhookSecret } : {}),
      allowed_updates: ['message'],
    });
    console.log(`✓ Production webhook registered -> ${siteUrl}/api/integrations/telegram/webhook`);
  } else {
    await tg('deleteWebhook', { drop_pending_updates: false });
    console.log(
      'ℹ No public HTTPS URL provided yet (NEXT_PUBLIC_SITE_URL or --url=https://...).',
    );
    console.log(
      '  Webhook cleared so you can run `npm run telegram:dev` locally right now, or re-run with `--url=https://your-site.vercel.app` after deploying to Vercel to enable the live Mini App button & webhook.',
    );
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
