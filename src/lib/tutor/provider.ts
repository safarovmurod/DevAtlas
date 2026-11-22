import type { TutorWebSource } from './shared';

// Server-only API adapter. Never send the API key to the browser.
export interface TutorMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
export type TutorProvider = { kind: 'gemini' | 'anymodel'; key: string; model: string };
export class TutorProviderError extends Error {
  constructor(
    readonly status: 429 | 502,
    message: string,
  ) {
    super(message);
  }
}

export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash';
export const FALLBACK_GEMINI_MODEL = 'gemini-3.5-flash-lite';

export function selectTutorProvider(
  env: Record<string, string | undefined> = process.env,
): TutorProvider | null {
  const geminiKey = env.GEMINI_API_KEY?.trim();
  const anymodelKey = env.AI_PROVIDER_KEY?.trim();
  const configuredKind = env.AI_TUTOR_PROVIDER?.trim();
  const kind = configuredKind || (geminiKey ? 'gemini' : 'anymodel');
  if (kind === 'gemini' && geminiKey) {
    const configured = env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
    return {
      kind: 'gemini',
      key: geminiKey,
      model: /^gemini-[a-z0-9.-]+$/.test(configured) ? configured : DEFAULT_GEMINI_MODEL,
    };
  }
  if (kind === 'anymodel' && anymodelKey)
    return {
      kind: 'anymodel',
      key: anymodelKey,
      model: env.AI_MODEL?.trim() || 'cx/gpt-6.1-sol',
    };
  return null;
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

function supportsThinkingConfig(model: string): boolean {
  return /^gemini-(?:2\.5|3\.)/.test(model);
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
      signal: AbortSignal.timeout(45000),
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
  const gemini = provider.kind === 'gemini';
  let response: Response;
  if (gemini) {
    const wantSearch = Boolean(options.webSearch);
    response = await callGemini(
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
    // Temporary high demand (503) or retired model (404): fall back once to Gemini Flash Lite.
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
  } else {
    response = await fetch('https://anymodel.org/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + provider.key },
      body: JSON.stringify({ model: provider.model, messages, max_tokens: maxOutputTokens }),
      signal: AbortSignal.timeout(45000),
      cache: 'no-store',
    });
  }
  if (!response.ok) failure(response.status);
  const data: unknown = await response.json();
  if (!data || typeof data !== 'object') failure(502);
  let reply: unknown, usage: unknown;
  let webSources: TutorWebSource[] = [];
  if (gemini) {
    const d = data as {
      candidates?: {
        content?: { parts?: { text?: unknown; thought?: unknown }[] };
        groundingMetadata?: unknown;
      }[];
      usageMetadata?: { totalTokenCount?: unknown };
    };
    const candidate = d.candidates?.[0];
    reply = candidate?.content?.parts
      ?.filter((p) => p.thought !== true)
      .map((p) => (typeof p.text === 'string' ? p.text : ''))
      .join('');
    usage = d.usageMetadata?.totalTokenCount;
    webSources = extractSafeWebSources(candidate?.groundingMetadata);
  } else {
    const d = data as {
      choices?: { message?: { content?: unknown } }[];
      usage?: { total_tokens?: unknown };
    };
    reply = d.choices?.[0]?.message?.content;
    usage = d.usage?.total_tokens;
  }
  if (typeof reply !== 'string' || !reply.trim() || reply.length > 20000) failure(502);
  const totalTokens = safeUsage(usage);
  return {
    reply: reply.trim(),
    ...(totalTokens === undefined ? {} : { totalTokens }),
    ...(webSources.length ? { webSources } : {}),
  };
}
