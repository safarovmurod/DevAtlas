import type { MetadataRoute } from 'next';
import { robotsRules } from '@/lib/seo';
import { publicSiteUrl } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  return robotsRules(publicSiteUrl());
}
