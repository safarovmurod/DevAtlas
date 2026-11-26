import type { CourseId } from '@/lib/courses/ids';
import type { InterfaceLocale } from '@/lib/locale';

export type StudioTrack = 'frontend' | 'backend' | 'python' | 'ai';

export type MockQuestion = {
  id: string;
  track: StudioTrack;
  prompt: Record<InterfaceLocale, string>;
  concepts: { label: Record<InterfaceLocale, string>; keywords: string[] }[];
  modelAnswer: Record<InterfaceLocale, string>;
  recommendedCourse: CourseId;
};

export type MockAnswerScore = {
  score: number;
  matchedConcepts: string[];
  missingConcepts: string[];
  depthBonus: boolean;
};

export type ProjectAuditFinding = {
  id: string;
  status: 'pass' | 'warn' | 'fail';
  title: Record<InterfaceLocale, string>;
  detail: Record<InterfaceLocale, string>;
};

export type ProjectAuditReport = {
  score: number;
  verdict: 'ready' | 'almost' | 'needs_work';
  findings: ProjectAuditFinding[];
  recommendedCourses: CourseId[];
};

export type SprintWeek = {
  week: number;
  focus: Record<InterfaceLocale, string>;
  deliverable: Record<InterfaceLocale, string>;
  tasks: Record<InterfaceLocale, string[]>;
  courseId: CourseId;
};

