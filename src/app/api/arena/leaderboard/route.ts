import { NextResponse } from 'next/server';
import { z } from 'zod';
import { readBoundedJson, RequestBodyError } from '@/lib/security/request';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

const ScoreSchema = z.object({
  displayName: z.string().trim().min(2).max(50),
  track: z.enum(['mixed', 'frontend', 'backend', 'python', 'ai']),
  score: z.number().int().min(0).max(10_000),
  correctCount: z.number().int().min(0).max(20),
});

export async function GET() {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ configured: false, entries: [] });
  }

  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const { data, error } = await admin
    .from('devatlas_arena_scores')
    .select('id, display_name, track, score, correct_count, created_at')
    .gte('created_at', weekAgo)
    .order('score', { ascending: false })
    .limit(25);

  if (error || !data) {
    return NextResponse.json({ configured: false, entries: [] });
  }

  return NextResponse.json({
    configured: true,
    entries: data.map((row) => ({
      id: row.id,
      displayName: row.display_name,
      track: row.track,
      score: row.score,
      correctCount: row.correct_count,
      createdAt: row.created_at,
    })),
  });
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await readBoundedJson(request, 8192);
  } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : 400;
    return NextResponse.json({ error: 'invalid_json' }, { status });
  }

  const parsed = ScoreSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_score' }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  let userId: string | null = null;
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) {
      const { data: userData } = await admin.auth.getUser(token).catch(() => ({ data: { user: null } }));
      userId = userData.user?.id ?? null;
    }
  }

  const { error } = await admin.from('devatlas_arena_scores').insert({
    user_id: userId,
    display_name: parsed.data.displayName,
    track: parsed.data.track,
    score: parsed.data.score,
    correct_count: parsed.data.correctCount,
  });

  return NextResponse.json({ ok: true, persisted: !error });
}
