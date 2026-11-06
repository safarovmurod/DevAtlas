import { PageTransition } from '@/components/layout/page-transition';
import { ReactCourseEntry } from '@/components/learning/react-course-entry';
export default function ReactEntryPage() {
  return (
    <PageTransition>
      <ReactCourseEntry />
    </PageTransition>
  );
}
