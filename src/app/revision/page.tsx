import { PageTransition } from '@/components/layout/page-transition';
import { titleMetadata } from '@/lib/page-titles';
import { ReactRevision } from '@/components/learning/review-board';
import { StudySession } from '@/components/learning/study-session';
import { sessionConfig } from '@/lib/session-config';
export function generateMetadata() {
  return titleMetadata('revision');
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  if (params.start === '1' || typeof params.topic === 'string')
    return (
      <PageTransition>
        <StudySession config={{ ...sessionConfig('revision', params), review: true }} />
      </PageTransition>
    );
  return (
    <PageTransition>
      <ReactRevision />
    </PageTransition>
  );
}
