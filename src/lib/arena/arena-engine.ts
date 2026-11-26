import type { InterfaceLocale } from '@/lib/locale';

export type ArenaTrack = 'mixed' | 'frontend' | 'backend' | 'python' | 'ai';

export type ArenaQuestion = {
  id: string;
  track: Exclude<ArenaTrack, 'mixed'>;
  prompt: Record<InterfaceLocale, string>;
  options: Record<InterfaceLocale, [string, string, string, string]>;
  correctIndex: 0 | 1 | 2 | 3;
};

export type ArenaChallenge = {
  challenger: string;
  track: ArenaTrack;
  targetScore: number;
  correctCount: number;
};

export const ARENA_QUESTIONS: ArenaQuestion[] = [
  {
    id: 'fe-1',
    track: 'frontend',
    prompt: {
      tg: 'Дар React барои чӣ `key`-и стабилӣ (ID) дар рӯйхат лозим аст?',
      ru: 'Зачем в React нужен стабильный key (ID) для элементов списка?',
      en: 'Why does React require a stable unique `key` on list items?',
      es: '¿Por qué React necesita un `key` único y estable en listas?',
    },
    options: {
      tg: [
        'Барои муайян кардани кадом элемент иваз ё нест шуд',
        'Барои тағйири ранги CSS',
        'Барои бастани API',
        'Танҳо барои TypeScript',
      ],
      ru: [
        'Чтобы отслеживать, какой элемент изменился или удалился',
        'Чтобы менять стили CSS',
        'Чтобы кешировать fetch',
        'Только ради TypeScript',
      ],
      en: [
        'So reconciliation tracks which items changed, added, or removed',
        'To apply Tailwind classes faster',
        'To cache API calls automatically',
        'Only to satisfy TypeScript',
      ],
      es: [
        'Para rastrear qué elementos cambiaron o se eliminaron',
        'Para cambiar estilos CSS',
        'Para cachear llamadas API',
        'Solo para TypeScript',
      ],
    },
    correctIndex: 0,
  },
  {
    id: 'fe-2',
    track: 'frontend',
    prompt: {
      tg: 'Кадом HTTP status code маънои «Шумо ворид нашудаед (Unauthorized)»-ро дорад?',
      ru: 'Какой HTTP статус означает «Не авторизован (Unauthorized)»?',
      en: 'Which HTTP status code represents Unauthorized?',
      es: '¿Qué código HTTP significa No autorizado?',
    },
    options: {
      tg: ['200', '301', '401', '500'],
      ru: ['200', '301', '401', '500'],
      en: ['200', '301', '401', '500'],
      es: ['200', '301', '401', '500'],
    },
    correctIndex: 2,
  },
  {
    id: 'fe-3',
    track: 'frontend',
    prompt: {
      tg: 'Дар JavaScript `Array.prototype.map()` чӣ бармегардонад?',
      ru: 'Что возвращает метод Array.prototype.map() в JavaScript?',
      en: 'What does `Array.prototype.map()` return in JavaScript?',
      es: '¿Qué devuelve `Array.prototype.map()` en JavaScript?',
    },
    options: {
      tg: ['Массиви нав бо ҳамон дарозӣ', 'Ҳамеша undefined', 'Танҳо элементи аввал', 'Матни JSON'],
      ru: ['Новый массив той же длины', 'Всегда undefined', 'Только первый элемент', 'Строку JSON'],
      en: ['A new array of the same length', 'Always undefined', 'Only the first match', 'A JSON string'],
      es: ['Un nuevo array de igual longitud', 'Siempre undefined', 'Solo el primer elemento', 'Un texto JSON'],
    },
    correctIndex: 0,
  },
  {
    id: 'be-1',
    track: 'backend',
    prompt: {
      tg: 'Беҳтарин роҳи пешгирии SQL Injection кадом аст?',
      ru: 'Какой способ надёжно защищает от SQL Injection?',
      en: 'What is the standard defense against SQL Injection?',
      es: '¿Cuál es la defensa estándar contra SQL Injection?',
    },
    options: {
      tg: [
        'Parameterized queries / Prepared statements',
        'Пиҳон кардани номи ҷадвал дар HTML',
        'Истифодаи GET ба ҷои POST',
        'Хомӯш кардани CORS',
      ],
      ru: [
        'Параметризованные запросы (Prepared statements)',
        'Скрытие имени таблицы в HTML',
        'Замена POST на GET',
        'Отключение CORS',
      ],
      en: [
        'Parameterized queries / prepared statements',
        'Hiding table names in client HTML',
        'Using GET instead of POST',
        'Disabling CORS headers',
      ],
      es: [
        'Consultas parametrizadas / prepared statements',
        'Ocultar nombres de tablas en HTML',
        'Usar GET en lugar de POST',
        'Desactivar CORS',
      ],
    },
    correctIndex: 0,
  },
  {
    id: 'be-2',
    track: 'backend',
    prompt: {
      tg: 'Чаро `SUPABASE_SERVICE_ROLE_KEY`-ро ҳеҷ гоҳ ба браузер (клиент) гузоштан мумкин нест?',
      ru: 'Почему нельзя передавать SERVICE_ROLE_KEY в браузер клиента?',
      en: 'Why must a database service-role key never be exposed to the browser?',
      es: '¿Por qué nunca debe exponerse una clave service-role en el navegador?',
    },
    options: {
      tg: [
        'Он RLS-ро давр мезанад ва дастрасии пурраи admin медиҳад',
        'Он саҳифаро суст мекунад',
        'Он дар Chrome кор намекунад',
        'Танҳо барои кам кардани трафик',
      ],
      ru: [
        'Он обходит RLS и даёт полный доступ ко всей базе',
        'Он замедляет загрузку шрифтов',
        'Он не работает в Safari',
        'Чтобы сэкономить трафик',
      ],
      en: [
        'It bypasses RLS and grants unrestricted admin database access',
        'It slows down CSS animations',
        'It only works in Firefox',
        'To reduce bundle size slightly',
      ],
      es: [
        'Omite RLS y da acceso total de administrador a la base de datos',
        'Hace más lento el CSS',
        'Solo funciona en Firefox',
        'Para ahorrar unos bytes',
      ],
    },
    correctIndex: 0,
  },
  {
    id: 'be-3',
    track: 'backend',
    prompt: {
      tg: 'Idempotency дар API-и пардохт чӣ маъно дорад?',
      ru: 'Что означает идемпотентность в платёжном API?',
      en: 'What does idempotency guarantee in a payment webhook/API?',
      es: '¿Qué garantiza la idempotencia en una API de pagos?',
    },
    options: {
      tg: [
        'Дархости такрорӣ ду бор пул намегирад ва ду бор дастрасӣ намедиҳад',
        'Пардохт бе интернет кор мекунад',
        'Ҳамаи корбарон Pro мегиранд',
        'Сервер ҳеҷ гоҳ 500 намедиҳад',
      ],
      ru: [
        'Повторный запрос не приведёт к двойному списанию или дублю',
        'Оплата работает без интернета',
        'Все получают бесплатный Pro',
        'Сервер никогда не возвращает 500',
      ],
      en: [
        'Retrying the same request/event never causes duplicate charges or grants',
        'Payments work offline',
        'Every user gets Pro automatically',
        'The server never returns 500',
      ],
      es: [
        'Reintentar el mismo evento nunca duplica cobros ni accesos',
        'Los pagos funcionan sin internet',
        'Todos reciben Pro gratis',
        'El servidor nunca devuelve 500',
      ],
    },
    correctIndex: 0,
  },
  {
    id: 'py-1',
    track: 'python',
    prompt: {
      tg: 'Дар Python суръати миёнаи санҷиши `x in my_set` чанд аст?',
      ru: 'Какова средняя сложность проверки `x in my_set` в Python?',
      en: 'What is the average time complexity of `x in my_set` in Python?',
      es: '¿Cuál es la complejidad promedio de `x in my_set` en Python?',
    },
    options: {
      tg: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
      ru: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
      en: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
      es: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
    },
    correctIndex: 0,
  },
  {
    id: 'py-2',
    track: 'python',
    prompt: {
      tg: 'Калимаи `yield` дар функсияи Python чӣ месозад?',
      ru: 'Что создаёт ключевое слово `yield` в функции Python?',
      en: 'What does using `yield` inside a Python function create?',
      es: '¿Qué crea la palabra clave `yield` en una función de Python?',
    },
    options: {
      tg: ['Generator (итератори камхотира)', 'Класс', 'SQL-ҷадвал', 'Синтаксиси хато'],
      ru: ['Генератор (ленивый итератор)', 'Класс', 'SQL-таблицу', 'Синтаксическую ошибку'],
      en: ['A lazy generator iterator', 'A database table', 'A class decorator', 'A syntax error'],
      es: ['Un generador perezoso', 'Una tabla SQL', 'Una clase', 'Un error de sintaxis'],
    },
    correctIndex: 0,
  },
  {
    id: 'ai-1',
    track: 'ai',
    prompt: {
      tg: 'RAG (Retrieval-Augmented Generation) асосан барои чӣ истифода мешавад?',
      ru: 'Для чего в первую очередь используется RAG в AI-приложениях?',
      en: 'What is the primary purpose of RAG in AI engineering?',
      es: '¿Cuál es el propósito principal de RAG en ingeniería de IA?',
    },
    options: {
      tg: [
        'Додани далел ва ҳуҷҷатҳои воқеӣ ба модел барои кам кардани хато',
        'Зиёд кардани ҳаҷми суратҳо',
        'Иваз кардани HTML',
        'Тезтар кардани Wi-Fi',
      ],
      ru: [
        'Подставлять проверенные факты и документы в контекст модели',
        'Увеличивать разрешение картинок',
        'Заменять HTML и CSS',
        'Ускорять браузер',
      ],
      en: [
        'Grounding model outputs in retrieved up-to-date documents to cut hallucinations',
        'Upscaling PNG images',
        'Replacing HTML layouts',
        'Compressing SQL databases',
      ],
      es: [
        'Fundamentar respuestas con documentos reales para reducir alucinaciones',
        'Aumentar resolución de imágenes',
        'Reemplazar HTML',
        'Comprimir bases de datos',
      ],
    },
    correctIndex: 0,
  },
  {
    id: 'ai-2',
    track: 'ai',
    prompt: {
      tg: 'Чаро пеш аз production ба AI-агент лимити токен ва бюджет (budget guardrail) мегузоранд?',
      ru: 'Зачем перед продакшеном ставить лимит токенов и бюджета для AI-агента?',
      en: 'Why enforce token and daily budget guardrails on an AI agent in production?',
      es: '¿Por qué aplicar límites de tokens y presupuesto a un agente IA en producción?',
    },
    options: {
      tg: [
        'Барои пешгирии хароҷоти ногаҳонӣ ва циклҳои беохир',
        'Барои тағйири шрифти сайт',
        'Барои хомӯш кардани Git',
        'Бе ягон сабаб',
      ],
      ru: [
        'Чтобы предотвратить неконтролируемые расходы и бесконечные циклы',
        'Чтобы изменить шрифт сайта',
        'Чтобы отключить Git',
        'Просто для красоты',
      ],
      en: [
        'To prevent runaway API costs, abuse, and infinite agent loops',
        'To change typography',
        'To disable version control',
        'No technical reason',
      ],
      es: [
        'Para evitar costos descontrolados, abusos y bucles infinitos',
        'Para cambiar fuentes',
        'Para desactivar Git',
        'Sin razón técnica',
      ],
    },
    correctIndex: 0,
  },
];

