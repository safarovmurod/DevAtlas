import { PageTransition } from '@/components/layout/page-transition';
import { titleMetadata } from '@/lib/page-titles';
import { CommunityScreen } from '@/components/community/community-screen';
export function generateMetadata() {
  return titleMetadata('community');
}

export default function CommunityPage() {
  return (
    <PageTransition>
      <CommunityScreen />
    </PageTransition>
  );
}
