import { PageTransition } from '@/components/layout/page-transition';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ReactPracticeLibrary } from '@/components/learning/react-course-entry';
export default async function ReactPracticeLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const full = (await searchParams).view === 'full';
  return (
    <PageTransition>
      <section className="react-entry">
        <Link href="/courses/react" className="back-link">
          <ArrowLeft size={16} />
          React
        </Link>
        <ReactPracticeLibrary full={full} />
      </section>
    </PageTransition>
  );
}
