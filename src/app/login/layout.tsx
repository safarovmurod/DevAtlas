import { titleMetadata } from '@/lib/page-titles';

/** The page itself is a Client Component, so its tab title is set here. */
export function generateMetadata() {
  return titleMetadata('signIn');
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
