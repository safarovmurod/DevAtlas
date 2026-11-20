import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlansScreen } from '@/components/community/plans-screen';
import { MEMBERSHIP_COPY } from '@/lib/billing/copy';
import { useLearningStore } from '@/stores/learning-store';

// The plans page talks to the billing API only through billingFetch, which is mocked here.
const mocks = vi.hoisted(() => ({
  user: null as null | { id: string },
  billingFetch: vi.fn(),
}));
vi.mock('@/components/account/account-provider', () => ({
  useAccount: () => ({ user: mocks.user }),
}));
vi.mock('@/lib/billing/billing-client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/billing/billing-client')>()),
  billingFetch: mocks.billingFetch,
}));
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
import { BillingRequestError } from '@/lib/billing/billing-client';

const copy = MEMBERSHIP_COPY.en;
const DAY = 86_400_000;
const days = (n: number) => new Date(Date.now() + n * DAY).toISOString();
type Membership = {
  tier: 'pro' | 'expert';
  expiresAt: string;
  active: boolean;
  source: 'admin' | 'payment';
  status: string | null;
  cancelAtPeriodEnd: boolean;
  canManage: boolean;
};
const paid = (overrides: Partial<Membership> = {}): Membership => ({
  tier: 'pro',
  expiresAt: days(20),
  active: true,
  source: 'payment',
  status: 'active',
  cancelAtPeriodEnd: false,
  canManage: true,
  ...overrides,
});
let current: { configured: boolean; signedIn: boolean; membership: Membership | null };
const assign = vi.fn();
const original = window.location;

function setLocation(search: string) {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...original, search, assign },
  });
}
const card = (plan: string) => document.querySelector<HTMLElement>(`[data-plan="${plan}"]`)!;
async function ready() {
  render(<PlansScreen />);
  await waitFor(() => expect(mocks.billingFetch).toHaveBeenCalled());
}

beforeEach(() => {
  useLearningStore.setState({ language: 'en' });
  mocks.user = { id: 'user-1' };
  current = { configured: true, signedIn: true, membership: null };
  assign.mockReset();
  setLocation('');
  mocks.billingFetch.mockReset();
  mocks.billingFetch.mockImplementation(async (path: string) => {
    if (path === '/api/billing/status') return current;
    throw new Error('unexpected ' + path);
  });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  Object.defineProperty(window, 'location', { configurable: true, value: original });
});

