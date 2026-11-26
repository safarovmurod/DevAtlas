'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  CalendarCheck,
  Route,
  RotateCcw,
  BookOpenCheck,
  BarChart3,
  Bookmark,
  Settings2,
  X,
  Crown,
  MessagesSquare,
  ChevronsUpDown,
  ShieldCheck,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { useAccount } from '@/components/account/account-provider';
import { AccountAvatar } from '@/components/account/account-avatar';
import { courseDisplayName } from '@/lib/catalog-copy';
import { CourseIcon } from '@/components/courses/course-icon';
import { useMembershipStatus } from '@/components/courses/use-membership-status';
import { useCourseProgress } from '@/lib/use-course-progress';
import { BOOKMARKS_COPY } from '@/lib/bookmarks';
// "Мой день" holds the lesson and its practice, "Повторение" holds revision and weak topics.
// Tests and interviews are not a separate section: each day opens its own strict attempt.
const items = [
  { key: 'plan', href: '/plan', icon: Route },
  { key: 'home', href: '/home', icon: CalendarCheck },
  { key: 'revision', href: '/revision', icon: RotateCcw },
  { key: 'answers', href: '/answers', icon: BookOpenCheck },
  { key: 'progress', href: '/progress', icon: BarChart3 },
  { key: 'bookmarks', href: '/bookmarks', icon: Bookmark },
] as const;

function NavIcon({ icon: Icon, active }: { icon: typeof CalendarCheck; active?: boolean }) {
  return (
    <span
      className={
        'flex size-8 shrink-0 items-center justify-center rounded-xl transition-[transform,background-color,color,box-shadow] duration-200 group-hover/nav:-translate-y-px ' +
        (active
          ? 'bg-primary-soft text-brand ring-1 ring-primary/35'
          : 'bg-muted text-muted-foreground ring-1 ring-border/80 group-hover/nav:text-foreground')
      }
    >
      <Icon size={17} strokeWidth={1.9} aria-hidden="true" />
    </span>
  );
}

