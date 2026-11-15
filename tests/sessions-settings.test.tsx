import type { SupabaseClient } from '@supabase/supabase-js';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { SessionsSettings } from '@/components/account/sessions-settings';
import { SESSIONS_COPY } from '@/components/account/sessions-settings-copy';
import type { useAccount } from '@/components/account/account-provider';
import { INTERFACE_LOCALES } from '@/lib/locale';
import { useLearningStore } from '@/stores/learning-store';

const mocked = vi.hoisted(() => ({
  account: null as ReturnType<typeof useAccount> | null,
  client: null as SupabaseClient | null,
}));
vi.mock('@/components/account/account-provider', () => ({ useAccount: () => mocked.account }));
vi.mock('@/lib/supabase/client', () => ({ getSupabaseBrowserClient: () => mocked.client }));

function token(claims: Record<string, unknown>) {
  const encode = (value: unknown) => btoa(JSON.stringify(value));
  return encode({ alg: 'ES256' }) + '.' + encode(claims) + '.signature';
}
const session = {
  access_token: token({ session_id: 'abcd1234-aaaa-bbbb-cccc-ddddeeeeffff', iat: 1793000000 }),
  user: {
    id: 'account-a',
    app_metadata: { provider: 'google' },
    last_sign_in_at: '2026-11-01T08:00:00.000Z',
  },
};
const copy = SESSIONS_COPY.en;
const signOutHere = vi.fn().mockResolvedValue(undefined);

function backend(signOut = vi.fn().mockResolvedValue({ error: null })) {
  const getSession = vi.fn().mockResolvedValue({ data: { session }, error: null });
  mocked.client = { auth: { getSession, signOut } } as unknown as SupabaseClient;
  return { getSession, signOut };
}
function signedIn(id: string | null = 'account-a') {
  mocked.account = {
    user: id ? { id } : null,
    signOut: signOutHere,
  } as unknown as ReturnType<typeof useAccount>;
}

beforeEach(() => {
  useLearningStore.setState({ language: 'en' });
  signOutHere.mockClear();
  signedIn();
});
afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
  mocked.account = null;
  mocked.client = null;
});

it('explains to a guest that sessions need sign-in and offers the login', () => {
  signedIn(null);
  backend();
  render(<SessionsSettings />);
  expect(screen.getByRole('heading', { name: copy.title })).toBeVisible();
  expect(screen.getByText(copy.guestHint)).toBeVisible();
  expect(screen.getByRole('link', { name: copy.guestLogin })).toHaveAttribute('href', '/login');
  expect(screen.queryByRole('button', { name: copy.signOutOthers })).not.toBeInTheDocument();
});

it('shows the real session of this device read from the saved sign-in', async () => {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36',
  );
  const b = backend();
  render(<SessionsSettings />);
  const device = screen.getByTestId('this-device');
  await waitFor(() => expect(within(device).getByText('abcd1234')).toBeVisible());
  expect(b.getSession).toHaveBeenCalled();
  expect(within(device).getByText('Google')).toBeVisible();
  expect(within(device).getByText('Chrome · Windows')).toBeVisible();
  expect(within(device).getByText(copy.current)).toBeVisible();
  expect(within(device).getByText(/2026/)).toBeVisible();
  expect(screen.getByText(copy.othersNote)).toBeVisible();
  // The list of other devices is never invented.
  expect(document.body.textContent).not.toMatch(/iPhone|Android phone/);
});

it('signs out of the other devices and keeps this session open', async () => {
  const b = backend();
  render(<SessionsSettings />);
  fireEvent.click(await screen.findByRole('button', { name: copy.signOutOthers }));
  await screen.findByText(copy.othersDone);
  expect(b.signOut).toHaveBeenCalledExactlyOnceWith({ scope: 'others' });
  expect(signOutHere).not.toHaveBeenCalled();
});

it('reports a failed sign-out of other devices without claiming success', async () => {
  backend(vi.fn().mockResolvedValue({ error: new Error('network') }));
  render(<SessionsSettings />);
  fireEvent.click(await screen.findByRole('button', { name: copy.signOutOthers }));
  expect(await screen.findByRole('alert')).toHaveTextContent(copy.othersError);
  expect(screen.queryByText(copy.othersDone)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: copy.signOutOthers })).toBeEnabled();
});

it('signs out on this device with the account sign-out', async () => {
  backend();
  render(<SessionsSettings />);
  fireEvent.click(await screen.findByRole('button', { name: copy.signOutHere }));
  expect(signOutHere).toHaveBeenCalledOnce();
});

it('shows a clear message when the saved session cannot be read', async () => {
  const getSession = vi.fn().mockRejectedValue(new Error('storage blocked'));
  mocked.client = { auth: { getSession, signOut: vi.fn() } } as unknown as SupabaseClient;
  render(<SessionsSettings />);
  expect(await screen.findByRole('alert')).toHaveTextContent(copy.sessionError);
});

it('follows the interface language', async () => {
  backend();
  render(<SessionsSettings />);
  await screen.findByText('abcd1234');
  for (const locale of INTERFACE_LOCALES) {
    act(() => useLearningStore.getState().setPreferences({ language: locale }));
    expect(screen.getByRole('heading', { name: SESSIONS_COPY[locale].title })).toBeVisible();
    expect(screen.getByRole('button', { name: SESSIONS_COPY[locale].signOutOthers })).toBeVisible();
    expect(screen.getByRole('button', { name: SESSIONS_COPY[locale].signOutHere })).toBeVisible();
  }
});
