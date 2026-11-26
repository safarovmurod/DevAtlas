import { NextResponse } from 'next/server';
import { z } from 'zod';
import { readBoundedJson, RequestBodyError } from '@/lib/security/request';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

const ReferralSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(32)
    .regex(/^[a-zA-Z0-9_-]+$/),
  landingPath: z.string().trim().max(120).optional().default('/'),
  visitorHash: z.string().trim().min(4).max(64).optional().default('anon'),
});

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await readBoundedJson(request, 8192);
  } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : 400;
    return NextResponse.json({ error: 'invalid_json' }, { status });
  }

  const parsed = ReferralSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_referral' }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  let persisted = false;
  if (admin) {
    const { error } = await admin.from('devatlas_referral_events').insert({
      referral_code: parsed.data.code,
      visitor_hash: parsed.data.visitorHash,
      landing_path: parsed.data.landingPath,
    });
    persisted = !error;
  }

  return NextResponse.json({ ok: true, code: parsed.data.code, persisted });
}
