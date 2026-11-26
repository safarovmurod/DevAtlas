#!/usr/bin/env node
/**
 * Configures @devatlas_official_bot via Telegram Bot API:
 * - Clean RU (default) + EN localized descriptions, short descriptions, and command menus
 * - Attempts setting bot profile avatar via setMyProfilePhoto when public/telegram/bot-avatar.png exists
 * - Blue Mini App Menu Button ("DevAtlas") when an HTTPS site URL is provided
 * - Production Webhook (message + callback_query) with X-Telegram-Bot-Api-Secret-Token
 *
 * Usage:
 *   npm run telegram:setup -- --url=https://react-mentor-opal.vercel.app
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
  for (const rawLine of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
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

async function tryUploadAvatar() {
  const avatarPath = resolve(process.cwd(), 'public/telegram/bot-avatar.jpg');
  if (!existsSync(avatarPath)) {
    console.log('ℹ No avatar found at public/telegram/bot-avatar.jpg');
    return false;
  }
  try {
    const fileBytes = readFileSync(avatarPath);
    const form = new FormData();
    form.append('photo', JSON.stringify({ type: 'static', photo: 'attach://avatar' }));
    form.append('avatar', new Blob([fileBytes], { type: 'image/jpeg' }), 'bot-avatar.jpg');
    const res = await fetch(`https://api.telegram.org/bot${token}/setMyProfilePhoto`, {
      method: 'POST',
      body: form,
    });
    const data = await res.json();
    if (data.ok) {
      console.log('✓ Bot profile avatar uploaded automatically via setMyProfilePhoto!');
      return true;
    }
    console.log(`ℹ setMyProfilePhoto returned: ${data.description || 'unsupported'}`);
    return false;
  } catch (err) {
    console.log(`ℹ Avatar upload skipped: ${err.message}`);
    return false;
  }
}

async function main() {
  const me = await tg('getMe', {});
  console.log(`Connected bot: @${me.username} (${me.first_name})`);

  // Russian (Default)
  await tg('setMyShortDescription', {
    short_description:
      'DevAtlas — 43 курса IT и AI, 6 воркшопов, Code Sandbox, QR-сертификаты, CV-портфолио и Арена 1v1.',
  });
  await tg('setMyDescription', {
    description:
      'DevAtlas — интерактивная образовательная платформа для карьеры в IT и AI.\n\n' +
      '• 43 курса: Frontend, Backend, Python, SQL, AI, UX, Маркетинг, Бизнес\n' +
      '• 6 практических воркшопов: Telegram-боты, Фриланс, AI без кода, No-Code, Excel+AI, Дети\n' +
      '• QR-сертификаты с публичной проверкой, конструктор CV и Арена 1v1\n\n' +
      'Нажмите START, чтобы открыть приложение прямо в Telegram.',
  });
  await tg('setMyCommands', {
    commands: [
      { command: 'start', description: 'Главное меню и запуск DevAtlas App' },
      { command: 'courses', description: '43 курса и Code Sandbox' },
      { command: 'workshops', description: '6 практических воркшопов' },
      { command: 'career', description: 'Тест выбора IT-профессии (2 мин)' },
      { command: 'arena', description: 'Арена 1v1 и недельный рейтинг' },
      { command: 'plans', description: 'Тарифы Start, Pro и Ultra' },
      { command: 'remind', description: 'Вкл/выкл напоминания об учёбе' },
      { command: 'lang', description: 'Переключить язык (RU / EN)' },
      { command: 'help', description: 'Список команд и справка' },
    ],
  });

  // English (Localized for EN Telegram clients)
  await tg('setMyShortDescription', {
    language_code: 'en',
    short_description:
      'DevAtlas — 43 Coding & AI courses, 6 workshops, Code Sandbox, QR certificates, CV builder & 1v1 Arena.',
  });
  await tg('setMyDescription', {
    language_code: 'en',
    description:
      'DevAtlas — interactive learning platform for Coding, AI & Career.\n\n' +
      '• 43 structured courses: React, Next.js, Python, Backend, SQL, AI, UX, Business\n' +
      '• 6 market workshops: Telegram Bots, Freelancing, AI Automation, No-Code, Excel+AI, Kids\n' +
      '• QR-verified certificates, public CV portfolio & 1v1 Code Duel Arena\n\n' +
      'Tap START to launch DevAtlas inside Telegram.',
  });
  await tg('setMyCommands', {
    language_code: 'en',
    commands: [
      { command: 'start', description: 'Main menu & launch DevAtlas App' },
      { command: 'courses', description: '43 courses & Code Sandbox' },
      { command: 'workshops', description: '6 practical market workshops' },
      { command: 'career', description: '2-minute IT Career Finder quiz' },
      { command: 'arena', description: '1v1 Code Duel & weekly leaderboard' },
      { command: 'plans', description: 'Start, Pro & Ultra plans' },
      { command: 'remind', description: 'Toggle study reminders' },
      { command: 'lang', description: 'Switch language (EN / RU)' },
      { command: 'help', description: 'Commands & help' },
    ],
  });
  console.log('✓ RU + EN descriptions and 9 commands configured.');

  await tryUploadAvatar();

  if (isHttps) {
    await tg('setChatMenuButton', {
      menu_button: {
        type: 'web_app',
        text: 'DevAtlas',
        web_app: { url: `${siteUrl}/courses` },
      },
    });
    console.log(`✓ Mini App Menu Button configured -> ${siteUrl}/courses`);

    await tg('setWebhook', {
      url: `${siteUrl}/api/integrations/telegram/webhook`,
      ...(webhookSecret ? { secret_token: webhookSecret } : {}),
      allowed_updates: ['message', 'callback_query'],
    });
    console.log(
      `✓ Production webhook registered (message + callback_query) -> ${siteUrl}/api/integrations/telegram/webhook`,
    );
  } else {
    await tg('deleteWebhook', { drop_pending_updates: false });
    console.log('ℹ No public HTTPS URL provided; webhook cleared for local polling.');
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
