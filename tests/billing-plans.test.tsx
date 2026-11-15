import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { MEMBERSHIP_COPY } from '@/lib/billing/copy';
import {
  FEATURE_PLAN,
  PLAN_IDS,
  planForTier,
  planIncludes,
  planOwnFeatures,
  type PlanFeature,
} from '@/lib/billing/plans';
import { INTERFACE_LOCALES } from '@/lib/locale';
import { PlansScreen } from '@/components/community/plans-screen';
import { useLearningStore } from '@/stores/learning-store';

describe('plan feature split', () => {
  it('puts the intro, basic lessons and editor checks in Start', () => {
    expect(planOwnFeatures('start')).toEqual(['platformIntro', 'basicLessons', 'editorChecks']);
  });

  it('puts deep study, all courses, practice, the certificate and the AI Tutor chat in Pro', () => {
    expect(planOwnFeatures('pro')).toEqual([
      'deepStudy',
      'allCourses',
      'practiceTasks',
      'certificate',
      'aiTutor',
    ]);
  });

  it('puts the mentor, project review, private community, job preparation and voice assistant in Ultra', () => {
    expect(planOwnFeatures('ultra')).toEqual([
      'mentor',
      'projectReview',
      'privateCommunity',
      'jobPrep',
      'voiceAssistant',
    ]);
  });

  it('puts every feature in exactly one plan and lets higher plans include lower ones', () => {
    const own = PLAN_IDS.flatMap((plan) => planOwnFeatures(plan));
    expect(new Set(own).size).toBe(own.length);
    expect(own.sort()).toEqual(Object.keys(FEATURE_PLAN).sort());
    expect(planIncludes('pro', 'basicLessons')).toBe(true);
    expect(planIncludes('ultra', 'aiTutor')).toBe(true);
    expect(planIncludes('pro', 'voiceAssistant')).toBe(false);
    expect(planIncludes('start', 'aiTutor')).toBe(false);
  });

  it('keeps the stored tier names: expert is Ultra', () => {
    expect(planForTier('starter')).toBe('start');
    expect(planForTier('pro')).toBe('pro');
    expect(planForTier('expert')).toBe('ultra');
  });

  it('has a name for every feature in every interface language', () => {
    for (const locale of INTERFACE_LOCALES)
      for (const feature of Object.keys(FEATURE_PLAN) as PlanFeature[])
        expect(
          MEMBERSHIP_COPY[locale].features[feature]?.trim(),
          locale + ' ' + feature,
        ).toBeTruthy();
  });
});

describe('plans page', () => {
  beforeEach(() => useLearningStore.setState({ language: 'en' }));
  afterEach(cleanup);

  it('shows Start, Pro and Ultra with their own features and honest payment state', () => {
    render(<PlansScreen />);
    const copy = MEMBERSHIP_COPY.en;
    const cards = screen.getAllByRole('article');
    expect(cards.map((card) => within(card).getByRole('heading').textContent)).toEqual([
      'Start',
      'Pro',
      'Ultra',
    ]);
    const [start, pro, ultra] = cards;
    expect(within(start).getByText(copy.features.editorChecks)).toBeVisible();
    expect(within(start).getByRole('link', { name: copy.start })).toHaveAttribute(
      'href',
      '/courses',
    );
    expect(within(pro).getByText(copy.everythingStart)).toBeVisible();
    expect(within(pro).getByText(copy.features.aiTutor)).toBeVisible();
    expect(within(pro).queryByText(copy.features.voiceAssistant)).not.toBeInTheDocument();
    expect(within(ultra).getByText(copy.everythingPro)).toBeVisible();
    expect(within(ultra).getByText(copy.features.voiceAssistant)).toBeVisible();
    expect(within(ultra).getByText(copy.features.privateCommunity)).toBeVisible();
    for (const card of [pro, ultra])
      expect(within(card).getByRole('button', { name: copy.unavailable })).toBeDisabled();
    expect(screen.getByText(copy.note)).toBeVisible();
  });

  it('renders in every interface language without the old plan name', () => {
    for (const locale of INTERFACE_LOCALES) {
      useLearningStore.setState({ language: locale });
      const view = render(<PlansScreen />);
      expect(view.container.textContent, locale).not.toContain('Pro Ultra');
      expect(screen.getAllByRole('article'), locale).toHaveLength(3);
      view.unmount();
    }
  });
});

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
