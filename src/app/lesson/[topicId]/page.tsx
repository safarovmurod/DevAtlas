import { PageTransition } from '@/components/layout/page-transition';
import { notFound, redirect } from 'next/navigation';
import { getTopic, topicTitle } from '@/content/course';
import { getRequestLocale } from '@/lib/request-locale';
import { LessonView } from '@/components/learning/lesson-view';
export async function generateMetadata({ params }: { params: Promise<{ topicId: string }> }) {
  const topic = getTopic((await params).topicId);
  return topic ? { title: topicTitle(topic, await getRequestLocale()) } : {};
}

export default async function LessonPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const topic = getTopic(topicId);
  if (!topic) notFound();
  if (topic.month === 3) redirect('/courses/nextjs/plan');
  return (
    <PageTransition>
      <LessonView topicId={topicId} />
    </PageTransition>
  );
}
