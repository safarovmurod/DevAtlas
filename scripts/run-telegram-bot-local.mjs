#!/usr/bin/env node
/**
 * Local long-polling runner for @devatlas_official_bot.
 * Lets you test live bot replies, user subscriber tracking, and sending messages
 * immediately on your machine before deploying HTTPS webhook to Vercel.
 *
 * Usage:
 *   npm run telegram:dev
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
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
  console.error('Missing TELEGRAM_BOT_TOKEN in .env.local');
  process.exit(1);
}

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '');
const isHttps = /^https:\/\/[^/\s]+/i.test(siteUrl) && !/localhost|127\.0\.0\.1/i.test(siteUrl);
const usersFile = resolve(process.cwd(), '.tmp-telegram-users.json');

function loadUsers() {
  if (!existsSync(usersFile)) return {};
  try {
    return JSON.parse(readFileSync(usersFile, 'utf8'));
  } catch {
    return {};
  }
}

function saveUsers(users) {
  writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

async function tg(method, payload) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

function makeButtons(rows) {
  if (!isHttps) return undefined;
  return {
    inline_keyboard: rows.map((row) =>
      row.map(([text, path]) => ({ text, web_app: { url: `${siteUrl}${path}` } })),
    ),
  };
}

function replyFor(text, firstName, remindersEnabled) {
  const cmd = (text.trim().split(/\s+/)[0]?.split('@')[0] || '/start').toLowerCase();
  const hi = firstName ? `${firstName}, ` : '';
  if (cmd === '/courses') {
    return {
      text: `${hi}дар DevAtlas 43 курс (HTML, CSS, JS, React, Next.js, Python, Backend, SQL, AI, UX, Маркетинг) ва Code Sandbox дастрасанд!`,
      reply_markup: makeButtons([[['📚 Кушодани 43 курс', '/courses']], [['💻 Code Sandbox', '/sandbox']]]),
    };
  }
  if (cmd === '/workshops') {
    return {
      text: `${hi}6 воркшопи нави бозорӣ: Telegram-ботҳо, Фриланс, AI барои бизнес, No-Code сайтҳо, Excel+AI ва Барномасозӣ барои кӯдакон.`,
      reply_markup: makeButtons([[['🔥 Кушодани 6 Воркшоп', '/workshops']]]),
    };
  }
  if (cmd === '/career') {
    return {
      text: `${hi}тести 2-дақиқаии интихоби касбро гузар ва нақшаи омӯзишатро гир!`,
      reply_markup: makeButtons([[['🧭 Тести касб', '/career-test']]]),
    };
  }
  if (cmd === '/arena') {
    return {
      text: `${hi}дар Аренаи Ҷанги Код 1v1 6 саволро дар 2 дақиқа ҳал кун ва дӯстатро даъват намо!`,
      reply_markup: makeButtons([[['⚡ Оғози Ҷанги Код', '/arena']]]),
    };
  }
  if (cmd === '/plans') {
    return {
      text:
        `${hi}тарифҳои DevAtlas:\n` +
        `• Start — Ройгон\n` +
        `• Pro ($5/моҳ) — QR-сертификат, Портфолио CV, AI Tutor\n` +
        `• Ultra ($12/моҳ) — Мок-мусоҳиба, Аудити проект, Спринти 30-рӯза, Voice`,
      reply_markup: makeButtons([[['👑 Тарифҳо', '/plans'], ['🎓 Марафонҳо', '/programs']]]),
    };
  }
  if (cmd === '/remind') {
    return {
      text: remindersEnabled
        ? `${hi}ёдраскунии дарсҳо ФАЪОЛ шуд 🔔`
        : `${hi}ёдраскунии дарсҳо ХОМӮШ шуд 🔕`,
    };
  }
  return {
    text:
      `Салом ${firstName || 'дӯст'}! Хуш омадед ба DevAtlas 🚀\n\n` +
      `Командаҳо:\n` +
      `/courses — 43 курс ва Code Sandbox\n` +
      `/workshops — 6 дарси нав\n` +
      `/career — Тести интихоби касб\n` +
      `/arena — Ҷанги код 1v1\n` +
      `/plans — Pro & Ultra\n` +
      `/remind — Ёдраскунии дарсҳо` +
      (isHttps ? '' : '\n\n(Барои тугмаи Mini App дар .env.local домени https://-ро гузоред)'),
    reply_markup: makeButtons([
      [['🚀 Кушодани DevAtlas App', '/courses']],
      [['🧭 Тести касб', '/career-test'], ['⚡ Ҷанги код', '/arena']],
      [['🔥 6 Воркшоп', '/workshops'], ['👑 Pro / Ultra', '/plans']],
    ]),
  };
}

async function main() {
  await tg('deleteWebhook', { drop_pending_updates: false });
  const me = await tg('getMe', {});
  console.log(`DevAtlas Telegram bot polling started: @${me.result?.username}`);
  let offset = 0;
  const users = loadUsers();

  while (true) {
    try {
      const updates = await tg('getUpdates', { offset, timeout: 25, allowed_updates: ['message'] });
      for (const upd of updates.result || []) {
        offset = upd.update_id + 1;
        const msg = upd.message;
        if (!msg?.chat?.id || !msg.text) continue;
        const chatId = msg.chat.id;
        const firstName = msg.from?.first_name || '';
        const cmd = msg.text.trim().split(/\s+/)[0]?.toLowerCase();
        const prev = users[chatId] || { remindersEnabled: true };
        const remindersEnabled = cmd === '/remind' ? !prev.remindersEnabled : prev.remindersEnabled;
        users[chatId] = {
          chatId,
          username: msg.from?.username || null,
          firstName,
          remindersEnabled,
          lastSeen: new Date().toISOString(),
        };
        saveUsers(users);
        const reply = replyFor(msg.text, firstName, remindersEnabled);
        await tg('sendMessage', { chat_id: chatId, ...reply });
        console.log(`Replied to ${firstName || chatId} (${cmd})`);
      }
    } catch (err) {
      console.error('Polling error:', err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

main();
