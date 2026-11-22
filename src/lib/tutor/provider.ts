import type { TutorWebSource } from './shared';

// Server-only Gemini API adapter. Never send the API key to the browser.
export interface TutorMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
export type TutorProvider = { kind: 'gemini'; key: string; model: string };
export class TutorProviderError extends Error {
  constructor(
    readonly status: 429 | 502,
    message: string,
  ) {
    super(message);
  }
}

// Flash Lite responds in ~1.2-2.5s (vs ~14s for non-lite) while keeping high quality across TG/RU/EN/ES.
export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite';
export const FALLBACK_GEMINI_MODEL = 'gemini-3.5-flash';

export function selectTutorProvider(
  env: Record<string, string | undefined> = process.env,
  channel: 'chat' | 'voice' = 'chat',
): TutorProvider | null {
  const configuredKind = env.AI_TUTOR_PROVIDER?.trim();
  if (configuredKind && configuredKind !== 'gemini') return null;
  const voiceKey = channel === 'voice' ? env.GEMINI_VOICE_API_KEY?.trim() : undefined;
  const geminiKey = voiceKey || env.GEMINI_API_KEY?.trim();
  if (!geminiKey) return null;
  const configured = env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
  return {
    kind: 'gemini',
    key: geminiKey,
    model: /^gemini-[a-z0-9.-]+$/.test(configured) ? configured : DEFAULT_GEMINI_MODEL,
  };
}

const safeUsage = (n: unknown) =>
  typeof n === 'number' && Number.isSafeInteger(n) && n >= 0 ? n : undefined;

function failure(status: number): never {
  throw new TutorProviderError(
    status === 429 ? 429 : 502,
    status === 429
      ? 'Лимити AI тамом шуд.'
      : status === 401 || status === 403
        ? 'Калиди AI ё дастрасӣ ба модел қабул нашуд.'
        : 'Хидмати AI ҳоло дастнорас аст.',
  );
}

/** Lite models reject thinkingConfig with 400 INVALID_ARGUMENT; only non-lite 2.5/3.x support it. */
function supportsThinkingConfig(model: string): boolean {
  return /^gemini-(?:2\.5|3\.)/.test(model) && !/lite/i.test(model);
}

function extractSafeWebSources(groundingMetadata: unknown): TutorWebSource[] {
  if (!groundingMetadata || typeof groundingMetadata !== 'object') return [];
  const chunks = (groundingMetadata as { groundingChunks?: unknown }).groundingChunks;
  if (!Array.isArray(chunks)) return [];
  const out: TutorWebSource[] = [];
  const seen = new Set<string>();
  for (const chunk of chunks) {
    if (!chunk || typeof chunk !== 'object') continue;
    const web = (chunk as { web?: { uri?: unknown; title?: unknown } }).web;
    if (!web || typeof web.uri !== 'string') continue;
    try {
      const parsed = new URL(web.uri);
      if (parsed.protocol !== 'https:') continue;
      const url = parsed.toString();
      if (seen.has(url)) continue;
      seen.add(url);
      const title =
        typeof web.title === 'string' && web.title.trim()
          ? web.title.trim().slice(0, 120)
          : parsed.hostname;
      out.push({ title, url });
      if (out.length >= 3) break;
    } catch {
      continue;
    }
  }
  return out;
}

async function callGemini(
  key: string,
  model: string,
  messages: TutorMessage[],
  maxOutputTokens: number,
  webSearch: boolean,
) {
  const generationConfig: Record<string, unknown> = {
    maxOutputTokens,
    temperature: 0.4,
  };
  if (supportsThinkingConfig(model)) {
    generationConfig.thinkingConfig = { thinkingBudget: 0 };
  }
  const body: Record<string, unknown> = {
    systemInstruction: {
      parts: [
        {
          text: messages
            .filter((m) => m.role === 'system')
            .map((m) => m.content)
            .join('\n\n'),
        },
      ],
    },
    contents: messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    generationConfig,
  };
  if (webSearch) {
    body.tools = [{ google_search: {} }];
  }
  return fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(35000),
      cache: 'no-store',
    },
  );
}

export async function requestTutorCompletion(
  provider: TutorProvider,
  messages: TutorMessage[],
  maxOutputTokens: number,
  options: { webSearch?: boolean } = {},
) {
  const wantSearch = Boolean(options.webSearch);
  let response = await callGemini(
    provider.key,
    provider.model,
    messages,
    maxOutputTokens,
    wantSearch,
  );
  // Free-tier keys may return 429/400 for google_search grounding while normal generation works.
  if (!response.ok && wantSearch && (response.status === 429 || response.status === 400)) {
    response = await callGemini(provider.key, provider.model, messages, maxOutputTokens, false);
  }
  // Temporary high demand (503) or retired model (404): fall back once to secondary Gemini model.
  if (
    !response.ok &&
    (response.status === 503 || response.status === 404) &&
    provider.model !== FALLBACK_GEMINI_MODEL
  ) {
    response = await callGemini(
      provider.key,
      FALLBACK_GEMINI_MODEL,
      messages,
      maxOutputTokens,
      false,
    );
  }
  if (!response.ok) failure(response.status);
  const data: unknown = await response.json();
  if (!data || typeof data !== 'object') failure(502);
  const d = data as {
    candidates?: {
      content?: { parts?: { text?: unknown; thought?: unknown }[] };
      groundingMetadata?: unknown;
    }[];
    usageMetadata?: { totalTokenCount?: unknown };
  };
  const candidate = d.candidates?.[0];
  const reply = candidate?.content?.parts
    ?.filter((p) => p.thought !== true)
    .map((p) => (typeof p.text === 'string' ? p.text : ''))
    .join('');
  const usage = d.usageMetadata?.totalTokenCount;
  const webSources = extractSafeWebSources(candidate?.groundingMetadata);
  if (typeof reply !== 'string' || !reply.trim() || reply.length > 20000) failure(502);
  const totalTokens = safeUsage(usage);
  return {
    reply: reply.trim(),
    ...(totalTokens === undefined ? {} : { totalTokens }),
    ...(webSources.length ? { webSources } : {}),
  };
}
