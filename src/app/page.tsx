import { PageTransition } from '@/components/layout/page-transition';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { getRequestLocale } from '@/lib/request-locale';
import { LANDING_COPY, PUBLIC_COPY } from '@/lib/public-copy';
import { BRAND_NAME } from '@/lib/brand';
import { landingDirections } from '@/lib/landing-directions';
import { PublicHeader } from '@/components/layout/public-header';
import { Brand } from '@/components/layout/brand';
import { LazyHeroScene } from '@/components/landing/hero-scene-lazy';
import { ComputerStory } from '@/components/landing/computer-story';
import type { ComputerScreenData } from '@/components/landing/computer-screen';
import { Starfield } from '@/components/landing/starfield';

const FAQ_LIMIT = 4;

const sectionTitle =
  'text-[32px] leading-tight font-bold tracking-[-0.02em] text-white md:text-[44px]';
const primaryLink =
  'inline-flex h-12 items-center gap-2 rounded-xl bg-[#4f46e5] px-6 text-sm font-semibold text-white no-underline ring-1 ring-inset ring-white/15 shadow-[0_14px_34px_-12px_rgba(79,70,229,0.75)] transition-colors hover:bg-[#4338ca] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8] motion-reduce:transition-none';
const ghostLink =
  'inline-flex h-12 items-center gap-2 rounded-xl border border-slate-400/20 bg-[#0e1526]/80 px-6 text-sm font-semibold text-white no-underline transition-colors hover:border-[#38bdf8]/40 hover:bg-[#131e36] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8] motion-reduce:transition-none';

export default async function Page() {
  const locale = await getRequestLocale();
  const copy = PUBLIC_COPY[locale],
    landing = LANDING_COPY[locale];
  // Course counts come from the real catalog, with the plural form of the language.
  const directions = landingDirections(locale);
  const screen: ComputerScreenData = {
    brand: BRAND_NAME,
    lessonNumber: '01',
    lessonLabel: landing.screen.lesson,
    lessonTitle: landing.screen.title,
    lessonText: landing.screen.text,
    progressLabel: landing.screen.progress,
    progress: 40,
    action: landing.screen.action,
    directionsTitle: landing.directionTitle,
    directions,
  };
  const headerCopy = {
    directions: landing.directions,
    how: landing.how,
    plans: landing.plans,
    questions: landing.questions,
    signIn: landing.signIn,
    openMenu: landing.openMenu,
    closeMenu: landing.closeMenu,
    start: copy.start,
    startShort: landing.startShort,
    platform: landing.footerPlatform,
  };
  return (
    <PageTransition>
      <main className="public-home overflow-x-clip !bg-[#060913] !p-0 !text-white">
        <Starfield />
        <PublicHeader copy={headerCopy} />

        <section
          aria-labelledby="landing-hero-heading"
          className="relative isolate flex min-h-[100svh] items-center overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[url('/auth-showcase/workspace.webp')] bg-cover bg-center opacity-20"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_38%,rgba(79,70,229,0.28),rgba(56,189,248,0.1)_42%,transparent_72%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-b from-[#060913]/45 via-[#060913]/75 to-[#060913]"
          />
          <div className="mx-auto grid w-full max-w-[1200px] items-center gap-6 px-5 pt-24 pb-10 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:pt-24 lg:pb-14">
            <div className="animate-rise">
              <p className="mb-4 text-xs font-semibold tracking-[0.2em] text-[#38bdf8] uppercase">
                {copy.eyebrow}
              </p>
              <h1
                id="landing-hero-heading"
                className="text-[38px] leading-[1.05] font-bold tracking-[-0.035em] text-white sm:text-[54px] lg:text-[64px]"
              >
                {copy.heroLead}{' '}
                <span className="bg-gradient-to-r from-[#818cf8] via-[#a5b4fc] to-[#38bdf8] bg-clip-text text-transparent">
                  {copy.heroEmphasis}
                </span>{' '}
                {copy.heroEnd}
              </h1>
              <p className="mt-5 max-w-[520px] text-base leading-relaxed text-slate-300/85 sm:text-lg">
                {copy.heroDescription}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/onboarding" transitionTypes={['nav-forward']} className={primaryLink}>
                  {copy.start} <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link href="#directions" className={ghostLink}>
                  {copy.seePlatform}
                </Link>
              </div>
            </div>
            <div className="animate-fade-in">
              <LazyHeroScene screen={screen} />
            </div>
          </div>
        </section>

        <ComputerStory
          title={landing.howTitle}
          directionTitle={landing.directionTitle}
          brand={BRAND_NAME}
          story={landing.story}
          directions={directions}
          locale={locale}
        />

        <section
          id="faq"
          aria-labelledby="public-faq-heading"
          className="mx-auto max-w-[900px] px-5 pb-20 sm:px-6"
        >
          <h2 id="public-faq-heading" className={sectionTitle}>
            {landing.faqTitle}
          </h2>
          <div className="mt-8 divide-y divide-slate-400/15 border-y border-slate-400/15">
            {landing.faq.slice(0, FAQ_LIMIT).map((item) => (
              <details key={item.question} className="group py-4">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-1 text-lg text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8]">
                  {item.question}
                  <ChevronDown
                    size={18}
                    aria-hidden="true"
                    className="shrink-0 text-slate-400 transition-transform group-open:rotate-180 group-open:text-[#38bdf8] motion-reduce:transition-none"
                  />
                </summary>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-300/75">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="relative isolate overflow-hidden border-t border-slate-400/15">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_75%_50%,rgba(79,70,229,0.34),rgba(56,189,248,0.12)_45%,transparent_68%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[url('/auth-showcase/workspace.webp')] bg-cover bg-[center_48%] opacity-20 [mask-image:linear-gradient(transparent,black_30%,black_66%,transparent)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-r from-[#060913]/80 via-transparent to-[#060913]/40"
          />
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-8 px-5 py-20 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-[34px] leading-tight font-bold tracking-[-0.02em] text-white md:text-[48px]">
                {copy.ctaTitle}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-200/80">
                {copy.ctaDescription}
              </p>
            </div>
            <Link href="/courses" transitionTypes={['nav-forward']} className={primaryLink}>
              {copy.ctaLink} <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <footer className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-6 border-t border-slate-400/15 px-5 py-10 text-sm text-slate-400 sm:px-6">
          <div className="flex flex-wrap items-center gap-4 [&_.public-brand]:inline-flex [&_.public-brand]:min-h-11 [&_.public-brand]:items-center [&_.public-brand>span:last-child]:!text-white">
            <Brand variant="public" />
            <small>
              © {new Date().getFullYear()} {BRAND_NAME}
            </small>
          </div>
          <nav className="flex gap-5" aria-label={landing.footerDocuments}>
            <Link
              href="/privacy"
              className="inline-flex min-h-11 items-center transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8]"
            >
              {copy.privacyLabel}
            </Link>
            <Link
              href="/terms"
              className="inline-flex min-h-11 items-center transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8]"
            >
              {copy.termsLabel}
            </Link>
          </nav>
        </footer>
      </main>
    </PageTransition>
  );
}
