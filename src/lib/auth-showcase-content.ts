import type { InterfaceLocale } from './locale';

type Copy = { title: string; description: string };
export const SHOWCASE_SLIDES = [
  {
    id: 'path',
    image: 'workspace',
    icon: 'html',
    theme: '#e68b55',
    ru: {
      title: 'Большая цель. Понятный следующий шаг.',
      description:
        'Идите по урокам в своём темпе: от первого знакомства с темой к самостоятельной практике.',
    },
    tg: {
      title: 'Мақсади калон. Қадами навбатии равшан.',
      description: 'Бо ритми худат омӯз: аввал мавзӯъро фаҳм, баъд дар практика мустақилона санҷ.',
    },
    en: {
      title: 'A bigger goal. A clearer next step.',
      description:
        'Move through lessons at your own pace, from understanding a topic to trying it yourself.',
    },
    es: {
      title: 'Una meta grande. Un siguiente paso claro.',
      description:
        'Avanza por las lecciones a tu ritmo, desde entender un tema hasta probarlo por tu cuenta.',
    },
  },
  {
    id: 'code',
    image: 'code',
    icon: 'javascript-1',
    theme: '#efc458',
    ru: {
      title: 'Не просто читайте. Пишите код.',
      description:
        'Пробуйте идеи в редакторе, смотрите результат и связывайте теорию с тем, что сделали сами.',
    },
    tg: {
      title: 'Фақат нахон. Код навис.',
      description:
        'Идеяатро дар редактор санҷ, натиҷаашро бин ва фаҳм, ки теория дар амал чӣ хел кор мекунад.',
    },
    en: {
      title: 'Go beyond reading. Write the code.',
      description:
        'Try ideas in the editor, see the result and connect each concept with something you built.',
    },
    es: {
      title: 'No te limites a leer. Escribe el código.',
      description:
        'Prueba ideas en el editor, mira el resultado y une cada concepto con algo que hayas hecho tú.',
    },
  },
  {
    id: 'react',
    image: 'code',
    icon: 'react',
    theme: '#80ccdc',
    ru: {
      title: 'Собирайте интерфейсы, которые понимаете.',
      description:
        'Компоненты, props и state: разбирайте логику React и применяйте её в упражнениях.',
    },
    tg: {
      title: 'Интерфейс соз — мантиқашро ҳам фаҳм.',
      description: 'Компонентҳо, props ва state: мантиқи React-ро омӯз ва дар машқҳо истифода бар.',
    },
    en: {
      title: 'Build interfaces you understand.',
      description:
        'Explore components, props and state, then put React concepts to work in practical exercises.',
    },
    es: {
      title: 'Crea interfaces que entiendas.',
      description:
        'Explora componentes, props y estado y luego aplica los conceptos de React en ejercicios prácticos.',
    },
  },
  {
    id: 'debug',
    image: 'workspace',
    icon: 'typescript',
    theme: '#a6b9fa',
    ru: {
      title: 'Ошибка — повод разобраться глубже.',
      description:
        'Читайте диагностику, проверяйте предположения и учитесь находить причину, а не угадывать исправление.',
    },
    tg: {
      title: 'Ошибка — имкони беҳтар фаҳмидан.',
      description:
        'Паёми хатогиро хон, фикратро санҷ ва сабабро ёф. Ҳалли дуруст аз фаҳмидани мушкил сар мешавад.',
    },
    en: {
      title: 'Turn an error into understanding.',
      description:
        'Read diagnostics, test your assumptions and learn to find the cause instead of guessing a fix.',
    },
    es: {
      title: 'Convierte un error en comprensión.',
      description:
        'Lee los diagnósticos, pon a prueba tus suposiciones y aprende a encontrar la causa en lugar de adivinar la solución.',
    },
  },
  {
    id: 'notes',
    image: 'creative',
    icon: 'personal-productivity',
    theme: '#d4ba91',
    ru: {
      title: 'Сохраняйте то, что стало понятно.',
      description:
        'Возвращайтесь к важным идеям в разделе «Повторение» и сравнивайте свои ответы с разбором.',
    },
    tg: {
      title: 'Чизи фаҳмидаатро нигоҳ дор.',
      description: 'Ба бахши «Такрор» баргард ва ҷавобҳоятро бо шарҳи дарс муқоиса кун.',
    },
    en: {
      title: 'Keep the ideas that click.',
      description:
        'Revisit important ideas in Review and compare your answers with the explanations.',
    },
    es: {
      title: 'Guarda las ideas que te funcionan.',
      description:
        'Vuelve a las ideas importantes en Repaso y compara tus respuestas con las explicaciones.',
    },
  },
  {
    id: 'review',
    image: 'workspace',
    icon: 'git',
    theme: '#e5a28a',
    ru: {
      title: 'Знать ответ. Понимать почему.',
      description:
        'Проверяйте себя вопросами и возвращайтесь к темам, которым нужно больше внимания.',
    },
    tg: {
      title: 'Ҷавобро дон. Сабабашро фаҳм.',
      description: 'Худатро бо саволҳо санҷ ва ба мавзӯъҳое баргард, ки ҳоло бештар машқ мехоҳанд.',
    },
    en: {
      title: 'Know the answer. Understand why.',
      description:
        'Check your understanding with questions and revisit the topics that need more attention.',
    },
    es: {
      title: 'Conoce la respuesta. Entiende por qué.',
      description:
        'Comprueba lo que has entendido con preguntas y vuelve a los temas que necesitan más atención.',
    },
  },
  {
    id: 'explore',
    image: 'creative',
    icon: 'ux-design',
    theme: '#c0b2e5',
    ru: {
      title: 'Откройте навыки за пределами кода.',
      description:
        'Изучайте дизайн, английский, бизнес и цифровые навыки. Найдите направление под свою цель.',
    },
    tg: {
      title: 'Берун аз код ҳам маҳорат омӯз.',
      description:
        'Дизайн, англисӣ, бизнес ва малакаҳои рақамиро омӯз. Самти мувофиқи мақсадатро интихоб кун.',
    },
    en: {
      title: 'Discover skills beyond code.',
      description:
        'Explore design, English, business and digital skills. Find a direction that fits your goal.',
    },
    es: {
      title: 'Descubre habilidades más allá del código.',
      description:
        'Explora diseño, inglés, negocios y habilidades digitales. Encuentra una ruta que encaje con tu objetivo.',
    },
  },
  {
    id: 'pace',
    image: 'code',
    icon: 'management-foundations',
    theme: '#a6c7b5',
    ru: {
      title: 'Ваш ритм. Ваш следующий результат.',
      description:
        'Начните с одного урока. Возвращайтесь к практике и постепенно превращайте знания в навыки.',
    },
    tg: {
      title: 'Ритми худат. Натиҷаи навбатии худат.',
      description:
        'Аз як дарс сар кун. Ба практика баргард ва қадам ба қадам донишатро ба маҳорат табдил деҳ.',
    },
    en: {
      title: 'Your pace. Your next breakthrough.',
      description:
        'Start with one lesson. Return to practice and gradually turn what you know into what you can do.',
    },
    es: {
      title: 'Tu ritmo. Tu próximo gran avance.',
      description:
        'Empieza con una lección. Vuelve a la práctica y convierte poco a poco lo que sabes en lo que sabes hacer.',
    },
  },
] as const;

