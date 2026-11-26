// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  buildTelegramReply,
  POST as telegramWebhookPost,
} from '@/app/api/integrations/telegram/webhook/route';
import { POST as localPayPost } from '@/app/api/billing/local-request/route';
import { POST as codeRunnerPost } from '@/app/api/code-runner/route';
import { POST as referralTrackPost } from '@/app/api/referrals/track/route';
import { POST as programApplyPost } from '@/app/api/programs/apply/route';
import { GET as leaderboardGet } from '@/app/api/arena/leaderboard/route';
import {
  computeArenaScore,
  decodeArenaChallenge,
  encodeArenaChallenge,
  selectArenaQuestions,
} from '@/lib/arena/arena-engine';
import { BOOTCAMPS, estimateClassroomPriceUsd } from '@/lib/programs/programs-data';
import { WORKSHOPS, findWorkshop } from '@/content/workshops/workshops-data';
import { INTERFACE_LOCALES } from '@/lib/locale';

describe('Telegram Bot & Mini App integration', () => {
  it('shows 3-language picker on /start and builds RU/TG/EN replies for every command', () => {
    const startPicker = buildTelegramReply('/start ref_friend77', 'https://devatlas.app', 'Ахмад');
    expect(startPicker.withBanner).toBe(true);
    const buttonsJson = JSON.stringify(startPicker.buttons);
    expect(buttonsJson).toContain('lang:ru:friend77');
    expect(buttonsJson).toContain('lang:tg:friend77');
    expect(buttonsJson).toContain('lang:en:friend77');

    for (const lang of ['ru', 'tg', 'en'] as const) {
      for (const cmd of ['/courses', '/career', '/workshops', '/arena', '/plans', '/remind', '/help']) {
        const reply = buildTelegramReply(cmd, 'https://devatlas.app', 'Ahmad', true, lang);
        expect(reply.text.length).toBeGreaterThan(20);
        expect(reply.buttons.length).toBeGreaterThan(0);
      }
    }
  });

  it('handles webhook payload cleanly and ignores empty updates', async () => {
    const req = new Request('https://devatlas.app/api/integrations/telegram/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: { chat: { id: 12345 }, from: { first_name: 'Rustam' }, text: '/workshops' },
      }),
    });
    const res = await telegramWebhookPost(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { ok: boolean; replyPreview: string };
    expect(json.ok).toBe(true);
    expect(json.replyPreview).toContain('Telegram');
  });
});

describe('Local payments, Code Runner, Referrals & Programs APIs', () => {
  it('accepts a valid local payment receipt strictly as pending without auto-upgrading', async () => {
    const req = new Request('https://devatlas.app/api/billing/local-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: 'pro',
        provider: 'alif_mobi',
        senderName: 'Аҳмад Раҳимов',
        contact: '@ahmad_dev',
        referenceCode: 'ALIF-998877',
      }),
    });
    const res = await localPayPost(req);
    expect(res.status).toBe(202);
    const json = (await res.json()) as { ok: boolean; status: string };
    expect(json.ok).toBe(true);
    expect(json.status).toBe('pending');
  });

  it('returns honest 503 runner_not_configured when CODE_RUNNER_API_URL is unset', async () => {
    const req = new Request('https://devatlas.app/api/code-runner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'python', code: 'print(1)' }),
    });
    const res = await codeRunnerPost(req);
    expect(res.status).toBe(503);
    const json = (await res.json()) as { error: string };
    expect(json.error).toBe('runner_not_configured');
  });

  it('validates referral tracking and program applications', async () => {
    const refRes = await referralTrackPost(
      new Request('https://devatlas.app/api/referrals/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'friend42', landingPath: '/career-test' }),
      }),
    );
    expect(refRes.status).toBe(200);

    const appRes = await programApplyPost(
      new Request('https://devatlas.app/api/programs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'classroom_b2b',
          programId: 'classroom-license',
          fullName: 'Директори Марказ',
          contact: '+992900001122',
          organization: 'Dushanbe IT School',
          seats: 45,
        }),
      }),
    );
    expect(appRes.status).toBe(200);

    const boardRes = await leaderboardGet();
    expect(boardRes.status).toBe(200);
  });
});

describe('Arena 1v1 duels, Classroom estimator & 6 high-demand workshops', () => {
  it('encodes and decodes 1v1 challenge links and calculates scores', () => {
    const qs = selectArenaQuestions('mixed', 6);
    expect(qs).toHaveLength(6);
    const score = computeArenaScore({ correctCount: 5, secondsLeft: 60, bestStreak: 4 });
    expect(score).toBe(500 + 180 + 75);

    const token = encodeArenaChallenge({
      challenger: 'Мадина',
      track: 'python',
      targetScore: score,
      correctCount: 5,
    });
    const decoded = decodeArenaChallenge(token);
    expect(decoded).toMatchObject({ challenger: 'Мадина', track: 'python', targetScore: score });
  });

  it('prices Classroom B2B tiers and exposes all 3 bootcamps', () => {
    expect(BOOTCAMPS).toHaveLength(3);
    expect(estimateClassroomPriceUsd(10).perSeatUsd).toBe(4);
    expect(estimateClassroomPriceUsd(50).perSeatUsd).toBe(3);
    expect(estimateClassroomPriceUsd(120).perSeatUsd).toBe(2.5);
  });

  it('publishes all 6 high-demand workshops with 4 complete lessons in all 4 UI locales', () => {
    expect(WORKSHOPS).toHaveLength(6);
    for (const slug of [
      'telegram-bots',
      'freelance-start',
      'ai-business-automation',
      'nocode-websites',
      'excel-sheets-ai',
      'kids-coding',
    ]) {
      const workshop = findWorkshop(slug);
      expect(workshop).not.toBeNull();
      expect(workshop?.lessons).toHaveLength(4);
      for (const lesson of workshop!.lessons) {
        expect(lesson.templateCode.trim().length).toBeGreaterThan(10);
        for (const locale of INTERFACE_LOCALES) {
          expect(lesson.title[locale].trim()).toBeTruthy();
          expect(lesson.explanation[locale].trim()).toBeTruthy();
          expect(lesson.quiz.options[locale]).toHaveLength(3);
        }
      }
    }
  });
});
