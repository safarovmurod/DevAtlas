// Mounted study timers register here so their unsaved seconds can be saved
// before the account or course changes.

const studyTimeFlushes = new Set<() => void>();

/** Flush the mounted timer before its account or course scope changes. */
export function registerStudyTimeFlush(flush: () => void) {
  studyTimeFlushes.add(flush);
  return () => {
    studyTimeFlushes.delete(flush);
  };
}

/** Saves the seconds counted so far before switching account or course. */
export function flushPendingStudyTime() {
  for (const flush of [...studyTimeFlushes]) flush();
}