export function showcaseCopy(index: number, language: InterfaceLocale): Copy {
  const slide = SHOWCASE_SLIDES[index];
  return slide[language];
}

export const SHOWCASE_UI = {
  ru: {
    label: 'Знакомство с DevAtlas',
    previous: 'Предыдущий слайд',
    rotate: 'Повернуть 3D на 360°',
    next: 'Следующий слайд',
    recommended: 'Рекомендуем начать с одного урока',
    detail: 'Уроки · Практика · Прогресс',
  },
  tg: {
    label: 'Шиносоӣ бо DevAtlas',
    previous: 'Слайди пешина',
    rotate: 'Гардиши 3D ба 360°',
    next: 'Слайди навбатӣ',
    recommended: 'Тавсия: аз як дарс сар кун',
    detail: 'Дарсҳо · Практика · Пешрафт',
  },
  en: {
    label: 'Discover DevAtlas',
    previous: 'Previous slide',
    rotate: 'Rotate 3D by 360°',
    next: 'Next slide',
    recommended: 'Start with one lesson',
    detail: 'Lessons · Practice · Progress',
  },
  es: {
    label: 'Conoce DevAtlas',
    previous: 'Diapositiva anterior',
    rotate: 'Girar el 3D 360°',
    next: 'Diapositiva siguiente',
    recommended: 'Te recomendamos empezar con una lección',
    detail: 'Lecciones · Práctica · Progreso',
  },
} as const;
