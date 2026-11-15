import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const actor = vi.hoisted(() => ({ id: 'account-a' as string | null }));
const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('@/components/account/account-provider', () => ({
  useAccount: () => ({ user: actor.id ? { id: actor.id } : null }),
}));
vi.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      getSession: async () => ({
        data: {
          session: actor.id ? { user: { id: actor.id }, access_token: 'unit-test-token' } : null,
        },
      }),
    },
  }),
}));
import { SiteAgent } from '@/components/agent/site-agent';
import { removeOldAgentChat, agentMaterialLink } from '@/lib/agent/agent-reply';
import { useLearningStore } from '@/stores/learning-store';
import { useAppStore } from '@/stores/app-store';

type FakeUtterance = { text: string; lang: string; onend: (() => void) | null };
type FakeRecognition = {
  lang: string;
  onresult: ((event: { results: { transcript: string }[][] }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

const spoken: FakeUtterance[] = [];
const recognitions: FakeRecognition[] = [];
const synthesis = { cancel: vi.fn(), speak: vi.fn(), getVoices: () => [] };

function installSpeech(recognition = true) {
  spoken.length = 0;
  recognitions.length = 0;
  synthesis.cancel.mockClear();
  synthesis.speak.mockReset();
  synthesis.speak.mockImplementation((utterance: FakeUtterance) => spoken.push(utterance));
  vi.stubGlobal('speechSynthesis', synthesis);
  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    class {
      lang = '';
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(public text: string) {}
    },
  );
  if (recognition)
    vi.stubGlobal(
      'SpeechRecognition',
      class {
        lang = '';
        interimResults = false;
        continuous = false;
        onresult: FakeRecognition['onresult'] = null;
        onerror: FakeRecognition['onerror'] = null;
        onend: (() => void) | null = null;
        start = vi.fn();
        stop = vi.fn();
        abort = vi.fn();
        constructor() {
          recognitions.push(this as unknown as FakeRecognition);
        }
      },
    );
}

beforeEach(() => {
  localStorage.clear();
  actor.id = 'account-a';
  router.push.mockReset();
  useLearningStore.setState({ language: 'en', selectedCourse: 'react' });
  useAppStore.setState({ tutorDrawerOpen: false });
  installSpeech();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const openPanel = () => fireEvent.click(screen.getByRole('button', { name: 'DevAtlas assistant' }));
const tapMic = () => fireEvent.click(screen.getByRole('button', { name: 'Speak' }));
/** The learner says something: the recognizer returns it and stops listening. */
function say(text: string) {
  tapMic();
  const recognizer = recognitions.at(-1)!;
  act(() => recognizer.onresult?.({ results: [[{ transcript: text }]] }));
  act(() => recognizer.onend?.());
}

it('is voice only: no chat list, quick questions, text field, greeting block or history note', () => {
  render(<SiteAgent />);
  openPanel();
  const dialog = screen.getByRole('dialog', { name: 'DevAtlas assistant' });
  expect(within(dialog).getByRole('button', { name: 'Speak' })).toBeVisible();
  expect(within(dialog).getByText('Tap the microphone and speak')).toBeVisible();
  expect(within(dialog).queryByRole('textbox')).not.toBeInTheDocument();
  expect(within(dialog).queryByRole('button', { name: 'Send' })).not.toBeInTheDocument();
  expect(within(dialog).queryByRole('button', { name: 'Clear chat' })).not.toBeInTheDocument();
  for (const removed of [
    /Hi! I am the DevAtlas assistant/,
    /History is separated by account/,
    /The guide explains the platform/,
    /Platform guide \+ answers from course materials/,
    /Where are the courses\?/,
    /What should I do next\?/,
  ])
    expect(dialog.textContent).not.toMatch(removed);
});

it('opens a page when asked by voice and says what it does', () => {
  render(<SiteAgent />);
  openPanel();
  say('open courses');
  expect(router.push).toHaveBeenCalledWith('/courses');
  expect(spoken.at(-1)?.text).toBe('Opening the courses.');
  expect(screen.getByText('You said:')).toBeVisible();
  expect(screen.getByText(/open courses/)).toBeVisible();
});

it('goes to the selected course day from "go to my day"', () => {
  useLearningStore.setState({ selectedCourse: 'html' });
  render(<SiteAgent />);
  openPanel();
  say('go to my day');
  expect(router.push).toHaveBeenCalledWith('/courses/html/home');
});

it('answers questions about the site by voice without any network request', () => {
  const fetcher = vi.fn();
  vi.stubGlobal('fetch', fetcher);
  render(<SiteAgent />);
  openPanel();
  say('how much is the subscription');
  expect(fetcher).not.toHaveBeenCalled();
  expect(spoken.at(-1)?.text).toContain('three plans');
  expect(spoken.at(-1)?.lang).toBe('en-US');
  expect(screen.getByText(/three plans/)).toBeVisible();
  expect(screen.getByRole('link', { name: 'Plans' })).toHaveAttribute('href', '/plans');
});

it('greets back and explains what it can do', () => {
  render(<SiteAgent />);
  openPanel();
  say('hello');
  expect(spoken.at(-1)?.text).toContain('open courses');
  say('what can you do');
  expect(spoken.at(-1)?.text).toContain('I listen and answer by voice');
});

it('asks the tutor about a course topic and speaks only the answer, not labels or code', async () => {
  const fetcher = vi.fn(async () =>
    Response.json({
      mode: 'local',
      reply:
        'Topic: Components\n\nQuestion: What is a component?\n\nAnswer: A component is a small piece of the page.\n\nCode:\nfunction A() {}',
      source: { title: 'Components', href: '/lesson/components' },
    }),
  );
  vi.stubGlobal('fetch', fetcher);
  render(<SiteAgent />);
  openPanel();
  say('explain react components');
  await waitFor(() =>
    expect(spoken.at(-1)?.text).toBe('A component is a small piece of the page.'),
  );
  const request = JSON.parse(
    (fetcher.mock.calls[0] as unknown as [string, RequestInit])[1].body as string,
  );
  expect(request).toMatchObject({ action: 'ask', courseId: 'react', language: 'en' });
  expect(screen.getByRole('link', { name: 'Components' })).toHaveAttribute(
    'href',
    '/lesson/components',
  );
});

it('speaks the unavailable message when the tutor cannot be reached', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
  render(<SiteAgent />);
  openPanel();
  say('explain react components');
  await waitFor(() => expect(spoken.at(-1)?.text).toMatch(/answer service is unavailable/));
});

it('cannot speak a late reply after the signed-in account changed', async () => {
  let resolve!: (value: Response) => void;
  vi.stubGlobal(
    'fetch',
    vi.fn(() => new Promise<Response>((done) => (resolve = done))),
  );
  const view = render(<SiteAgent />);
  openPanel();
  say('explain react components');
  await waitFor(() => expect(screen.getByText('Thinking…')).toBeVisible());
  actor.id = 'account-b';
  view.rerender(<SiteAgent />);
  await act(async () => resolve(Response.json({ reply: 'Late secret from A' })));
  expect(spoken.some((utterance) => utterance.text.includes('Late secret'))).toBe(false);
  openPanel();
  expect(screen.queryByText(/Late secret/)).not.toBeInTheDocument();
});

it('stops listening and speaking when the panel is closed with Escape', () => {
  render(<SiteAgent />);
  const launcher = screen.getByRole('button', { name: 'DevAtlas assistant' });
  openPanel();
  say('hello');
  expect(screen.getByRole('button', { name: 'Stop the voice' })).toBeVisible();
  synthesis.cancel.mockClear();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(synthesis.cancel).toHaveBeenCalled();
  expect(launcher).toHaveFocus();
});

it('stops the voice on request and answers "stop" without a reply', () => {
  render(<SiteAgent />);
  openPanel();
  say('hello');
  act(() => spoken.at(-1)?.onend?.());
  expect(screen.getByText('Tap the microphone and speak')).toBeVisible();
  const before = spoken.length;
  say('stop');
  expect(spoken).toHaveLength(before);
});

it('shows a hint and keeps working when the microphone is blocked', () => {
  render(<SiteAgent />);
  openPanel();
  tapMic();
  const recognizer = recognitions.at(-1)!;
  act(() => recognizer.onerror?.({ error: 'not-allowed' }));
  act(() => recognizer.onend?.());
  expect(screen.getByText(/Microphone access is blocked/)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Speak' })).toBeEnabled();
});

it('points to the AI Tutor chat in a browser that cannot listen', () => {
  vi.unstubAllGlobals();
  installSpeech(false);
  render(<SiteAgent />);
  openPanel();
  expect(screen.queryByRole('button', { name: 'Speak' })).not.toBeInTheDocument();
  expect(screen.getByText(/cannot listen to your voice/)).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Open AI Tutor' }));
  expect(useAppStore.getState().tutorDrawerOpen).toBe(true);
});

it('opens the AI Tutor chat when asked by voice', () => {
  render(<SiteAgent />);
  openPanel();
  say('open AI Tutor');
  expect(useAppStore.getState().tutorDrawerOpen).toBe(true);
  expect(spoken.at(-1)?.text).toBe('Opening AI Tutor.');
});

it('removes the saved text chat of the current owner only', () => {
  localStorage.setItem('devatlas-agent-chat-v2:account:account-a', '[{"id":"1"}]');
  localStorage.setItem('devatlas-agent-chat-v2:account:account-b', '[{"id":"2"}]');
  localStorage.setItem('devatlas-agent-chat-v1', '[{"id":"old"}]');
  render(<SiteAgent />);
  expect(localStorage.getItem('devatlas-agent-chat-v2:account:account-a')).toBeNull();
  expect(localStorage.getItem('devatlas-agent-chat-v2:account:account-b')).not.toBeNull();
  expect(localStorage.getItem('devatlas-agent-chat-v1')).not.toBeNull();
  removeOldAgentChat(
    {
      removeItem: () => {
        throw new Error('denied');
      },
    },
    null,
  );
});

it('accepts only same-site source links', () => {
  expect(agentMaterialLink({ title: 'Lesson', href: '/lesson/a' })).toEqual({
    label: 'Lesson',
    href: '/lesson/a',
  });
  for (const href of ['javascript:alert(1)', '//evil.example', 'https://evil.example', '/a\\b'])
    expect(agentMaterialLink({ title: 'Bad', href })).toBeNull();
});
