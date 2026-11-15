import type { InterfaceLocale } from '@/lib/locale';
import type { NavTarget } from '@/lib/agent/voice-commands';

type AgentCopy = {
  assistant: string;
  close: string;
  tapToSpeak: string;
  listening: string;
  thinking: string;
  speaking: string;
  micStart: string;
  micStop: string;
  stopSpeaking: string;
  heard: string;
  noSpeech: string;
  micDenied: string;
  languageUnsupported: string;
  unsupported: string;
  noVoiceOutput: string;
  openTutor: string;
  tutorOpened: string;
  greeting: string;
  help: string;
  unavailable: string;
  /** What the assistant says when it opens a page. */
  nav: Record<NavTarget, string>;
};

/** Text of the floating DevAtlas voice assistant. It listens and speaks; it has no chat. */
export const AGENT_COPY: Record<InterfaceLocale, AgentCopy> = {
  ru: {
    assistant: 'Ассистент DevAtlas',
    close: 'Закрыть',
    tapToSpeak: 'Нажмите на микрофон и говорите',
    listening: 'Слушаю…',
    thinking: 'Думаю…',
    speaking: 'Говорю…',
    micStart: 'Говорить',
    micStop: 'Закончить запись',
    stopSpeaking: 'Остановить голос',
    heard: 'Вы сказали',
    noSpeech: 'Не расслышал. Нажмите на микрофон и повторите.',
    micDenied: 'Нет доступа к микрофону. Разрешите его в настройках браузера.',
    languageUnsupported:
      'Браузер не распознаёт этот язык. Переключите язык интерфейса на русский или английский.',
    unsupported: 'Этот браузер не умеет слушать голос. Откройте AI Tutor и напишите вопрос там.',
    noVoiceOutput: 'В этом браузере нет озвучивания, поэтому ответ показан текстом.',
    openTutor: 'Открыть AI Tutor',
    tutorOpened: 'Открываю AI Tutor.',
    greeting: 'Привет! Скажите, например, «открой курсы» или задайте вопрос по теме.',
    help: 'Я слушаю и отвечаю голосом. Скажите «открой курсы», «мой день», «открой практику» или «тарифы». Можно спросить, что делать дальше, или задать вопрос по теме курса.',
    unavailable:
      'Сервис ответов сейчас недоступен. Про платформу я всё равно подскажу, а вопросы по темам можно задать в AI Tutor.',
    nav: {
      courses: 'Открываю курсы.',
      myDay: 'Открываю ваш день.',
      plan: 'Открываю план курса.',
      practice: 'Открываю практику.',
      tests: 'Открываю тесты.',
      answers: 'Открываю ответы.',
      notes: 'Открываю заметки.',
      plans: 'Открываю тарифы.',
      community: 'Открываю сообщество.',
      settings: 'Открываю настройки.',
      progress: 'Открываю ваш прогресс.',
    },
  },
  tg: {
    assistant: 'Ёрдамчии DevAtlas',
    close: 'Пӯшидан',
    tapToSpeak: 'Микрофонро пахш кунед ва гӯед',
    listening: 'Гӯш мекунам…',
    thinking: 'Фикр мекунам…',
    speaking: 'Мегӯям…',
    micStart: 'Гуфтан',
    micStop: 'Анҷоми сабт',
    stopSpeaking: 'Қатъи овоз',
    heard: 'Шумо гуфтед',
    noSpeech: 'Нашунидам. Микрофонро пахш кунед ва такрор кунед.',
    micDenied: 'Ба микрофон иҷозат нест. Онро дар танзимоти браузер фаъол кунед.',
    languageUnsupported:
      'Браузер ин забонро намешиносад. Забони интерфейсро ба русӣ ё англисӣ иваз кунед.',
    unsupported:
      'Ин браузер овозро гӯш карда наметавонад. AI Tutor-ро кушоед ва саволро дар он нависед.',
    noVoiceOutput: 'Дар ин браузер овоздиҳӣ нест, барои ҳамин ҷавоб бо матн нишон дода шуд.',
    openTutor: 'Кушодани AI Tutor',
    tutorOpened: 'AI Tutor-ро мекушоям.',
    greeting: 'Салом! Масалан гӯед «курсҳоро кушо» ё дар бораи мавзӯъ савол диҳед.',
    help: 'Ман гӯш мекунам ва бо овоз ҷавоб медиҳам. Гӯед «курсҳоро кушо», «рӯзи ман», «машқҳоро кушо» ё «тарифҳо». Метавонед пурсед, ки минбаъд чӣ кунед, ё дар бораи мавзӯи курс савол диҳед.',
    unavailable:
      'Хидмати ҷавобҳо ҳоло дастрас нест. Дар бораи платформа ба ҳар ҳол кӯмак мекунам, саволҳои мавзӯиро дар AI Tutor диҳед.',
    nav: {
      courses: 'Курсҳоро мекушоям.',
      myDay: 'Рӯзи шуморо мекушоям.',
      plan: 'Нақшаи курсро мекушоям.',
      practice: 'Машқҳоро мекушоям.',
      tests: 'Санҷишҳоро мекушоям.',
      answers: 'Ҷавобҳоро мекушоям.',
      notes: 'Ёддоштҳоро мекушоям.',
      plans: 'Тарифҳоро мекушоям.',
      community: 'Ҷомеаро мекушоям.',
      settings: 'Танзимотро мекушоям.',
      progress: 'Пешрафти шуморо мекушоям.',
    },
  },
  en: {
    assistant: 'DevAtlas assistant',
    close: 'Close',
    tapToSpeak: 'Tap the microphone and speak',
    listening: 'Listening…',
    thinking: 'Thinking…',
    speaking: 'Speaking…',
    micStart: 'Speak',
    micStop: 'Finish recording',
    stopSpeaking: 'Stop the voice',
    heard: 'You said',
    noSpeech: 'I did not catch that. Tap the microphone and try again.',
    micDenied: 'Microphone access is blocked. Allow it in your browser settings.',
    languageUnsupported:
      'Your browser cannot recognise this language. Switch the interface to English or Russian.',
    unsupported:
      'This browser cannot listen to your voice. Open AI Tutor and type your question there.',
    noVoiceOutput: 'This browser cannot speak aloud, so the answer is shown as text.',
    openTutor: 'Open AI Tutor',
    tutorOpened: 'Opening AI Tutor.',
    greeting: 'Hi! Say, for example, “open courses”, or ask a question about a topic.',
    help: 'I listen and answer by voice. Say “open courses”, “my day”, “open practice” or “plans”. You can ask what to do next, or ask a question about a course topic.',
    unavailable:
      'The answer service is unavailable right now. I can still help with the platform, and you can ask topic questions in AI Tutor.',
    nav: {
      courses: 'Opening the courses.',
      myDay: 'Opening your day.',
      plan: 'Opening the course plan.',
      practice: 'Opening practice.',
      tests: 'Opening the tests.',
      answers: 'Opening the answers.',
      notes: 'Opening your notes.',
      plans: 'Opening the plans.',
      community: 'Opening the community.',
      settings: 'Opening settings.',
      progress: 'Opening your progress.',
    },
  },
  es: {
    assistant: 'Asistente de DevAtlas',
    close: 'Cerrar',
    tapToSpeak: 'Toca el micrófono y habla',
    listening: 'Escuchando…',
    thinking: 'Pensando…',
    speaking: 'Hablando…',
    micStart: 'Hablar',
    micStop: 'Terminar la grabación',
    stopSpeaking: 'Detener la voz',
    heard: 'Dijiste',
    noSpeech: 'No te he entendido. Toca el micrófono e inténtalo de nuevo.',
    micDenied: 'No hay acceso al micrófono. Permítelo en los ajustes del navegador.',
    languageUnsupported:
      'Tu navegador no reconoce este idioma. Cambia la interfaz a inglés o ruso.',
    unsupported:
      'Este navegador no puede escuchar tu voz. Abre AI Tutor y escribe tu pregunta allí.',
    noVoiceOutput:
      'Este navegador no puede leer en voz alta, así que la respuesta se muestra como texto.',
    openTutor: 'Abrir AI Tutor',
    tutorOpened: 'Abriendo AI Tutor.',
    greeting: '¡Hola! Di, por ejemplo, «abre los cursos» o hazme una pregunta sobre un tema.',
    help: 'Escucho y respondo con voz. Di «abre los cursos», «mi día», «abre la práctica» o «planes». Puedes preguntar qué hacer a continuación o hacer una pregunta sobre un tema del curso.',
    unavailable:
      'El servicio de respuestas no está disponible ahora. Aun así puedo ayudarte con la plataforma, y las preguntas sobre temas puedes hacerlas en AI Tutor.',
    nav: {
      courses: 'Abriendo los cursos.',
      myDay: 'Abriendo tu día.',
      plan: 'Abriendo el plan del curso.',
      practice: 'Abriendo la práctica.',
      tests: 'Abriendo las pruebas.',
      answers: 'Abriendo las respuestas.',
      notes: 'Abriendo tus notas.',
      plans: 'Abriendo los planes.',
      community: 'Abriendo la comunidad.',
      settings: 'Abriendo los ajustes.',
      progress: 'Abriendo tu progreso.',
    },
  },
};
