'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, CalendarCheck, Code2, UserRound } from 'lucide-react';
import { COPY } from '@/lib/i18n';
import type { InterfaceLocale } from '@/lib/locale';
import { cn } from '@/lib/utils';
import { useLearningStore } from '@/stores/learning-store';

const LABELS: Record<InterfaceLocale, { courses: string; profile: string; nav: string }> = {
  ru: { courses: 'Курсы', profile: 'Профиль', nav: 'Основные разделы' },
  tg: { courses: 'Курсҳо', profile: 'Профил', nav: 'Бахшҳои асосӣ' },
  en: { courses: 'Courses', profile: 'Profile', nav: 'Main sections' },
  uk: { courses: 'Курси', profile: 'Профіль', nav: 'Основні розділи' },
  ja: { courses: 'コース', profile: 'プロフィール', nav: '主なセクション' },
  ko: { courses: '강좌', profile: '프로필', nav: '주요 메뉴' },
};

/** Phone navigation from the mockups: My day, Courses, Practice, Profile. */
export function MobileTabBar() {
  const pathname = usePathname();
  const language = useLearningStore((state) => state.language);
  const course = useLearningStore((state) => state.selectedCourse);
  const copy = COPY[language];
  const labels = LABELS[language];
  const homeHref = course === 'react' ? '/home' : `/courses/${course}/home`;

  const tabs = [
    { href: homeHref, label: copy.home, icon: CalendarCheck, active: pathname === homeHref },
    {
      href: '/courses',
      label: labels.courses,
      icon: BookOpen,
      active:
        pathname === '/courses' || (pathname.startsWith('/courses/') && pathname !== homeHref),
    },
    { href: '/practice', label: copy.practice, icon: Code2, active: pathname === '/practice' },
    { href: '/settings', label: labels.profile, icon: UserRound, active: pathname === '/settings' },
  ];

  return (
    <nav
      aria-label={labels.nav}
      className="mobile-tab-bar fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] min-[861px]:hidden"
    >
      {tabs.map(({ href, label, icon: Icon, active }) => (
        <Link
          key={label}
          href={href}
          transitionTypes={['nav-fade']}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium no-underline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
            active ? 'text-brand' : 'text-muted-foreground',
          )}
        >
          <Icon size={22} strokeWidth={1.7} aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
