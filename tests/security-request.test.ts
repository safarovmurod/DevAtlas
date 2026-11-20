import { afterEach, describe, expect, it, vi } from 'vitest';
import { readBoundedJson } from '@/lib/security/request';
import { runFunction } from '@/lib/grading/function-runner';

const navMocks = vi.hoisted(() => ({
  redirect: vi.fn((url: string) => {
    throw Object.assign(new Error('NEXT_REDIRECT'), { url });
  }),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));
vi.mock('next/navigation', () => ({
  redirect: navMocks.redirect,
  notFound: navMocks.notFound,
}));

function request(body: string, headers?: HeadersInit) {
  return new Request('https://example.test/api', { method: 'POST', body, headers });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('bounded API JSON parsing', () => {
  it('accepts a valid body at its byte limit', async () => {
    await expect(readBoundedJson(request('{"ok":true}'), 11)).resolves.toEqual({ ok: true });
  });

  it('checks actual bytes even when content-length is absent or forged', async () => {
    for (const headers of [undefined, { 'content-length': '1' }]) {
      await expect(readBoundedJson(request('{"text":"too long"}', headers), 10)).rejects.toMatchObject({ status: 413 });
    }
  });

  it('counts multibyte UTF-8 rather than JavaScript character length', async () => {
    await expect(readBoundedJson(request('"你好"'), 7)).rejects.toMatchObject({ status: 413 });
    await expect(readBoundedJson(request('"你好"'), 8)).resolves.toBe('你好');
  });

  it('rejects advertised oversized bodies without reading their stream', async () => {
    const read = vi.fn();
    const cancel = vi.fn().mockResolvedValue(undefined);
    const input = { headers: new Headers({ 'content-length': '100' }), body: { cancel, getReader: read } } as unknown as Request;
    await expect(readBoundedJson(input, 10)).rejects.toMatchObject({ status: 413 });
    expect(cancel).toHaveBeenCalledOnce();
    expect(read).not.toHaveBeenCalled();
  });

  it('rejects malformed, empty and invalid UTF-8 JSON without exposing internals', async () => {
    await expect(readBoundedJson(request('{'))).rejects.toMatchObject({ status: 400, message: 'Invalid JSON body.' });
    await expect(readBoundedJson(new Request('https://example.test/api', { method: 'POST' }))).rejects.toMatchObject({ status: 400 });
    const invalid = new Request('https://example.test/api', { method: 'POST', body: new Uint8Array([34, 255, 34]) });
    await expect(readBoundedJson(invalid)).rejects.toMatchObject({ status: 400 });
  });
});

describe('function-runner browser isolation and message-bridge hardening', () => {
  const sampleTests = [{ name: 'adds numbers', args: [2, 3], expected: 5 }];

  it('refuses to execute on the server when window or document is absent', async () => {
    const originalWindow = globalThis.window;
    try {
      // @ts-expect-error simulating server environment without window
      delete globalThis.window;
      await expect(
        runFunction('export function add(a: number, b: number) { return a + b; }', 'add', sampleTests),
      ).rejects.toThrow(/Browser isolation is required/);
    } finally {
      globalThis.window = originalWindow;
    }
  });

  it('rejects malicious functionName injection, empty tests and oversized code before creating an iframe', async () => {
    const spy = vi.spyOn(document, 'createElement');
    for (const badName of ['add;alert(1)', 'add"]();/*', '123bad', '']) {
      await expect(
        runFunction('function add(a: number, b: number) { return a + b; }', badName, sampleTests),
      ).rejects.toThrow('No executable tests.');
    }
    await expect(
      runFunction('function add(a: number, b: number) { return a + b; }', 'add', []),
    ).rejects.toThrow('No executable tests.');
    await expect(
      runFunction('const x = "' + 'a'.repeat(50_001) + '";', 'add', sampleTests),
    ).rejects.toThrow('Код аз ҳад калон аст.');
    expect(spy).not.toHaveBeenCalled();
  });

  it('runs inside an opaque allow-scripts sandbox with strict CSP and validates worker messages', async () => {
    const token = '11111111-1111-4111-8111-111111111111';
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(token);

    const promise = runFunction(
      'export function add(a: number, b: number) { return a + b; }',
      'add',
      sampleTests,
    );

    let frame: HTMLIFrameElement | null = null;
    await vi.waitFor(() => {
      frame = document.querySelector('iframe[title="Isolated function test"]');
      expect(frame).not.toBeNull();
    });

    expect(frame!.getAttribute('sandbox')).toBe('allow-scripts');
    expect(frame!.getAttribute('sandbox')).not.toContain('allow-same-origin');
    expect(frame!.srcdoc).toContain("default-src 'none'");
    expect(frame!.srcdoc).toContain("connect-src 'none'");
    expect(frame!.srcdoc).toContain("base-uri 'none'; form-action 'none'");
    expect(frame!.srcdoc).toContain("'postMessage','importScripts','Worker','SharedWorker','fetch'");

    const postSpy = vi.fn();
    Object.defineProperty(frame!, 'contentWindow', {
      configurable: true,
      value: { postMessage: postSpy },
    });

    // Forged message from wrong source or wrong token is ignored.
    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: { token, results: [{ name: 'forged', passed: true }] },
      }),
    );
    window.dispatchEvent(
      new MessageEvent('message', {
        source: frame!.contentWindow,
        data: { token: 'wrong-token', ready: true },
      }),
    );
    expect(postSpy).not.toHaveBeenCalled();

    // Legitimate ready handshake dispatches exactly once; duplicate ready is ignored.
    window.dispatchEvent(
      new MessageEvent('message', {
        source: frame!.contentWindow,
        data: { token, ready: true },
      }),
    );
    window.dispatchEvent(
      new MessageEvent('message', {
        source: frame!.contentWindow,
        data: { token, ready: true },
      }),
    );
    expect(postSpy).toHaveBeenCalledTimes(1);

    // Authorized result resolves and removes the sandboxed iframe.
    window.dispatchEvent(
      new MessageEvent('message', {
        source: frame!.contentWindow,
        data: {
          token,
          results: [{ name: 'adds numbers', passed: true, actual: 5, expected: 5 }],
        },
      }),
    );
    await expect(promise).resolves.toEqual([
      { name: 'adds numbers', passed: true, actual: 5, expected: 5 },
    ]);
    expect(document.querySelector('iframe[title="Isolated function test"]')).toBeNull();
  });

  it('fails closed when worker sends malformed or mismatched result payload', async () => {
    const token = '22222222-2222-4222-8222-222222222222';
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(token);

    const promise = runFunction(
      'export function add(a: number, b: number) { return a + b; }',
      'add',
      sampleTests,
    );

    let frame: HTMLIFrameElement | null = null;
    await vi.waitFor(() => {
      frame = document.querySelector('iframe[title="Isolated function test"]');
      expect(frame).not.toBeNull();
    });

    window.dispatchEvent(
      new MessageEvent('message', {
        source: frame!.contentWindow,
        data: { token, results: [{ name: 'spoofed', passed: 'yes' }] },
      }),
    );
    await expect(promise).rejects.toThrow('Хатои иҷрои код.');
  });
});

describe('PracticePage month=3 redirect parameter validation', () => {
  it('redirects valid month=3 day queries and rejects injected or out-of-range day parameters', async () => {
    const { default: PracticePage } = await import('@/app/practice/page');

    await expect(
      PracticePage({ searchParams: Promise.resolve({ month: '3', day: '2' }) }),
    ).rejects.toMatchObject({
      message: 'NEXT_REDIRECT',
      url: '/courses/nextjs/home?day=2#day-practice',
    });

    await expect(
      PracticePage({ searchParams: Promise.resolve({ month: '3' }) }),
    ).rejects.toMatchObject({
      message: 'NEXT_REDIRECT',
      url: '/courses/nextjs/home#day-practice',
    });

    for (const maliciousDay of ['1&injected=1', '1#evil', '0', '-1', '999', 'NaN', '../admin']) {
      await expect(
        PracticePage({ searchParams: Promise.resolve({ month: '3', day: maliciousDay }) }),
      ).rejects.toThrow('NEXT_NOT_FOUND');
    }
  });
});
