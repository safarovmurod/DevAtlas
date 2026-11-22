'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  Clock3,
  ChevronRight,
  HelpCircle,
  Crown,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { courseName } from '@/content/courses/catalog';
import { useAccount } from '@/components/account/account-provider';
import { useMembershipStatus } from '@/components/courses/use-membership-status';
import { Brand } from './brand';
import { LanguageMenu } from './language-menu';
import { AccountMenu } from './account-menu';
import { RulesModal, RULES_COPY } from './rules-modal';

const PLAN_LABELS = {
  start: 'Start',
  pro: 'Pro',
  ultra: 'Ultra',
} as const;

export function Header() {
  const router = useRouter();
  const account = useAccount();
  const membership = useMembershipStatus();
  const [rulesOpen, setRulesOpen] = useState(false);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const collapsed = useAppStore((state) => state.desktopSidebarCollapsed);
  const toggleDesktop = useAppStore((state) => state.toggleDesktopSidebar);
  const seconds = useAppStore((state) => state.activeSecondsToday);
  const language = useLearningStore((state) => state.language);
  const course = useLearningStore((state) => state.selectedCourse);
  const copy = COPY[language];
  const rulesCopy = RULES_COPY[language];
  const openMenu = {
    ru: 'Открыть меню',
    en: 'Open menu',
    tg: 'Кушодани меню',
    es: 'Abrir menú',
  }[language];
  function goBack() {
    const navigation = (window as Window & { navigation?: { canGoBack: boolean } }).navigation;
    let previousOnSite = false;
    try {
      previousOnSite = new URL(document.referrer).origin === window.location.origin;
    } catch {
      // Direct entries have no referrer.
    }
    if (navigation ? navigation.canGoBack : previousOnSite) router.back();
    else router.push(window.location.pathname === '/courses' ? '/' : '/courses');
  }
  const closeMenu = {
    ru: 'Свернуть меню',
    en: 'Collapse menu',
    tg: 'Ҷамъ кардани меню',
    es: 'Contraer menú',
  }[language];
  const planBadgeClass =
    membership.plan === 'ultra'
      ? 'border-indigo-400/40 bg-indigo-500/15 text-indigo-500 dark:text-indigo-300'
      : membership.plan === 'pro'
        ? 'border-sky-400/40 bg-sky-500/15 text-sky-600 dark:text-sky-300'
        : 'border-border bg-muted/70 text-muted-foreground';

  return (
    <>
      <header className="app-header">
        <div className="header-brand">
          <button
            className="icon-button mobile-menu"
            onClick={toggleSidebar}
            aria-label={openMenu}
            aria-expanded={sidebarOpen}
            aria-controls="learning-sidebar"
          >
            <Menu size={21} />
          </button>
          <Brand />
        </div>
        <button
          type="button"
          className="icon-button desktop-sidebar-toggle"
          aria-label={collapsed ? openMenu : closeMenu}
          aria-expanded={!collapsed}
          aria-controls="learning-sidebar"
          onClick={toggleDesktop}
        >
          {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
        <button
          className="icon-button workspace-back"
          type="button"
          onClick={goBack}
          aria-label={copy.back}
          title={copy.back}
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <span className="header-caption">
          <ChevronRight size={15} />
          {courseName(course)}
        </span>
        <div className="header-tools">
          {account.user && !membership.loading && (
            <Link
              href="/plans"
              className={`hidden items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold no-underline transition-colors hover:border-primary sm:inline-flex ${planBadgeClass}`}
              title={PLAN_LABELS[membership.plan]}
            >
              <Crown size={13} aria-hidden="true" />
              <span>{PLAN_LABELS[membership.plan]}</span>
            </Link>
          )}
          <span className="active-time">
            <Clock3 size={16} />
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
          </span>
          <button
            type="button"
            className="icon-button !size-11"
            onClick={() => setRulesOpen(true)}
            aria-label={rulesCopy.buttonLabel}
            title={rulesCopy.buttonLabel}
          >
            <HelpCircle size={19} />
          </button>
          <LanguageMenu />
          <Link
            href="/settings"
            transitionTypes={['nav-fade']}
            className="icon-button header-settings"
            aria-label={copy.settings}
          >
            <Settings2 size={19} />
          </Link>
          <AccountMenu />
        </div>
      </header>
      <RulesModal open={rulesOpen} language={language} onClose={() => setRulesOpen(false)} />
    </>
  );
}
