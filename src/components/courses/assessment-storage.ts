import type { AssessmentAnswer, AssessmentView } from '@/lib/practice/assessment';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getSessionWithTimeout } from '@/lib/supabase/session';

/**
 * Access token of the signed-in learner, or undefined for a guest.
 * Throws if the account changed since the assessment was opened.
 */
export async function tokenFor(actor: string) {
  if (actor === 'guest') return undefined;
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error('Session unavailable');
  const { data, error } = await getSessionWithTimeout(client);
  if (error || data.session?.user.id !== actor) throw new Error('Session changed');
  return data.session.access_token;
}

/** Unfinished answers saved in the browser, so a reload does not lose them. */
export interface Draft {
  version: number;
  variantId: string;
  answers: Record<string, AssessmentAnswer>;
}

const MAX_ANSWERS = 10;
const MAX_TEXT = 500;
const MAX_ITEMS = 6;
const MAX_ITEM = 120;

const isShortString = (item: unknown) => typeof item === 'string' && item.length <= MAX_ITEM;

/** A saved answer is a text, a list of option ids, or a map of matching pairs. */
function isValidAnswer(answer: unknown) {
  if (typeof answer === 'string') return answer.length <= MAX_TEXT;
  if (Array.isArray(answer)) return answer.length <= MAX_ITEMS && answer.every(isShortString);
  return (
    answer !== null &&
    typeof answer === 'object' &&
    Object.keys(answer).length <= MAX_ITEMS &&
    Object.values(answer).every(isShortString)
  );
}

/** Reads a saved draft. "corrupt" means something was stored but it is not a valid draft. */
export function readDraft(key: string): { draft: Draft | null; corrupt: boolean } {
  if (typeof window === 'undefined') return { draft: null, corrupt: false };
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { draft: null, corrupt: false };
    const value = JSON.parse(raw);
    const valid =
      value &&
      Number.isInteger(value.version) &&
      typeof value.variantId === 'string' &&
      value.answers &&
      typeof value.answers === 'object' &&
      !Array.isArray(value.answers) &&
      Object.keys(value.answers).length <= MAX_ANSWERS &&
      Object.values(value.answers).every(isValidAnswer);
    if (!valid) return { draft: null, corrupt: true };
    return {
      draft: { version: value.version, variantId: value.variantId, answers: value.answers },
      corrupt: false,
    };
  } catch {
    return { draft: null, corrupt: true };
  }
}

/** Saves the current answers. Blocked storage is ignored: answers stay in memory. */
export function saveDraft(
  key: string,
  view: AssessmentView,
  answers: Record<string, AssessmentAnswer>,
) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({ version: view.version, variantId: view.variantId, answers }),
    );
  } catch {
    // Keep working in memory without deleting the original draft.
  }
}
