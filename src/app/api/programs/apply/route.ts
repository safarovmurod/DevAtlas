import { NextResponse } from 'next/server';
import { z } from 'zod';
import { readBoundedJson, RequestBodyError } from '@/lib/security/request';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { notifyTelegramAdmin } from '@/lib/integrations/telegram-notify';

const ApplySchema = z.object({
  kind: z.enum(['bootcamp', 'classroom_b2b', 'employer_internship']),
  programId: z.string().trim().min(2).max(80),
  fullName: z.string().trim().min(2).max(80),
  contact: z.string().trim().min(4).max(100),
  organization: z.string().trim().max(100).optional().default(''),
  seats: z.number().int().min(1).max(5000).optional(),
  notes: z.string().trim().max(600).optional().default(''),
});

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await readBoundedJson(request, 16_384);
  } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : 400;
    return NextResponse.json({ error: 'invalid_json' }, { status });
  }

  const parsed = ApplySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation_failed' }, { status: 400 });
  }

  const d = parsed.data;
  const admin = getSupabaseAdminClient();
  let savedToDatabase = false;
  if (admin) {
    const { error } = await admin.from('devatlas_program_applications').insert({
      kind: d.kind,
      program_id: d.programId,
      full_name: d.fullName,
      contact: d.contact,
      organization: d.organization || null,
      seats: d.seats ?? null,
      notes: d.notes || null,
    });
    savedToDatabase = !error;
  }

  const telegramNotified = await notifyTelegramAdmin(
    `🎯 New DevAtlas Application (${d.kind})\n` +
      `Program: ${d.programId}\n` +
      `Name: ${d.fullName}\n` +
      `Contact: ${d.contact}\n` +
      (d.organization ? `Org: ${d.organization}\n` : '') +
      (d.seats ? `Seats: ${d.seats}\n` : '') +
      (d.notes ? `Notes: ${d.notes}` : ''),
  );

  return NextResponse.json({
    ok: true,
    savedToDatabase,
    telegramNotified,
    persisted: savedToDatabase || telegramNotified,
  });
}
