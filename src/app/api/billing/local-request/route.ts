import { NextResponse } from 'next/server';
import { z } from 'zod';
import { readBoundedJson, RequestBodyError } from '@/lib/security/request';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { notifyTelegramAdmin } from '@/lib/integrations/telegram-notify';

const LocalPaySchema = z.object({
  plan: z.enum(['pro', 'ultra']),
  provider: z.enum(['alif_mobi', 'korti_milli', 'dc_next', 'eskhata', 'other']),
  senderName: z.string().trim().min(2).max(80),
  contact: z.string().trim().min(4).max(80),
  referenceCode: z.string().trim().min(3).max(80),
});

export async function GET() {
  const account = process.env.NEXT_PUBLIC_LOCAL_PAY_ACCOUNT?.trim() || '';
  const holder = process.env.NEXT_PUBLIC_LOCAL_PAY_HOLDER?.trim() || '';
  const telegramSupport = process.env.NEXT_PUBLIC_LOCAL_PAY_TELEGRAM?.trim() || '';
  return NextResponse.json({
    configured: Boolean(account),
    account,
    holder,
    telegramSupport,
    providers: ['alif_mobi', 'korti_milli', 'dc_next', 'eskhata'],
  });
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await readBoundedJson(request, 16_384);
  } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : 400;
    return NextResponse.json({ error: 'invalid_json' }, { status });
  }

  const parsed = LocalPaySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation_failed' }, { status: 400 });
  }

  const data = parsed.data;
  const admin = getSupabaseAdminClient();
  let userId: string | null = null;

  const authHeader = request.headers.get('authorization');
  if (admin && authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) {
      const { data: userData } = await admin.auth.getUser(token).catch(() => ({ data: { user: null } }));
      userId = userData.user?.id ?? null;
    }
  }

  let savedToDatabase = false;
  if (admin) {
    const { error } = await admin.from('devatlas_local_payment_requests').insert({
      user_id: userId,
      plan: data.plan,
      provider: data.provider,
      sender_name: data.senderName,
      contact: data.contact,
      reference_code: data.referenceCode,
      status: 'pending',
    });
    savedToDatabase = !error;
  }

  const telegramNotified = await notifyTelegramAdmin(
    `💳 DevAtlas Local Payment Request (PENDING)\n` +
      `Plan: ${data.plan.toUpperCase()}\n` +
      `Provider: ${data.provider}\n` +
      `Name: ${data.senderName}\n` +
      `Contact: ${data.contact}\n` +
      `Receipt/Ref: ${data.referenceCode}\n` +
      `User ID: ${userId ?? 'guest'}\n` +
      `Note: Verify receipt manually before granting membership in /admin.`,
  );

  // Never auto-grant paid tier from client submission.
  return NextResponse.json(
    {
      ok: true,
      status: 'pending',
      savedToDatabase,
      telegramNotified,
      persisted: savedToDatabase || telegramNotified,
    },
    { status: 202 },
  );
}
