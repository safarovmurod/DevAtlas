import { OnboardingQuiz } from '@/components/onboarding/onboarding-quiz';
import { titleMetadata } from '@/lib/page-titles';
export function generateMetadata() {
  return titleMetadata('onboarding');
}

export default function OnboardingPage() {
  return <OnboardingQuiz />;
}
