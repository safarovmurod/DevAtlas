import type { SupabaseClient } from '@supabase/supabase-js';
import { mergeProgress, progressSnapshot } from './progress';
import { useLearningStore } from '@/stores/learning-store';

export type SyncStatus = 'local' | 'syncing' | 'synced' | 'offline' | 'error';

/** A stopped coordinator never reads or updates the next account's store. */
export function startAccountSync(
  client: SupabaseClient,
  userId: string,
  status: (value: SyncStatus) => void,
) {
  let stopped = false,
    busy = false,
    queued = false,
    applying = false,
    revision = 0,
    initialized = false;
  let lastSaved = '',
    timer: ReturnType<typeof setTimeout> | undefined;

  function schedule(delay: number) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      void sync();
    }, delay);
  }

  async function sync() {
    if (stopped) return;
    if (busy) {
      // An edit's debounce may expire before the previous request has finished.
      queued = true;
      return;
    }
    if (!navigator.onLine) {
      status('offline');
      return;
    }
    clearTimeout(timer);
    timer = undefined;
    queued = false;
    busy = true;
    status('syncing');
    try {
      // Read remote on each pass: handles concurrent devices without losing edits.
      const { data, error } = await client
        .from('react_mentor_progress')
        .select('data,revision')
        .eq('user_id', userId)
        .maybeSingle();
      if (stopped) return;
      if (error) throw error;
      if (!initialized || (data?.revision ?? 0) !== revision) {
        const remote = progressSnapshot(data?.data || {});
        const local = progressSnapshot(useLearningStore.getState());
        const merged = data ? mergeProgress(remote, local) : local;
        applying = true;
        try {
          useLearningStore.setState(merged);
        } finally {
          applying = false;
        }
        revision = data?.revision || 0;
        lastSaved = JSON.stringify(remote);
        initialized = true;
      }
      const snapshot = progressSnapshot(useLearningStore.getState());
      const serialized = JSON.stringify(snapshot);
      if (serialized !== lastSaved) {
        const { data: saved, error: writeError } = await client.rpc('react_mentor_save_progress', {
          expected_revision: revision,
          progress_data: snapshot,
        });
        if (stopped) return;
        if (writeError?.code === 'PT409' || writeError?.code === '40001') {
          schedule(200);
          return;
        }
        if (writeError || !saved?.[0]) throw writeError || new Error('Missing sync response');
        revision = saved[0].revision;
        lastSaved = serialized;
      }
      if (!queued && timer === undefined) status('synced');
    } catch {
      if (!stopped) status(navigator.onLine ? 'error' : 'offline');
    } finally {
      busy = false;
      if (!stopped && queued && timer === undefined) schedule(0);
    }
  }
  const unsubscribe = useLearningStore.subscribe(() => {
    if (stopped || applying) return;
    schedule(1500);
  });
  const interval = setInterval(sync, 30000);
  const visible = () => {
    if (!document.hidden) void sync();
  };
  window.addEventListener('online', sync);
  document.addEventListener('visibilitychange', visible);
  void sync();
  return {
    sync,
    stop() {
      stopped = true;
      clearTimeout(timer);
      clearInterval(interval);
      unsubscribe();
      window.removeEventListener('online', sync);
      document.removeEventListener('visibilitychange', visible);
    },
  };
}