describe('plans page with payments', () => {
  it('shows $5 and $12 per month and a subscribe button when payments are on', async () => {
    await ready();
    const pro = card('pro');
    expect(await within(pro).findByRole('button', { name: copy.subscribe })).toBeEnabled();
    expect(within(pro).getByText('$5')).toBeVisible();
    expect(within(card('ultra')).getByText('$12')).toBeVisible();
    expect(within(pro).getByText(copy.perMonth)).toBeVisible();
    expect(screen.getByText(copy.taxNote)).toBeVisible();
    expect(screen.getByText(copy.noteLive)).toBeVisible();
    expect(screen.queryByText(copy.unavailable)).not.toBeInTheDocument();
  });

  it('stays honestly disabled when payments are not configured', async () => {
    current = { configured: false, signedIn: true, membership: null };
    await ready();
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: copy.unavailable })).toHaveLength(2),
    );
    expect(screen.queryByRole('button', { name: copy.subscribe })).not.toBeInTheDocument();
    expect(screen.getByText(copy.note)).toBeVisible();
  });

  it('sends a guest to sign in instead of starting a payment', async () => {
    mocks.user = null;
    current = { configured: true, signedIn: false, membership: null };
    await ready();
    const links = await screen.findAllByRole('link', { name: copy.signInToBuy });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/login');
  });

  it('starts the checkout for the chosen plan and redirects to the provider', async () => {
    await ready();
    mocks.billingFetch.mockImplementation(async (path: string) =>
      path === '/api/billing/checkout'
        ? { url: 'https://test.checkout.dodopayments.com/session/cks_1' }
        : current,
    );
    fireEvent.click(await within(card('ultra')).findByRole('button', { name: copy.subscribe }));
    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith('https://test.checkout.dodopayments.com/session/cks_1'),
    );
    expect(mocks.billingFetch).toHaveBeenCalledWith('/api/billing/checkout', {
      method: 'POST',
      body: { tier: 'expert' },
    });
    // The button shows progress and cannot be pressed twice while the redirect happens.
    expect(within(card('ultra')).getByRole('button', { name: copy.opening })).toBeDisabled();
  });

  it('explains each failure and lets the user try again', async () => {
    await ready();
    const cases: [string, string][] = [
      ['already_subscribed', copy.errors.already_subscribed],
      ['manage_in_portal', copy.errors.manage_in_portal],
      ['provider_error', copy.errors.provider_error],
      ['too_many_requests', copy.errors.too_many_requests],
      ['authentication_required', copy.errors.authentication_required],
      ['something_new', copy.errors.generic],
    ];
    for (const [code, text] of cases) {
      mocks.billingFetch.mockImplementation(async (path: string) => {
        if (path === '/api/billing/checkout') throw new BillingRequestError(code, 409);
        return current;
      });
      fireEvent.click(await within(card('pro')).findByRole('button', { name: copy.subscribe }));
      expect(await screen.findByRole('alert')).toHaveTextContent(text);
      await waitFor(() =>
        expect(within(card('pro')).getByRole('button', { name: copy.subscribe })).toBeEnabled(),
      );
    }
    expect(assign).not.toHaveBeenCalled();
  });

  it('shows the current plan with the next charge date and does not offer it again', async () => {
    current = { ...current, membership: paid({ expiresAt: days(20) }) };
    await ready();
    const panel = await screen.findByTestId('current-plan');
    expect(within(panel).getByText(`${copy.currentPlan}: Pro`)).toBeVisible();
    expect(panel.textContent).toContain(copy.renewsOn.replace(' {date}', ''));
    expect(within(card('pro')).getByRole('button', { name: copy.currentPlan })).toBeDisabled();
    expect(within(card('ultra')).getByRole('button', { name: copy.upgrade })).toBeEnabled();
    expect(within(panel).getByRole('button', { name: copy.manage })).toBeEnabled();
  });

  it('shows when a cancelled plan ends, and that Ultra includes Pro', async () => {
    current = {
      ...current,
      membership: paid({ tier: 'expert', cancelAtPeriodEnd: true, status: 'cancelled' }),
    };
    await ready();
    const panel = await screen.findByTestId('current-plan');
    expect(panel.textContent).toContain(copy.endsOn.replace(' {date}', ''));
    expect(within(card('pro')).getByRole('button', { name: copy.includedInPlan })).toBeDisabled();
    expect(within(card('ultra')).getByRole('button', { name: copy.currentPlan })).toBeDisabled();
  });

  it('marks an administrator gift without offering the provider portal', async () => {
    current = { ...current, membership: paid({ source: 'admin', canManage: false, status: null }) };
    await ready();
    const panel = await screen.findByTestId('current-plan');
    expect(panel.textContent).toContain(copy.giftUntil.replace(' {date}', ''));
    expect(within(panel).queryByRole('button', { name: copy.manage })).not.toBeInTheDocument();
  });

  it('tells a customer whose payment failed to update the card in the portal', async () => {
    current = { ...current, membership: paid({ status: 'on_hold', active: false }) };
    await ready();
    expect(await screen.findByText(copy.onHold)).toBeVisible();
  });

  it('opens the customer portal for managing the subscription', async () => {
    current = { ...current, membership: paid() };
    await ready();
    mocks.billingFetch.mockImplementation(async (path: string) =>
      path === '/api/billing/portal'
        ? { url: 'https://test.customer.dodopayments.com/session/portal_1' }
        : current,
    );
    fireEvent.click(await screen.findByRole('button', { name: copy.manage }));
    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith(
        'https://test.customer.dodopayments.com/session/portal_1',
      ),
    );
    expect(mocks.billingFetch).toHaveBeenCalledWith('/api/billing/portal', { method: 'POST' });
  });

  it('refuses to navigate to non-Dodo or javascript: checkout and portal URLs', async () => {
    current = { ...current, membership: paid() };
    await ready();
    for (const badUrl of ['javascript:alert(1)', 'https://evil.example/checkout']) {
      mocks.billingFetch.mockImplementation(async (path: string) =>
        path === '/api/billing/checkout' || path === '/api/billing/portal'
          ? { url: badUrl }
          : current,
      );
      fireEvent.click(await within(card('ultra')).findByRole('button', { name: copy.upgrade }));
      expect(await screen.findByRole('alert')).toHaveTextContent(copy.errors.provider_error);
      fireEvent.click(await screen.findByRole('button', { name: copy.manage }));
      expect(await screen.findByRole('alert')).toHaveTextContent(copy.errors.provider_error);
    }
    expect(assign).not.toHaveBeenCalled();
  });

  it('upgrades a paid Pro in place and waits for the database before saying it worked', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    current = { ...current, membership: paid() };
    await ready();
    mocks.billingFetch.mockImplementation(async (path: string) =>
      path === '/api/billing/checkout' ? { upgraded: true } : current,
    );
    fireEvent.click(await within(card('ultra')).findByRole('button', { name: copy.upgrade }));
    expect(await screen.findByText(copy.upgradeStarted)).toBeVisible();
    expect(assign).not.toHaveBeenCalled();
    current = { ...current, membership: paid({ tier: 'expert' }) };
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3100);
    });
    await waitFor(() => expect(screen.queryByText(copy.upgradeStarted)).not.toBeInTheDocument());
    expect(within(card('ultra')).getByRole('button', { name: copy.currentPlan })).toBeDisabled();
  });
});

