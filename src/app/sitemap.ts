import type { MetadataRoute } from 'next';
import { sitemapEntries } from '@/lib/seo';
import { publicSiteUrl } from '@/lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries(publicSiteUrl());
}
