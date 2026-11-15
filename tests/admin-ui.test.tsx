import type { SupabaseClient } from '@supabase/supabase-js';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mocked = vi.hoisted(() => ({ client: null as SupabaseClient | null }));
vi.mock('@/lib/supabase/client', () => ({ getSupabaseBrowserClient: () => mocked.client }));

import { DeleteDialog } from '@/components/admin/admin-dialogs';
import { UserRow } from '@/components/admin/user-row';
import type { AdminUser } from '@/components/admin/admin-api';
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
  const names = () => screen.getAllByRole('button').map((button) => button.textContent);

  it('shows membership status and the actions an admin may take', () => {
    const onIntent = vi.fn();
    render(
      <UserRow user={base} busy={false} viewerId="a1" viewerIsOwner={false} onIntent={onIntent} />,
    );
    expect(screen.getByText('Фаъол, 12 рӯз монд')).toBeInTheDocument();
    expect(screen.getByText(/owner@example.test/)).toBeInTheDocument();
    expect(names()).toEqual([
      'Дароз кардан',
      'Бекор кардан',
      'Паём фиристодан',
      'Блок кардан',
      'Нест кардани аккаунт',
    ]);
    fireEvent.click(screen.getByRole('button', { name: 'Нест кардани аккаунт' }));
    expect(onIntent).toHaveBeenCalledWith({ kind: 'delete', user: base });
  });

  it('hides destructive actions for the owner and role actions for non-owners', () => {
    render(
      <UserRow
        user={{ ...base, isOwner: true, isAdmin: true }}
        busy={false}
        viewerId="a1"
        viewerIsOwner
        onIntent={vi.fn()}
      />,
    );
    expect(names()).toEqual(['Дароз кардан', 'Паём фиристодан']);
    cleanup();
    render(<UserRow user={base} busy={false} viewerId="o1" viewerIsOwner onIntent={vi.fn()} />);
    expect(names()).toContain('Админ кардан');
  });

  it('rejects an invalid day count without calling the server', () => {
    const onIntent = vi.fn();
    render(
      <UserRow user={base} busy={false} viewerId="a1" viewerIsOwner={false} onIntent={onIntent} />,
    );
    fireEvent.change(screen.getByLabelText('Шумораи рӯз'), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: 'Дароз кардан' }));
    expect(onIntent).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Шумораи рӯз')).toHaveAttribute('aria-invalid', 'true');
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
