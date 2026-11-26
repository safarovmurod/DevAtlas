import { StartHere } from '@/components/start/start-here';
import { START_HERE_INTRO } from '@/content/start-here';
import { pageTitle } from '@/lib/page-titles';
import { getRequestLocale } from '@/lib/request-locale';
import { publicPageMetadata } from '@/lib/seo';

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const intro = START_HERE_INTRO[locale === 'es' ? 'en' : locale];
  return publicPageMetadata(locale, pageTitle('start', locale), intro, '/start');
}
export default function StartPage() {
  return <StartHere />;
}
