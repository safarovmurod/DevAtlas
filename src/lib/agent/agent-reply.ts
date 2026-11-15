import { z } from 'zod';

const linkSchema = z.object({
  href: z
    .string()
    .max(300)
    .regex(/^\/(?!\/)/)
    .refine((value) => !/[\\\u0000-\u001f]/.test(value)),
  label: z.string().max(300),
});

/** A page of the site that the assistant can point to. Only same-site paths are accepted. */
export type AgentLink = z.infer<typeof linkSchema>;

/** What the assistant says and shows after one question. */
export interface AgentReply {
  text: string;
  kind: 'guide' | 'materials' | 'online' | 'notice' | 'error';
  links: AgentLink[];
}

/** A lesson source from the tutor as a safe link, or null when it is not a same-site path. */
export function agentMaterialLink(source: unknown): AgentLink | null {
  const parsed = z
    .object({ href: linkSchema.shape.href, title: linkSchema.shape.label })
    .safeParse(source);
  return parsed.success ? { href: parsed.data.href, label: parsed.data.title } : null;
}

/** Storage keys of the old text chat. The assistant no longer has a chat, so its saved text is removed. */
function oldAgentKeys(owner: string | null) {
  const scope = owner === null ? 'guest' : `account:${encodeURIComponent(owner)}`;
  return [`devatlas-agent-chat-v2:${scope}`, `devatlas-agent-voice-v2:${scope}`];
}

/**
 * Deletes the signed-in account's (or the guest's) saved text chat from this browser.
 * Other accounts and the unowned v1 chat are never touched.
 */
export function removeOldAgentChat(storage: Pick<Storage, 'removeItem'>, owner: string | null) {
  try {
    for (const key of oldAgentKeys(owner)) storage.removeItem(key);
  } catch {
    // Blocked storage has nothing to clean.
  }
}
