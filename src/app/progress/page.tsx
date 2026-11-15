import { PageTransition } from '@/components/layout/page-transition';
import { ProgressReport } from '@/components/progress/progress-report';

export default function ProgressPage() {
  return (
    <PageTransition>
      <ProgressReport />
    </PageTransition>
  );
}
