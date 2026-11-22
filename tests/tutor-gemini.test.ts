// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_GEMINI_MODEL,
  FALLBACK_GEMINI_MODEL,
  requestTutorCompletion,
  selectTutorProvider,
  TutorProviderError,
} from '@/lib/tutor/provider';

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe('Gemini adapter', () => {
  it('selects Gemini with a secret server key and rejects legacy AnyModel env vars', () => {
    expect(selectTutorProvider({ GEMINI_API_KEY: 'test-secret' })).toMatchObject({
      kind: 'gemini',
      model: DEFAULT_GEMINI_MODEL,
    });
    expect(
      selectTutorProvider({ AI_TUTOR_PROVIDER: 'gemini', AI_PROVIDER_KEY: 'legacy' }),
    ).toBeNull();
    expect(
      selectTutorProvider({ AI_TUTOR_PROVIDER: 'anymodel', AI_PROVIDER_KEY: 'legacy' }),
    ).toBeNull();
    expect(selectTutorProvider({ AI_PROVIDER_KEY: 'legacy' })).toBeNull();
  });

  it('calls Google API with thinkingBudget 0, filters thought parts and keeps key server-side', async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        candidates: [
          {
            content: {
              parts: [
                { thought: true, text: 'hidden internal reasoning' },
                { text: 'React state stores component data.' },
              ],
            },
            groundingMetadata: {
              groundingChunks: [
                { web: { uri: 'https://react.dev/learn/state', title: 'React Docs' } },
                { web: { uri: 'javascript:alert(1)', title: 'Bad Link' } },
              ],
            },
          },
        ],
        usageMetadata: { totalTokenCount: 23 },
      }),
    );
    const result = await requestTutorCompletion(
      selectTutorProvider({ GEMINI_API_KEY: 'test-secret' })!,
      [
        { role: 'system', content: 'DevAtlas tutor' },
        { role: 'user', content: 'Explain React state' },
      ],
      640,
      { webSearch: true },
    );
    expect(result).toEqual({
      reply: 'React state stores component data.',
      totalTokens: 23,
      webSources: [{ title: 'React Docs', url: 'https://react.dev/learn/state' }],
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain(`/models/${DEFAULT_GEMINI_MODEL}:generateContent`);
    expect(init.headers['x-goog-api-key']).toBe('test-secret');
    expect(init.headers.Authorization).toBeUndefined();
    const payload = JSON.parse(init.body);
    expect(payload.systemInstruction.parts[0].text).toContain('DevAtlas');
    expect(payload.generationConfig.thinkingConfig).toEqual({ thinkingBudget: 0 });
    expect(payload.tools).toEqual([{ google_search: {} }]);
  });

  it('retries cleanly without google_search when grounding returns 429 and falls back on 503', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('grounding quota exceeded', { status: 429 }))
      .mockResolvedValueOnce(new Response('high demand', { status: 503 }))
      .mockResolvedValueOnce(
        Response.json({
          candidates: [{ content: { parts: [{ text: 'Fallback answer.' }] } }],
          usageMetadata: { totalTokenCount: 18 },
        }),
      );
    const result = await requestTutorCompletion(
      selectTutorProvider({ GEMINI_API_KEY: 'test-secret' })!,
      [{ role: 'user', content: 'HTML чист?' }],
      640,
      { webSearch: true },
    );
    expect(result).toEqual({ reply: 'Fallback answer.', totalTokens: 18 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[2][0]).toContain(`/models/${FALLBACK_GEMINI_MODEL}:generateContent`);
  });

  it('sanitizes errors', async () => {
    fetchMock.mockResolvedValue(new Response('secret-provider-details', { status: 429 }));
    await expect(
      requestTutorCompletion(selectTutorProvider({ GEMINI_API_KEY: 'test-secret' })!, [], 640),
    ).rejects.toBeInstanceOf(TutorProviderError);
  });
});
