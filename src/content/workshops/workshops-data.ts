import type { InterfaceLocale } from '@/lib/locale';

export type WorkshopSlug =
  | 'telegram-bots'
  | 'freelance-start'
  | 'ai-business-automation'
  | 'nocode-websites'
  | 'excel-sheets-ai'
  | 'kids-coding';

export type WorkshopLesson = {
  id: string;
  title: Record<InterfaceLocale, string>;
  explanation: Record<InterfaceLocale, string>;
  templateTitle: string;
  templateCode: string;
  practiceTask: Record<InterfaceLocale, string>;
  quiz: {
    question: Record<InterfaceLocale, string>;
    options: Record<InterfaceLocale, [string, string, string]>;
    correctIndex: 0 | 1 | 2;
  };
};

export type WorkshopCourse = {
  slug: WorkshopSlug;
  badge: Record<InterfaceLocale, string>;
  level: 'Start' | 'Pro';
  durationLabel: Record<InterfaceLocale, string>;
  title: Record<InterfaceLocale, string>;
  summary: Record<InterfaceLocale, string>;
  lessons: WorkshopLesson[];
};

const L = (tg: string, ru: string, en: string, es: string): Record<InterfaceLocale, string> => ({
  tg,
  ru,
  en,
  es,
});

export const WORKSHOPS: WorkshopCourse[] = [
  {
    slug: 'telegram-bots',
    badge: L('Фриланс · Хит', 'Фриланс · Хит', 'High Demand', 'Alta demanda'),
    level: 'Start',
    durationLabel: L('4 модул · Амалӣ', '4 модуля · Практика', '4 modules · Hands-on', '4 módulos · Práctico'),
    title: L(
      'Сохтани Telegram-ботҳо ва Mini Apps',
      'Создание Telegram-ботов и Mini Apps',
      'Telegram Bots & Mini Apps (Python / Node)',
      'Bots de Telegram y Mini Apps',
    ),
    summary: L(
      'Аз BotFather то боти мағоза бо тугмаҳо, қабули заказ, Mini App ва деплойи 24/7 барои гирифтани заказҳои аввалин.',
      'От BotFather до бота-магазина с кнопками, приёмом заявок, Mini App и 24/7 деплоем для первых заказов.',
      'From BotFather to a commercial shop/booking bot with inline keyboards, Mini App WebView, and 24/7 webhook deploy.',
      'De BotFather a un bot comercial con botones, Mini App y despliegue 24/7.',
    ),
    lessons: [
      {
        id: 'tg-1',
        title: L('1. BotFather, Токен ва амнияти бот', '1. BotFather, токен и безопасность', '1. BotFather, Tokens & Security', '1. BotFather, token y seguridad'),
        explanation: L(
          'Ҳар Telegram-бот дар @BotFather бо командаи /newbot сохта мешавад. Токен калиди асосии бот аст: онро ҳеҷ гоҳ ба GitHub ё файли кушода нагузоред, танҳо дар .env нигоҳ доред.',
          'Бот создаётся в @BotFather командой /newbot. Токен — главный ключ управления: храните его строго в .env и никогда не коммитьте в GitHub.',
          'Register your bot in @BotFather via /newbot. Treat the bot token like a password: load it strictly from server environment variables (.env) and rotate if leaked.',
          'Registra el bot en @BotFather con /newbot y guarda el token únicamente en variables de entorno.',
        ),
        templateTitle: 'bot.py (aiogram 3 starter)',
        templateCode: `import os, asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart

dp = Dispatcher()

@dp.message(CommandStart())
async def start(msg: types.Message):
    await msg.answer("Салом! Боти DevAtlas кор мекунад 🚀")

async def main():
    bot = Bot(token=os.environ["TELEGRAM_BOT_TOKEN"])
    await dp.start_polling(bot)

asyncio.run(main())`,
        practiceTask: L(
          'Дар @BotFather боти тестӣ созед, токенашро дар .env гузоред ва ба командаи /start ҷавоби худро илова кунед.',
          'Создайте тестового бота в @BotFather, поместите токен в .env и ответьте на /start приветствием.',
          'Create a test bot in @BotFather, load its token via env vars, and customize the /start greeting.',
          'Crea un bot de prueba en @BotFather y configura el saludo /start.',
        ),
        quiz: {
          question: L('Токени Telegram-ботро дар куҷо нигоҳ доштан дуруст аст?', 'Где правильно хранить токен Telegram-бота?', 'Where should a Telegram bot token be stored?', '¿Dónde guardar el token del bot?'),
          options: {
            tg: ['Дар .env (environment variable) дар сервер', 'Дар коди HTML-и саҳифа', 'Дар README.md дар GitHub'],
            ru: ['В .env (переменной окружения на сервере)', 'В HTML-коде страницы', 'В публичном README на GitHub'],
            en: ['In server environment variables (.env)', 'Hardcoded in client HTML', 'Committed inside README.md'],
            es: ['En variables de entorno del servidor (.env)', 'En el HTML del cliente', 'En README.md público'],
          },
          correctIndex: 0,
        },
      },
      {
        id: 'tg-2',
        title: L('2. Тугмаҳои Inline ва Менюи Мағоза', '2. Inline-кнопки и меню магазина', '2. Inline Keyboards & Shop Menus', '2. Botones Inline y Menú de Tienda'),
        explanation: L(
          'Мизоҷон навиштани командаҳоро дӯст намедоранд — тугмаҳои InlineKeyboard бо callback_data харидро 3 маротиба тезтар ва фаҳмотар мекунанд.',
          'Клиентам проще нажимать кнопки, чем вводить команды вручную. Используйте InlineKeyboard с коротким callback_data для каталога и корзины.',
          'Use InlineKeyboard buttons with compact callback_data payloads (e.g. `buy:pro`) so users navigate products and checkout with taps instead of typing.',
          'Usa botones InlineKeyboard con callback_data cortos para navegar el catálogo con un toque.',
        ),
        templateTitle: 'keyboard.py',
        templateCode: `from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

shop_menu = InlineKeyboardMarkup(inline_keyboard=[
    [InlineKeyboardButton(text="📦 Каталог", callback_data="catalog")],
    [InlineKeyboardButton(text="💳 Заказ додан", callback_data="order:new")],
])`,
        practiceTask: L(
          '3 тугмаи маҳсулот ва тугмаи «Тамос бо менеҷер» созед ва ҳангоми клик нархи маҳсулотро нишон диҳед.',
          'Добавьте 3 кнопки товаров и кнопку «Связаться с менеджером», показывая цену по нажатию.',
          'Build a 3-item catalog keyboard plus a Contact Manager button that displays item pricing on tap.',
          'Crea un teclado con 3 productos y un botón de contacto.',
        ),
        quiz: {
          question: L('Барои коркарди пахши тугмаи Inline кадом майдон истифода мешавад?', 'Какое поле передаёт действие кнопки InlineKeyboard?', 'Which field carries the tap payload in an inline button?', '¿Qué campo identifica la acción de un botón inline?'),
          options: {
            tg: ['callback_data', 'css_class', 'sql_query'],
            ru: ['callback_data', 'css_class', 'sql_query'],
            en: ['callback_data', 'css_class', 'sql_query'],
            es: ['callback_data', 'css_class', 'sql_query'],
          },
          correctIndex: 0,
        },
      },
      {
        id: 'tg-3',
        title: L('3. Пайвасти Telegram Mini App (WebApp)', '3. Подключение Telegram Mini App', '3. Connecting a Telegram Mini App', '3. Conectar una Telegram Mini App'),
        explanation: L(
          'Mini App сайтро рост дар дохили Telegram мекушояд. Бо тугмаи `web_app: { url }` ва скрипти `Telegram.WebApp.ready()` корбар бе баромадан аз Telegram заказ медиҳад ё дарс мехонад.',
          'Mini App открывает веб-приложение прямо внутри Telegram. Достаточно кнопки `web_app: { url }` и вызова `window.Telegram.WebApp.ready()` на фронтенде.',
          'Mini Apps embed any HTTPS web app inside Telegram via `web_app: { url }`. Call `Telegram.WebApp.ready()` and `expand()` on load for native full-screen UX.',
          'Las Mini Apps abren tu web HTTPS dentro de Telegram mediante `web_app: { url }`.',
        ),
        templateTitle: 'mini-app-button.json',
        templateCode: `{
  "reply_markup": {
    "inline_keyboard": [[
      { "text": "🚀 Кушодани DevAtlas", "web_app": { "url": "https://your-domain.app/courses" } }
    ]]
  }
}`,
        practiceTask: L(
          'Тугмаи web_app-ро ба саҳифаи `/career-test` ё `/workshops` пайваст кунед ва дар Telegram санҷед.',
          'Привяжите кнопку web_app к вашей HTTPS-странице и проверьте открытие в мобильном Telegram.',
          'Attach a web_app button pointing to your HTTPS deployment and test opening it on mobile Telegram.',
          'Conecta un botón web_app a tu dominio HTTPS y pruébalo en Telegram.',
        ),
        quiz: {
          question: L('Барои кушодани Mini App URL бояд чӣ гуна протокол дошта бошад?', 'Какой протокол обязателен для URL Telegram Mini App?', 'Which protocol is required for a Telegram Mini App URL?', '¿Qué protocolo exige Telegram Mini App?'),
          options: {
            tg: ['HTTPS', 'FTP', 'file://'],
            ru: ['HTTPS', 'FTP', 'file://'],
            en: ['HTTPS', 'FTP', 'file://'],
            es: ['HTTPS', 'FTP', 'file://'],
          },
          correctIndex: 0,
        },
      },
      {
        id: 'tg-4',
        title: L('4. Webhook, Деплой ва Гирифтани Закази Аввал', '4. Webhook, деплой и первый клиент', '4. Webhook Security & Client Handoff', '4. Webhook y entrega al cliente'),
        explanation: L(
          'Дар production ба ҷои polling беҳтар аст Webhook бо `X-Telegram-Bot-Api-Secret-Token` истифода баред. Ба мизоҷ нархи дақиқ, мӯҳлат ва 1 ҳафта дастгирии ройгон пешниҳод кунед.',
          'В продакшене используйте Webhook с проверкой заголовка X-Telegram-Bot-Api-Secret-Token. Для клиента фиксируйте ТЗ, сроки и 7 дней поддержки.',
          'In production, switch from polling to HTTPS Webhooks validated with `X-Telegram-Bot-Api-Secret-Token`. Deliver with a short user guide and clear scope.',
          'En producción usa Webhooks con token secreto y entrega una guía clara al cliente.',
        ),
        templateTitle: 'set-webhook.sh',
        templateCode: `curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://your-domain.app/api/integrations/telegram/webhook","secret_token":"YOUR_SECRET"}'`,
        practiceTask: L(
          'Тавсифи 1-саҳифаии хизмати «Сохтани боти заказ барои мағоза»-ро бо нарх ва 3 функсияи асосӣ нависед.',
          'Составьте короткое коммерческое предложение на разработку бота для местного бизнеса (3 функции + срок).',
          'Draft a 1-page client proposal for a local business Telegram bot (3 core features, timeline, and maintenance).',
          'Redacta una propuesta de 1 página para un bot de negocio local.',
        ),
        quiz: {
          question: L('Чаро дар Webhook `secret_token` санҷида мешавад?', 'Зачем проверять secret_token в запросах Webhook?', 'Why verify `secret_token` on webhook requests?', '¿Por qué verificar `secret_token` en un webhook?'),
          options: {
            tg: ['То каси бегона паёми қалбакӣ нафиристад', 'Барои суст кардани сервер', 'Барои нест кардани чат'],
            ru: ['Чтобы защититься от поддельных запросов не от Telegram', 'Чтобы замедлить ответ', 'Чтобы удалить сообщения'],
            en: ['To reject forged requests that did not come from Telegram', 'To throttle CSS loading', 'To clear chat history'],
            es: ['Para rechazar peticiones falsas que no vienen de Telegram', 'Para hacer más lento el servidor', 'Para borrar el chat'],
          },
          correctIndex: 0,
        },
      },
    ],
  },
  {
    slug: 'freelance-start',
    badge: L('Даромад · Бозори ҷаҳонӣ', 'Доход · Фриланс', 'Income & Clients', 'Ingresos'),
    level: 'Start',
    durationLabel: L('4 модул · Шаблонҳо', '4 модуля · Шаблоны', '4 modules · Playbooks', '4 módulos · Plantillas'),
    title: L(
      'Фриланс аз сифр: Upwork, Kwork ва Fiverr',
      'Фриланс с нуля: Upwork, Kwork и Fiverr',
      'Freelancing from Zero: Upwork, Kwork & Fiverr',
      'Freelance desde cero: Upwork y Fiverr',
    ),
    summary: L(
      'Чӣ хел профили пурфурӯш месозем, аввалин заказро мегирем, нарх мегузорем ва бо мизоҷ бе фиреб кор мекунем.',
      'Как упаковать профиль, получить первые заказы, правильно оценить работу и безопасно работать с клиентами.',
      'Package a winning profile, write proposals that convert, price fixed-scope projects, and manage clients safely.',
      'Crea un perfil sólido, redacta propuestas ganadoras y fija precios claros.',
    ),
    lessons: [
      {
        id: 'fr-1',
        title: L('1. Интихоби ниша ва сохтани 2 кейси намунавӣ', '1. Выбор ниши и 2 сильных кейса', '1. Picking a Niche & 2 Proof Projects', '1. Elegir nicho y 2 casos de prueba'),
        explanation: L(
          'Мизоҷ «ман ҳама корро мекунам»-ро намехарад. Нишаи аниқ гиред (масалан: «Landing дар React/Next.js дар 5 рӯз» ё «Telegram-бот барои мағоза») ва 2 намунаи корӣ дар `/portfolio` гузоред.',
          'Клиенты не доверяют формулировке «делаю всё». Выберите узкую услугу («Лендинг за 5 дней» или «Бот приёма заявок») и покажите 2 живых примера.',
          'Generalists struggle to win first orders. Pick one sharp deliverable (e.g. "Fast Next.js Landing Page in 5 Days") and publish 2 live demos in your portfolio.',
          'Evita ofrecer "de todo". Elige un entregable concreto y muestra 2 demos en vivo.',
        ),
        templateTitle: 'Profile Headline Formula',
        templateCode: `[Role] helping [Client Type] get [Concrete Result] with [Stack]
Example:
"Frontend Developer helping local shops & startups launch fast React/Next.js websites in 5–7 days"`,
        practiceTask: L(
          'Дар бахши `/portfolio` сарлавҳаи аниқ ва 1 лоиҳаи намунавии худро пур кунед.',
          'Заполните чёткий оффер и добавьте 1 проект в вашем DevAtlas Портфолио (/portfolio).',
          'Write your focused headline and add 1 showcase project in `/portfolio`.',
          'Escribe tu titular enfocado y añade 1 proyecto en `/portfolio`.',
        ),
        quiz: {
          question: L('Кадом сарлавҳаи профил бештар заказ меорад?', 'Какой заголовок профиля вызывает больше доверия?', 'Which freelancer headline converts better?', '¿Qué titular convierte mejor?'),
          options: {
            tg: ['«Сохтани сайти тез ва адаптивӣ дар React дар 5 рӯз»', '«Ҳамаи корҳои компютериро мекунам»', '«Омӯзандаи навкор»'],
            ru: ['«Соберу быстрый адаптивный сайт на React за 5 дней»', '«Делаю любые задачи за компьютером»', '«Новичок, учусь»'],
            en: ['"I build fast responsive React landing pages in 5 days"', '"I do all computer work"', '"Beginner looking for anything"'],
            es: ['"Creo sitios rápidos en React en 5 días"', '"Hago de todo en PC"', '"Principiante sin experiencia"'],
          },
          correctIndex: 0,
        },
      },
      {
        id: 'fr-2',
        title: L('2. Навиштани отклик (Proposal), ки мизоҷ мехонад', '2. Отклик (Proposal), на который отвечают', '2. Writing Proposals Clients Actually Read', '2. Propuestas que los clientes responden'),
        explanation: L(
          'Ҳеҷ гоҳ матни копипасти «Салом, ман 5 сол таҷриба дорам» нафиристед. Дар 2 сатри аввал мушкили худи мизоҷро нишон диҳед, 1 идеяи ройгон диҳед ва линкро ба демо гузоред.',
          'Откажитесь от шаблонов «Здравствуйте, готов выполнить». Начните с конкретной детали из задачи клиента, предложите 1 улучшение и приложите ссылку на похожую работу.',
          'Skip generic copy-paste intros. Open with a specific insight about the client’s brief, propose a clear 3-step plan, link 1 relevant demo, and ask 1 smart question.',
          'Empieza mencionando un detalle del problema del cliente, incluye 1 demo relevante y haz una pregunta concreta.',
        ),
        templateTitle: 'Winning Proposal Template',
        templateCode: `Hi [Name],
I noticed your store needs [specific goal from brief].
Here is how I would deliver it in [X] days:
1. Mobile-first layout & catalog
2. Instant Telegram order notification
3. Live deployment + quick walkthrough video

Similar project I built: [Your DevAtlas /u/... link]
Quick question: do you already have product photos ready?`,
        practiceTask: L(
          'Аз рӯи ҳамин шаблон 1 отклик барои сохтани сайт ё бот нависед.',
          'Напишите 1 тренировочный отклик по шаблону для реального заказа с Kwork или Upwork.',
          'Write 1 tailored proposal using this structure for a real job posting.',
          'Redacta 1 propuesta personalizada siguiendo esta estructura.',
        ),
        quiz: {
          question: L('Аз чӣ сар кардани отклик (Proposal) самараноктар аст?', 'С чего лучше начинать отклик на заказ?', 'How should a strong freelance proposal begin?', '¿Cómo debe empezar una buena propuesta?'),
          options: {
            tg: ['Аз мушкил ва мақсади худи мизоҷ + нақшаи кӯтоҳ', 'Аз тарҷумаи ҳоли 3-саҳифаӣ', 'Танҳо бо калимаи «Метавонам»'],
            ru: ['С конкретной задачи клиента и короткого плана решения', 'С автобиографии на 3 страницы', 'Одним словом «Готов»'],
            en: ['With the client’s specific problem and a brief action plan', 'With a 3-page life story', 'With a one-word "Interested"'],
            es: ['Con el problema concreto del cliente y un plan breve', 'Con una biografía larga', 'Con solo "Me interesa"'],
          },
          correctIndex: 0,
        },
      },
      {
        id: 'fr-3',
        title: L('3. Нархгузорӣ, пешпардохт ва амнияти муомила', '3. Ценообразование и безопасная сделка', '3. Pricing, Milestones & Safe Payment', '3. Precios, hitos y pago seguro'),
        explanation: L(
          'Ҳамеша вазифаро ба марҳилаҳо (Milestones) тақсим кунед: 30–50% пешпардохт ё Escrow-и биржа (Upwork/Kwork), тасдиқи прототип, баъд супоридани коди ниҳоӣ.',
          'Разбивайте проект на этапы (Milestones) или работайте через Безопасную сделку / 50% предоплаты. Фиксируйте список правок до старта.',
          'Split projects into milestones or use platform escrow (Upwork/Fiverr/Kwork). Never hand over full source code to an unknown client without milestone protection.',
          'Divide el trabajo en hitos con depósito en garantía o anticipo del 50%.',
        ),
        templateTitle: 'Scope & Milestone Checklist',
        templateCode: `Milestone 1 (40%): Wireframe + approved structure
Milestone 2 (40%): Working live preview link
Milestone 3 (20%): Final revisions (up to 2 rounds) + source handoff`,
        practiceTask: L(
          'Барои як лоиҳаи \$150-ӣ нақшаи 3-марҳилаина бо мӯҳлат нависед.',
          'Разбейте проект за $150 на 3 этапа оплаты с чёткими критериями приёмки.',
          'Break down a $150 starter project into 3 clear payment milestones.',
          'Divide un proyecto de $150 en 3 hitos claros.',
        ),
        quiz: {
          question: L('Беҳтарин роҳи пешгирии бепул мондан дар фриланс чист?', 'Как защититься от неоплаты на фрилансе?', 'What best protects freelancers from non-payment?', '¿Qué protege mejor contra impagos?'),
          options: {
            tg: ['Escrow-и биржа ё пешпардохти марҳилаӣ (Milestones)', 'Фиристодани тамоми код пеш аз гап задан дар бораи пул', 'Кор кардан бе ягон тавофуқи хаттӣ'],
            ru: ['Безопасная сделка (Escrow) или поэтапная предоплата', 'Отправка исходников до обсуждения оплаты', 'Работа без письменного ТЗ'],
            en: ['Platform Escrow or milestone-based upfront deposits', 'Sending final code before discussing budget', 'Working with zero written scope'],
            es: ['Escrow de la plataforma o pagos por hitos', 'Entregar todo antes de acordar precio', 'Trabajar sin alcance escrito'],
          },
          correctIndex: 0,
        },
      },
      {
        id: 'fr-4',
        title: L('4. Гирифтани 5-ситора ва мизоҷони доимӣ', '4. Отзыв 5★ и повторные заказы', '4. Earning 5★ Reviews & Retainers', '4. Reseñas 5★ y clientes recurrentes'),
        explanation: L(
          'Пас аз тамом кардани кор видеои 1-дақиқаии шарҳ (Loom/Telegram) фиристед, ки чӣ хел аз сайт ё бот истифода баранд. Ин мизоҷро хушҳол мекунад ва барои дастгирии моҳона бармегардонад.',
          'Вместе с результатом отправьте короткое 1-минутное видео-обзор, как всё работает. Это мгновенно выделяет вас и приводит к повторным заказам.',
          'Deliver with a 60-second walkthrough video showing how to edit or use what you built. Clients love clarity and often convert into monthly retainers.',
          'Entrega con un vídeo breve de 60 segundos explicando el uso para fidelizar al cliente.',
        ),
        templateTitle: 'Delivery Message',
        templateCode: `Everything is live and tested!
- Live link: [URL]
- 1-minute guide: [Video link]
Please review and let me know if any small tweak is needed. If everything looks great, I would truly appreciate your honest review!`,
        practiceTask: L(
          'Паёми супоридани кор ва пешниҳоди «дастгирии моҳона»-ро барои мизоҷ омода кунед.',
          'Подготовьте шаблон сдачи работы и мягкого предложения ежемесячной поддержки.',
          'Prepare your handoff message and an optional monthly maintenance retainer offer.',
          'Prepara tu mensaje de entrega con oferta de mantenimiento mensual.',
        ),
        quiz: {
          question: L('Чӣ хел эҳтимоли гирифтани закази дуюм аз ҳамон мизоҷро зиёд мекунем?', 'Что сильнее всего повышает шанс повторного заказа?', 'What boosts repeat business from an existing client?', '¿Qué impulsa pedidos recurrentes?'),
          options: {
            tg: ['Супоридани саривақтӣ, видео-дастури кӯтоҳ ва пешниҳоди беҳсозии навбатӣ', 'Нопадид шудан пас аз гирифтани пул', 'Таъхири 1-ҳафтаина бе огоҳӣ'],
            ru: ['Сдача в срок, короткая инструкция и идея следующего улучшения', 'Пропасть сразу после оплаты', 'Задержать срок без предупреждения'],
            en: ['On-time delivery, clear walkthrough, and suggesting the next high-value upgrade', 'Disappearing right after payment', 'Missing deadlines silently'],
            es: ['Entrega puntual, guía clara y proponer la siguiente mejora', 'Desaparecer tras cobrar', 'Retrasarse sin avisar'],
          },
          correctIndex: 0,
        },
      },
    ],
  },
  {
    slug: 'ai-business-automation',
    badge: L('AI · Бе код', 'AI · Без кода', 'AI · No-Code', 'IA · Sin código'),
    level: 'Start',
    durationLabel: L('4 модул · Автоматизатсия', '4 модуля · Автоматизация', '4 modules · Workflows', '4 módulos · Flujos'),
    title: L(
      'AI барои кор ва бизнес (ChatGPT, Claude, n8n)',
      'AI для работы и бизнеса (ChatGPT, Claude, n8n)',
      'AI for Work & Business Automation (No-Code)',
      'IA para Trabajo y Automatización de Negocios',
    ),
    summary: L(
      'Бе донистани барномасозии мураккаб кори идора, маркетинг, дастгирии мизоҷон ва ҳисоботҳоро бо AI ва n8n автоматӣ кунед.',
      'Автоматизируйте маркетинг, поддержку клиентов и отчёты с помощью промпт-инженерии и n8n/Make без сложного кода.',
      'Automate customer replies, lead routing, content ops, and reports using structured prompts and n8n/Make.',
      'Automatiza atención al cliente, marketing y reportes con IA y n8n sin código.',
    ),
    lessons: [
      {
        id: 'aib-1',
        title: L('1. Формулаи Промпти Касбӣ (Role + Context + Format)', '1. Формула сильного промпта', '1. Structured Business Prompting', '1. Prompts estructurados de negocio'),
        explanation: L(
          'Саволи кӯтоҳ — ҷавоби умумӣ медиҳад. Ҳамеша 4 қисм диҳед: Нақш (Role), Маълумоти воқеии тиҷорат (Context), Вазифаи дақиқ (Task) ва Формати баромад (ҷадвал, JSON ё матни Telegram).',
          'Общий запрос даёт «воду». Задавайте 4 элемента: Роль, Контекст бизнеса, Конкретную задачу и Формат ответа (таблица, список, пост).',
          'Vague prompts give generic output. Specify Role, Business Context, Exact Task, Constraints, and Output Format (table, checklist, or email).',
          'Incluye siempre Rol, Contexto del negocio, Tarea concreta y Formato de salida.',
        ),
        templateTitle: 'Business Prompt Blueprint',
        templateCode: `Role: You are a senior operations analyst for a retail shop in Dushanbe.
Context: Monthly sales dropped 12% in category B; average order is 180 TJS.
Task: Create a 5-point action plan and 3 Telegram promo messages in Tajik.
Format: Markdown table (Action | Owner | Expected Impact).`,
        practiceTask: L(
          'Бо ин формула барои тиҷорати дӯстдоштаатон (кафе, курс ё мағоза) нақшаи 1-ҳафтаина созед.',
          'Примените формулу к реальному бизнесу (кафе, магазин, учебный центр) и получите план на неделю.',
          'Apply the 4-part prompt template to a real business workflow and compare with a 1-line prompt.',
          'Aplica la fórmula a un negocio real y compara el resultado.',
        ),
        quiz: {
          question: L('Кадом унсур ҷавоби AI-ро барои тиҷорат дақиқтар мекунад?', 'Что делает ответ AI максимально полезным для бизнеса?', 'What makes AI output far more accurate for business tasks?', '¿Qué mejora más la precisión de la IA?'),
          options: {
            tg: ['Додани контексти воқеӣ, маҳдудиятҳо ва формати баромад', 'Навиштани танҳо 2 калима', 'Хомӯш кардани интернет'],
            ru: ['Конкретный контекст, ограничения и формат вывода', 'Запрос из двух слов', 'Отсутствие примеров'],
            en: ['Concrete business context, constraints, and target output format', 'A two-word prompt', 'Omitting the audience'],
            es: ['Contexto real, restricciones y formato esperado', 'Un prompt de dos palabras', 'No definir el objetivo'],
          },
          correctIndex: 0,
        },
      },
      {
        id: 'aib-2',
        title: L('2. Занҷири автоматии Trigger → AI → Action (n8n / Make)', '2. Цепочка Trigger → AI → Action (n8n)', '2. Trigger → AI → Action Pipelines', '2. Flujos Trigger → IA → Acción'),
        explanation: L(
          'Автоматизатсия 3 қадам дорад: Trigger (масалан, дархости нав аз сайт ё Telegram) → AI (тасниф ва навиштани ҷавоб) → Action (сабт ба Google Sheets + хабар ба менеҷер).',
          'Любая автоматизация состоит из 3 блоков: Триггер (новая заявка) → AI-обработка (классификация/черновик ответа) → Действие (запись в Sheets + уведомление в Telegram).',
          'Every no-code AI workflow follows 3 steps: Trigger (new form/message) → AI step (classify/summarize/draft) → Action (write to Sheets/CRM + notify team).',
          'Todo flujo sigue 3 pasos: Disparador → Procesamiento IA → Acción en CRM/Sheets.',
        ),
        templateTitle: 'Lead Routing Workflow (Pseudocode)',
        templateCode: `1. TRIGGER: New form submission (name, message, budget)
2. AI STEP: Classify intent -> [sales | support | spam] + draft reply
3. ROUTER:
   - sales   -> Append row to Google Sheets + Alert Telegram sales chat
   - support -> Create ticket with drafted reply for human review`,
        practiceTask: L(
          'Як кори такроршавандаи ҳаррӯзаро интихоб карда, схемаи 3-қадамаи онро нависед.',
          'Выберите одну рутинную задачу и распишите её в виде цепочки Trigger → AI → Action.',
          'Map one repetitive daily task into a Trigger → AI → Action diagram.',
          'Mapea una tarea repetitiva en Trigger → IA → Acción.',
        ),
        quiz: {
          question: L('Дар схемаи автоматизатсия «Trigger» чист?', 'Что такое Trigger в автоматизации n8n / Make?', 'What is a Trigger in a no-code workflow?', '¿Qué es un Trigger en n8n/Make?'),
          options: {
            tg: ['Ҳодисае, ки занҷирро ба кор меандозад (масалан, паём ё дархости нав)', 'Номи шрифт', 'Пароли компютер'],
            ru: ['Событие, запускающее сценарий (новая заявка, письмо, расписание)', 'Цвет кнопки', 'Название тарифа'],
            en: ['The event that starts the workflow (new form, message, or schedule)', 'A CSS theme', 'A billing invoice'],
            es: ['El evento que inicia el flujo (formulario, mensaje o horario)', 'Un color', 'Un archivo ZIP'],
          },
          correctIndex: 0,
        },
      },
      {
        id: 'aib-3',
        title: L('3. Базаи дониш ва дастгирии мизоҷон бо AI', '3. База знаний и поддержка клиентов с AI', '3. Grounded FAQ & Customer Support AI', '3. Base de conocimiento y soporte IA'),
        explanation: L(
          'Барои он ки AI ба мизоҷ нархи нодуруст нагӯяд, ба ӯ файли FAQ-и расмӣ (нархнома, суроға, соати кор) диҳед ва қоидаи қатъӣ гузоред: «Агар ҷавоб дар FAQ набошад — ба оператор пайваст кун».',
          'Чтобы AI не выдумывал цены и скидки, передавайте официальный FAQ и строгое правило: «Если ответа нет в документе — переведи на менеджера».',
          'Feed the assistant your verified FAQ/price sheet and enforce a strict fallback rule: whenever information is missing, escalate to a human operator.',
          'Entrega tu FAQ oficial y obliga a derivar a un humano si falta información.',
        ),
        templateTitle: 'Safe Support System Rule',
        templateCode: `You answer customer questions ONLY using the approved FAQ below.
If the user asks about custom discounts, refunds, or anything not in the FAQ:
Reply: "Let me connect you with a human specialist right away."`,
        practiceTask: L(
          '5 саволу ҷавоби маъмултарини мизоҷонро (FAQ) барои як ширкат тартиб диҳед.',
          'Составьте мини-FAQ из 5 частых вопросов клиентов и правило передачи оператору.',
          'Draft a 5-question verified FAQ plus an escalation rule for a real business.',
          'Redacta 5 preguntas frecuentes verificadas con regla de escalado.',
        ),
        quiz: {
          question: L('Вақте саволи мизоҷ дар FAQ-и расмӣ нест, AI бояд чӣ кор кунад?', 'Что должен сделать AI-ассистент, если ответа нет в базе знаний?', 'What should a business support AI do when an answer is not in its FAQ?', '¿Qué debe hacer el bot si no tiene el dato en el FAQ?'),
          options: {
            tg: ['Рост гӯяд ва ба корманди зинда пайваст кунад', 'Нархро аз худ бофад', 'Чатро нест кунад'],
            ru: ['Честно сообщить и перевести диалог на живого специалиста', 'Придумать цену самому', 'Игнорировать клиента'],
            en: ['Abstain honestly and escalate to a human specialist', 'Guess a discount', 'Ignore the message'],
            es: ['Indicarlo con honestidad y derivar a un humano', 'Inventar un precio', 'Ignorar al cliente'],
          },
          correctIndex: 0,
        },
      },
      {
        id: 'aib-4',
        title: L('4. Назорати хароҷот ва фурӯши хизмати AI ба ширкатҳо', '4. Контроль бюджета и продажа внедрений', '4. ROI, Cost Controls & Selling AI Ops', '4. ROI, control de costos y venta'),
        explanation: L(
          'Ширкатҳо технологияро не, балки сарфаи вақт ва зиёд шудани фурӯшро мехаранд. Ҳисоб кунед: агар бот рӯзе 2 соати менеҷерро сарфа кунад, он дар 1 моҳ арзиши худро 5 маротиба мепӯшонад.',
          'Бизнес покупает не «нейросеть», а экономию часов и рост заявок. Всегда считайте ROI и ставьте дневные лимиты расходов API.',
          'Businesses buy saved hours and faster response times, not buzzwords. Always calculate monthly ROI and set hard daily API spend caps.',
          'Las empresas compran ahorro de tiempo y ventas. Calcula el ROI y fija límites diarios de API.',
        ),
        templateTitle: 'ROI Pitch Formula',
        templateCode: `Hours saved/week: 10h  |  Monthly value: 40h
Setup fee: $150–$300   |  Monthly API budget cap: $10–$20`,
        practiceTask: L(
          'Барои 1 ширкати шинос ҳисоби ROI ва пешниҳоди автоматизатсия нависед.',
          'Посчитайте ROI автоматизации одного процесса для знакомого бизнеса.',
          'Calculate the time-saved ROI for one real small-business workflow.',
          'Calcula el ahorro de horas para un negocio local.',
        ),
        quiz: {
          question: L('Чаро ба API-и AI лимити хароҷоти рӯзона (budget cap) мегузоранд?', 'Зачем настраивать дневной лимит расходов на AI API?', 'Why set a daily budget cap on AI API keys?', '¿Por qué poner un límite diario de gasto en la API?'),
          options: {
            tg: ['Барои пешгирии хароҷоти ногаҳонӣ ҳангоми спам ё хато', 'Барои суст кардани интернет', 'Барои пинҳон кардани лого'],
            ru: ['Чтобы защитить бюджет от спама и бесконечных циклов', 'Чтобы отключить мобильную версию', 'Чтобы удалить Google Sheets'],
            en: ['To protect against runaway spend from loops or spam traffic', 'To slow down web fonts', 'To disable webhooks'],
            es: ['Para proteger el presupuesto ante bucles o spam', 'Para desactivar el móvil', 'Para borrar datos'],
          },
          correctIndex: 0,
        },
      },
    ],
  },
  {
    slug: 'nocode-websites',
    badge: L('Тез · 2 ҳафта то заказ', 'Быстрый старт · No-Code', 'Fast Launch', 'Lanzamiento rápido'),
    level: 'Start',
    durationLabel: L('4 модул · Лендинг', '4 модуля · Лендинг', '4 modules · Landing', '4 módulos · Landing'),
    title: L(
      'Сохтани сайтҳои тез No-Code + AI (Tilda / Framer)',
      'Быстрые сайты на No-Code + AI (Tilda / Framer)',
      'Fast No-Code + AI Websites (Framer / Tilda)',
      'Sitios Rápidos No-Code + IA (Framer / Tilda)',
    ),
    summary: L(
      'Сохтори лендинги пурфурӯш, дизайн дар Framer/Tilda бо ёрии AI, адаптив барои телефон ва пайваст ба домен.',
      'Структура продающего лендинга, сборка в Framer/Tilda с помощью AI, мобильная адаптация и передача клиенту.',
      'High-converting landing page anatomy, rapid Framer/Tilda + AI builds, mobile responsiveness, and domain handoff.',
      'Anatomía de landing pages que convierten, diseño móvil y entrega de dominio.',
    ),
    lessons: [
      {
        id: 'nc-1',
        title: L('1. Сохтори 6-блокаи сайти пурфурӯш', '1. Структура продающего лендинга из 6 блоков', '1. 6-Block High-Converting Landing Anatomy', '1. Estructura de 6 bloques que convierte'),
        explanation: L(
          'Сайти хуб тасодуфӣ сохта намешавад: 1) Hero бо ваъдаи равшан + тугма; 2) Мушкили мизоҷ; 3) Ҳал ва бартариҳо; 4) Натиҷаҳо/отзывҳо; 5) Нархҳо; 6) FAQ ва тугмаи заказ.',
          'Сильный лендинг строится по схеме: 1) Первый экран (оффер + CTA); 2) Боль клиента; 3) Решение; 4) Кейсы и отзывы; 5) Тарифы; 6) FAQ и форма заявки.',
          'Follow the proven flow: Hero (clear offer + CTA) → Pain point → Solution/Benefits → Proof/Reviews → Pricing → FAQ + Final CTA.',
          'Sigue el flujo probado: Hero claro → Problema → Solución → Pruebas → Precios → FAQ y CTA.',
        ),
        templateTitle: 'Hero Copy Checklist',
        templateCode: `Headline: [What you offer] + [For whom] + [Main benefit]
Subheadline: 1–2 lines explaining how it works without jargon
Primary CTA: Clear action verb ("Заказать расчёт" / "Начать бесплатно")`,
        practiceTask: L(
          'Матни 6 блоки сайти як курс ё мағозаро дар дафтар ё Notion нависед.',
          'Напишите тексты для всех 6 блоков лендинга любого реального бизнеса.',
          'Draft the copy for all 6 landing page sections for a local business.',
          'Redacta el texto de los 6 bloques para un negocio real.',
        ),
        quiz: {
          question: L('Дар экрани аввали сайт (Hero) чӣ бояд фавран фаҳмо бошад?', 'Что пользователь должен понять за 5 секунд на первом экране?', 'What must a visitor understand within 5 seconds in the hero section?', '¿Qué debe quedar claro en los primeros 5 segundos?'),
          options: {
            tg: ['Чӣ пешниҳод мешавад, ба кӣ фоида дорад ва тугмаи қадами навбатӣ', 'Танҳо расми абстрактӣ бе матн', 'Шартномаи 10-саҳифаӣ'],
            ru: ['Что предлагают, какую выгоду получит клиент и куда нажать', 'Только абстрактную картинку', 'Договор на 10 страниц'],
            en: ['What is offered, who it helps, and the primary action button', 'Only an abstract photo with no text', 'Full legal terms'],
            es: ['Qué ofreces, a quién ayuda y el botón de acción', 'Solo una foto sin texto', 'Texto legal largo'],
          },
          correctIndex: 0,
        },
      },
      {
        id: 'nc-2',
        title: L('2. Ранг, шрифт ва фосилаҳо (Visual Hierarchy)', '2. Типографика, контраст и отступы', '2. Typography, Contrast & Spacing', '2. Tipografía, contraste y espaciado'),
        explanation: L(
          'Қоидаи 60-30-10: 60% фон, 30% картаҳо, 10% ранги асосии тугма (accent). Танҳо 1–2 шрифт истифода баред ва контрасти матнро тоза нигоҳ доред.',
          'Правило 60-30-10: 60% фон, 30% поверхности, 10% акцентный цвет для CTA. Не больше 2 шрифтов и высокий контраст текста.',
          'Use the 60-30-10 palette rule, limit to 1–2 fonts, maintain generous whitespace, and ensure strong text contrast (WCAG AA).',
          'Aplica la regla 60-30-10, usa máximo 2 fuentes y mantén buen contraste.',
        ),
        templateTitle: 'Design Tokens Starter',
        templateCode: `--bg: #070b18;        /* 60% base */
--card: #11182d;      /* 30% surface */
--accent: #4f46e5;    /* 10% CTA highlight */
--text: #f8fafc;      /* High contrast text */`,
        practiceTask: L(
          'Палитраи 3-ранга ва 2 андозаи шрифтро барои лендингатон интихоб кунед.',
          'Подберите палитру 60-30-10 и шрифтовую пару для своего лендинга.',
          'Define a 60-30-10 palette and heading/body font scale for your page.',
          'Define una paleta 60-30-10 y escala tipográfica.',
        ),
        quiz: {
          question: L('Дар қоидаи 60-30-10 ранги акцентӣ (10%) барои чӣ истифода мешавад?', 'Для чего используется акцентный цвет (10%) в правиле 60-30-10?', 'What is the 10% accent color reserved for?', '¿Para qué se reserva el 10% de color acento?'),
          options: {
            tg: ['Тугмаҳои асосии CTA ва нуқтаҳои муҳим', 'Тамоми фони саҳифа', 'Ҳамаи матни оддӣ'],
            ru: ['Главных кнопок CTA и важных акцентов', 'Всего фона страницы', 'Всех абзацев текста'],
            en: ['Primary CTA buttons and key highlights', 'The entire page background', 'Every body paragraph'],
            es: ['Botones principales CTA y destacados', 'Todo el fondo', 'Todos los párrafos'],
          },
          correctIndex: 0,
        },
      },
      {
        id: 'nc-3',
        title: L('3. Адаптив барои телефон (Mobile-First)', '3. Мобильная адаптация (Mobile-First)', '3. Mobile-First Polish & Speed', '3. Diseño Mobile-First y velocidad'),
        explanation: L(
          'Зиёда аз 75% муштариён дар Тоҷикистон аз Instagram ва Telegram бо телефон медароянд. Ҳар тугма бояд ҳадди ақал 44px баландӣ дошта бошад ва суратҳо дар формати WebP бошанд.',
          'Более 75% трафика из Telegram и Instagram приходит со смартфонов. Проверяйте ширину 375px, высоту кнопок ≥ 44px и сжимайте картинки в WebP.',
          'Over 75% of social traffic is mobile. Verify layouts at 375px width, keep touch buttons ≥ 44px tall, and serve compressed WebP images.',
          'Comprueba el diseño en 375px, botones táctiles ≥ 44px e imágenes en WebP.',
        ),
        templateTitle: 'Mobile QA Checklist',
        templateCode: `[ ] Zero horizontal scroll at 375px width
[ ] Tap targets at least 44x44px
[ ] Images compressed (< 200KB WebP)
[ ] Clickable tel: and https://t.me/ contact links`,
        practiceTask: L(
          'Сайти худро дар андозаи 375px санҷед ва боварӣ ҳосил кунед, ки скроли уфуқӣ нест.',
          'Проверьте свою страницу на ширине 375px и уберите любые горизонтальные сдвиги.',
          'Audit your landing page at 375px width and fix any overflow or tiny buttons.',
          'Revisa tu página a 375px y corrige desbordamientos.',
        ),
        quiz: {
          question: L('Андозаи минималии тавсияшудаи тугма барои пахши ангушт дар телефон чанд аст?', 'Какова минимальная рекомендуемая высота кнопки на мобильном?', 'What is the minimum recommended mobile touch target size?', '¿Cuál es el tamaño táctil mínimo recomendado en móvil?'),
          options: {
            tg: ['44×44 px', '12×12 px', '8×8 px'],
            ru: ['44×44 px', '12×12 px', '8×8 px'],
            en: ['44×44 px', '12×12 px', '8×8 px'],
            es: ['44×44 px', '12×12 px', '8×8 px'],
          },
          correctIndex: 0,
        },
      },
      {
        id: 'nc-4',
        title: L('4. Пайвасти формаи заказ ба Telegram + Домен', '4. Заявки в Telegram, SEO и домен', '4. Connecting Forms, Analytics & Domain', '4. Formularios a Telegram y dominio'),
        explanation: L(
          'Мизоҷ бояд ҳар дархости навро дар 2 сония дар Telegram бинад. Пеш аз супоридан title, description, favicon ва SSL (HTTPS)-ро санҷед.',
          'Подключите отправку заявок с формы прямо в Telegram клиента, настройте SSL, favicon, OpenGraph-превью и проверьте тестовую заявку.',
          'Route lead forms straight to Telegram/email, verify HTTPS SSL, set OpenGraph social preview tags, and submit a live test lead before handoff.',
          'Conecta el formulario a Telegram, revisa HTTPS y prueba un envío real.',
        ),
        templateTitle: 'Launch Checklist',
        templateCode: `[ ] Custom domain + HTTPS active
[ ] Title + Meta description + OG preview image
[ ] Test form submission arrives in Telegram
[ ] Client given edit access`,
        practiceTask: L(
          'Рӯйхати санҷиши пеш аз супориданро (Launch Checklist) пур карда 1 дархости тестӣ фиристед.',
          'Пройдите чек-лист запуска и отправьте тестовую заявку с формы.',
          'Complete the launch checklist and confirm your test lead arrives cleanly.',
          'Completa el checklist de lanzamiento y valida un envío de prueba.',
        ),
        quiz: {
          question: L('Барои чӣ пеш аз супоридани сайт OpenGraph (OG) танзим мекунанд?', 'Зачем настраивать OpenGraph-теги перед запуском сайта?', 'Why configure OpenGraph meta tags before launching?', '¿Para qué sirven las etiquetas OpenGraph?'),
          options: {
            tg: ['То ҳангоми фиристодани линк дар Telegram/Instagram сурат ва сарлавҳаи зебо барояд', 'Барои харидани сервер', 'Барои бастани сайт'],
            ru: ['Чтобы при отправке ссылки в Telegram показывалась красивая карточка', 'Чтобы заменить DNS', 'Чтобы отключить HTTPS'],
            en: ['So shared links show a clean title and preview card in Telegram/social apps', 'To purchase a domain', 'To disable mobile view'],
            es: ['Para mostrar una tarjeta limpia al compartir el enlace en Telegram', 'Para cambiar el dominio', 'Para quitar SSL'],
          },
          correctIndex: 0,
        },
      },
    ],
  },
  {
    slug: 'excel-sheets-ai',
    badge: L('Офис · Бонк ва Муҳосибот', 'Офис · Финансы', 'Office & Finance', 'Oficina y Finanzas'),
    level: 'Start',
    durationLabel: L('4 модул · Формулаҳо', '4 модуля · Формулы', '4 modules · Formulas', '4 módulos · Fórmulas'),
    title: L(
      'Excel + Google Sheets + AI барои офис ва муҳосибот',
      'Excel + Google Sheets + AI для офиса и учёта',
      'Excel + Google Sheets + AI for Office & Finance',
      'Excel + Google Sheets + IA para Oficina',
    ),
    summary: L(
      'Формулаҳои XLOOKUP, SUMIFS, ҷадвалҳои Pivot, дашбордҳои молиявӣ ва истифодаи AI барои автоматизатсияи ҳисоботҳо.',
      'XLOOKUP, SUMIFS, сводные таблицы (Pivot), финансовые дашборды и генерация сложных формул с помощью AI.',
      'Master XLOOKUP, SUMIFS, Pivot tables, KPI dashboards, and AI-assisted formula automation for office & banking roles.',
      'Domina XLOOKUP, SUMIFS, tablas dinámicas, dashboards y fórmulas con IA.',
    ),
    lessons: [
      {
        id: 'ex-1',
        title: L('1. Тоза кардани маълумот ва сохтори дурусти ҷадвал', '1. Чистые таблицы и правила данных', '1. Clean Tabular Data Design', '1. Diseño limpio de tablas'),
        explanation: L(
          'Ягон формула дар ҷадвали бетартиб дуруст кор намекунад: ҳар сатр — 1 амалиёт, ҳар сутун — 1 намуди маълумот (Сана, Маҳсулот, Миқдор, Нарх), бе cell-ҳои омехта (merged cells).',
          'Формулы ломаются из-за объединённых ячеек и «каши» в колонках. Правило: 1 строка = 1 запись, 1 колонка = 1 тип данных (Дата, Товар, Сумма).',
          'Avoid merged cells inside data ranges. Keep 1 row per transaction, 1 consistent data type per column, and separate raw data from summary dashboards.',
          'Evita celdas combinadas en los datos: 1 fila por registro y 1 tipo por columna.',
        ),
        templateTitle: 'Clean Sales Sheet Columns',
        templateCode: `Date       | Branch   | Category | Qty | Unit_Price | Total (=D2*E2)
2026-11-01 | Dushanbe | Coffee   |  12 |      25    | 300
2026-11-01 | Khujand  | Tea      |  20 |      15    | 300`,
        practiceTask: L(
          'Ҷадвали 10-сатраи даромаду хароҷоти моҳонаро бе ягон merged cell созед.',
          'Создайте таблицу из 10 строк доходов/расходов без объединённых ячеек.',
          'Create a clean 10-row monthly income/expense sheet with zero merged cells.',
          'Crea una tabla limpia de 10 filas de ingresos y gastos.',
        ),
        quiz: {
          question: L('Чаро дар дохили базаи маълумоти Excel/Sheets «Merge Cells» тавсия намешавад?', 'Почему нельзя использовать «Объединить ячейки» внутри таблицы данных?', 'Why avoid merged cells inside raw spreadsheet tables?', '¿Por qué evitar celdas combinadas en tablas de datos?'),
          options: {
            tg: ['Он филтр, сорт ва формулаҳои Pivot-ро вайрон мекунад', 'Он рангро сиёҳ мекунад', 'Он файлро ба PDF мегардонад'],
            ru: ['Они ломают сортировку, фильтры и сводные таблицы', 'Они меняют язык интерфейса', 'Они удаляют графики'],
            en: ['They break sorting, filtering, and Pivot Table aggregation', 'They delete formulas immediately', 'They lock the file'],
            es: ['Rompen filtros, ordenación y tablas dinámicas', 'Cambian el idioma', 'Borran el archivo'],
          },
          correctIndex: 0,
        },
      },
      {
        id: 'ex-2',
        title: L('2. XLOOKUP ва SUMIFS — пайвасти ду ҷадвал', '2. XLOOKUP и SUMIFS — связь таблиц', '2. XLOOKUP & SUMIFS Power Formulas', '2. Fórmulas XLOOKUP y SUMIFS'),
        explanation: L(
          '`XLOOKUP` нархи маҳсулотро аз нархнома ба таври автоматӣ мекашад, ва `SUMIFS` ҷамъи фурӯшро аз рӯи шаҳр ва моҳ дар 1 сония ҳисоб мекунад.',
          'XLOOKUP заменяет старый ВПР и тянет цену из прайс-листа, а SUMIFS считает итоги сразу по нескольким условиям (филиал + месяц).',
          'Use XLOOKUP to pull prices from a reference table without fragile column indexes, and SUMIFS to aggregate totals by branch, category, and date range.',
          'Usa XLOOKUP para traer precios desde un catálogo y SUMIFS para sumar con múltiples criterios.',
        ),
        templateTitle: 'Core Office Formulas',
        templateCode: `=XLOOKUP(C2, Catalog!A:A, Catalog!B:B, "Not found")
=SUMIFS(Sales!F:F, Sales!B:B, "Dushanbe", Sales!C:C, "Coffee")`,
        practiceTask: L(
          'Бо `SUMIFS` ҷамъи фурӯши танҳо як филиалро дар ҷадвали худ ҳисоб кунед.',
          'Посчитайте через SUMIFS сумму продаж отдельно по каждому филиалу.',
          'Calculate branch-by-branch totals in your workbook using SUMIFS.',
          'Calcula los totales por sucursal usando SUMIFS.',
        ),
        quiz: {
          question: L('Кадом формула ҷамъи рақамҳоро бо 2 ё зиёда шарт ҳисоб мекунад?', 'Какая формула суммирует значения сразу по нескольким условиям?', 'Which formula sums values matching multiple conditions?', '¿Qué fórmula suma valores con múltiples condiciones?'),
          options: {
            tg: ['SUMIFS', 'LOWER', 'TODAY'],
            ru: ['SUMIFS', 'LOWER', 'TODAY'],
            en: ['SUMIFS', 'LOWER', 'TODAY'],
            es: ['SUMIFS', 'LOWER', 'TODAY'],
          },
          correctIndex: 0,
        },
      },
      {
        id: 'ex-3',
        title: L('3. Ҷадвали Pivot ва Дашборди Роҳбар', '3. Сводные таблицы (Pivot) и дашборд', '3. Pivot Tables & Executive Dashboards', '3. Tablas Dinámicas y Dashboards'),
        explanation: L(
          'Ҷадвали Pivot 10 000 сатр фурӯшро дар 3 клик ба ҳисоботи фаҳмо барои директор табдил медиҳад (фурӯш аз рӯи моҳ, категория ва фоида).',
          'Сводная таблица превращает 10 000 строк операций в наглядный отчёт для руководителя за 3 клика без ручных формул.',
          'Pivot Tables summarize thousands of rows in seconds—group by month, branch, or product and connect clean bar/line charts.',
          'Las tablas dinámicas resumen miles de filas en segundos para gráficos claros.',
        ),
        templateTitle: 'Dashboard KPI Strip',
        templateCode: `Total Revenue: =SUM(Sales!F:F)
Total Orders:  =COUNTA(Sales!A2:A)
Avg Ticket:    =IFERROR(Total_Revenue / Total_Orders, 0)`,
        practiceTask: L(
          'Дар варақи алоҳидаи `Dashboard` 3 KPI (Даромад, Шумораи заказ, Чеки миёна) созед.',
          'Сделайте отдельный лист Dashboard с 3 KPI: Выручка, Заказы, Средний чек.',
          'Build a separate Dashboard sheet with Revenue, Order Count, and Average Ticket KPIs.',
          'Crea una hoja Dashboard con Ingresos, Pedidos y Ticket Medio.',
        ),
        quiz: {
          question: L('`IFERROR(A1/B1, 0)` барои чӣ лозим аст?', 'Зачем оборачивать деление в IFERROR(..., 0)?', 'Why wrap division formulas in `IFERROR(..., 0)`?', '¿Para qué envolver una división en `IFERROR(..., 0)`?'),
          options: {
            tg: ['Барои нишон додани 0 ба ҷои хатои #DIV/0! вақте махраҷ холӣ аст', 'Барои нест кардани сутун', 'Барои чоп кардани саҳифа'],
            ru: ['Чтобы показывать 0 вместо ошибки #DIV/0! при пустом знаменателе', 'Чтобы удалить лист', 'Чтобы скрыть колонку'],
            en: ['To display 0 cleanly instead of #DIV/0! when the denominator is empty', 'To delete rows', 'To export PDF'],
            es: ['Para mostrar 0 en lugar de #DIV/0! si el divisor está vacío', 'Para borrar filas', 'Para exportar PDF'],
          },
          correctIndex: 0,
        },
      },
      {
        id: 'ex-4',
        title: L('4. Навиштани формулаҳо ва таҳлил бо ёрии AI', '4. Генерация формул и анализ с AI', '4. AI-Assisted Formulas & Audits', '4. Fórmulas y auditoría con IA'),
        explanation: L(
          'Агар формулаи мураккаб лозим шавад, номи сутунҳо ва намунаи 2 сатрро ба AI диҳед (бе маълумоти махфии мизоҷон!) — он формулаи тайёри Excel/Sheets-ро менависад ва шарҳ медиҳад.',
          'Опишите AI названия колонок и 2 вымышленные строки (не загружайте персональные данные клиентов!), чтобы мгновенно получить точную формулу с объяснением.',
          'Describe your column headers and 2 anonymized sample rows to AI to generate complex formulas—never paste confidential customer PII into public AI chats.',
          'Comparte solo cabeceras y filas de ejemplo anonimizadas para pedir fórmulas a la IA.',
        ),
        templateTitle: 'Safe AI Formula Prompt',
        templateCode: `Google Sheets columns: A=Date, B=Branch, C=Amount, D=Status ("Paid"/"Pending").
Write ONE formula to sum Column C only for "Paid" rows in November 2026.`,
        practiceTask: L(
          'Ягон вазифаи ҳисобдории худро бо шаблони Safe AI Formula Prompt санҷед ва натиҷаашро дастӣ тасдиқ кунед.',
          'Сгенерируйте одну формулу через Safe AI Prompt и обязательно проверьте её на 3 тестовых строках.',
          'Generate one multi-condition formula using the safe prompt and verify it on 3 test rows.',
          'Genera una fórmula multicriterio y compruébala con 3 filas de prueba.',
        ),
        quiz: {
          question: L('Пеш аз фиристодани ҷадвал ба AI кадом қоидаи амниятӣ ҳатмист?', 'Какое правило безопасности обязательно перед отправкой таблицы в AI?', 'Which privacy rule is mandatory before asking AI to analyze spreadsheet data?', '¿Qué regla de privacidad es obligatoria antes de usar IA con hojas de cálculo?'),
          options: {
            tg: ['Маълумоти шахсӣ/махфии мизоҷонро тоза ё иваз (anonymize) кардан', 'Паролҳои бонкро ҳамроҳ кардан', 'Ҳеҷ қоида нест'],
            ru: ['Удалить или обезличить персональные и банковские данные клиентов', 'Добавить пароли сотрудников', 'Отправлять всё без проверки'],
            en: ['Remove or anonymize confidential customer PII and credentials first', 'Include bank passwords', 'No precautions needed'],
            es: ['Anonimizar o quitar datos confidenciales de clientes', 'Incluir contraseñas', 'No hace falta cuidado'],
          },
          correctIndex: 0,
        },
      },
    ],
  },
  {
    slug: 'kids-coding',
    badge: L('Барои кӯдакон (9–15 сол)', 'Для детей (9–15 лет)', 'Kids & Teens (9–15)', 'Niños (9–15 años)'),
    level: 'Start',
    durationLabel: L('4 бозӣ · Шавқовар', '4 игры · Интерактив', '4 games · Fun', '4 juegos · Divertido'),
    title: L(
      'Барномасозӣ барои кӯдакон ва наврасон (Логика + Python)',
      'Программирование для детей и подростков (Игры и Python)',
      'Coding for Kids & Teens (Logic Games + Python)',
      'Programación para Niños y Jóvenes (Juegos + Python)',
    ),
    summary: L(
      'Оғози сода ва бозимонанд: алгоритмҳо, циклҳо, шартҳо ва сохтани аввалин бозии матнии худ дар Python.',
      'Увлекательный старт для школьников: алгоритмы, условия, циклы и создание первой мини-игры на Python.',
      'A playful, beginner-friendly track teaching algorithms, loops, conditionals, and building your first Python mini-game.',
      'Inicio divertido con algoritmos, bucles, condiciones y tu primer minijuego en Python.',
    ),
    lessons: [
      {
        id: 'kd-1',
        title: L('1. Компютер чӣ хел фармон мефаҳмад? (Алгоритм)', '1. Как компьютер понимает команды? (Алгоритм)', '1. How Computers Follow Steps (Algorithms)', '1. Cómo sigue pasos un ordenador'),
        explanation: L(
          'Алгоритм мисли дастури пухтани ош ё роҳнамои робот аст: агар як қадамро фаромӯш кунӣ, робот хато мекунад! Дар Python мо фармонҳоро сатр ба сатр менависем.',
          'Алгоритм — это чёткая инструкция для робота шаг за шагом. В Python каждая строчка выполняется строго по порядку.',
          'An algorithm is a step-by-step recipe for a robot. If you skip a step, the robot gets confused! In Python, commands run one line after another.',
          'Un algoritmo es una receta paso a paso para un robot. En Python las líneas se ejecutan en orden.',
        ),
        templateTitle: 'robot_hello.py',
        templateCode: `hero = "Али"
score = 10
print("Салом,", hero, "! Ту", score, "ситора гирифтӣ ⭐")`,
        practiceTask: L(
          'Дар `/sandbox` номи қаҳрамонро ба номи худат иваз кун ва шумораи ситораҳоро 100 мон!',
          'Открой /sandbox, поменяй имя героя на своё и поставь 100 звёзд!',
          'Open `/sandbox`, change the hero name to yours, and print a fun welcome message!',
          'Abre `/sandbox`, cambia el nombre del héroe por el tuyo y pruébalo.',
        ),
        quiz: {
          question: L('Алгоритм чист?', 'Что такое алгоритм?', 'What is an algorithm?', '¿Qué es un algoritmo?'),
          options: {
            tg: ['Тартиби дақиқи қадамҳо барои иҷрои як кор', 'Танҳо як бозии телефон', 'Номи клавиатура'],
            ru: ['Чёткий порядок шагов для решения задачи', 'Название монитора', 'Кнопка выключения'],
            en: ['A clear step-by-step set of instructions to solve a task', 'A computer monitor', 'A power button'],
            es: ['Una secuencia clara de pasos para resolver una tarea', 'Una pantalla', 'Un teclado'],
          },
          correctIndex: 0,
        },
      },
      {
        id: 'kd-2',
        title: L('2. Қарор қабул кардан: `if` ва `else`', '2. Принятие решений: if и else', '2. Making Decisions with `if` & `else`', '2. Decisiones con `if` y `else`'),
        explanation: L(
          'Бо `if` бозии ту оқил мешавад: «АГАР хол аз 50 зиёд бошад — ту ғолиб шудӣ, ВАГАРНА — боз як бор кӯшиш кун!».',
          'С помощью `if` игра становится умной: «ЕСЛИ очков больше 50 — победа, ИНАЧЕ — попробуй ещё раз!».',
          '`if` and `else` let your game react to players: IF score >= 50, unlock Level 2; ELSE, try again!',
          '`if` y `else` permiten que tu juego reaccione según los puntos del jugador.',
        ),
        templateTitle: 'level_check.py',
        templateCode: `coins = 60
if coins >= 50:
    print("🏆 Марҳилаи 2 кушода шуд!")
else:
    print("🪙 Боз танга ҷамъ кун!")`,
        practiceTask: L(
          'Шарт навис: агар `energy == 0` бошад, «Бозӣ тамом шуд» чоп шавад.',
          'Напиши условие: если `energy == 0`, вывести «Энергия закончилась».',
          'Write an `if` check that prints "Recharge!" when `energy == 0`.',
          'Escribe una condición `if` que avise cuando `energy == 0`.',
        ),
        quiz: {
          question: L('Агар `coins = 30` бошад, дар коди боло кадом паём мебарояд?', 'Что выведет код выше, если coins = 30?', 'If `coins = 30`, which branch runs in the code above?', 'Si `coins = 30`, ¿qué rama se ejecuta?'),
          options: {
            tg: ['Қисми `else` («Боз танга ҷамъ кун!»)', 'Қисми `if` («Марҳилаи 2 кушода шуд!»)', 'Ҳарду якҷоя'],
            ru: ['Ветка else («Собери ещё монет!»)', 'Ветка if («Уровень 2 открыт!»)', 'Обе сразу'],
            en: ['The `else` branch', 'The `if` branch', 'Both branches'],
            es: ['La rama `else`', 'La rama `if`', 'Ambas ramas'],
          },
          correctIndex: 0,
        },
      },
      {
        id: 'kd-3',
        title: L('3. Қудрати Такрор: Цикли `for`', '3. Суперсила повторения: цикл for', '3. Repeat Power: `for` Loops', '3. El poder de repetir: bucles `for`'),
        explanation: L(
          'Ба ҷои 10 бор навиштани `print`, мо 1 цикли `for` менависем ва компютер дар 1 сония 10 ё 1000 бор такрор мекунад!',
          'Вместо того чтобы писать команду 100 раз, цикл `for` делает это за 2 строчки кода.',
          'Instead of copying the same line 100 times, a `for` loop repeats actions cleanly in 2 lines of code.',
          'En lugar de repetir 100 líneas, un bucle `for` lo hace en solo 2 líneas.',
        ),
        templateTitle: 'rocket_countdown.py',
        templateCode: `for sec in [5, 4, 3, 2, 1]:
    print("Парвоз баъд аз:", sec)
print("🚀 ПОЕХАЛИ!")`,
        practiceTask: L(
          'Цикле навис, ки 5 ситораро як-як чоп кунад.',
          'Напиши цикл, который печатает 5 уровней: Уровень 1 ... Уровень 5.',
          'Write a `for` loop that prints Level 1 through Level 5.',
          'Escribe un bucle `for` que imprima del Nivel 1 al Nivel 5.',
        ),
        quiz: {
          question: L('Цикли `for` барои чӣ истифода мешавад?', 'Зачем нужен цикл for?', 'What is a `for` loop used for?', '¿Para qué sirve un bucle `for`?'),
          options: {
            tg: ['Барои такрор кардани як амал чанд маротиба', 'Барои хомӯш кардани компютер', 'Барои тағйири номи файл'],
            ru: ['Чтобы повторять действие нужное число раз', 'Чтобы выключить компьютер', 'Чтобы нарисовать кнопку вручную'],
            en: ['To repeat an action multiple times automatically', 'To turn off the computer', 'To rename folders'],
            es: ['Para repetir una acción varias veces automáticamente', 'Para apagar el PC', 'Para cambiar el fondo'],
          },
          correctIndex: 0,
        },
      },
      {
        id: 'kd-4',
        title: L('4. Бозии аввалини ту: «Рақами махфиро ёб!»', '4. Твоя первая игра: «Угадай число!»', '4. Your First Mini-Game: Secret Number!', '4. Tu primer minijuego: ¡Adivina el número!'),
        explanation: L(
          'Акнун мо ҳамаи донишҳоро (тағйирёбанда + `if/else` + цикл) якҷо карда, бозии воқеӣ месозем, ки бо дӯстонат бозӣ карда метавонӣ!',
          'Соединяем переменные, `if/else` и цикл — и получаем настоящую мини-игру «Угадай секретное число»!',
          'Combine variables, `if/else`, and loops to build a playable Secret Number guessing game to challenge your friends!',
          'Combina variables, `if/else` y bucles para crear un juego real de adivinar números.',
        ),
        templateTitle: 'guess_game.py',
        templateCode: `secret = 7
guesses = [3, 9, 7]

for guess in guesses:
    if guess == secret:
        print("🎉 Офарин! Рақами махфӣ:", secret)
        break
    elif guess < secret:
        print(guess, "— хеле хурд аст!")
    else:
        print(guess, "— хеле калон аст!")`,
        practiceTask: L(
          'Рақами `secret`-ро иваз кун ва рӯйхати `guesses`-ро тавре соз, ки дар кӯшиши 3-юм ғолиб шавад.',
          'Поменяй число `secret` и список попыток так, чтобы победа была на 3-м шаге.',
          'Change `secret` and test different guesses in `/sandbox`!',
          'Cambia `secret` y prueba distintos intentos en `/sandbox`.',
        ),
        quiz: {
          question: L('Фармони `break` дар дохили цикл чӣ кор мекунад?', 'Что делает команда break внутри цикла?', 'What does `break` do inside a loop?', '¿Qué hace `break` dentro de un bucle?'),
          options: {
            tg: ['Циклро фавран меистад (масалан, вақте бозигар ғолиб шуд)', 'Циклро дучанд мекунад', 'Кодро нест мекунад'],
            ru: ['Сразу останавливает цикл (например, при победе)', 'Удваивает число повторений', 'Стирает переменные'],
            en: ['Stops the loop immediately (e.g., as soon as the player wins)', 'Doubles the loop count', 'Deletes variables'],
            es: ['Detiene el bucle de inmediato al ganar', 'Duplica las vueltas', 'Borra el código'],
          },
          correctIndex: 0,
        },
      },
    ],
  },
];

export function findWorkshop(slug: string): WorkshopCourse | null {
  return WORKSHOPS.find((item) => item.slug === slug) ?? null;
}
