import { PageTransition } from '@/components/layout/page-transition';
import { titleMetadata } from '@/lib/page-titles';
import { ProgressReport } from '@/components/progress/progress-report';

export function generateMetadata() {
  return titleMetadata('progress');
}

export default function ProgressPage() {
  return (
    <PageTransition>
      <ProgressReport />
    </PageTransition>
  );
}
