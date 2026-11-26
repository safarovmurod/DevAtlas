import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/account/require-admin';
import { readBoundedJson, RequestBodyError } from '@/lib/security/request';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  isTelegramBotConfigured,
  resolveSiteOrigin,
  sendTelegramMessage,
  type TelegramInlineButton,
} from '@/lib/integrations/telegram-notify';

const SendSchema = z.object({
  message: z.string().trim().min(1).max(3000),
  chatId: z.union([z.number().int(), z.string().regex(/^-?\d+$/)]).optional(),
  broadcast: z.boolean().optional(),
  ctaLabel: z.string().trim().max(60).optional(),
  ctaPath: z
    .string()
    .trim()
    .regex(/^\/[a-zA-Z0-9/_-]*$/)
    .max(120)
    .optional(),
});

/** Admin-only: check Telegram bot status & subscribed user count. */
export async function GET(request: Request) {
  const check = await requireAdmin(request);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const admin = getSupabaseAdminClient();
  let subscriberCount = 0;
  if (admin) {
    const { count } = await admin
      .from('devatlas_telegram_users')
      .select('chat_id', { count: 'exact', head: true })
      .eq('reminders_enabled', true);
    subscriberCount = count ?? 0;
  }

  return NextResponse.json({
    ok: true,
    configured: isTelegramBotConfigured(),
    subscriberCount,
  });
}

/** Admin-only: send a Telegram message to 1 user (chatId) or broadcast to all opted-in bot users. */
export async function POST(request: Request) {
  const check = await requireAdmin(request);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  if (!isTelegramBotConfigured()) {
    return NextResponse.json({ error: 'telegram_not_configured' }, { status: 503 });
  }

  let raw: unknown;
  try {
    raw = await readBoundedJson(request, 16_384);
  } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : 400;
    return NextResponse.json({ error: 'invalid_json' }, { status });
  }

  const parsed = SendSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation_failed' }, { status: 400 });
  }

  const { message, chatId, broadcast, ctaLabel, ctaPath } = parsed.data;
  const origin = resolveSiteOrigin(request);
  const isHttps = /^https:\/\/[^/\s]+/i.test(origin) && !/localhost|127\.0\.0\.1/i.test(origin);
  const buttons: TelegramInlineButton[][] | undefined =
    ctaLabel && ctaPath
      ? [
          [
            isHttps
              ? { text: ctaLabel, web_app: { url: `${origin}${ctaPath}` } }
              : { text: ctaLabel, url: `${origin}${ctaPath}` },
          ],
        ]
      : undefined;

  if (chatId !== undefined) {
    const ok = await sendTelegramMessage({ chatId, text: message, buttons });
    return NextResponse.json({ ok, delivered: ok ? 1 : 0, failed: ok ? 0 : 1 });
  }

  if (!broadcast) {
    return NextResponse.json({ error: 'chat_id_or_broadcast_required' }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'database_not_configured' }, { status: 503 });
  }

  const { data, error } = await admin
    .from('devatlas_telegram_users')
    .select('chat_id')
    .eq('reminders_enabled', true)
    .limit(500);

  if (error || !data) {
    return NextResponse.json({ error: 'subscriber_lookup_failed' }, { status: 500 });
  }

  let delivered = 0;
  let failed = 0;
  for (const row of data) {
    const sent = await sendTelegramMessage({ chatId: row.chat_id, text: message, buttons });
    if (sent) delivered += 1;
    else failed += 1;
  }

  return NextResponse.json({ ok: true, total: data.length, delivered, failed });
}
