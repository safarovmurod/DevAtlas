import { z } from 'zod';

// The old unscoped key has no trustworthy owner. Preserve it, but never assign
// its contents to a newly signed-in user or silently import it into guest mode.
export const LEGACY_AGENT_CHAT_KEY = 'devatlas-agent-chat-v1';
const link = z.object({
  href: z
    .string()
    .max(300)
    .regex(/^\/(?!\/)/)
    .refine((value) => !/[\\\u0000-\u001f]/.test(value)),
  label: z.string().max(300),
});
export function agentMaterialLink(source: unknown) {
  const parsed = z.object({ href: link.shape.href, title: link.shape.label }).safeParse(source);
  return parsed.success ? { href: parsed.data.href, label: parsed.data.title } : null;
}
export const agentMessageSchema = z.object({
  id: z.string().min(1).max(100),
  sender: z.enum(['user', 'assistant']),
  text: z.string().max(20000),
  kind: z.enum(['guide', 'materials', 'online', 'notice', 'error']).optional(),
  links: z.array(link).max(8).optional(),
});
export type AgentMessage = z.infer<typeof agentMessageSchema>;
export function agentStorageKey(owner: string | null, kind: 'chat' | 'voice' = 'chat') {
  return `devatlas-agent-${kind}-v2:${owner === null ? 'guest' : `account:${encodeURIComponent(owner)}`}`;
}
export function readAgentHistory(
  storage: Pick<Storage, 'getItem'>,
  owner: string | null,
): AgentMessage[] | null {
  try {
    const raw = storage.getItem(agentStorageKey(owner));
    if (!raw || raw.length > 320000) return null;
    const result = z.array(agentMessageSchema).max(40).safeParse(JSON.parse(raw));
    return result.success && result.data.length ? result.data : null;
  } catch {
    return null;
  }
}
export function saveAgentHistory(
  storage: Pick<Storage, 'setItem'>,
  owner: string | null,
  messages: AgentMessage[],
): boolean {
  try {
    const parsed = z.array(agentMessageSchema).max(40).parse(messages.slice(-40));
    const value = JSON.stringify(parsed);
    if (value.length > 320000) return false;
    storage.setItem(agentStorageKey(owner), value);
    return true;
  } catch {
    return false;
  }
}
