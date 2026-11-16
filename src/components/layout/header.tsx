'use client';
import Link from 'next/link';
import { Menu, Settings2, Clock3, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useLearningStore } from '@/stores/learning-store';
import { COPY } from '@/lib/i18n';
import { courseName } from '@/content/courses/catalog';
import { Brand } from './brand';
import { LanguageMenu } from './language-menu';
import { AccountMenu } from './account-menu';

export function Header() {
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const sidebarOpen = useAppStore((state) => state.sidebarOpen);
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
