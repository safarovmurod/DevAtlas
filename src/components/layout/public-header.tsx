'use client';

import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Brand } from './brand';

type HeaderCopy = {
  directions: string;
  how: string;
  plans: string;
  questions: string;
  signIn: string;
  openMenu: string;
  closeMenu: string;
  start: string;
  startShort: string;
  platform: string;
};

const linkClass =
  'inline-flex min-h-11 items-center rounded-full px-3.5 py-2 text-sm font-medium text-slate-300 no-underline transition-colors hover:bg-slate-400/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8] motion-reduce:transition-none';

/** Obsidian glass navigation bar, full width, fixed on top of the landing page. */
export function PublicHeader({ copy }: { copy: HeaderCopy }) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const links = [
    { href: '#directions', label: copy.directions },
    { href: '#how-it-works', label: copy.how },
    { href: '/plans', label: copy.plans },
    { href: '#faq', label: copy.questions },
  ];

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>('button')?.focus();
    function dismiss(event: PointerEvent) {
      if (event.target instanceof Node && !container.current?.contains(event.target))
        setOpen(false);
    }
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);

  function handleKey(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = Array.from(
      panel.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])') || [],
    );
    if (!items.length) return;
    if (event.shiftKey && document.activeElement === items[0]) {
      event.preventDefault();
      items.at(-1)?.focus();
    } else if (!event.shiftKey && document.activeElement === items.at(-1)) {
      event.preventDefault();
      items[0].focus();
    }
  }

  return (
    <header
      ref={container}
      className="fixed inset-x-0 top-0 z-50 border-b border-slate-400/15 bg-[#060913]/85 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6">
        <div className="min-w-0 [&_.public-brand]:inline-flex [&_.public-brand]:min-h-11 [&_.public-brand]:items-center [&_.public-brand>span:last-child]:!text-white">
          <Brand variant="public" />
        </div>
        <nav className="hidden items-center gap-1 md:flex" aria-label={copy.platform}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/login"
            transitionTypes={['nav-forward']}
            className="hidden min-h-11 items-center px-3 py-2 text-sm font-medium text-slate-300 no-underline transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8] sm:inline-flex"
          >
            {copy.signIn}
          </Link>
          <Link
            href="/login"
            transitionTypes={['nav-forward']}
            aria-label={copy.start}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-[#4f46e5] px-3 text-sm font-semibold text-white no-underline ring-1 ring-inset ring-white/15 transition-colors hover:bg-[#4338ca] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8] motion-reduce:transition-none sm:px-4"
          >
            <span className="hidden sm:inline">{copy.start}</span>
            <span className="sm:hidden" aria-hidden="true">
              {copy.startShort}
            </span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <button
            ref={trigger}
            type="button"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-400/20 bg-[#0e1526]/70 text-white transition-colors hover:border-[#38bdf8]/40 hover:bg-[#131d33] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8] md:hidden"
            aria-label={copy.openMenu}
            aria-expanded={open}
            aria-controls="public-mobile-navigation"
            onClick={() => setOpen((value) => !value)}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
      {open && (
        <div
          className="border-t border-slate-400/15 bg-[#060913]/95 p-4 md:hidden"
          id="public-mobile-navigation"
          role="dialog"
          aria-label={copy.openMenu}
          ref={panel}
          onKeyDown={handleKey}
        >
          <button
            type="button"
            className="mb-2 ml-auto flex size-11 items-center justify-center rounded-xl border border-slate-400/20 bg-[#0e1526] text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8]"
            aria-label={copy.closeMenu}
            onClick={close}
          >
            <X size={20} />
          </button>
          <nav aria-label={copy.platform} className="grid gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className={linkClass + ' !py-3 text-base'}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/login" onClick={close} className={linkClass + ' !py-3 text-base'}>
              {copy.signIn}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