describe('coming back from the checkout', () => {
  it('a redirect alone never shows "paid": it waits until the database has the plan', async () => {
    setLocation('?checkout=return&plan=pro&subscription_id=sub_1&status=active');
    await ready();
    expect(await screen.findByText(copy.returnWaiting)).toBeVisible();
    expect(screen.queryByText(/Payment confirmed/)).not.toBeInTheDocument();
    expect(screen.queryByTestId('current-plan')).not.toBeInTheDocument();
  });

  it('shows the confirmation once the webhook has written the plan (after a few seconds)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    setLocation('?checkout=return&plan=ultra');
    await ready();
    expect(await screen.findByText(copy.returnWaiting)).toBeVisible();
    current = { ...current, membership: paid({ tier: 'expert', expiresAt: days(30) }) };
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3100);
    });
    const banner = await screen.findByText(/Payment confirmed\. Ultra is active until/);
    expect(banner).toBeVisible();
    expect(screen.getByTestId('current-plan')).toBeVisible();
  });

  it('keeps waiting for the plan the customer bought, not just any plan', async () => {
    setLocation('?checkout=return&plan=ultra');
    current = { ...current, membership: paid({ tier: 'pro' }) };
    await ready();
    expect(await screen.findByText(copy.returnWaiting)).toBeVisible();
  });

  it('admits when confirmation takes too long instead of pretending', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    setLocation('?checkout=return&plan=pro');
    await ready();
    for (let i = 0; i < 20; i++)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(3100);
      });
    expect(await screen.findByText(copy.returnSlow)).toBeVisible();
  });

  it('says so when the payment failed or the checkout was cancelled', async () => {
    setLocation('?checkout=return&plan=pro&status=failed');
    await ready();
    expect(await screen.findByRole('alert')).toHaveTextContent(copy.returnFailed);
    cleanup();
    setLocation('?checkout=cancelled');
    await ready();
    expect(await screen.findByText(copy.returnCancelled)).toBeVisible();
  });

  it('has every new text in every interface language', () => {
    for (const locale of ['en', 'ru', 'tg', 'es'] as const) {
      const text = MEMBERSHIP_COPY[locale];
      for (const key of [
        'perMonth',
        'taxNote',
        'noteLive',
        'subscribe',
        'upgrade',
        'currentPlan',
        'includedInPlan',
        'signInToBuy',
        'opening',
        'manage',
        'manageHint',
        'activeUntil',
        'renewsOn',
        'endsOn',
        'giftUntil',
        'onHold',
        'returnWaiting',
        'returnActive',
        'returnSlow',
        'returnFailed',
        'returnCancelled',
        'upgradeStarted',
      ] as const)
        expect(String(text[key]).trim(), locale + ' ' + key).not.toBe('');
      for (const code of Object.keys(copy.errors))
        expect(text.errors[code]?.trim(), locale + ' ' + code).toBeTruthy();
      expect(text.returnActive).toContain('{plan}');
      expect(text.returnActive).toContain('{date}');
    }
  });
});
