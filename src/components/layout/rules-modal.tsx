'use client';

import { useEffect, useRef } from 'react';
import { BookOpen, Bot, HelpCircle, MessagesSquare, Mic, ShieldAlert, X } from 'lucide-react';
import type { InterfaceLocale } from '@/lib/locale';

type RuleSection = {
  icon: 'platform' | 'tutor' | 'voice' | 'community' | 'safety';
  title: string;
  items: string[];
};

type RulesCopy = {
  buttonLabel: string;
  title: string;
  subtitle: string;
  close: string;
  sections: RuleSection[];
};

export const RULES_COPY: Record<InterfaceLocale, RulesCopy> = {
  tg: {
    buttonLabel: 'Қоидаҳои сайт ва AI',
    title: 'Қоидаҳои DevAtlas',
    subtitle: 'Тартиби истифодаи сайт, AI Tutor, ёрдамчии овозӣ ва чати ҷомеа.',
    close: 'Пӯшидан',
    sections: [
      {
        icon: 'platform',
        title: '1. Платформа ва курсҳо',
        items: [
          'Дарсҳо, тестҳо ва нақшаи омӯзиш барои омӯзиши мустақил ва қадам ба қадам сохта шудаанд.',
          'Дастрасӣ ба имкониятҳои пулакӣ (Pro / Ultra) аз рӯи обунаи фаъол дар сервер санҷида мешавад.',
          'Пас аз тамом шудани мӯҳлати обуна аккаунт ба тарифи ройгони Start бармегардад.',
        ],
      },
      {
        icon: 'tutor',
        title: '2. AI Tutor (Чат)',
        items: [
          'Танҳо дар бораи 43 курси DevAtlas, дарсҳо, мавзӯъҳо ва коде, ки меомӯзед, савол диҳед.',
          'Саволҳои берун аз курс (сиёсат, ретсепт, навиштани файлҳои бегона ва ғ.) қабул намешаванд.',
          '3 огоҳӣ (1/3 → 2/3 → 3/3) барои мавзӯъҳои берун аз курс боиси басташавии AI барои 3 рӯз мегардад.',
        ],
      },
      {
        icon: 'voice',
        title: '3. Ёрдамчии овозӣ (AI Инструктор)',
        items: [
          'Бо овоз савол диҳед — инструктор мавзӯъро мефаҳмонад, мисоли код нишон медиҳад ва мустақиман ба дарси лозима мебарад.',
          'Фармонҳои зуд: «курсҳоро кушо», «рӯзи ман», «машқҳоро кушо», «пешрафт», «тарифҳо».',
          'Ҳамон қоидаи 3 огоҳӣ → 3 рӯз басташавӣ барои мавзӯъҳои бегона амал мекунад.',
        ],
      },
      {
        icon: 'community',
        title: '4. Чати ҷомеа ва эҳтиром (Ҳақорат манъ аст)',
        items: [
          'Ҳақорат, таҳқир, дағалӣ ва суханони носазо дар чат, AI Tutor ва ёрдамчии овозӣ қатъиян манъ аст.',
          'Барои ҳақорат система 5 огоҳӣ медиҳад (1/5 → 5/5). Дар огоҳии 5-ум дастрасӣ ба чат ва AI барои 3 рӯз баста мешавад.',
          'Дар вақти басташавӣ таймери баръакс (рӯз, соат, дақиқа, сония) ва санаи аниқи кушодашавӣ нишон дода мешавад.',
        ],
      },
      {
        icon: 'safety',
        title: '5. Амният ва ҳифзи аккаунт',
        items: [
          'Ҳамаи ҳуқуқҳо, обунаҳо ва маҳдудиятҳо дар сервер ва базаи маълумот санҷида мешаванд.',
          'Кӯшиши вайрон кардани кор, спам ё истифодаи скриптҳои зараровар боиси басташавии доимии аккаунт мешавад.',
        ],
      },
    ],
  },
  ru: {
    buttonLabel: 'Правила сайта и AI',
    title: 'Правила DevAtlas',
    subtitle: 'Как работают платформа, AI Tutor, голосовой инструктор и чат сообщества.',
    close: 'Закрыть',
    sections: [
      {
        icon: 'platform',
        title: '1. Платформа и курсы',
        items: [
          'Уроки, тесты и план обучения созданы для последовательной самостоятельной практики.',
          'Доступ к возможностям Pro и Ultra проверяется на сервере по активной подписке.',
          'После окончания срока подписки аккаунт автоматически переходит на бесплатный тариф Start.',
        ],
      },
      {
        icon: 'tutor',
        title: '2. AI Tutor (Чат)',
        items: [
          'Задавайте вопросы только по 43 курсам DevAtlas, урокам, темам и учебному коду.',
          'Посторонние темы (рецепты, сторонние файлы, темы вне курсов) не обрабатываются.',
          '3 предупреждения (1/3 → 2/3 → 3/3) за вопросы вне курсов блокируют доступ к AI на 3 дня.',
        ],
      },
      {
        icon: 'voice',
        title: '3. Голосовой инструктор',
        items: [
          'Задавайте вопросы голосом: инструктор объяснит тему, покажет пример кода и откроет нужный урок.',
          'Быстрые команды: «открой курсы», «мой день», «практика», «прогресс», «тарифы».',
          'Действуют те же правила: только темы курсов (3 предупреждения = блок на 3 дня).',
        ],
      },
      {
        icon: 'community',
        title: '4. Чат сообщества и уважение (Запрет оскорблений)',
        items: [
          'Мат, оскорбления и грубость строго запрещены в сообществе, AI Tutor и голосовом ассистенте.',
          'За оскорбления выдаётся до 5 предупреждений (1/5 → 5/5). На 5-м предупреждении доступ блокируется на 3 дня.',
          'Во время блокировки отображается живой обратный отсчёт и точная дата разблокировки.',
        ],
      },
      {
        icon: 'safety',
        title: '5. Безопасность',
        items: [
          'Все подписки, роли и ограничения проверяются сервером и базой данных.',
          'Спам, обход ограничений и попытки вмешательства приводят к блокировке аккаунта.',
        ],
      },
    ],
  },
  en: {
    buttonLabel: 'Site & AI Rules',
    title: 'DevAtlas Rules',
    subtitle: 'Guidelines for the platform, AI Tutor, Voice Instructor, and Community Chat.',
    close: 'Close',
    sections: [
      {
        icon: 'platform',
        title: '1. Platform & Courses',
        items: [
          'Lessons, quizzes, and plans are built for step-by-step independent practice.',
          'Pro and Ultra permissions are verified server-side from your active subscription.',
          'Once a subscription expires, the account automatically returns to the free Start tier.',
        ],
      },
      {
        icon: 'tutor',
        title: '2. AI Tutor (Chat)',
        items: [
          'Ask only about the 43 DevAtlas courses, lessons, concepts, and study code.',
          'Off-topic prompts or requests for unrelated documents are not answered.',
          '3 off-topic warnings (1/3 → 3/3) trigger an automatic 3-day block.',
        ],
      },
      {
        icon: 'voice',
        title: '3. Voice Instructor',
        items: [
          'Ask questions by voice — the instructor explains with examples and opens the matching lesson.',
          'Quick commands: “open courses”, “my day”, “open practice”, “progress”, “plans”.',
          'Follows the same 3-warning / 3-day block policy for off-topic requests.',
        ],
      },
      {
        icon: 'community',
        title: '4. Community Conduct & Anti-Abuse',
        items: [
          'Profanity, insults, and harassment are strictly prohibited across Community, AI Tutor, and Voice.',
          'Abusive language issues up to 5 warnings (1/5 → 5/5). On the 5th warning, access is blocked for 3 days.',
          'Blocked users see a live countdown timer and the exact unlock date and time.',
        ],
      },
      {
        icon: 'safety',
        title: '5. Security',
        items: [
          'All entitlements, roles, and moderation blocks are enforced on the server and database.',
          'Abuse, spam, or automated bypass attempts result in account suspension.',
        ],
      },
    ],
  },
  es: {
    buttonLabel: 'Reglas del sitio e IA',
    title: 'Reglas de DevAtlas',
    subtitle: 'Normas de la plataforma, AI Tutor, asistente de voz y comunidad.',
    close: 'Cerrar',
    sections: [
      {
        icon: 'platform',
        title: '1. Plataforma y cursos',
        items: [
          'Las lecciones, pruebas y planes están pensados para practicar paso a paso.',
          'El acceso Pro y Ultra se verifica en el servidor según tu suscripción activa.',
          'Cuando vence una suscripción, la cuenta vuelve al plan gratuito Start.',
        ],
      },
      {
        icon: 'tutor',
        title: '2. AI Tutor (Chat)',
        items: [
          'Pregunta solo sobre los 43 cursos de DevAtlas, sus lecciones y código.',
          'Las solicitudes ajenas a los cursos no se responden.',
          '3 avisos fuera de tema (1/3 → 3/3) bloquean el acceso a la IA durante 3 días.',
        ],
      },
      {
        icon: 'voice',
        title: '3. Instructor de voz',
        items: [
          'Habla con el instructor para recibir explicaciones con ejemplos y abrir la lección.',
          'Comandos rápidos: «abre los cursos», «mi día», «práctica», «progreso», «planes».',
          'Aplica la misma regla de 3 avisos = bloqueo de 3 días.',
        ],
      },
      {
        icon: 'community',
        title: '4. Comunidad y respeto',
        items: [
          'Los insultos y el lenguaje ofensivo están prohibidos en el chat, AI Tutor y voz.',
          'Tras 5 avisos por insultos (1/5 → 5/5), el acceso se bloquea durante 3 días.',
          'Mientras dure el bloqueo verás una cuenta regresiva en vivo con la fecha exacta de desbloqueo.',
        ],
      },
      {
        icon: 'safety',
        title: '5. Seguridad',
        items: [
          'Todos los planes, roles y bloqueos se aplican en el servidor y la base de datos.',
          'El spam o los intentos de eludir reglas conllevan la suspensión de la cuenta.',
        ],
      },
    ],
  },
};

