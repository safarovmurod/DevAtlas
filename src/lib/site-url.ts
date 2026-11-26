/**
 * Public origin for canonical links, robots.txt and sitemap.xml.
 * REACT_MENTOR_SITE_URL is the owner-configured HTTPS address (also used for payment return links).
 * On Vercel the production domain is the fallback; local runs use localhost.
 */
export function publicSiteUrl(env: Record<string, string | undefined> = process.env): URL {
  const vercelDomain = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const candidates = [env.REACT_MENTOR_SITE_URL, vercelDomain && `https://${vercelDomain}`];
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (!value) continue;
    try {
      const url = new URL(value);
      if (url.protocol === 'https:') return new URL(url.origin);
    } catch {
      // A malformed value is skipped; the next candidate applies.
    }
  }
  return new URL('http://localhost:3000');
}
