import { describe, expect, it } from 'vitest';
import {
  buildCertificateId,
  collectCertificates,
  decodeAndVerifyCertificateToken,
  encodeCertificateToken,
} from '@/lib/certificates/certificate-engine';
import {
  decodePortfolioToken,
  encodePortfolioToken,
  sanitizeExternalUrl,
  sanitizeTelegramHandle,
} from '@/lib/portfolio/portfolio-engine';
import {
  STUDIO_QUESTIONS,
  auditProjectSubmission,
  buildJobReadySprint,
  scoreMockAnswer,
} from '@/lib/ultra/studio-engine';
import { CAREER_QUESTIONS, recommendCareerTrack } from '@/lib/career/career-finder';
import { planIncludes } from '@/lib/billing/plans';

describe('Pro QR certificates engine', () => {
  it('encodes and verifies certificate tokens and rejects tampered tokens', () => {
    const id = buildCertificateId('react', 'user-42', '2026-11-26');
    const token = encodeCertificateToken({
      id,
      holder: 'Аҳмад Раҳимов',
      courseId: 'react',
      daysDone: 60,
      totalDays: 60,
      hours: 42.5,
      issuedOn: '2026-11-26',
    });

    const verified = decodeAndVerifyCertificateToken(token);
    expect(verified.valid).toBe(true);
    if (verified.valid) {
      expect(verified.payload.holder).toBe('Аҳмад Раҳимов');
      expect(verified.payload.courseId).toBe('react');
      expect(verified.payload.id).toBe(id);
    }

    // Tamper with payload JSON while leaving old signature
    const raw = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(token.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)),
      ),
    );
    raw.holder = 'Fake Name';
    const tampered = btoa(
      Array.from(new TextEncoder().encode(JSON.stringify(raw)), (b) => String.fromCharCode(b)).join(''),
    )
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');

    const tamperedResult = decodeAndVerifyCertificateToken(tampered);
    expect(tamperedResult.valid).toBe(false);
    if (!tamperedResult.valid) expect(tamperedResult.reason).toBe('tampered');
  });

  it('collects earned and in-progress certificates from real progress sources', () => {
    const records = collectCertificates(
      [
        {
          id: 'html',
          total: 30,
          confirmedDays: Array.from({ length: 30 }, (_, i) => i + 1),
          completedTopics: [],
          completedPractice: [],
          answers: {},
          studySeconds: { '2026-11-25': 7200 },
          draftClock: {},
        },
        {
          id: 'css',
          total: 30,
          confirmedDays: [1, 2, 3],
          completedTopics: [],
          completedPractice: [],
          answers: {},
          studySeconds: { '2026-11-26': 1800 },
          draftClock: {},
        },
      ],
      'user-1',
      '2026-11-26',
    );
    expect(records).toHaveLength(2);
    expect(records[0].courseId).toBe('html');
    expect(records[0].status).toBe('earned');
    expect(records[1].courseId).toBe('css');
    expect(records[1].status).toBe('in_progress');
  });
});

describe('Pro Portfolio & CV engine', () => {
  it('encodes, decodes and sanitizes external URLs and Telegram handles', () => {
    expect(sanitizeExternalUrl('javascript:alert(1)')).toBe('');
    expect(sanitizeExternalUrl('github.com/devatlas')).toBe('https://github.com/devatlas');
    expect(sanitizeTelegramHandle('@dev_atlas!')).toBe('dev_atlas');

    const token = encodePortfolioToken({
      fullName: 'Фарҳод Каримов',
      headline: 'Frontend Developer',
      city: 'Душанбе',
      bio: 'Building web apps with React & Next.js',
      githubUrl: 'https://github.com/farhod',
      telegramHandle: '@farhod_dev',
      totalHours: 36.4,
      streak: 14,
      activeDays: 22,
      courses: [{ id: 'react', percent: 100, daysDone: 60, totalDays: 60 }],
      projects: [
        {
          title: 'Shop App',
          stack: 'Next.js, TypeScript',
          summary: 'Online store with checkout',
          url: 'https://example.com/shop',
        },
      ],
    });

    const decoded = decodePortfolioToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.fullName).toBe('Фарҳод Каримов');
    expect(decoded?.telegramHandle).toBe('farhod_dev');
    expect(decoded?.courses[0].id).toBe('react');
    expect(decoded?.projects[0].title).toBe('Shop App');
  });
});

describe('Ultra Studio engine', () => {
  it('scores mock technical answers against concepts and awards higher score for thorough answers', () => {
    const question = STUDIO_QUESTIONS[0];
    const empty = scoreMockAnswer(question, '', 'en');
    expect(empty.score).toBe(0);

    const strong = scoreMockAnswer(
      question,
      'React re-renders when state or props update with a new immutable reference via spread copy. Dynamic lists need a stable unique id as key instead of array index for reconciliation.',
      'en',
    );
    expect(strong.score).toBeGreaterThanOrEqual(85);
    expect(strong.missingConcepts).toHaveLength(0);
  });

  it('audits project submissions and flags leaked secrets', () => {
    const clean = auditProjectSubmission({
      track: 'frontend',
      codeOrManifest:
        '{"scripts":{"build":"next build","lint":"eslint","test":"vitest"},"dependencies":{"typescript":"5","zod":"4"}} try { fetch() } catch (error) {}',
    });
    expect(clean.score).toBe(100);
    expect(clean.verdict).toBe('ready');

    const leaky = auditProjectSubmission({
      track: 'backend',
      codeOrManifest: 'const key = "sk-live1234567890abcdef";',
    });
    expect(leaky.score).toBeLessThanOrEqual(45);
    expect(leaky.findings.find((f) => f.id === 'secrets')?.status).toBe('fail');
  });

  it('generates a 4-week job-ready sprint for every studio track', () => {
    const sprint = buildJobReadySprint({ track: 'ai', hoursPerDay: 2 });
    expect(sprint).toHaveLength(4);
    expect(sprint.map((w) => w.week)).toEqual([1, 2, 3, 4]);
  });

  it('keeps strict plan gates for Pro and Ultra features', () => {
    expect(planIncludes('start', 'portfolioCv')).toBe(false);
    expect(planIncludes('pro', 'portfolioCv')).toBe(true);
    expect(planIncludes('pro', 'careerStudio')).toBe(false);
    expect(planIncludes('ultra', 'careerStudio')).toBe(true);
  });
});

describe('Public Career Finder quiz', () => {
  it('recommends matching DevAtlas tracks from quiz answers', () => {
    expect(CAREER_QUESTIONS).toHaveLength(4);
    const aiTrack = recommendCareerTrack({
      goal: 'ai-auto',
      enjoy: 'puzzles',
      experience: 'tech-grow',
      product: 'ai-assistant',
    });
    expect(aiTrack.id).toBe('ai');
    expect(aiTrack.roadmap.length).toBeGreaterThanOrEqual(3);

    const mobileTrack = recommendCareerTrack({
      goal: 'web-ui',
      enjoy: 'mobile-apps',
      experience: 'some-code',
      product: 'phone-app',
    });
    expect(mobileTrack.id).toBe('mobile');
  });
});
