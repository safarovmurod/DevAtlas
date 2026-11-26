import { titleMetadata } from '@/lib/page-titles';

/** The page itself is a Client Component, so its tab title is set here. */
export function generateMetadata() {
  return titleMetadata('plan');
}

export default function PlanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
