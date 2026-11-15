import { vi } from 'vitest';

/**
 * In-memory stand-in for the service-role Supabase client used by the admin routes.
 * It models only what those routes use: auth.admin (list/get/update/delete users) and a
 * small PostgREST query builder over plain arrays.
 */
export type FakeUser = {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  is_anonymous?: boolean;
  created_at?: string;
  last_sign_in_at?: string | null;
  banned_until?: string | null;
  app_metadata?: Record<string, unknown>;
};
type Row = Record<string, unknown>;
type Predicate = (row: Row) => boolean;

export function fakeAdmin(users: FakeUser[], tables: Record<string, Row[]> = {}) {
  const accounts = new Map<string, FakeUser>(
    users.map((user) => [
      user.id,
      {
        created_at: '2026-01-01T00:00:00.000Z',
        email_confirmed_at: '2026-01-01T00:00:00.000Z',
        app_metadata: { provider: 'email', providers: ['email'] },
        ...structuredClone(user),
      },
    ]),
  );
  const data: Record<string, Row[]> = {
    react_mentor_memberships: [],
    react_mentor_notifications: [],
    react_mentor_admin_audit: [],
    ...structuredClone(tables),
  };
  const failing = new Set<string>();
  let counter = 0;

  const getUserById = vi.fn(async (id: string) => {
    const user = accounts.get(id);
    return user
      ? { data: { user: structuredClone(user) }, error: null }
      : { data: { user: null }, error: { message: 'User not found', status: 404 } };
  });
  const listUsers = vi.fn(async ({ page = 1, perPage = 50 } = {}) => {
    const all = [...accounts.values()];
    return {
      data: {
        users: all.slice((page - 1) * perPage, page * perPage).map((user) => structuredClone(user)),
        total: all.length,
        aud: 'authenticated',
        nextPage: null,
        lastPage: Math.max(1, Math.ceil(all.length / perPage)),
      },
      error: null,
    };
  });
  const updateUserById = vi.fn(
    async (id: string, attributes: { app_metadata?: Row; ban_duration?: string }) => {
      const user = accounts.get(id);
      if (!user) return { data: { user: null }, error: { message: 'User not found' } };
      if (attributes.app_metadata) {
        // Supabase merges top-level keys; null removes a key.
        const merged: Row = { ...(user.app_metadata ?? {}) };
        for (const [key, value] of Object.entries(attributes.app_metadata))
          if (value === null) delete merged[key];
          else merged[key] = value;
        user.app_metadata = merged;
      }
      if (attributes.ban_duration === 'none') user.banned_until = null;
      else if (attributes.ban_duration) {
        const hours = Number(attributes.ban_duration.replace(/h$/, ''));
        user.banned_until = new Date(Date.now() + hours * 3_600_000).toISOString();
      }
      return { data: { user: structuredClone(user) }, error: null };
    },
  );
  const deleteUser = vi.fn(async (id: string) => {
    accounts.delete(id);
    for (const table of ['react_mentor_memberships', 'react_mentor_notifications'])
      data[table] = data[table].filter((row) => row.user_id !== id);
    return { data: {}, error: null };
  });

  function from(table: string) {
    let op: 'select' | 'insert' | 'upsert' | 'update' | 'delete' = 'select';
    let payload: Row | null = null;
    let single = false;
    let limit = Infinity;
    let order: { column: string; ascending: boolean } | null = null;
    const filters: Predicate[] = [];
    const run = () => {
      if (failing.has(table)) return { data: null, error: { code: 'XX000', message: 'down' } };
      const rows = (data[table] ??= []);
      const matches = (row: Row) => filters.every((filter) => filter(row));
      if (op === 'insert') {
        rows.push({
          id: `row-${++counter}`,
          created_at: new Date(Date.now() + counter).toISOString(),
          ...payload,
        });
        return { data: null, error: null };
      }
      if (op === 'upsert') {
        const index = rows.findIndex((row) => row.user_id === payload?.user_id);
        if (index >= 0) rows[index] = { ...rows[index], ...payload };
        else rows.push({ ...payload });
        return { data: null, error: null };
      }
      if (op === 'update') {
        for (const row of rows) if (matches(row)) Object.assign(row, payload);
        return { data: null, error: null };
      }
      if (op === 'delete') {
        data[table] = rows.filter((row) => !matches(row));
        return { data: null, error: null };
      }
      let found = rows.filter(matches).map((row) => structuredClone(row));
      if (order) {
        const { column, ascending } = order;
        found.sort(
          (a, b) => String(a[column]).localeCompare(String(b[column])) * (ascending ? 1 : -1),
        );
      }
      found = found.slice(0, limit);
      return { data: single ? (found[0] ?? null) : found, error: null };
    };
    const query = {
      select: () => query,
      insert: (row: Row) => ((op = 'insert'), (payload = row), query),
      upsert: (row: Row) => ((op = 'upsert'), (payload = row), query),
      update: (row: Row) => ((op = 'update'), (payload = row), query),
      delete: () => ((op = 'delete'), query),
      eq: (column: string, value: unknown) => (filters.push((row) => row[column] === value), query),
      in: (column: string, values: unknown[]) => (
        filters.push((row) => values.includes(row[column])),
        query
      ),
      gt: (column: string, value: string) => (
        filters.push((row) => String(row[column]) > value),
        query
      ),
      lte: (column: string, value: string) => (
        filters.push((row) => String(row[column]) <= value),
        query
      ),
      order: (column: string, options: { ascending: boolean }) => (
        (order = { column, ascending: options.ascending }),
        query
      ),
      limit: (count: number) => ((limit = count), query),
      maybeSingle: () => ((single = true), query),
      then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
        Promise.resolve().then(run).then(resolve, reject),
    };
    return query;
  }

  return {
    client: { auth: { admin: { getUserById, listUsers, updateUserById, deleteUser } }, from },
    accounts,
    data,
    failing,
    spies: { getUserById, listUsers, updateUserById, deleteUser },
  };
}
