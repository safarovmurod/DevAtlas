import { describe, expect, it, beforeEach } from 'vitest';
import {
  containsProfanity,
  profanityStrikeMessage,
  PROFANITY_MAX_STRIKES,
} from '@/lib/tutor/profanity';
import {
  getModerationStatus,
  recordProfanityStrike,
  recordTutorStrike,
  resetLocalTutorStrikes,
  resetUserModeration,
} from '@/lib/tutor/strikes';
import { detectExplainStyle } from '@/lib/tutor/shared';
import { tutorScope } from '@/lib/tutor/scope';
import { selectTutorProvider, DEFAULT_GEMINI_MODEL } from '@/lib/tutor/provider';
import { buildPlan } from '@/lib/onboarding';
import { extractCodeExamples } from '@/components/agent/use-voice-assistant';

describe('profanity moderation and 5-strike 3-day block', () => {
  beforeEach(() => {
    resetLocalTutorStrikes();
  });

  it('catches Tajik, Russian, English and Spanish profanity without false positives on coding terms', () => {
    for (const bad of [
      'сука блять',
      'ту аҳмақ ҳастӣ',
      'what the fuck',
      'hijo de puta',
      'f*ck off',
    ]) {
      expect(containsProfanity(bad), bad).toBe(true);
    }
    for (const safe of [
      'class AssetManager { pass() { return fetch("/api/title"); } }',
      'HTML button shell bash git commit -m "fix script parsing"',
      'React useState чист ва чӣ тавр кор мекунад?',
      'Объясни Flexbox и Grid в CSS проще',
    ]) {
      expect(containsProfanity(safe), safe).toBe(false);
    }
  });

  it('issues 1..4 warnings then blocks for 3 days on strike 5 and resets cleanly', async () => {
    const uid = 'local-test-user-profanity';
    for (let i = 1; i <= 4; i++) {
      const res = await recordProfanityStrike(uid);
      expect(res.strikes).toBe(i);
      expect(res.maxStrikes).toBe(PROFANITY_MAX_STRIKES);
      expect(res.blocked).toBe(false);
      expect(profanityStrikeMessage(res, 'tg')).toContain(`${i}/5`);
    }
    const fifth = await recordProfanityStrike(uid);
    expect(fifth.strikes).toBe(5);
    expect(fifth.blocked).toBe(true);
    expect(fifth.blockedUntil).toBeTruthy();
    expect(profanityStrikeMessage(fifth, 'tg')).toContain('5/5');

    const status = await getModerationStatus(uid);
    expect(status.blocked).toBe(true);
    expect(status.blockReason).toBe('profanity');

    await resetUserModeration(uid);
    const cleared = await getModerationStatus(uid);
    expect(cleared.blocked).toBe(false);
    expect(cleared.profanity.strikes).toBe(0);
  });

  it('tracks off-topic 3-strike block independently and clears both on reset', async () => {
    const uid = 'local-test-user-offtopic';
    await recordTutorStrike(uid);
    await recordTutorStrike(uid);
    const third = await recordTutorStrike(uid);
    expect(third.blocked).toBe(true);
    const status = await getModerationStatus(uid);
    expect(status.blockReason).toBe('off_topic');
    await resetUserModeration(uid);
    expect((await getModerationStatus(uid)).blocked).toBe(false);
  });
});

describe('adaptive tutor styles, adjacent topics, voice provider and code extraction', () => {
  it('detects simpler, another_example and from_zero styles', () => {
    expect(detectExplainStyle('сода кн')).toBe('simpler');
    expect(detectExplainStyle('нафаҳмидам, проще объясни')).toBe('simpler');
    expect(detectExplainStyle('дигар мисол бте')).toBe('another_example');
    expect(detectExplainStyle('аз нол фаҳмон')).toBe('from_zero');
    expect(detectExplainStyle('React useState чист?')).toBe('default');
  });

  it('allows adjacent learning topics while still blocking off-topic requests', () => {
    expect(tutorScope('Kubernetes ва Docker чист?')).toBe('allowed');
    expect(tutorScope('Vue vs React чӣ фарқ дорад?')).toBe('allowed');
    expect(tutorScope('сода кн', 'useState чист?')).toBe('allowed');
    expect(tutorScope('дигар мисол', 'useState чист?')).toBe('allowed');
    expect(tutorScope('Пагоҳ ҳаво чӣ хел?')).toBe('outside');
  });

  it('selects GEMINI_VOICE_API_KEY for voice channel and defaults to fast Flash Lite', () => {
    const chat = selectTutorProvider(
      { GEMINI_API_KEY: 'chat-key', GEMINI_VOICE_API_KEY: 'voice-key' },
      'chat',
    );
    const voice = selectTutorProvider(
      { GEMINI_API_KEY: 'chat-key', GEMINI_VOICE_API_KEY: 'voice-key' },
      'voice',
    );
    expect(chat?.key).toBe('chat-key');
    expect(voice?.key).toBe('voice-key');
    expect(chat?.model).toBe(DEFAULT_GEMINI_MODEL);
  });

  it('extracts code examples cleanly from voice replies', () => {
    const raw = 'React state:\n```tsx\nconst [n, setN] = useState(0);\n```\nDone.';
    expect(extractCodeExamples(raw)).toEqual(['const [n, setN] = useState(0);']);
  });
});

describe('smart onboarding plan with hardware recommendation, pace bundling and roadmap', () => {
  it('bundles lessons by daily time and provides PC recommendation and roadmap', () => {
    const intensive = buildPlan({
      direction: 'frontend',
      device: 'phone',
      minutes: '180',
      days: '5',
      coded: 'never',
      style: 'practice',
    });
    expect(intensive.lessonsPerSession).toBe(3);
    expect(intensive.phoneOnly).toBe(true);
    expect(intensive.hardware?.required).toBe(true);
    expect(intensive.hardware?.ram).toContain('GB');
    expect(intensive.roadmap?.length).toBeGreaterThanOrEqual(5);
    expect(intensive.roadmap?.some((s) => s.courseId === 'html' && s.isCurrent)).toBe(true);
    expect(intensive.roadmap?.some((s) => s.courseId === 'react')).toBe(true);
    expect(intensive.roadmap?.some((s) => s.courseId === 'nodejs')).toBe(true);

    const light = buildPlan({ direction: 'business', device: 'phone', minutes: '45', days: '3' });
    expect(light.lessonsPerSession).toBe(1);
    expect(light.hardware?.required).toBe(false);
  });
});
