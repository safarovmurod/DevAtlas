import type { OnboardingLocale } from '@/lib/onboarding';

// Shared types of the placement (knowledge check) questions.

export type Text = Record<OnboardingLocale, string>;
export const t = (tg: string, ru: string, en: string): Text => ({ tg, ru, en });

export type PlacementDirection = 'frontend' | 'backend' | 'mobile' | 'data' | 'design' | 'business';
export type PlacementLevel = 'beginner' | 'middle' | 'advanced';
/** 1 = basics, 2 = working knowledge, 3 = confident practitioner. */
export type PlacementTier = 1 | 2 | 3;

export interface PlacementQuestion {
  id: string;
  tier: PlacementTier;
  question: Text;
  code?: string;
  /** Three answers; the fourth choice «I don't know» is added by the UI and is never correct. */
  options: [Text, Text, Text];
  correctIndex: 0 | 1 | 2;
}
