'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowLeft, ArrowRight, Rotate3d, Sparkles } from 'lucide-react';
import { SHOWCASE_SLIDES, SHOWCASE_UI, showcaseCopy } from '@/lib/auth-showcase-content';
import { useLearningStore } from '@/stores/learning-store';
import type { createShowcaseScene } from './auth-showcase-scene';
import type { AuthCopy } from '@/lib/auth-copy';

type Scene = ReturnType<typeof createShowcaseScene>;

export function AuthShowcase() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const update = () => setDesktop(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return desktop ? <DesktopShowcase /> : null;
}

/** Static mobile artwork: no carousel, WebGL, timer or gesture handlers. */
export function AuthShowcaseMobile({ copy }: { copy: AuthCopy }) {
  return (
    <div className="auth-mobile-showcase">
      <div className="auth-mobile-showcase-copy">
        <strong>{copy.panelFlow}</strong>
        <span>{copy.panelBenefits[2]}</span>
      </div>
      <div className="auth-mobile-showcase-image" aria-hidden="true">
        <Image src="/auth-showcase/creative.webp" alt="" fill sizes="160px" />
      </div>
    </div>
  );
}

function DesktopShowcase() {
  const language = useLearningStore((state) => state.language);
  const locale = language;
  const ui = SHOWCASE_UI[locale];
  const [active, setActive] = useState(0);
  const [autoplay] = useState(() =>
    Autoplay({
      delay: 8000,
      playOnInit: false,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      stopOnFocusIn: true,
    }),
  );
  const [viewportRef, carousel] = useEmblaCarousel({ loop: true, duration: 35, watchDrag: true }, [
    autoplay,
  ]);
  const sceneHost = useRef<HTMLDivElement>(null);
  const scene = useRef<Scene | null>(null);
  const activeRef = useRef(active);
  const [sceneReady, setSceneReady] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);

  useEffect(() => {
    if (!carousel) return;
    const select = () => {
      const index = carousel.selectedScrollSnap();
      setActive(index);
      activeRef.current = index;
      scene.current?.setSlide(index);
    };
    carousel.on('select', select);
    carousel.on('reInit', select);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 1024px)');
    const sync = () => {
      if (motion.matches || !desktop.matches || document.hidden) autoplay.stop();
      else autoplay.play();
    };
    sync();
    motion.addEventListener('change', sync);
    desktop.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      carousel.off('select', select);
      carousel.off('reInit', select);
      motion.removeEventListener('change', sync);
      desktop.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [carousel, autoplay]);

  useEffect(() => {
    const host = sceneHost.current;
    if (!host) return;
    let cancelled = false;
    let loading = false;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 1024px)');
    async function load() {
      if (cancelled || loading || !desktop.matches || scene.current) return;
      loading = true;
      try {
        const { createShowcaseScene } = await import('./auth-showcase-scene');
        if (cancelled || !host) return;
        scene.current = createShowcaseScene(host, motion.matches);
        scene.current.setSlide(activeRef.current);
        setSceneReady(true);
        setMotionAllowed(!motion.matches);
      } catch {
        // The photo and course artwork remain visible when WebGL is unavailable.
        setSceneReady(false);
      } finally {
        loading = false;
      }
    }
    function refresh() {
      scene.current?.dispose();
      scene.current = null;
      setSceneReady(false);
      void load();
    }
    void load();
    motion.addEventListener('change', refresh);
    return () => {
      cancelled = true;
      motion.removeEventListener('change', refresh);
      scene.current?.dispose();
      scene.current = null;
    };
  }, []);

  return (
    <section
      className="auth-showcase !bg-[#060913]"
      aria-label={ui.label}
      aria-roledescription="carousel"
      lang={locale}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          carousel?.scrollPrev();
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          carousel?.scrollNext();
        }
      }}
    >
      <div className="auth-showcase-viewport" ref={viewportRef}>
        <div className="auth-showcase-track">
          {SHOWCASE_SLIDES.map((slide, index) => {
            const text = showcaseCopy(index, language);
            return (
              <article
                className="auth-showcase-slide"
                key={slide.id}
                aria-hidden={active !== index}
                aria-label={`${index + 1} / ${SHOWCASE_SLIDES.length}`}
              >
                <Image
                  className="auth-showcase-photo"
                  src={`/auth-showcase/${slide.image}.webp`}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 550px, 1px"
                  loading="eager"
                />
                <div
                  className="auth-showcase-shade"
                  style={{
                    background:
                      'radial-gradient(ellipse at 50% 34%, rgba(79,70,229,0.28), rgba(56,189,248,0.1) 42%, transparent 64%), linear-gradient(180deg, rgba(6,9,19,0.72), rgba(14,21,38,0.28) 32%, rgba(6,9,19,0.88) 60%, #060913 88%)',
                  }}
                />
                <div className="auth-showcase-editorial">
                  <span className="auth-showcase-number !text-[#38bdf8]">
                    {String(index + 1).padStart(2, '0')} <span>/ 08</span>
                  </span>
                  <h2>{text.title}</h2>
                  <p>{text.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <div className="auth-showcase-stage" aria-hidden="true" ref={sceneHost} />
      {!sceneReady && (
        <div className="auth-showcase-fallback" aria-hidden="true">
          <Image
            src={`/course-icons/${SHOWCASE_SLIDES[active].icon}.svg`}
            alt=""
            width={120}
            height={120}
          />
        </div>
      )}
      {sceneReady && motionAllowed && (
        <button
          type="button"
          className="auth-showcase-rotate !border-slate-400/25 !bg-[#0e1526]/80 !text-[#7dd3fc] hover:!border-[#38bdf8]/60 hover:!bg-[#162240]"
          aria-label={ui.rotate}
          title={ui.rotate}
          onClick={() => scene.current?.spin()}
        >
          <Rotate3d size={18} aria-hidden="true" />
        </button>
      )}
      <div className="auth-showcase-topline">
        <span>{ui.detail}</span>
        <span className="!text-[#818cf8]">DevAtlas</span>
      </div>
      <div className="auth-showcase-navigation">
        <div className="auth-showcase-dots">
          {SHOWCASE_SLIDES.map((slide, index) => (
            <button
              type="button"
              key={slide.id}
              aria-label={showcaseCopy(index, language).title}
              aria-pressed={active === index}
              onClick={() => {
                carousel?.scrollTo(index);
                autoplay.reset();
              }}
            >
              <span className={active === index ? '!bg-[#38bdf8]' : undefined} />
            </button>
          ))}
        </div>
        <div className="auth-showcase-arrows">
          <button
            type="button"
            aria-label={ui.previous}
            className="!border-slate-400/30 !bg-[#0e1526]/80 !text-white hover:!border-[#38bdf8]/50 hover:!bg-[#162240]"
            onClick={() => {
              carousel?.scrollPrev();
              autoplay.reset();
            }}
          >
            <ArrowLeft size={19} />
          </button>
          <button
            type="button"
            aria-label={ui.next}
            className="!border-[#6366f1] !bg-[#4f46e5] !text-white hover:!border-[#818cf8] hover:!bg-[#4338ca]"
            onClick={() => {
              carousel?.scrollNext();
              autoplay.reset();
            }}
          >
            <ArrowRight size={19} />
          </button>
        </div>
      </div>
      <div className="auth-showcase-bottom !border-slate-400/15">
        <span className="!text-[#7dd3fc]">
          <Sparkles size={14} aria-hidden="true" />
          {ui.recommended}
        </span>
      </div>
    </section>
  );
}
