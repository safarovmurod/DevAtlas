import { PageTransition } from '@/components/layout/page-transition';
import { notFound } from 'next/navigation';
import { AnswerReader } from '@/components/learning/answer-reader';
import { getAnswerTopic } from '@/content/answers';
import { pageTitle } from '@/lib/page-titles';
import { getRequestLocale } from '@/lib/request-locale';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const topic = getAnswerTopic((await params).id);
  const answers = pageTitle('answers', await getRequestLocale());
  return { title: topic ? `${topic.title} · ${answers}` : answers };
}

export default async function AnswerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = getAnswerTopic(id);
  if (!topic) notFound();
  return (
    <PageTransition>
      <AnswerReader topic={topic} />
    </PageTransition>
  );
}
