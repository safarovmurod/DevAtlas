import type { MetadataRoute } from 'next';
import { PUBLIC_COPY } from '@/lib/public-copy';
import { SITE_NAME } from '@/lib/seo';

/** Installed-app name, colors and icon. The colors are the light theme's canvas and brand accent. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: PUBLIC_COPY.en.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f7fb',
    theme_color: '#4f46e5',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
    shortcuts: [
      { name: 'Courses', url: '/courses' },
      { name: 'Workshops', url: '/workshops' },
      { name: 'Career Finder', url: '/career-test' },
      { name: 'Arena 1v1', url: '/arena' },
    ],
  };
}