export const STUDIO_QUESTIONS: MockQuestion[] = [
  {
    id: 'fe-state-rendering',
    track: 'frontend',
    recommendedCourse: 'react',
    prompt: {
      tg: 'Дар React кай `state` боиси re-render мешавад ва чӣ хел рӯйхати калонро бе хатои `key` тез нигоҳ медорем?',
      ru: 'Когда изменение state в React вызывает re-render, и как правильно рендерить списки без ошибок с key?',
      en: 'When does state trigger a React re-render, and why do stable keys matter when rendering dynamic lists?',
      es: '¿Cuándo provoca el state un re-render en React y por qué importan las keys estables en listas dinámicas?',
    },
    concepts: [
      {
        label: { tg: 'Иваз шудани state / props', ru: 'Обновление state / props', en: 'State / props change', es: 'Cambio de state / props' },
        keywords: ['state', 'setstate', 'props', 'render', 're-render', 'ререндер', 'состоян', 'ҳолат'],
      },
      {
        label: { tg: 'Immutable (объекти нав)', ru: 'Иммутабельность (новый объект)', en: 'Immutability / new reference', es: 'Inmutabilidad / nueva referencia' },
        keywords: ['immut', 'reference', 'copy', 'spread', 'иммут', 'копи', 'нав', 'ссылк'],
      },
      {
        label: { tg: 'Стабильный ID ба ҷои index', ru: 'Стабильный id вместо index', en: 'Stable unique ID over array index', es: 'ID estable en lugar del índice' },
        keywords: ['key', 'id', 'index', 'индекс', 'уникал', 'ягона', 'reconcil'],
      },
    ],
    modelAnswer: {
      tg: 'React ҳангоми тағйир ёфтани reference-и state (бо setter ва объекти нав) ё props компонентро дубора render мекунад. Барои рӯйхатҳо `key`-и ягона (масалан `item.id`) лозим аст, на `index`, то React ҳангоми нест ё илова шудани элемент DOM ва state-и дохилиро омехта накунад.',
      ru: 'React перерисовывает компонент при передаче нового значения/ссылки в setter состояния или изменении props. Для списков нужен стабильный уникальный key (например `item.id`), а не `index`, иначе при вставке или удалении сбивается сопоставление элементов и внутренний state.',
      en: 'React re-renders when a state setter receives a new value/reference (Object.is check) or parent props change. Dynamic lists need stable unique IDs as `key` instead of array indexes so reconciliation preserves element identity and local state during insertions, deletions, or sorting.',
      es: 'React vuelve a renderizar cuando un setter recibe una nueva referencia o cambian las props. En listas dinámicas se requiere un `key` único y estable (como `item.id`) en lugar del índice para no mezclar el estado al reordenar o borrar elementos.',
    },
  },
  {
    id: 'fe-async-race',
    track: 'frontend',
    recommendedCourse: 'javascript-pro',
    prompt: {
      tg: 'Ҳангоми ҷустуҷӯи зинда (search input) бо `fetch` чӣ хел пеши роҳи race condition ва дархостҳои зиёдатиро мегиред?',
      ru: 'Как при живом поиске с fetch избежать race condition и лишних запросов на сервер?',
      en: 'How do you prevent race conditions and excessive network requests during live search input with fetch?',
      es: '¿Cómo evitas condiciones de carrera y peticiones excesivas al hacer búsqueda en vivo con fetch?',
    },
    concepts: [
      {
        label: { tg: 'Debounce (интизорӣ)', ru: 'Debounce (задержка)', en: 'Debounce input', es: 'Debounce en el input' },
        keywords: ['debounce', 'timeout', 'delay', 'дебаунс', 'задержк', 'интизор'],
      },
      {
        label: { tg: 'AbortController / бекоркунӣ', ru: 'AbortController / отмена запроса', en: 'AbortController / cancellation', es: 'AbortController / cancelación' },
        keywords: ['abort', 'cancel', 'cleanup', 'signal', 'отмен', 'бекор'],
      },
      {
        label: { tg: 'Идоракунии loading / error', ru: 'Состояния loading и error', en: 'Loading & error handling', es: 'Manejo de loading y error' },
        keywords: ['error', 'loading', 'try', 'catch', 'ошибк', 'хато'],
      },
    ],
    modelAnswer: {
      tg: 'Аввал ба вуруд `debounce` (250–400ms) мегузорем, то дар ҳар ҳарф дархост наравад. Дуюм, дар `useEffect` бо `AbortController` дархости пешинаро ҳангоми cleanup бекор мекунем, то ҷавоби дермонда натиҷаи навро рӯйпӯш накунад, ва ҳолатҳои `loading`/`error`-ро ҷудо нигоҳ медорем.',
      ru: 'Добавляем debounce (250–400 мс), чтобы не слать запрос на каждый символ, и используем AbortController в cleanup-функции эффекта, чтобы отменять устаревшие запросы и не допускать перезаписи свежих данных.',
      en: 'Debounce user input (250–400ms) to cut redundant requests, cancel stale in-flight fetches using AbortController in effect cleanup (or track a request ID), and explicitly handle loading, empty, and error states.',
      es: 'Aplica debounce (250–400 ms) para reducir peticiones, cancela solicitudes obsoletas con AbortController en el cleanup y maneja explícitamente estados de carga y error.',
    },
  },
  {
    id: 'be-sql-security',
    track: 'backend',
    recommendedCourse: 'sql',
    prompt: {
      tg: 'SQL Injection чист, чӣ хел пешгирӣ мешавад ва кай дар ҷадвал `INDEX` мегузорем?',
      ru: 'Что такое SQL Injection, как от него защититься, и когда нужно добавлять индекс в SQL?',
      en: 'What is SQL injection, how do you prevent it, and when should you add a database index?',
      es: '¿Qué es SQL Injection, cómo se previene y cuándo conviene añadir un índice en SQL?',
    },
    concepts: [
      {
        label: { tg: 'Parameterized queries / Prepared statements', ru: 'Параметризованные запросы', en: 'Parameterized queries / placeholders', es: 'Consultas parametrizadas' },
        keywords: ['param', 'prepared', 'placeholder', 'orm', 'параметр', '$1', '?'],
      },
      {
        label: { tg: 'Ҷустуҷӯи тез (WHERE / JOIN)', ru: 'Ускорение WHERE / JOIN', en: 'Speed up WHERE / JOIN lookups', es: 'Acelerar WHERE / JOIN' },
        keywords: ['where', 'join', 'lookup', 'btree', 'поиск', 'ҷустуҷӯ', 'scan'],
      },
      {
        label: { tg: 'Нархи write (INSERT/UPDATE)', ru: 'Цена на запись (INSERT/UPDATE)', en: 'Write overhead trade-off', es: 'Costo en escrituras' },
        keywords: ['write', 'insert', 'update', 'trade', 'overhead', 'запис', 'память', 'суст'],
      },
    ],
    modelAnswer: {
      tg: 'SQL Injection вақте рух медиҳад, ки вуруди корбар рост ба сатри SQL часпонида мешавад. Ҳалли дуруст — ҳамеша parameterized queries (`$1`, `?`). Индексро ба сутунҳое мегузорем, ки зиёд дар `WHERE`, `JOIN` ё `ORDER BY` меоянд, бо назардошти он ки индекс `INSERT/UPDATE`-ро каме суст мекунад.',
      ru: 'SQL-инъекция возникает при конкатенации пользовательского ввода в SQL-строку. Защита — только параметризованные запросы (prepared statements). Индексы ускоряют частые WHERE/JOIN/ORDER BY, но замедляют INSERT/UPDATE и занимают место.',
      en: 'SQL injection happens when untrusted input is concatenated into raw SQL. Always use parameterized queries/prepared statements. Add indexes on high-selectivity columns used in WHERE, JOIN, and ORDER BY while balancing extra storage and slower writes.',
      es: 'SQL injection ocurre al concatenar entrada no confiable en SQL. Se previene con consultas parametrizadas. Los índices aceleran WHERE/JOIN pero añaden coste en INSERT/UPDATE y almacenamiento.',
    },
  },
  {
    id: 'be-auth-idempotency',
    track: 'backend',
    recommendedCourse: 'backend-pro',
    prompt: {
      tg: 'Чаро webhook-и пардохт бояд имзо (signature) ва idempotency дошта бошад?',
      ru: 'Почему платёжный webhook обязан проверять подпись (signature) и быть идемпотентным?',
      en: 'Why must a payment webhook verify signatures and enforce idempotency?',
      es: '¿Por qué un webhook de pagos debe verificar firma y ser idempotente?',
    },
    concepts: [
      {
        label: { tg: 'Тасдиқи HMAC / Signature', ru: 'Проверка HMAC-подписи', en: 'HMAC signature verification', es: 'Verificación de firma HMAC' },
        keywords: ['sign', 'hmac', 'secret', 'spoof', 'подпис', 'имзо', 'fake', 'поддел'],
      },
      {
        label: { tg: 'Idempotency (такрор нашавад)', ru: 'Идемпотентность (защита от дублей)', en: 'Idempotency / deduplication', es: 'Idempotencia / sin duplicados' },
        keywords: ['idempoten', 'retry', 'duplicate', 'unique', 'дубл', 'повтор', 'такрор', 'event'],
      },
      {
        label: { tg: 'Маълумоти боэътимод дар сервер', ru: 'Источник правды на сервере/БД', en: 'Server-side source of truth', es: 'Fuente de verdad en servidor' },
        keywords: ['server', 'database', 'db', 'transaction', 'сервер', 'баз', 'транзакц'],
      },
    ],
    modelAnswer: {
      tg: 'Бе тасдиқи имзои HMAC ҳар кас метавонад ба endpoint дархости қалбакии "paid" фиристад. Idempotency (бо `event_id`-и уникалӣ дар DB) зарур аст, зеро провайдер метавонад ҳамон webhook-ро 2–3 бор дубора фиристад ва обуна ё баланс набояд ду бор илова шавад.',
      ru: 'Без проверки HMAC-подписи злоумышленник может подделать запрос об оплате. Идемпотентность по уникальному event_id в БД нужна, потому что платёжные провайдеры повторяют доставку webhook, и повтор не должен дважды выдавать доступ или начислять баланс.',
      en: 'Without verifying the cryptographic signature (HMAC), attackers can forge paid events. Idempotency (storing unique event IDs in a DB transaction) ensures provider retries never grant duplicate credits or corrupt subscription state.',
      es: 'Sin verificar la firma HMAC cualquiera puede falsificar un pago. La idempotencia con event_id único en BD evita cobros o activaciones duplicadas cuando el proveedor reintenta el envío.',
    },
  },
  {
    id: 'py-async-data',
    track: 'python',
    recommendedCourse: 'python',
    prompt: {
      tg: 'Дар Python фарқи `list`, `set` ва `dict` дар суръати ҷустуҷӯ чист ва кай generator (`yield`) истифода мебарем?',
      ru: 'Чем отличаются list, set и dict по скорости поиска в Python, и зачем нужны генераторы (yield)?',
      en: 'How do list, set, and dict differ in lookup complexity in Python, and when should you use a generator (`yield`)?',
      es: '¿En qué se diferencian list, set y dict en búsqueda en Python y cuándo usar un generador (`yield`)?',
    },
    concepts: [
      {
        label: { tg: 'O(1) hash vs O(n) scan', ru: 'O(1) хэш vs O(n) перебор', en: 'O(1) hash lookup vs O(n) linear scan', es: 'O(1) hash frente a O(n)' },
        keywords: ['o(1)', 'o(n)', 'hash', 'хэш', 'быстр', 'тез', 'linear'],
      },
      {
        label: { tg: 'Generator / Lazy memory', ru: 'Генератор экономит память', en: 'Lazy evaluation / low memory', es: 'Evaluación perezosa / poca memoria' },
        keywords: ['yield', 'lazy', 'memory', 'stream', 'памят', 'хотира', 'файл', 'large'],
      },
    ],
    modelAnswer: {
      tg: 'Ҷустуҷӯ дар `list` O(n) аст (як-як мекобад), вале дар `set` ва `dict` ба ҳисоби миёна O(1) аст (ба туфайли hash table). Generator бо `yield` элементҳоро як-як ҳангоми зарурӣ месозад, бинобар ин барои файлҳо ва датасетҳои калон хотираро (RAM) сарфа мекунад.',
      ru: 'Поиск в list занимает O(n), а в set и dict в среднем O(1) за счёт хэш-таблиц. Генератор через yield вычисляет элементы лениво по одному, экономя оперативную память при чтении больших файлов и потоков данных.',
      en: '`list` membership checks take O(n) linear time, while `set` and `dict` average O(1) via hash tables. Generators (`yield`) produce items lazily one at a time, keeping memory usage flat on large files or streams.',
      es: 'Buscar en `list` cuesta O(n), mientras `set` y `dict` promedian O(1) gracias a tablas hash. Los generadores (`yield`) producen elementos bajo demanda y ahorran memoria en flujos grandes.',
    },
  },
  {
    id: 'ai-rag-eval',
    track: 'ai',
    recommendedCourse: 'context-engineering',
    prompt: {
      tg: 'Чӣ хел хатоҳои AI-агент (hallucination)-ро кам мекунем ва сифати ҷавобҳоро пеш аз production месанҷем?',
      ru: 'Как снизить галлюцинации AI-агента и проверить качество ответов до запуска в production?',
      en: 'How do you reduce AI agent hallucinations and evaluate response quality before shipping to production?',
      es: '¿Cómo reduces las alucinaciones de un agente de IA y evalúas su calidad antes de producción?',
    },
    concepts: [
      {
        label: { tg: 'Grounding / RAG / манбаъ', ru: 'Grounding / RAG / опора на факты', en: 'Grounding / RAG / citations', es: 'Grounding / RAG / fuentes' },
        keywords: ['rag', 'retriev', 'context', 'source', 'ground', 'документ', 'контекст', 'манба'],
      },
      {
        label: { tg: 'Structured output & schema', ru: 'Валидация формата / schema', en: 'Structured output / schema validation', es: 'Salida estructurada / esquema' },
        keywords: ['json', 'schema', 'zod', 'tool', 'guardrail', 'схем', 'валидац'],
      },
      {
        label: { tg: 'Eval dataset & cost/latency limits', ru: 'Eval-набор и лимиты бюджета', en: 'Automated evals & budget guardrails', es: 'Evaluaciones y límites de costo' },
        keywords: ['eval', 'test', 'budget', 'limit', 'metric', 'тест', 'метрик', 'бюджет', 'лимит'],
      },
    ],
    modelAnswer: {
      tg: 'Барои кам кардани hallucination: 1) Grounding бо RAG ва иҷозат додан ба модел, ки вақте маълумот нест "намедонам" гӯяд; 2) Валидатсияи баромад бо schema (JSON/Zod) ва tool boundaries; 3) Маҷмӯи тестҳои eval (golden cases) + назорати қатъии бюджет ва latency.',
      ru: 'Снижаем галлюцинации через RAG/grounding с явным разрешением отвечать «не знаю», строгие схемы вывода (JSON/Zod) и ограничения инструментов. До продакшена прогоняем eval-набор реальных кейсов и ставим лимиты бюджета/токенов.',
      en: 'Combine retrieval grounding (with explicit abstain instructions when evidence is missing), strict schema/tool validation, and an automated eval suite measuring accuracy, latency, and token budget limits before release.',
      es: 'Combina RAG/grounding permitiendo abstenerse si falta evidencia, validación estricta de esquemas y herramientas, más una batería de evals con límites de costo y latencia.',
    },
  },
];