function SectionIcon({ kind }: { kind: RuleSection['icon'] }) {
  switch (kind) {
    case 'platform':
      return <BookOpen size={16} aria-hidden="true" />;
    case 'tutor':
      return <Bot size={16} aria-hidden="true" />;
    case 'voice':
      return <Mic size={16} aria-hidden="true" />;
    case 'community':
      return <MessagesSquare size={16} aria-hidden="true" />;
    case 'safety':
      return <ShieldAlert size={16} aria-hidden="true" />;
  }
}

export function RulesModal({
  open,
  language,
  onClose,
}: {
  open: boolean;
  language: InterfaceLocale;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const copy = RULES_COPY[language] ?? RULES_COPY.ru;

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal,80)] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="devatlas-rules-title"
        className="flex max-h-[86dvh] w-full max-w-[600px] flex-col overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border bg-primary-soft/60 px-5 py-4">
          <div className="min-w-0">
            <h2
              id="devatlas-rules-title"
              className="m-0 flex items-center gap-2 text-lg font-bold tracking-tight"
            >
              <HelpCircle size={20} className="text-brand" aria-hidden="true" />
              {copy.title}
            </h2>
            <p className="mt-1 mb-0 text-xs text-muted-foreground">{copy.subtitle}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="icon-button !size-11 shrink-0"
            onClick={onClose}
            aria-label={copy.close}
          >
            <X size={18} />
          </button>
        </header>

        <div className="grid gap-4 overflow-y-auto px-5 py-4 text-left">
          {copy.sections.map((section) => (
            <section
              key={section.title}
              className="rounded-xl border border-border/80 bg-background/60 p-3.5"
            >
              <h3 className="m-0 flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-brand">
                  <SectionIcon kind={section.icon} />
                </span>
                {section.title}
              </h3>
              <ul className="mt-2.5 mb-0 grid gap-1.5 pl-5 text-xs leading-5 text-muted-foreground sm:text-sm">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
