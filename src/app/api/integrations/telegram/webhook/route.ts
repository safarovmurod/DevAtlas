import { NextResponse } from 'next/server';
import { readBoundedJson, RequestBodyError } from '@/lib/security/request';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  isTelegramBotConfigured,
  resolveSiteOrigin,
  sendTelegramMessage,
  type TelegramInlineButton,
} from '@/lib/integrations/telegram-notify';

type TelegramUpdate = {
  message?: {
    chat?: { id?: number };
    from?: { first_name?: string; username?: string; language_code?: string };
    text?: string;
  };
};

function isHttpsOrigin(origin: string): boolean {
  return /^https:\/\/[^/\s]+/i.test(origin) && !/localhost|127\.0\.0\.1/i.test(origin);
}

export function buildTelegramReply(
  textInput: string,
  origin: string,
  firstName: string,
  remindersEnabled = true,
) {
  const parts = textInput.trim().split(/\s+/);
  const cmd = (parts[0]?.split('@')[0] ?? '/start').toLowerCase();
  const arg = parts[1]?.trim() ?? '';
  const greeting = firstName ? `${firstName}, ` : '';
  const hasHttps = isHttpsOrigin(origin);
  const appButton = (path: string, label: string): TelegramInlineButton =>
    hasHttps
      ? { text: label, web_app: { url: `${origin}${path}` } }
      : { text: label, url: `${origin}${path}` };

  if (cmd === '/courses') {
    return {
      text:
        `${greeting}дар DevAtlas 43 курси сохторӣ (HTML, CSS, JS, React, Next.js, Python, Backend, SQL, AI, UX, Маркетинг, Англисӣ) бо амалияи код ва тестҳо дастрасанд!`,
      buttons: [
        [appButton('/courses', '📚 Кушодани ҳамаи 43 курс')],
        [appButton('/sandbox', '💻 Code Sandbox (11 забон)')],
      ],
    };
  }
  if (cmd === '/career') {
    return {
      text: `${greeting}тести 2-дақиқаии интихоби касбро гузар ва roadmap-и шахсиятро гир!`,
      buttons: [[appButton('/career-test', '🧭 Кушодани Тести касб')]],
    };
  }
  if (cmd === '/workshops') {
    return {
      text: `${greeting}6 дарси нави талаботи баланд: Telegram-ботҳо, Фриланс, AI барои бизнес, No-Code сайтҳо, Excel+AI ва Барномасозӣ барои кӯдакон.`,
      buttons: [[appButton('/workshops', '🔥 Кушодани 6 Воркшоп')]],
    };
  }
  if (cmd === '/arena') {
    return {
      text: `${greeting}2 дақиқа вақт дорӣ? Дар Аренаи Ҷанги Код 1v1 хол ҷамъ кун ва линки дуэлро ба дӯстат фирист!`,
      buttons: [[appButton('/arena', '⚡ Оғози Ҷанги Код 1v1')]],
    };
  }
  if (cmd === '/plans') {
    return {
      text:
        `${greeting}тарифҳои DevAtlas:\n` +
        `• Start (Ройгон) — курсҳои асосӣ, муҳаррир ва чат\n` +
        `• Pro ($5/моҳ) — курсҳои Pro, QR-сертификат, Портфолио CV, AI Tutor\n` +
        `• Ultra ($12/моҳ) — Мок-мусоҳиба, Аудити лоиҳа, Спринти 30-рӯза ва Ёрдамчии овозӣ\n\n` +
        `Пардохт бо корт ё дархости пардохти маҳаллӣ (Alif Mobi / Корти Миллӣ / DC Next) дар дохили App.`,
      buttons: [
        [appButton('/plans', '👑 Дидани тарифҳо')],
        [appButton('/programs', '🎓 Марафонҳо & B2B')],
      ],
    };
  }
  if (cmd === '/remind') {
    return {
      text: remindersEnabled
        ? `${greeting}ёдраскунии дарсҳо ФАЪОЛ шуд! Ҳар вақте дарси нав ё марафон барояд, ба ту хабар медиҳем. Барои хомӯш кардан боз /remind навис.`
        : `${greeting}ёдраскунии дарсҳо ХОМӮШ шуд. Ҳар вақт хоҳӣ, бо /remind дубора фаъол кун.`,
      buttons: [[appButton('/courses', '📚 Кушодани DevAtlas')]],
    };
  }
  if (cmd === '/help') {
    return {
      text:
        `Командаҳои DevAtlas Bot:\n` +
        `/start — Менюи асосӣ ва кушодани App\n` +
        `/courses — 43 курси ройгон ва Pro\n` +
        `/workshops — 6 воркшопи нави бозорӣ\n` +
        `/career — Тести ройгони интихоби касб\n` +
        `/arena — Ҷанги код 1v1 бо дӯстон\n` +
        `/plans — Тарифҳои Pro & Ultra\n` +
        `/remind — Фаъол/хомӯш кардани паёмҳои ёдраскунӣ`,
      buttons: [[appButton('/courses', '🚀 Кушодани DevAtlas App')]],
    };
  }

  const refMatch = /^ref_([a-zA-Z0-9_-]{2,32})$/.exec(arg);
  const startPath = refMatch ? `/career-test?ref=${encodeURIComponent(refMatch[1])}` : '/courses';
  const refNote = refMatch ? '\n🎁 Шумо бо даъвати дӯстатон ворид шудед!' : '';

  return {
    text:
      `Салом ${firstName || 'дӯст'}! Хуш омадед ба DevAtlas 🚀${refNote}\n\n` +
      `Дар ин ҷо метавонӣ бе баромадан аз Telegram барномасозӣ, AI, дизайн, маркетинг ва забонро омӯзӣ, QR-сертификат гирӣ ва портфолио созӣ.\n\n` +
      `Тугмаи поёнро пахш кун то барнома кушода шавад:`,
    buttons: [
      [appButton(startPath, '🚀 Кушодани DevAtlas App')],
      [appButton('/career-test', '🧭 Тести касб'), appButton('/arena', '⚡ Ҷанги код 1v1')],
      [appButton('/workshops', '🔥 6 Воркшопи нав'), appButton('/plans', '👑 Pro / Ultra')],
      [appButton('/certificates', '🏅 Сертификатҳо'), appButton('/portfolio', '💼 Резюме / CV')],
    ],
  };
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: isTelegramBotConfigured(),
    botUsername: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim() || 'devatlas_official_bot',
    commands: ['/start', '/courses', '/workshops', '/career', '/arena', '/plans', '/remind', '/help'],
  });
}

