import { titleMetadata } from '@/lib/page-titles';

/** The page itself is a Client Component, so its tab title is set here. */
export function generateMetadata() {
  return titleMetadata('settings');
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
