import { PageTransition } from '@/components/layout/page-transition';
import { PlansScreen } from '@/components/community/plans-screen';
import { pageTitle } from '@/lib/page-titles';
import { PUBLIC_COPY } from '@/lib/public-copy';
import { getRequestLocale } from '@/lib/request-locale';
import { publicPageMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const locale = await getRequestLocale();
  return publicPageMetadata(
    locale,
    pageTitle('plans', locale),
    PUBLIC_COPY[locale].description,
    '/plans',
  );
}
export default function PlansPage() {
  return (
    <PageTransition>
      <PlansScreen />
    </PageTransition>
  );
}
