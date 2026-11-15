import type { InterfaceLocale } from './locale';

export const PREMIUM_COPY: Record<
  InterfaceLocale,
  {
    starter: string;
    all: string;
    login: string;
    required: string;
    unavailable: string;
    plans: string;
    signIn: string;
    protected: string;
  }
> = {
  ru: {
    starter: 'Бесплатно',
    all: 'Все уровни',
    login: 'Войдите в аккаунт, чтобы открыть этот курс.',
    required: 'Для этого курса нужна действующая подписка',
    unavailable: 'Не удалось проверить доступ. Попробуйте ещё раз.',
    plans: 'Посмотреть тарифы',
    signIn: 'Войти',
    protected: 'Доступ к материалам проверяется сервером.',
  },
  tg: {
    starter: 'Ройгон',
    all: 'Ҳамаи сатҳҳо',
    login: 'Барои кушодани ин курс ба аккаунт ворид шавед.',
    required: 'Барои ин курс обунаи фаъол лозим аст',
    unavailable: 'Дастрасӣ санҷида нашуд. Боз кӯшиш кунед.',
    plans: 'Дидани тарифҳо',
    signIn: 'Ворид шудан',
    protected: 'Дастрасӣ ба мавод аз тарафи сервер санҷида мешавад.',
  },
  en: {
    starter: 'Free',
    all: 'All plans',
    login: 'Sign in to open this course.',
    required: 'This course requires an active subscription',
    unavailable: 'Access could not be verified. Please retry.',
    plans: 'View plans',
    signIn: 'Sign in',
    protected: 'The server verifies access to course materials.',
  },
  es: {
    starter: 'Gratis',
    all: 'Todos los niveles',
    login: 'Inicia sesión para abrir este curso.',
    required: 'Este curso requiere una suscripción activa',
    unavailable: 'No se pudo verificar el acceso. Inténtalo de nuevo.',
    plans: 'Ver planes',
    signIn: 'Entrar',
    protected: 'El servidor comprueba el acceso a los materiales.',
  },
};
