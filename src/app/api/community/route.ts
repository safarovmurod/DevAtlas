import { z } from 'zod';
import { readBoundedJson, RequestBodyError } from '@/lib/security/request';
import { communityResponse, requireMembership } from '@/lib/billing/community-server';
import {
  COMMUNITY_BUCKET,
  COMMUNITY_CODE_MAX,
  COMMUNITY_MEDIA_TYPES,
  COMMUNITY_TEXT_MAX,
  communityMediaProblem,
  isCommunityMediaType,
} from '@/lib/community/limits';

const uuid = z.string().uuid();
const mediaPath = z.string().regex(/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp|mp4|webm)$/);
const Input = z.discriminatedUnion('kind', [
  z
    .object({ kind: z.literal('message'), text: z.string().trim().min(1).max(COMMUNITY_TEXT_MAX) })
    .strict(),
  z
    .object({
      kind: z.literal('code'),
      text: z.string().trim().min(1).max(COMMUNITY_CODE_MAX),
      language: z
        .string()
        .regex(/^[a-z0-9+#-]{1,20}$/)
        .optional(),
    })
    .strict(),
  z
    .object({
      kind: z.literal('media'),
      path: mediaPath,
      text: z.string().trim().max(COMMUNITY_TEXT_MAX).optional(),
    })
    .strict(),
  z
    .object({
      kind: z.literal('upload'),
      type: z.string().max(40),
      size: z.number().int(),
    })
    .strict(),
  z.object({ kind: z.literal('delete'), id: uuid }).strict(),
  z.object({ kind: z.literal('heartbeat') }).strict(),
  z.object({ kind: z.literal('leave') }).strict(),
]);

type Row = {
  id: string;
  author_id: string;
  author_name: string;
  body: string;
  created_at: string;
  kind?: string;
  code_language?: string | null;
  attachment_path?: string | null;
  attachment_mime?: string | null;
};

/** The community migration (20261118000000) adds columns and RPCs; without it the chat waits. */
function setupMissing(error: { code?: string } | null) {
  return !!error && ['42703', 'PGRST204', 'PGRST202', '42883'].includes(error.code ?? '');
}
const setupRequired = () => communityResponse({ error: 'setup_required' }, 503);

export async function GET(request: Request) {
  const access = await requireMembership(request);
  if ('failure' in access) return access.failure;
  const [messages, online] = await Promise.all([
    access.client
      .from('react_mentor_chat_messages')
      .select(
        'id,author_id,author_name,body,created_at,kind,code_language,attachment_path,attachment_mime',
      )
      .order('created_at', { ascending: false })
      .limit(60),
    access.client
      .from('react_mentor_chat_presence')
      .select('user_id', { count: 'exact', head: true })
      .gt('last_seen', new Date(Date.now() - 90_000).toISOString()),
  ]);
  if (setupMissing(messages.error)) return setupRequired();
  if (messages.error || online.error)
    return communityResponse({ error: 'service_unavailable' }, 503);
  const rows = ((messages.data || []) as Row[]).reverse();
  const paths = rows.flatMap((row) => (row.attachment_path ? [row.attachment_path] : []));
  const urls = new Map<string, string>();
  if (paths.length) {
    // Private bucket: each viewer gets short-lived signed links, never a public URL.
    const signed = await access.client.storage.from(COMMUNITY_BUCKET).createSignedUrls(paths, 3600);
    for (const item of signed.data || [])
      if (item.path && item.signedUrl && !item.error) urls.set(item.path, item.signedUrl);
  }
  return communityResponse({
    messages: rows.map((row) => ({
      id: row.id,
      author_id: row.author_id,
      author_name: row.author_name,
      body: row.body,
      created_at: row.created_at,
      kind: row.kind ?? 'text',
      code_language: row.code_language ?? null,
      media_type: row.attachment_mime ?? null,
      media_url: row.attachment_path ? (urls.get(row.attachment_path) ?? null) : null,
      mine: row.author_id === access.user.id,
    })),
    online: online.count || 0,
    tier: access.tier,
  });
}

function rpcFailure(error: { code?: string }) {
  if (setupMissing(error)) return setupRequired();
  const status =
    error.code === 'PT429'
      ? 429
      : error.code === '42501'
        ? 403
        : error.code === '22023'
          ? 400
          : error.code === 'P0002'
            ? 404
            : 503;
  const key = {
    429: 'rate_limited',
    403: 'membership_required',
    400: 'invalid_request',
    404: 'not_found',
    503: 'service_unavailable',
  }[status];
  return communityResponse({ error: key }, status);
}

export async function POST(request: Request) {
  const access = await requireMembership(request);
  if ('failure' in access) return access.failure;
  let body: unknown;
  try {
    body = await readBoundedJson(request, 20_000);
  } catch (error) {
    return communityResponse(
      { error: 'invalid_request' },
      error instanceof RequestBodyError ? error.status : 400,
    );
  }
  const parsed = Input.safeParse(body);
  if (!parsed.success) return communityResponse({ error: 'invalid_request' }, 400);
  const input = parsed.data;
  const { client, user } = access;

  if (input.kind === 'upload') {
    const problem = communityMediaProblem(input.type, input.size);
    if (problem)
      return communityResponse({ error: problem === 'type' ? 'invalid_type' : 'too_large' }, 400);
    if (!isCommunityMediaType(input.type)) return communityResponse({ error: 'invalid_type' }, 400);
    // The path is chosen here: the caller's own folder and a random name.
    const path = `${user.id}/${crypto.randomUUID()}.${COMMUNITY_MEDIA_TYPES[input.type].ext}`;
    const signed = await client.storage.from(COMMUNITY_BUCKET).createSignedUploadUrl(path);
    if (signed.error || !signed.data) return setupOrUnavailable(signed.error);
    return communityResponse({ path, token: signed.data.token }, 201);
  }

  if (input.kind === 'delete') {
    const result = await client.rpc('react_mentor_delete_message', { message_id: input.id });
    if (result.error) return rpcFailure(result.error);
    if (typeof result.data === 'string' && result.data)
      await client.storage.from(COMMUNITY_BUCKET).remove([result.data]);
    return communityResponse({ ok: true });
  }

  if (input.kind === 'heartbeat' || input.kind === 'leave') {
    const result = await client.rpc('react_mentor_chat_heartbeat', {
      leaving: input.kind === 'leave',
    });
    return result.error ? rpcFailure(result.error) : communityResponse({ ok: true });
  }

  const result =
    input.kind === 'message'
      ? await client.rpc('react_mentor_send_message', { message_body: input.text })
      : input.kind === 'code'
        ? await client.rpc('react_mentor_send_post', {
            post_kind: 'code',
            post_body: input.text,
            post_code_language: input.language ?? null,
            post_attachment_path: null,
          })
        : await client.rpc('react_mentor_send_post', {
            post_kind: /\.(mp4|webm)$/.test(input.path) ? 'video' : 'image',
            post_body: input.text ?? '',
            post_code_language: null,
            post_attachment_path: input.path,
          });
  if (result.error) return rpcFailure(result.error);
  return communityResponse({ ok: true }, 201);
}

function setupOrUnavailable(error: { message?: string } | null) {
  // Storage answers "Bucket not found" until the migration has created the bucket.
  if (error?.message && /bucket not found/i.test(error.message)) return setupRequired();
  return communityResponse({ error: 'service_unavailable' }, 503);
}
