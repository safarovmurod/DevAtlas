import type { SupabaseClient } from '@supabase/supabase-js';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mocked = vi.hoisted(() => ({ client: null as SupabaseClient | null }));
vi.mock('@/lib/supabase/client', () => ({ getSupabaseBrowserClient: () => mocked.client }));

import { DeleteDialog, PlanDialog } from '@/components/admin/admin-dialogs';
import { UserRow } from '@/components/admin/user-row';
import {
  PAYMENT_EXTEND_NOTE,
  PAYMENT_WARNING,
  revokeMessage,
  type AdminUser,
} from '@/components/admin/admin-api';
import { NotificationToaster } from '@/components/account/notification-toaster';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('account deletion dialog', () => {
  it('asks twice and deletes only after the full email is typed', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <DeleteDialog
        email="Learner@Example.test"
        busy={false}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );
    // Step 1: "are you sure?" There is no delete button and no email field yet.
    expect(screen.getByRole('dialog')).toHaveTextContent('Шумо мутмаин ҳастед?');
    expect(screen.queryByRole('textbox')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Ҳа, идома додан' }));

    // Step 2: the final button stays disabled until the email matches exactly.
    const input = screen.getByRole('textbox');
    const remove = screen.getByRole('button', { name: 'Абадан нест кардан' });
    expect(remove).toBeDisabled();
    fireEvent.change(input, { target: { value: 'learner@example' } });
    expect(remove).toBeDisabled();
    fireEvent.submit(input.closest('form')!);
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: ' learner@example.TEST ' } });
    expect(remove).toBeEnabled();
    fireEvent.click(remove);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith('learner@example.TEST');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('cancels at the first step and with Escape without deleting', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(<DeleteDialog email="a@b.test" busy={false} onConfirm={onConfirm} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Не, бекор' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('cannot be closed or submitted twice while the deletion runs', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    const { rerender } = render(
      <DeleteDialog email="a@b.test" busy={false} onConfirm={onConfirm} onClose={onClose} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ҳа, идома додан' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a@b.test' } });
    rerender(<DeleteDialog email="a@b.test" busy onConfirm={onConfirm} onClose={onClose} />);
    expect(screen.getByRole('button', { name: 'Нест мешавад…' })).toBeDisabled();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('user row', () => {
  const base: AdminUser = {
    id: 'u1',
    email: 'learner@example.test',
    createdAt: '2026-01-01T00:00:00Z',
    lastSignInAt: null,
    emailConfirmed: true,
    providers: ['email'],
    isAdmin: false,
    isOwner: false,
    bannedUntil: null,
    membership: {
      tier: 'expert',
      expiresAt: '2099-01-01T00:00:00Z',
      active: true,
      daysLeft: 12,
      source: 'admin',
      grantedById: 'o1',
      grantedByEmail: 'owner@example.test',
      grantedAt: '2026-11-01T00:00:00Z',
    },
  };
  function row(user: AdminUser, viewerIsOwner: boolean, onIntent = vi.fn()) {
    render(
      <table>
        <tbody>
          <UserRow
            user={user}
            busy={false}
            viewerId="a1"
            viewerIsOwner={viewerIsOwner}
            onIntent={onIntent}
          />
        </tbody>
      </table>,
    );
    return onIntent;
  }
  const openMenu = () => fireEvent.click(screen.getByRole('button', { name: /Амалҳо/ }));
  const items = () => screen.getAllByRole('menuitem').map((item) => item.textContent);

  it('shows plan and days left, and keeps all actions in one menu', () => {
    const onIntent = row(base, false);
    expect(screen.getByText('Ultra')).toBeInTheDocument();
    expect(screen.getByText('12 рӯз монд')).toBeInTheDocument();
    expect(screen.queryByRole('menu')).toBeNull();
    openMenu();
    expect(items()).toEqual([
      'Дароз кардан…',
      'Кам кардани рӯзҳо…',
      'Бекор кардани подписка',
      'Паём фиристодан…',
      'Блок кардан…',
      'Нест кардани аккаунт…',
    ]);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Кам кардани рӯзҳо…' }));
    expect(onIntent).toHaveBeenCalledWith({ kind: 'plan', user: base, mode: 'shorten' });
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('marks a plan that was paid for with a «Пардохт» badge and an admin plan without one', () => {
    row(
      { ...base, membership: { ...base.membership!, source: 'payment', grantedById: null } },
      false,
    );
    expect(screen.getByText('Пардохт')).toBeInTheDocument();
    cleanup();
    row(base, false);
    expect(screen.queryByText('Пардохт')).toBeNull();
  });

  it('hides destructive actions for the owner and role actions for non-owners', () => {
    row({ ...base, isOwner: true, isAdmin: true }, true);
    openMenu();
    expect(items()).toEqual(['Дароз кардан…', 'Паём фиристодан…']);
    cleanup();
    row({ ...base, membership: null }, true);
    openMenu();
    expect(items()).toContain('Админ кардан');
    expect(items()[0]).toBe('Додани подписка…');
  });

  it('places the menu against the viewport so the table cannot clip it', () => {
    row(base, false);
    openMenu();
    const menu = screen.getByRole('menu');
    expect(menu.style.top).toMatch(/px$/);
    expect(menu.style.right).toMatch(/px$/);
    fireEvent.scroll(window);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('closes the menu with Escape without doing anything', () => {
    const onIntent = row(base, false);
    openMenu();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    expect(onIntent).not.toHaveBeenCalled();
  });
});

describe('plan dialog', () => {
  it('grants the chosen tier for the chosen days and blocks an invalid count', () => {
    const onConfirm = vi.fn();
    render(
      <PlanDialog
        mode="grant"
        email="a@b.test"
        current={null}
        busy={false}
        onConfirm={onConfirm}
        onClose={vi.fn()}
      />,
    );
    const days = screen.getByLabelText('Шумораи рӯз');
    fireEvent.change(days, { target: { value: '0' } });
    expect(screen.getByRole('button', { name: 'Додан' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '90 рӯз' }));
    fireEvent.change(screen.getByLabelText('Тариф'), { target: { value: 'expert' } });
    expect(screen.getByText(/Санаи нави тамомшавӣ/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Додан' }));
    expect(onConfirm).toHaveBeenCalledWith('expert', 90);
  });
});

describe('paid plans changed by an admin', () => {
  const paidPlan = {
    tier: 'pro' as const,
    expiresAt: '2099-01-01T00:00:00Z',
    active: true,
    daysLeft: 20,
    source: 'payment' as const,
    grantedById: null,
    grantedByEmail: null,
    grantedAt: null,
  };

  it('warns that the provider keeps charging when a paid plan is cancelled here', () => {
    expect(revokeMessage('a@b.test', paidPlan)).toContain(PAYMENT_WARNING);
    expect(PAYMENT_WARNING).toContain('Dodo Payments');
    expect(PAYMENT_WARNING).toContain('Идоракунии обуна');
    expect(revokeMessage('a@b.test', { ...paidPlan, source: 'admin' })).not.toContain('Dodo');
    expect(revokeMessage('a@b.test', null)).not.toContain('Dodo');
  });

  it('warns before shortening or extending a paid plan, but not before a new grant', () => {
    const open = (mode: 'shorten' | 'extend' | 'grant', current = paidPlan) =>
      render(
        <PlanDialog
          mode={mode}
          email="a@b.test"
          current={current}
          busy={false}
          onConfirm={vi.fn()}
          onClose={vi.fn()}
        />,
      );
    open('shorten');
    expect(screen.getByRole('note')).toHaveTextContent(PAYMENT_WARNING);
    cleanup();
    open('extend');
    expect(screen.getByRole('note')).toHaveTextContent(PAYMENT_EXTEND_NOTE);
    cleanup();
    open('grant');
    expect(screen.queryByRole('note')).toBeNull();
    cleanup();
    open('shorten', { ...paidPlan, source: 'admin' as never });
    expect(screen.queryByRole('note')).toBeNull();
  });
});

describe('notification toaster', () => {
  function backend(rows: { id: string; body: string }[]) {
    const limit = vi.fn().mockResolvedValue({ data: rows, error: null });
    const query = { select: () => query, is: () => query, order: () => query, limit };
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
    mocked.client = { from: vi.fn(() => query), rpc } as unknown as SupabaseClient;
    return { limit, rpc };
  }

  it('shows a message as plain text, marks it read and hides it after 8 seconds', async () => {
    vi.useFakeTimers();
    const { rpc } = backend([{ id: 'n1', body: '<img src=x onerror=alert(1)> Салом' }]);
    render(<NotificationToaster userId="u1" />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByText('<img src=x onerror=alert(1)> Салом')).toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();
    expect(rpc).toHaveBeenCalledWith('react_mentor_mark_notification_read', {
      notification_id: 'n1',
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(8_000);
    });
    expect(screen.queryByText(/Салом/)).toBeNull();
  });

  it('polls every 10 seconds only while the tab is visible and never repeats a message', async () => {
    vi.useFakeTimers();
    const { limit } = backend([{ id: 'n1', body: 'hello' }]);
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    render(<NotificationToaster userId="u1" />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(25_000);
    });
    expect(limit).not.toHaveBeenCalled();
    visibility.mockReturnValue('visible');
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(limit).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText('hello')).toHaveLength(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    // The next poll returns the same row (as if it were not yet marked read); it is not shown again.
    expect(limit).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('hello')).toBeNull();
    visibility.mockRestore();
  });
});
