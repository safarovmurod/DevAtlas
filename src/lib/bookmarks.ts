import { courseSectionHref } from '@/lib/courses/links';
import type { CourseId } from '@/lib/courses/ids';
import type { InterfaceLocale } from '@/lib/locale';

/** A lesson day. React numbers its days within month 1 or 2. */
export interface BookmarkTarget {
  courseId: CourseId;
  day: number;
  month?: number;
}

/** One bookmark per lesson day. */
export function bookmarkKey(target: BookmarkTarget) {
  return target.courseId === 'react'
    ? `react:${target.month ?? 1}:${target.day}`
    : `${target.courseId}:${target.day}`;
}

export function bookmarkHref(target: BookmarkTarget) {
  return target.courseId === 'react'
    ? `/home?month=${target.month ?? 1}&day=${target.day}`
    : courseSectionHref(target.courseId, 'home', target.day);
}

export const BOOKMARKS_COPY: Record<
  InterfaceLocale,
  {
    title: string;
    subtitle: string;
    save: string;
    saved: string;
    remove: string;
    empty: string;
  }
> = {
  ru: {
    title: 'Закладки',
    subtitle: 'Уроки, к которым вы хотите вернуться.',
    save: 'В закладки',
    saved: 'В закладках',
    remove: 'Удалить из закладок',
    empty: 'Пока нет закладок. Откройте урок и нажмите «В закладки», чтобы вернуться к нему позже.',
  },
  en: {
    title: 'Bookmarks',
    subtitle: 'Lessons you want to come back to.',
    save: 'Bookmark',
    saved: 'Bookmarked',
    remove: 'Remove bookmark',
    empty: 'No bookmarks yet. Open a lesson and press “Bookmark” to come back to it later.',
  },
  tg: {
    title: 'Захирашудаҳо',
    subtitle: 'Дарсҳое, ки мехоҳед ба онҳо баргардед.',
    save: 'Захира кардан',
    saved: 'Захира шуд',
    remove: 'Аз захираҳо хориҷ кардан',
    empty:
      'Ҳоло чизе захира нашудааст. Дарсро кушоед ва «Захира кардан»-ро пахш кунед, то баъдтар ба он баргардед.',
  },
  es: {
    title: 'Guardados',
    subtitle: 'Lecciones a las que quieres volver.',
    save: 'Guardar',
    saved: 'Guardado',
    remove: 'Quitar de guardados',
    empty: 'Aún no hay guardados. Abre una lección y pulsa «Guardar» para volver a ella más tarde.',
  },
};