export async function POST(request: Request) {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (expectedSecret) {
    const provided = request.headers.get('x-telegram-bot-api-secret-token')?.trim() || '';
    if (provided !== expectedSecret) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  let body: TelegramUpdate;
  try {
    body = (await readBoundedJson(request, 32_768)) as TelegramUpdate;
  } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : 400;
    return NextResponse.json({ error: 'invalid_payload' }, { status });
  }

  const chatId = body.message?.chat?.id;
  const text = body.message?.text?.trim() || '';
  if (!chatId || !text) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const firstName = body.message?.from?.first_name?.trim() || '';
  const username = body.message?.from?.username?.trim() || null;
  const languageCode = body.message?.from?.language_code?.trim() || null;
  const parts = text.split(/\s+/);
  const cmd = (parts[0]?.split('@')[0] ?? '').toLowerCase();
  const refMatch = cmd === '/start' ? /^ref_([a-zA-Z0-9_-]{2,32})$/.exec(parts[1] ?? '') : null;

  let remindersEnabled = true;
  const admin = getSupabaseAdminClient();
  if (admin) {
    if (cmd === '/remind') {
      const existing = await admin
        .from('devatlas_telegram_users')
        .select('reminders_enabled')
        .eq('chat_id', chatId)
        .maybeSingle();
      remindersEnabled = existing.data ? !existing.data.reminders_enabled : true;
    }

    await admin.from('devatlas_telegram_users').upsert(
      {
        chat_id: chatId,
        username,
        first_name: firstName || null,
        language_code: languageCode,
        ...(refMatch ? { referral_code: refMatch[1] } : {}),
        ...(cmd === '/remind' ? { reminders_enabled: remindersEnabled } : {}),
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'chat_id' },
    );

    if (refMatch) {
      await admin.from('devatlas_referral_events').insert({
        referral_code: refMatch[1],
        visitor_hash: `tg_${chatId}`,
        landing_path: '/telegram-bot',
      });
    }
  }

  const origin = resolveSiteOrigin(request);
  const reply = buildTelegramReply(text, origin, firstName, remindersEnabled);

  const sent = isTelegramBotConfigured()
    ? await sendTelegramMessage({ chatId, text: reply.text, buttons: reply.buttons })
    : false;

  return NextResponse.json({
    ok: true,
    configured: isTelegramBotConfigured(),
    sent,
    replyPreview: reply.text,
  });
}
