import type { SessionConfig } from '@/components/learning/study-session';
export function sessionConfig(
  mode: SessionConfig['mode'],
  params: Record<string, string | string[] | undefined>,
): SessionConfig {
  const month = Number(params.month);
  const group = Number(params.group);
  return {
    mode,
    daily: params.daily === '1',
    month: [1, 2, 3].includes(month) ? month : undefined,
    group: [1, 2, 3].includes(group) ? group : undefined,
    topic: typeof params.topic === 'string' ? params.topic : undefined,
    review: params.review === '1',
  };
}
