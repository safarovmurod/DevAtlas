'use client';
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
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { courseName } from '@/content/courses/catalog';
import { Brand } from './brand';
import { LanguageMenu } from './language-menu';
import { AccountMenu } from './account-menu';

export function Header() {
  const router = useRouter();
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
  const collapsed = useAppStore((state) => state.desktopSidebarCollapsed);
  const toggleDesktop = useAppStore((state) => state.toggleDesktopSidebar);
  const seconds = useAppStore((state) => state.activeSecondsToday);
  const language = useLearningStore((state) => state.language);
  const course = useLearningStore((state) => state.selectedCourse);
  const copy = COPY[language];
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
  return (
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
        <span className="active-time">
          <Clock3 size={16} />
          {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
        </span>
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
  );
}
