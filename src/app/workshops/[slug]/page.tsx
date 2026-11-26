import { notFound } from 'next/navigation';
import { WorkshopPlayer } from '@/components/workshops/workshop-player';
import { findWorkshop } from '@/content/workshops/workshops-data';

export default async function WorkshopDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workshop = findWorkshop(slug);
  if (!workshop) notFound();
  return <WorkshopPlayer workshop={workshop} />;
}
