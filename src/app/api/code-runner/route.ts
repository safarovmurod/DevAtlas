import { NextResponse } from 'next/server';
import { z } from 'zod';
import { readBoundedJson, RequestBodyError } from '@/lib/security/request';

export const SANDBOX_LANGUAGES = [
  'python',
  'javascript',
  'typescript',
  'cpp',
  'java',
  'go',
  'rust',
  'csharp',
  'php',
  'ruby',
  'bash',
] as const;

export type SandboxLanguage = (typeof SANDBOX_LANGUAGES)[number];

const PISTON_MAP: Record<SandboxLanguage, { language: string; version: string; filename: string }> = {
  python: { language: 'python', version: '3.10.0', filename: 'main.py' },
  javascript: { language: 'javascript', version: '18.15.0', filename: 'main.js' },
  typescript: { language: 'typescript', version: '5.0.3', filename: 'main.ts' },
  cpp: { language: 'c++', version: '10.2.0', filename: 'main.cpp' },
  java: { language: 'java', version: '15.0.2', filename: 'Main.java' },
  go: { language: 'go', version: '1.16.2', filename: 'main.go' },
  rust: { language: 'rust', version: '1.68.2', filename: 'main.rs' },
  csharp: { language: 'csharp', version: '6.12.0', filename: 'Main.cs' },
  php: { language: 'php', version: '8.2.3', filename: 'main.php' },
  ruby: { language: 'ruby', version: '3.0.1', filename: 'main.rb' },
  bash: { language: 'bash', version: '5.2.0', filename: 'main.sh' },
};

const RunSchema = z.object({
  language: z.enum(SANDBOX_LANGUAGES),
  code: z.string().min(1).max(20_000),
  stdin: z.string().max(4000).optional().default(''),
});

function configuredRunnerUrl(): string {
  const url = process.env.CODE_RUNNER_API_URL?.trim() || '';
  return /^https?:\/\//i.test(url) ? url.replace(/\/+$/, '') : '';
}

export async function GET() {
  const url = configuredRunnerUrl();
  return NextResponse.json({
    configured: Boolean(url),
    languages: SANDBOX_LANGUAGES,
  });
}

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await readBoundedJson(request, 32_768);
  } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : 400;
    return NextResponse.json({ error: 'invalid_json' }, { status });
  }

  const parsed = RunSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const runnerUrl = configuredRunnerUrl();
  if (!runnerUrl) {
    return NextResponse.json(
      {
        error: 'runner_not_configured',
        message:
          'Server code runner is not configured yet. Set CODE_RUNNER_API_URL (Piston-compatible execute endpoint) on the server, or run JavaScript directly in the browser tab.',
      },
      { status: 503 },
    );
  }

  const spec = PISTON_MAP[parsed.data.language];
  try {
    const response = await fetch(runnerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.CODE_RUNNER_API_KEY?.trim()
          ? { Authorization: `Bearer ${process.env.CODE_RUNNER_API_KEY.trim()}` }
          : {}),
      },
      body: JSON.stringify({
        language: spec.language,
        version: spec.version,
        files: [{ name: spec.filename, content: parsed.data.code }],
        stdin: parsed.data.stdin,
        run_timeout: 5000,
        compile_timeout: 8000,
      }),
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'runner_upstream_error' }, { status: 502 });
    }

    const result = (await response.json()) as {
      run?: { stdout?: string; stderr?: string; code?: number };
      compile?: { stdout?: string; stderr?: string; code?: number };
    };
    const stdout = String(result.run?.stdout ?? '').slice(0, 16_000);
    const stderr = String(result.compile?.stderr || result.run?.stderr || '').slice(0, 16_000);
    const exitCode = typeof result.run?.code === 'number' ? result.run.code : 0;

    return NextResponse.json({ ok: true, stdout, stderr, exitCode });
  } catch {
    return NextResponse.json({ error: 'runner_timeout' }, { status: 504 });
  }
}
