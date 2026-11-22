import { NextRequest } from 'next/server';
import { z } from 'zod';
import { featurePlanAccess } from '@/lib/practice/plan-access';
import { readBoundedJson, RequestBodyError } from '@/lib/security/request';

export const runtime = 'nodejs';
export const maxDuration = 35;

const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const TRANSLIT_MODEL = 'gemini-3.5-flash-lite';
const SAMPLE_RATE = 24_000;

const BodySchema = z.object({
  text: z.string().trim().min(1).max(700),
  language: z.enum(['tg', 'ru', 'en', 'es']).default('tg'),
});

// Cheap per-user throttle so rapid taps cannot flood TTS quota.
const lastSpokenAt = new Map<string, number>();

function cleanSpeechText(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[*_#<>~]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 560);
}

/** Deterministic Tajik Cyrillic -> Perso-Arabic phonetic fallback when transliteration model fails. */
function tajikCyrillicToPersianFallback(input: string): string {
  const map: Record<string, string> = {
    а: 'ا',
    б: 'ب',
    в: 'و',
    г: 'گ',
    ғ: 'غ',
    д: 'د',
    е: 'ی',
    ё: 'یا',
    ж: 'ژ',
    з: 'ز',
    и: 'ی',
    ӣ: 'ی',
    й: 'ی',
    к: 'ک',
    қ: 'ق',
    л: 'ل',
    м: 'م',
    н: 'ن',
    о: 'آ',
    п: 'پ',
    р: 'ر',
    с: 'س',
    т: 'ت',
    у: 'و',
    ӯ: 'و',
    ф: 'ف',
    х: 'خ',
    ҳ: 'ه',
    ч: 'چ',
    ҷ: 'ج',
    ш: 'ش',
    ъ: 'ع',
    э: 'ا',
    ю: 'یو',
    я: 'یا',
  };
  let out = '';
  for (const ch of input.toLowerCase()) {
    out += map[ch] ?? ch;
  }
  return out;
}

/**
 * Gemini 2.5 Flash Preview TTS supports Persian/Farsi script with studio-quality human voices,
 * while Tajik Cyrillic returns finishReason=OTHER. Converting Tajik Cyrillic into natural
 * Persian-Tajik script (preserving Tajik vocabulary & Dushanbe pronunciation) lets Gemini speak
 * clear, warm, natural human Tajik!
 */
async function prepareTajikForTts(text: string, apiKey: string): Promise<string> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${TRANSLIT_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        signal: AbortSignal.timeout(8_000),
        cache: 'no-store',
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    'Convert the following Tajik Cyrillic sentence into Persian script EXACTLY word-for-word for natural Tajik speech synthesis. Keep the exact Tajik words and Tajik pronunciation (do not replace Tajik words with Iranian slang; spell English tech terms phonetically like React -> ری‌اکت, JavaScript -> جاوااسکریپت, HTML -> اچ‌تی‌ام‌ال, CSS -> سی‌اس‌اس, DevAtlas -> دیو اطلس). Output ONLY the converted text, nothing else:\n' +
                    text,
                },
              ],
            },
          ],
          generationConfig: { maxOutputTokens: 280, temperature: 0.1 },
        }),
      },
    );
    if (!res.ok) return tajikCyrillicToPersianFallback(text);
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const converted = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? '')
      .join('')
      .trim();
    return converted && converted.length >= 2 ? converted : tajikCyrillicToPersianFallback(text);
  } catch {
    return tajikCyrillicToPersianFallback(text);
  }
}

/** Wraps raw 16-bit signed mono PCM bytes into a standard RIFF/WAV buffer playable by all browsers. */
function pcm16ToWav(pcm: Buffer, sampleRate = SAMPLE_RATE, channels = 1): Buffer {
  const byteRate = sampleRate * channels * 2;
  const blockAlign = channels * 2;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(16, 34); // bits per sample
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

const VOICE_STYLE: Record<'tg' | 'ru' | 'en' | 'es', { voice: string; directive: string }> = {
  tg: {
    voice: 'Puck',
    directive:
      'Read aloud warmly, clearly, and naturally like an experienced Tajik coding mentor speaking to a student in Dushanbe:',
  },
  ru: {
    voice: 'Puck',
    directive:
      'Read aloud warmly, clearly, and naturally like a helpful Russian programming teacher explaining a lesson:',
  },
  en: {
    voice: 'Zephyr',
    directive:
      'Read aloud warmly, clearly, and naturally like an encouraging programming instructor:',
  },
  es: {
    voice: 'Aoede',
    directive:
      'Read aloud warmly, clearly, and naturally like a friendly Spanish programming instructor:',
  },
};

export async function POST(req: NextRequest) {
  const access = await featurePlanAccess(req, 'voiceAssistant');
  if (access.denial) return access.denial;

  const apiKey =
    process.env.GEMINI_VOICE_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim() || '';
  if (!apiKey) {
    return Response.json(
      { error: 'voice_unavailable' },
      { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }

  let body: unknown;
  try {
    body = await readBoundedJson(req, 4096);
  } catch (cause) {
    return Response.json(
      { error: 'invalid_request' },
      {
        status: cause instanceof RequestBodyError ? cause.status : 400,
        headers: { 'Cache-Control': 'private, no-store' },
      },
    );
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'invalid_request' },
      { status: 400, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }

  const rateKey = access.userId ?? 'local';
  const now = Date.now();
  if (!access.isPrivileged && now - (lastSpokenAt.get(rateKey) ?? 0) < 1200) {
    return Response.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }
  lastSpokenAt.set(rateKey, now);
  if (lastSpokenAt.size > 2000) {
    for (const [k, ts] of lastSpokenAt) if (now - ts > 60_000) lastSpokenAt.delete(k);
  }

  const cleaned = cleanSpeechText(parsed.data.text);
  if (!cleaned) {
    return Response.json(
      { error: 'invalid_request' },
      { status: 400, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }

  const { language } = parsed.data;
  const style = VOICE_STYLE[language];
  const speechInput = language === 'tg' ? await prepareTajikForTts(cleaned, apiKey) : cleaned;

  try {
    const ttsRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        signal: AbortSignal.timeout(22_000),
        cache: 'no-store',
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${style.directive} ${speechInput}` }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: style.voice },
              },
            },
          },
        }),
      },
    );
    if (!ttsRes.ok) {
      return Response.json(
        { error: 'voice_unavailable' },
        { status: 502, headers: { 'Cache-Control': 'private, no-store' } },
      );
    }
    const payload = (await ttsRes.json()) as {
      candidates?: {
        content?: { parts?: { inlineData?: { mimeType?: string; data?: string } }[] };
      }[];
    };
    const inline = payload.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!inline?.data) {
      return Response.json(
        { error: 'voice_unavailable' },
        { status: 502, headers: { 'Cache-Control': 'private, no-store' } },
      );
    }

    const rawBytes = Buffer.from(inline.data, 'base64');
    const mime = (inline.mimeType ?? '').toLowerCase();
    const rateMatch = mime.match(/rate=(\d+)/);
    const sampleRate = rateMatch ? Number(rateMatch[1]) || SAMPLE_RATE : SAMPLE_RATE;
    const isPcm = mime.includes('pcm') || mime.includes('l16');
    const audioBuffer = isPcm ? pcm16ToWav(rawBytes, sampleRate) : rawBytes;
    const contentType = isPcm ? 'audio/wav' : inline.mimeType || 'audio/wav';

    return new Response(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(audioBuffer.length),
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return Response.json(
      { error: 'voice_unavailable' },
      { status: 502, headers: { 'Cache-Control': 'private, no-store' } },
    );
  }
}