const NAV_LABELS = {
  ru: {
    open: 'Открыть меню',
    close: 'Закрыть меню',
    navigation: 'Навигация по курсу',
    eyebrow: 'ОБУЧЕНИЕ',
    choose: 'Выбрать курс',
    tests: 'Тесты и интервью',
    answers: 'Ответы и интервью',
    progress: 'Прогресс',
    guest: 'Гость',
    personal: 'Личный аккаунт',
    local: 'В этом браузере',
  },
  en: {
    open: 'Open menu',
    close: 'Close menu',
    navigation: 'Course navigation',
    eyebrow: 'WORKSPACE',
    choose: 'Choose course',
    tests: 'Tests & interview',
    answers: 'Answers & interview',
    progress: 'Progress',
    guest: 'Guest',
    personal: 'Personal account',
    local: 'In this browser',
  },
  tg: {
    open: 'Кушодани меню',
    close: 'Пӯшидани меню',
    navigation: 'Менюи курс',
    eyebrow: 'ОМӮЗИШ',
    choose: 'Интихоби курс',
    tests: 'Санҷишҳо ва мусоҳиба',
    answers: 'Ҷавобҳо ва мусоҳиба',
    progress: 'Пешрафт',
    guest: 'Меҳмон',
    personal: 'Аккаунти шахсӣ',
    local: 'Дар ҳамин браузер',
  },
  es: {
    open: 'Abrir menú',
    close: 'Cerrar menú',
    navigation: 'Navegación del curso',
    eyebrow: 'APRENDIZAJE',
    choose: 'Elegir curso',
    tests: 'Pruebas y entrevista',
    answers: 'Respuestas y entrevista',
    progress: 'Progreso',
    guest: 'Invitado',
    personal: 'Cuenta personal',
    local: 'En este navegador',
  },
};
const EXTRA_NAV = {
  ru: { plans: 'Тарифы', community: 'Сообщество' },
  en: { plans: 'Plans', community: 'Community' },
  tg: { plans: 'Тарифҳо', community: 'Ҷомеа' },
  es: { plans: 'Planes', community: 'Comunidad' },
};
const ADMIN_LABEL = { ru: 'Админ', en: 'Admin', tg: 'Админ', es: 'Admin' };
export function Sidebar() {
  const account = useAccount();
  const membership = useMembershipStatus();
  const pathname = usePathname();
  const open = useAppStore((state) => state.sidebarOpen);
  const collapsed = useAppStore((state) => state.desktopSidebarCollapsed);
  const reactSelection = useLearningStore((state) => state.drafts['react-selected-day']);
  const setOpen = useAppStore((state) => state.setSidebarOpen);
  const [mobile, setMobile] = useState(false);
  const drawer = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 860px)');
    const update = () => {
      setMobile(media.matches);
      if (!media.matches) setOpen(false);
    };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [setOpen]);
  useEffect(() => {
    if (!open || !mobile) return;
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const controls = drawer.current?.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled])',
      );
      if (!controls?.length) return;
      const first = controls[0],
        last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open, mobile, setOpen]);
  const {
    course,
    language,
    reactMonth,
    percent: progressPercent,
    label: progressLabel,
  } = useCourseProgress();
  const copy = COPY[language];
  const labels = NAV_LABELS[language];
  const [savedMonth, savedDay] = (reactSelection ?? '').split(':').map(Number);
  const answersHref = `/answers?month=${reactMonth}&day=${savedMonth === reactMonth && savedDay >= 1 && savedDay <= 30 ? savedDay : 1}`;
  return (
    <>
      {open && (
        <button
          className="sidebar-overlay"
          aria-label={labels.close}
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        id="learning-sidebar"
        ref={drawer}
        className={'sidebar ' + (open ? 'is-open ' : '') + (collapsed ? 'is-collapsed' : '')}
        role={mobile && open ? 'dialog' : undefined}
        aria-modal={mobile && open ? true : undefined}
        aria-label={labels.navigation}
        inert={mobile ? !open : collapsed}
      >
        <div className="sidebar-top">
          <span className="eyebrow">{labels.eyebrow}</span>
          <button
            ref={closeButton}
            className="icon-button mobile-menu"
            onClick={() => setOpen(false)}
            aria-label={labels.close}
          >
            <X size={20} />
          </button>
        </div>
        <Link
          transitionTypes={['nav-fade']}
          href="/courses"
          aria-current={pathname === '/courses' ? 'page' : undefined}
          className="group relative mx-1 mb-3 block shrink-0 overflow-hidden rounded-2xl border border-indigo-400/20 !bg-[linear-gradient(145deg,#0f172a_0%,#1e1b4b_100%)] p-4 !text-white no-underline shadow-[0_18px_34px_-20px_rgba(15,23,42,0.85)] transition-transform duration-300 hover:-translate-y-0.5"
          onClick={() => setOpen(false)}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-8 -right-8 size-28 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.28),rgba(79,70,229,0.2)_48%,transparent_72%)] blur-2xl"
          />
          <span className="relative flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
              <CourseIcon courseId={course} size={30} />
            </span>
            <span className="grid min-w-0">
              <small className="text-xs text-slate-300/75">{labels.choose}</small>
              <strong className="truncate text-sm font-semibold text-white">
                {courseDisplayName(course, language)}
              </strong>
            </span>
            <ChevronsUpDown size={16} aria-hidden="true" className="ml-auto text-slate-300/60" />
          </span>
          <span
            role="progressbar"
            aria-label={progressLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressPercent)}
            className="relative mt-4 block h-1.5 overflow-hidden rounded-full bg-white/12"
          >
            <span
              className="block h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#38bdf8]"
              style={{ width: `${Math.round(progressPercent)}%` }}
            />
          </span>
          <small className="relative mt-2 block font-mono text-xs tabular-nums text-slate-300/75">
            {progressLabel}
          </small>
        </Link>
        <nav>
          {items.map((item) => {
            const Icon = item.icon;
            const href =
              course === 'react' && item.key === 'plan'
                ? `/plan/${reactMonth}`
                : course === 'react' && item.key === 'answers'
                  ? answersHref
                  : course === 'react' || item.key === 'progress' || item.key === 'bookmarks'
                    ? item.href
                    : `/courses/${course}${item.href}`;
            const active =
              pathname === href ||
              (course === 'react' &&
                item.href === '/answers' &&
                (pathname === '/answers' || pathname.startsWith('/answers/'))) ||
              (course === 'react' &&
                item.href === '/plan' &&
                (pathname.startsWith('/lesson/') || pathname.startsWith('/plan/')));
            return (
              <Link
                transitionTypes={['nav-fade']}
                key={item.href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={'nav-item group/nav gap-3 ' + (active ? 'active' : '')}
                onClick={() => setOpen(false)}
              >
                <NavIcon icon={Icon} active={active} />
                <span>
                  {item.key === 'answers'
                    ? labels.answers
                    : item.key === 'progress'
                      ? labels.progress
                      : item.key === 'bookmarks'
                        ? BOOKMARKS_COPY[language].title
                        : copy[item.key]}
                </span>
                {active && <span className="nav-dot" />}
              </Link>
            );
          })}
        </nav>
        <nav className="sidebar-extra" aria-label={EXTRA_NAV[language].community}>
          <span className="eyebrow">{EXTRA_NAV[language].community}</span>
          <Link
            transitionTypes={['nav-fade']}
            href="/community"
            className={'nav-item group/nav gap-3 ' + (pathname === '/community' ? 'active' : '')}
            onClick={() => setOpen(false)}
          >
            <NavIcon icon={MessagesSquare} active={pathname === '/community'} />
            <span>{EXTRA_NAV[language].community}</span>
          </Link>
          <Link
            transitionTypes={['nav-fade']}
            href="/plans"
            className={'nav-item group/nav gap-3 ' + (pathname === '/plans' ? 'active' : '')}
            onClick={() => setOpen(false)}
          >
            <NavIcon icon={Crown} active={pathname === '/plans'} />
            <span>{EXTRA_NAV[language].plans}</span>
          </Link>
        </nav>
        <div className="sidebar-bottom">
          {/* Only a shortcut for the owner. The server checks the role and 2FA on every request. */}
          {account.user?.app_metadata?.app_role === 'admin' && (
            <Link
              transitionTypes={['nav-fade']}
              href="/admin"
              aria-current={pathname === '/admin' ? 'page' : undefined}
              className={'nav-item group/nav gap-3 ' + (pathname === '/admin' ? 'active' : '')}
              onClick={() => setOpen(false)}
            >
              <NavIcon icon={ShieldCheck} active={pathname === '/admin'} />
              {ADMIN_LABEL[language]}
            </Link>
          )}
          <Link
            transitionTypes={['nav-fade']}
            href="/settings"
            aria-current={pathname === '/settings' ? 'page' : undefined}
            className={'nav-item group/nav gap-3 ' + (pathname === '/settings' ? 'active' : '')}
            onClick={() => setOpen(false)}
          >
            <NavIcon icon={Settings2} active={pathname === '/settings'} />
            {copy.settings}
          </Link>
          <Link
            transitionTypes={['nav-fade']}
            href="/settings"
            className="profile-row"
            onClick={() => setOpen(false)}
          >
            <AccountAvatar />
            <div>
              <strong>{account.profile?.displayName || labels.guest}</strong>
              <span>
                {account.user
                  ? `${labels.personal} · ${membership.plan === 'ultra' ? 'Ultra' : membership.plan === 'pro' ? 'Pro' : 'Start'}`
                  : labels.local}
              </span>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