export function scoreMockAnswer(
  question: MockQuestion,
  answer: string,
  locale: InterfaceLocale,
): MockAnswerScore {
  const normalized = answer.trim().toLowerCase();
  const matchedConcepts: string[] = [];
  const missingConcepts: string[] = [];

  for (const concept of question.concepts) {
    const hit = concept.keywords.some((kw) => normalized.includes(kw.toLowerCase()));
    if (hit) matchedConcepts.push(concept.label[locale]);
    else missingConcepts.push(concept.label[locale]);
  }

  const conceptRatio =
    question.concepts.length > 0 ? matchedConcepts.length / question.concepts.length : 0;
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  const depthBonus = wordCount >= 22 && matchedConcepts.length >= 2;
  const rawScore = Math.round(conceptRatio * 85 + (depthBonus ? 15 : Math.min(10, wordCount * 0.5)));

  return {
    score: Math.min(100, Math.max(0, normalized ? rawScore : 0)),
    matchedConcepts,
    missingConcepts,
    depthBonus,
  };
}

export function auditProjectSubmission(input: {
  track: StudioTrack;
  codeOrManifest: string;
}): ProjectAuditReport {
  const text = input.codeOrManifest.trim();
  const lower = text.toLowerCase();
  const findings: ProjectAuditFinding[] = [];
  const recommended = new Set<CourseId>();

  // 1. Typing / validation
  const hasTyping =
    lower.includes('typescript') ||
    lower.includes('"zod"') ||
    lower.includes('interface ') ||
    lower.includes('type ') ||
    lower.includes('pydantic') ||
    lower.includes('-> ');
  findings.push({
    id: 'typing',
    status: hasTyping ? 'pass' : 'warn',
    title: {
      tg: 'Типизатсия ва валидатсияи маълумот',
      ru: 'Типизация и валидация данных',
      en: 'Static typing & schema validation',
      es: 'Tipado estático y validación',
    },
    detail: hasTyping
      ? {
          tg: 'Аломатҳои TypeScript / schema validation ёфт шуданд — хуб барои корфармо.',
          ru: 'Обнаружены признаки TypeScript / валидации схем — сильный плюс на ревью.',
          en: 'Detected TypeScript / schema validation signals — strong engineering signal.',
          es: 'Se detectaron señales de TypeScript o validación de esquemas.',
        }
      : {
          tg: 'TypeScript ё валидатсияи вуруд (масалан Zod / Pydantic) дида нашуд.',
          ru: 'Не найдено TypeScript или валидации входных данных (Zod / Pydantic).',
          en: 'No TypeScript or input schema validation (e.g. Zod / Pydantic) detected.',
          es: 'No se detectó TypeScript ni validación de entradas (Zod / Pydantic).',
        },
  });
  if (!hasTyping) recommended.add('typescript');

  // 2. Automated tests
  const hasTests =
    lower.includes('vitest') ||
    lower.includes('jest') ||
    lower.includes('playwright') ||
    lower.includes('pytest') ||
    lower.includes('"test"') ||
    lower.includes('expect(');
  findings.push({
    id: 'tests',
    status: hasTests ? 'pass' : 'fail',
    title: {
      tg: 'Тестҳои автоматӣ (Unit / E2E)',
      ru: 'Автоматические тесты (Unit / E2E)',
      en: 'Automated tests (Unit / E2E)',
      es: 'Pruebas automatizadas (Unit / E2E)',
    },
    detail: hasTests
      ? {
          tg: 'Конфигуратсия ё коди тест мавҷуд аст — лоиҳа ба стандартҳои ширкат наздик аст.',
          ru: 'Есть тестовый стек или проверки — проект выглядит готовым к командной работе.',
          en: 'Test runner or assertions detected — signals production discipline.',
          es: 'Se detectó runner de pruebas o aserciones.',
        }
      : {
          tg: 'Ҳеҷ тесте ёфт нашуд. Илова кардани ҳадди ақал 3–5 unit-тест шонси қабул ба корро дучанд мекунад.',
          ru: 'Тесты не найдены. Добавьте хотя бы 3–5 unit-тестов для ключевой логики перед отправкой резюме.',
          en: 'No tests found. Adding even 3–5 unit tests for core business logic dramatically improves recruiter confidence.',
          es: 'No se encontraron pruebas. Añadir 3–5 pruebas unitarias mejora mucho el perfil.',
        },
  });

  // 3. Secret hygiene
  const leakedSecret =
    /sk-[a-z0-9]{12,}/i.test(text) ||
    /supabase_service_role_key\s*=\s*['"]?[a-z0-9._-]{12,}/i.test(text) ||
    /password\s*[:=]\s*['"][^'"]{4,}['"]/i.test(text);
  findings.push({
    id: 'secrets',
    status: leakedSecret ? 'fail' : 'pass',
    title: {
      tg: 'Амнияти калидҳо ва секретҳо',
      ru: 'Безопасность ключей и секретов',
      en: 'Secrets & credential hygiene',
      es: 'Higiene de secretos y credenciales',
    },
    detail: leakedSecret
      ? {
          tg: 'ХАТАР: Дар матн калиди махфӣ ё пароли ошкоро монанд дида шуд! Ҳатман ба .env гузаронед.',
          ru: 'РИСК: Похоже, в коде есть открытый ключ или пароль! Уберите в .env и перевыпустите токен.',
          en: 'RISK: Possible hardcoded secret or password detected! Move to server env vars and rotate immediately.',
          es: 'RIESGO: Se detectó un posible secreto o contraseña fija. Muévelo a variables de entorno.',
        }
      : {
          tg: 'Калидҳои ошкоро (hardcoded secrets) дар порчаи санҷидашуда ёфт нашуданд.',
          ru: 'Открытых секретов в проверенном фрагменте не обнаружено.',
          en: 'No obvious hardcoded secrets detected in the submitted snippet.',
          es: 'No se detectaron secretos expuestos en el fragmento.',
        },
  });
  if (leakedSecret) recommended.add('backend-pro');

  // 4. Error handling & resilience
  const hasErrorHandling =
    lower.includes('try') ||
    lower.includes('catch') ||
    lower.includes('error') ||
    lower.includes('status') ||
    lower.includes('fallback');
  findings.push({
    id: 'errors',
    status: hasErrorHandling ? 'pass' : 'warn',
    title: {
      tg: 'Коркарди хатоҳо (Error handling)',
      ru: 'Обработка ошибок (Error handling)',
      en: 'Error handling & edge cases',
      es: 'Manejo de errores y casos límite',
    },
    detail: hasErrorHandling
      ? {
          tg: 'Коркарди хатоҳо ёфт шуд.',
          ru: 'Присутствует обработка ошибок или резервные состояния.',
          en: 'Error handling or fallback states are present.',
          es: 'Se detectó manejo de errores o estados de respaldo.',
        }
      : {
          tg: 'Коркарди хатоҳо (try/catch, ҳолати холӣ ва хатои шабака) дида нашуд.',
          ru: 'Не видно обработки ошибок (try/catch, сетевые сбои, пустые состояния).',
          en: 'No explicit error handling detected (try/catch, network failures, empty states).',
          es: 'No se observa manejo explícito de errores.',
        },
  });

  // 5. Documentation & scripts
  const hasDocsOrScripts =
    lower.includes('readme') ||
    lower.includes('"build"') ||
    lower.includes('"lint"') ||
    lower.includes('docker') ||
    lower.includes('.env.example');
  findings.push({
    id: 'docs',
    status: hasDocsOrScripts ? 'pass' : 'warn',
    title: {
      tg: 'README, скриптҳои build/lint ва омодагӣ ба деплой',
      ru: 'README, скрипты build/lint и готовность к деплою',
      en: 'README, build/lint scripts & deploy readiness',
      es: 'README, scripts build/lint y despliegue',
    },
    detail: hasDocsOrScripts
      ? {
          tg: 'Скриптҳои асосӣ ё ҳуҷҷатгузорӣ мавҷуд аст.',
          ru: 'Есть скрипты сборки/линтинга или документация запуска.',
          en: 'Build/lint scripts or setup documentation markers found.',
          es: 'Se encontraron scripts de build/lint o documentación.',
        }
      : {
          tg: 'Ба лоиҳа README бо скриншот, дастури насб, `.env.example` ва линкро ба демо илова кунед.',
          ru: 'Добавьте README со скриншотами, инструкцией запуска, .env.example и ссылкой на live demo.',
          en: 'Add a clear README with screenshots, local setup steps, `.env.example`, and a live demo link.',
          es: 'Añade un README con capturas, pasos de instalación, `.env.example` y enlace de demo.',
        },
  });

  if (input.track === 'frontend') recommended.add('react');
  else if (input.track === 'backend') recommended.add('backend-pro');
  else if (input.track === 'python') recommended.add('python');
  else recommended.add('agent-harness');

  let score = 0;
  for (const finding of findings) {
    if (finding.status === 'pass') score += 20;
    else if (finding.status === 'warn') score += 10;
  }
  if (leakedSecret) score = Math.min(score, 45);
  if (text.length < 30) score = Math.min(score, 35);

  const verdict: ProjectAuditReport['verdict'] =
    score >= 80 ? 'ready' : score >= 55 ? 'almost' : 'needs_work';

  return {
    score,
    verdict,
    findings,
    recommendedCourses: Array.from(recommended).slice(0, 3),
  };
}

export function buildJobReadySprint(params: {
  track: StudioTrack;
  hoursPerDay: 1 | 2 | 3;
}): SprintWeek[] {
  const paceLabel =
    params.hoursPerDay === 1 ? '1h/day' : params.hoursPerDay === 2 ? '2h/day' : '3h+/day';

  const trackCourses: Record<StudioTrack, [CourseId, CourseId, CourseId, CourseId]> = {
    frontend: ['javascript-pro', 'react', 'nextjs', 'communication'],
    backend: ['sql', 'nodejs', 'backend-pro', 'architecture-expert'],
    python: ['python', 'sql', 'algorithms', 'data-analytics'],
    ai: ['ai-fundamentals', 'context-engineering', 'agent-harness', 'backend-pro'],
  };

  const [c1, c2, c3, c4] = trackCourses[params.track];

  return [
    {
      week: 1,
      courseId: c1,
      focus: {
        tg: `Ҳафтаи 1 (${paceLabel}): Бастани холигоҳҳои асосӣ`,
        ru: `Неделя 1 (${paceLabel}): Закрытие базовых пробелов`,
        en: `Week 1 (${paceLabel}): Close Core Technical Gaps`,
        es: `Semana 1 (${paceLabel}): Cerrar brechas técnicas`,
      },
      deliverable: {
        tg: '10 машқи амалӣ + 1 модули тоза дар GitHub',
        ru: '10 практических задач + 1 чистый модуль на GitHub',
        en: '10 completed practice exercises + 1 clean GitHub module',
        es: '10 ejercicios prácticos + 1 módulo limpio en GitHub',
      },
      tasks: {
        tg: [
          'Ҳар рӯз 1 дарс ва санҷиши амалӣ дар курси интихобшуда',
          'Қайд кардани 5 мавзӯи душвор дар бахши Такрор (Revision)',
          'Навиштани 3 unit-тест барои коди худ',
        ],
        ru: [
          'Каждый день 1 урок и практика в профильном курсе',
          'Зафиксировать 5 слабых тем в разделе Повторение',
          'Написать минимум 3 unit-теста для своего решения',
        ],
        en: [
          'Complete 1 structured lesson + hands-on task every day',
          'Log top 5 weak topics and clear them in Revision',
          'Write at least 3 automated unit tests for your code',
        ],
        es: [
          'Completar 1 lección + práctica cada día',
          'Registrar 5 temas débiles y repasarlos',
          'Escribir al menos 3 pruebas unitarias',
        ],
      },
    },
    {
      week: 2,
      courseId: c2,
      focus: {
        tg: 'Ҳафтаи 2: Сохтани 1 лоиҳаи воқеии портфолио',
        ru: 'Неделя 2: Реальный пет-проект для портфолио',
        en: 'Week 2: Ship 1 Flagship Portfolio Project',
        es: 'Semana 2: Publicar 1 proyecto insignia',
      },
      deliverable: {
        tg: 'Лоиҳаи корӣ бо live-демо, README ва санҷиши Ultra Audit ≥ 80%',
        ru: 'Работающий проект с live demo, README и оценкой Ultra Audit ≥ 80%',
        en: 'Deployed live demo with README and Ultra Audit score ≥ 80%',
        es: 'Demo en vivo con README y puntuación Ultra Audit ≥ 80%',
      },
      tasks: {
        tg: [
          'Сохтани функсионали асосӣ бо auth ё API-и воқеӣ',
          'Гузаронидани коди лоиҳа аз аудити Ultra Studio',
          'Нашр кардани демо ва илова ба бахши Портфолио',
        ],
        ru: [
          'Реализовать рабочий функционал с API или базой данных',
          'Прогнать код и package.json через аудит Ultra Studio',
          'Задеплоить демо и добавить проект в DevAtlas Портфолио',
        ],
        en: [
          'Build end-to-end core flow with real data & error handling',
          'Run your repo manifest & code through Ultra Project Audit',
          'Deploy live link and add it to your DevAtlas Portfolio',
        ],
        es: [
          'Implementar flujo completo con datos reales y errores',
          'Auditar el proyecto en Ultra Studio',
          'Desplegar demo y añadirlo al Portafolio',
        ],
      },
    },
    {
      week: 3,
      courseId: c3,
      focus: {
        tg: 'Ҳафтаи 3: Мок-мусоҳибаҳо ва таҳлили архитектура',
        ru: 'Неделя 3: Мок-интервью и разбор архитектуры',
        en: 'Week 3: Mock Technical Interviews & System Thinking',
        es: 'Semana 3: Entrevistas simuladas y arquitectura',
      },
      deliverable: {
        tg: 'Натиҷаи ≥ 80% дар симулятори мусоҳиба + омодагӣ ба саволҳои лоиҳа',
        ru: 'Результат ≥ 80% в тренажёре интервью + защита архитектуры проекта',
        en: 'Score ≥ 80% in Mock Interview Simulator + architecture pitch',
        es: 'Puntuación ≥ 80% en entrevista simulada + defensa de proyecto',
      },
      tasks: {
        tg: [
          'Гузаштани ҳамаи саволҳои симулятори мусоҳибаи Ultra',
          'Омода кардани шарҳи 2-дақиқаии лоиҳаи худ',
          'Машқ бо AI Tutor ё Voice Assistant барои ҷавобҳои шифоҳӣ',
        ],
        ru: [
          'Пройти все вопросы тренажёра мок-интервью на ≥ 80%',
          'Подготовить 2-минутный рассказ о своём проекте и решениях',
          'Потренировать устные ответы через Voice Assistant',
        ],
        en: [
          'Score ≥ 80% across all Ultra mock technical prompts',
          'Prepare a 2-minute walkthrough of trade-offs in your project',
          'Rehearse spoken answers using the Ultra Voice Assistant',
        ],
        es: [
          'Alcanzar ≥ 80% en las preguntas técnicas simuladas',
          'Preparar una explicación de 2 minutos de tu proyecto',
          'Practicar respuestas habladas con el Asistente de voz',
        ],
      },
    },
    {
      week: 4,
      courseId: c4,
      focus: {
        tg: 'Ҳафтаи 4: Резюме, сертификат ва фиристодани дархостҳо',
        ru: 'Неделя 4: Резюме, QR-сертификат и отклики на вакансии',
        en: 'Week 4: Final CV, QR Certificate & Targeted Applications',
        es: 'Semana 4: CV final, certificado QR y postulaciones',
      },
      deliverable: {
        tg: 'CV-и PDF + 15 дархости босифат ба ширкатҳо ё заказҳои фриланс',
        ru: 'Готовый PDF-CV + 15 целевых откликов на вакансии / фриланс-заказы',
        en: 'Exported PDF CV + 15 tailored job or freelance proposals',
        es: 'CV en PDF + 15 postulaciones o propuestas freelance',
      },
      tasks: {
        tg: [
          'Зеркашии QR-сертификат ва линки профили оммавии `/u/...`',
          'Фиристодани 3–5 дархости шахсисозишуда ҳар рӯз (LinkedIn / Telegram / Upwork)',
          'Таҳлили ҳар як мусоҳибаи воқеӣ ва беҳтар кардани ҷавобҳо',
        ],
        ru: [
          'Экспортировать QR-сертификат и публичную ссылку портфолио',
          'Отправлять 3–5 персонализированных откликов в день (LinkedIn / Telegram / Kwork)',
          'Разбирать каждый реальный отказ и закрывать пробелы',
        ],
        en: [
          'Export your QR certificate and shareable `/u/...` portfolio URL',
          'Send 3–5 personalized applications per day with your live demo',
          'Debrief every interview question and refine weak spots',
        ],
        es: [
          'Exportar tu certificado QR y enlace público de portafolio',
          'Enviar 3–5 postulaciones personalizadas al día',
          'Analizar cada entrevista para mejorar respuestas',
        ],
      },
    },
  ];
}
