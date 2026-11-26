import type { InterfaceLocale } from '@/lib/locale';

/** Text of the error screens (app/error.tsx and app/global-error.tsx). */
export const ERROR_COPY: Record<
  InterfaceLocale,
  {
    eyebrow: string;
    title: string;
    description: string;
    reference: string;
    retry: string;
    home: string;
    catalog: string;
  }
> = {
  ru: {
    eyebrow: 'Сбой страницы',
    title: 'Что-то пошло не так',
    description:
      'Во время открытия раздела возникла непредвиденная ошибка. Ваш прогресс в безопасности — попробуйте обновить раздел или вернитесь на главную.',
    reference: 'Код обращения',
    retry: 'Повторить попытку',
    home: 'На главную',
    catalog: 'Каталог курсов',
  },
  tg: {
    eyebrow: 'Хатогии саҳифа',
    title: 'Хатогии ғайричашмдошт рух дод',
    description:
      'Ҳангоми кушодани ин бахш мушкил ба миён омад. Пешрафти шумо бехатар аст — дубора кӯшиш кунед ё ба саҳифаи асосӣ баргардед.',
    reference: 'Рамзи муроҷиат',
    retry: 'Аз нав кӯшиш кардан',
    home: 'Ба саҳифаи асосӣ',
    catalog: 'Каталоги курсҳо',
  },
  en: {
    eyebrow: 'Page interruption',
    title: 'Something went wrong',
    description:
      'An unexpected error occurred while opening this view. Your learning progress is safe — try reloading this section or return home.',
    reference: 'Reference ID',
    retry: 'Try again',
    home: 'Back to home',
    catalog: 'Course catalog',
  },
  es: {
    eyebrow: 'Interrupción de página',
    title: 'Algo salió mal',
    description:
      'Ocurrió un error inesperado al abrir esta sección. Tu progreso está a salvo: intenta recargar o vuelve al inicio.',
    reference: 'Código de referencia',
    retry: 'Intentar de nuevo',
    home: 'Volver al inicio',
    catalog: 'Catálogo de cursos',
  },
};
