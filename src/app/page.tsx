import { PageTransition } from '@/components/layout/page-transition';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { getRequestLocale } from '@/lib/request-locale';
import { LANDING_COPY, PUBLIC_COPY } from '@/lib/public-copy';
import { BRAND_NAME } from '@/lib/brand';
import { landingDirections } from '@/lib/landing-directions';
import { CATEGORY_ICONS } from '@/components/courses/category-icons';
import { PublicHeader } from '@/components/layout/public-header';
import { Brand } from '@/components/layout/brand';
import { LazyHeroScene } from '@/components/landing/hero-scene-lazy';
import { ComputerStory } from '@/components/landing/computer-story';
import type { ComputerScreenData } from '@/components/landing/computer-screen';
import { Starfield } from '@/components/landing/starfield';

const FAQ_LIMIT = 4;

const sectionTitle =
  'text-[32px] leading-tight font-bold tracking-[-0.02em] text-white md:text-[44px]';
const card = 'rounded-2xl border border-white/10 bg-white/[0.03] p-5';
const primaryLink =
  'inline-flex h-12 items-center gap-2 rounded-xl bg-[#c2410c] px-6 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#ea580c]';
const ghostLink =
  'inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 text-sm font-semibold text-white no-underline transition-colors hover:bg-white/15';

export default async function Page() {
  const locale = await getRequestLocale();
  const copy = PUBLIC_COPY[locale],
    landing = LANDING_COPY[locale];
  // Course counts come from the real catalog, with the plural form of the language.
  const directions = landingDirections(locale);
  const firstStep = landing.steps[0];
  const screen: ComputerScreenData = {
    brand: BRAND_NAME,
    lessonNumber: '01',
    lessonLabel: landing.screen.lesson,
    lessonTitle: firstStep.description.replace(/\.$/, ''),
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
      <main className="public-home overflow-x-clip !bg-[#07080d] !p-0 !text-white">
        <Starfield />
        <PublicHeader copy={headerCopy} />

        <section
          aria-labelledby="landing-hero-heading"
          className="relative isolate flex min-h-[100svh] items-center overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[url('/auth-showcase/workspace.webp')] bg-cover bg-center opacity-30"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-b from-[#07080d]/40 via-[#07080d]/70 to-[#07080d]"
          />
          <div className="mx-auto grid w-full max-w-[1200px] items-center gap-6 px-5 pt-28 pb-12 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:pb-20">
            <div className="animate-rise">
              <p className="mb-5 text-xs font-medium tracking-[0.2em] text-white/60 uppercase">
                {copy.eyebrow}
              </p>
              <h1
                id="landing-hero-heading"
                className="text-[40px] leading-[1.04] font-bold tracking-[-0.035em] text-white sm:text-[56px] lg:text-[68px]"
              >
                {copy.heroLead} <span className="text-[#a99bff]">{copy.heroEmphasis}</span>{' '}
                {copy.heroEnd}
              </h1>
              <p className="mt-5 max-w-[520px] text-base leading-relaxed text-white/70 sm:text-lg">
                {copy.heroDescription}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
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
          steps={landing.steps}
          screen={screen}
          screenLabel={landing.screen.label}
        />

        <section
          id="directions"
          aria-labelledby="public-directions-heading"
          className="mx-auto max-w-[1200px] px-5 py-20 sm:px-6"
        >
          <h2 id="public-directions-heading" className={sectionTitle}>
            {landing.directionTitle}
          </h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {directions.map((category) => {
              const Icon = CATEGORY_ICONS[category.id];
              return (
                <Link
                  key={category.id}
                  href={`/courses/category/${category.id}`}
                  className={`${card} group flex items-center gap-4 no-underline transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]`}
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#c9c2ff]">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <span className="flex-1">
                    <strong className="block text-white">{category.label}</strong>
                    <small className="text-white/50">{category.countLabel}</small>
                  </span>
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                    className="text-white/40 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              );
            })}
          </div>
        </section>

        <section
          id="faq"
          aria-labelledby="public-faq-heading"
          className="mx-auto max-w-[900px] px-5 pb-20 sm:px-6"
        >
          <h2 id="public-faq-heading" className={sectionTitle}>
            {landing.faqTitle}
          </h2>
          <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
            {landing.faq.slice(0, FAQ_LIMIT).map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg text-white">
                  {item.question}
                  <ChevronDown
                    size={18}
                    aria-hidden="true"
                    className="shrink-0 text-white/50 transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[url('/auth-showcase/code.webp')] bg-cover bg-center opacity-20"
          />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#07080d]/75" />
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-8 px-5 py-20 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-[34px] leading-tight font-bold tracking-[-0.02em] text-white md:text-[48px]">
                {copy.ctaTitle}
              </h2>
              <p className="mt-4 text-lg text-white/70">{copy.ctaDescription}</p>
            </div>
            <Link href="/courses" transitionTypes={['nav-forward']} className={primaryLink}>
              {copy.ctaLink} <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <footer className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-6 px-5 py-10 text-sm text-white/50 sm:px-6">
          <div className="flex flex-wrap items-center gap-4 [&_.public-brand>span:last-child]:!text-white">
            <Brand variant="public" />
            <small>
              © {new Date().getFullYear()} {BRAND_NAME}
            </small>
          </div>
          <nav className="flex gap-5" aria-label={landing.footerDocuments}>
            <Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-white">
              {copy.privacyLabel}
            </Link>
            <Link href="/terms" className="inline-flex min-h-11 items-center hover:text-white">
              {copy.termsLabel}
            </Link>
          </nav>
        </footer>
      </main>
    </PageTransition>
  );
}