export function selectArenaQuestions(track: ArenaTrack, limit = 6): ArenaQuestion[] {
  const pool =
    track === 'mixed'
      ? ARENA_QUESTIONS
      : ARENA_QUESTIONS.filter((item) => item.track === track);
  if (pool.length >= limit) return pool.slice(0, limit);
  const rest = ARENA_QUESTIONS.filter((item) => !pool.includes(item));
  return [...pool, ...rest].slice(0, limit);
}

export function computeArenaScore(params: {
  correctCount: number;
  secondsLeft: number;
  bestStreak: number;
}): number {
  return Math.max(
    0,
    params.correctCount * 100 +
      Math.max(0, Math.round(params.secondsLeft)) * 3 +
      Math.max(0, params.bestStreak - 1) * 25,
  );
}

export function encodeArenaChallenge(challenge: ArenaChallenge): string {
  const clean: ArenaChallenge = {
    challenger: challenge.challenger.trim().slice(0, 40) || 'DevAtlas Player',
    track: challenge.track,
    targetScore: Math.max(0, Math.round(challenge.targetScore)),
    correctCount: Math.max(0, Math.round(challenge.correctCount)),
  };
  const bytes = new TextEncoder().encode(JSON.stringify(clean));
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function decodeArenaChallenge(token: string | null): ArenaChallenge | null {
  if (!token || token.length > 400) return null;
  try {
    const norm = token.replace(/-/g, '+').replace(/_/g, '/');
    const pad = norm.length % 4 === 0 ? '' : '='.repeat(4 - (norm.length % 4));
    const bin = atob(norm + pad);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as Partial<ArenaChallenge>;
    if (
      typeof parsed.challenger !== 'string' ||
      typeof parsed.targetScore !== 'number' ||
      typeof parsed.correctCount !== 'number'
    ) {
      return null;
    }
    const track: ArenaTrack =
      parsed.track === 'frontend' ||
      parsed.track === 'backend' ||
      parsed.track === 'python' ||
      parsed.track === 'ai'
        ? parsed.track
        : 'mixed';
    return {
      challenger: parsed.challenger.slice(0, 40),
      track,
      targetScore: Math.max(0, Math.round(parsed.targetScore)),
      correctCount: Math.max(0, Math.round(parsed.correctCount)),
    };
  } catch {
    return null;
  }
}
