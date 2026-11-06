import type { InterfaceLocale } from '@/lib/locale';

type AgentCopy = {
  assistant: string;
  subtitle: string;
  voiceOn: string;
  voiceOff: string;
  voiceIsOn: string;
  voiceIsOff: string;
  clear: string;
  close: string;
  kindGuide: string;
  kindMaterials: string;
  kindNoMatch: string;
  stop: string;
  thinking: string;
  inputLabel: string;
  placeholder: string;
  send: string;
  historyNote: string;
  guideNote: string;
  unavailable: string;
};

/** Text of the floating DevAtlas assistant. */
export const AGENT_COPY: Record<InterfaceLocale, AgentCopy> = {
  ru: {
    assistant: 'Ассистент DevAtlas',
    subtitle: 'Навигация и ответы из материалов курса',
    voiceOn: 'Включить голос',
    voiceOff: 'Выключить голос',
    voiceIsOn: 'Голос включён',
    voiceIsOff: 'Голос выключен',
    clear: 'Очистить чат',
    close: 'Закрыть',
    kindGuide: 'Гид по платформе',
    kindMaterials: 'Из материалов курса',
    kindNoMatch: 'Не нашёл',
    stop: 'Остановить',
    thinking: 'Думаю…',
    inputLabel: 'Вопрос ассистенту',
    placeholder: 'Спросите про платформу или тему урока…',
    send: 'Отправить',
    historyNote:
      'История разделена по аккаунтам и хранится только в этом браузере. Серверная история пока недоступна.',
    guideNote:
      'Гид отвечает по устройству платформы; вопросы по урокам — из проверенных материалов курса. Без выдумок.',
    unavailable:
      'Сервис ответов сейчас недоступен. По платформе я всё равно подскажу: спросите «что дальше?», «где практика?», «как считается мастерство?».',
  },
  tg: {
    assistant: 'Ёрдамчии DevAtlas',
    subtitle: 'Роҳнамоии платформа ва ҷавобҳо аз маводи курс',
    voiceOn: 'Овозро фаъол кун',
    voiceOff: 'Овозро хомӯш кун',
    voiceIsOn: 'Овоз фаъол аст',
    voiceIsOff: 'Овоз хомӯш аст',
    clear: 'Чатро тоза кардан',
    close: 'Пӯшидан',
    kindGuide: 'Роҳнамо',
    kindMaterials: 'Аз маводи курс',
    kindNoMatch: 'Наёфтам',
    stop: 'Қатъ кардан',
    thinking: 'Фикр мекунам…',
    inputLabel: 'Савол ба ёрдамчӣ',
    placeholder: 'Дар бораи платформа ё мавзӯъ пурсед…',
    send: 'Фиристодан',
    historyNote:
      'Таърих барои ҳар ҳисоб ҷудо буда, танҳо дар ҳамин браузер нигоҳ дошта мешавад. Таърихи серверӣ ҳоло дастрас нест.',
    guideNote:
      'Роҳнамо сохтори платформаро мефаҳмонад; ҷавоби саволҳои дарсӣ аз маводи санҷидашудаи курс аст. Бе бофтан.',
    unavailable:
      'Хидмати ҷавобҳо ҳоло дастрас нест. Дар бораи платформа ба ҳар ҳол кӯмак мекунам: пурсед «қадами навбатӣ?», «машқҳо дар куҷо?», «пешрафт чӣ тавр ҳисоб мешавад?».',
  },
  en: {
    assistant: 'DevAtlas assistant',
    subtitle: 'Platform guide + answers from course materials',
    voiceOn: 'Turn voice on',
    voiceOff: 'Turn voice off',
    voiceIsOn: 'Voice on',
    voiceIsOff: 'Voice off',
    clear: 'Clear chat',
    close: 'Close',
    kindGuide: 'Platform guide',
    kindMaterials: 'From course materials',
    kindNoMatch: 'No match',
    stop: 'Stop',
    thinking: 'Thinking…',
    inputLabel: 'Ask the assistant',
    placeholder: 'Ask about the platform or a lesson topic…',
    send: 'Send',
    historyNote:
      'History is separated by account and stored only in this browser. Server history is not available yet.',
    guideNote:
      'The guide explains the platform; lesson questions come from reviewed course materials. No inventions.',
    unavailable:
      'The answer service is unavailable right now. I can still help with the platform: ask “what next?”, “where is practice?”, “how does mastery work?”.',
  },
  uk: {
    assistant: 'Асистент DevAtlas',
    subtitle: 'Навігація та відповіді з матеріалів курсу',
    voiceOn: 'Увімкнути голос',
    voiceOff: 'Вимкнути голос',
    voiceIsOn: 'Голос увімкнено',
    voiceIsOff: 'Голос вимкнено',
    clear: 'Очистити чат',
    close: 'Закрити',
    kindGuide: 'Гід платформою',
    kindMaterials: 'З матеріалів курсу',
    kindNoMatch: 'Не знайшов',
    stop: 'Зупинити',
    thinking: 'Думаю…',
    inputLabel: 'Запитання асистенту',
    placeholder: 'Запитайте про платформу або тему уроку…',
    send: 'Надіслати',
    historyNote:
      'Історія розділена за обліковими записами й зберігається лише в цьому браузері. Серверна історія поки недоступна.',
    guideNote:
      'Гід пояснює будову платформи; відповіді на питання з уроків — із перевірених матеріалів курсу. Без вигадок.',
    unavailable:
      'Сервіс відповідей зараз недоступний. З платформою я все одно допоможу: оберіть одну з підказок нижче.',
  },
  ja: {
    assistant: 'DevAtlas アシスタント',
    subtitle: 'サイト案内とコース教材からの回答',
    voiceOn: '音声をオンにする',
    voiceOff: '音声をオフにする',
    voiceIsOn: '音声オン',
    voiceIsOff: '音声オフ',
    clear: 'チャットを消去',
    close: '閉じる',
    kindGuide: 'サイト案内',
    kindMaterials: 'コース教材から',
    kindNoMatch: '見つかりません',
    stop: '停止',
    thinking: '考えています…',
    inputLabel: 'アシスタントに質問',
    placeholder: 'サイトやレッスンの内容について質問…',
    send: '送信',
    historyNote:
      '履歴はアカウントごとに分かれ、このブラウザーにのみ保存されます。サーバー履歴はまだ利用できません。',
    guideNote:
      '案内はサイトの使い方を説明します。レッスンの質問には確認済みのコース教材から答えます。作り話はしません。',
    unavailable:
      '回答サービスは現在利用できません。サイトの使い方は引き続き案内できます。下の候補から選んでください。',
  },
  ko: {
    assistant: 'DevAtlas 도우미',
    subtitle: '플랫폼 안내와 강좌 자료 기반 답변',
    voiceOn: '음성 켜기',
    voiceOff: '음성 끄기',
    voiceIsOn: '음성 켜짐',
    voiceIsOff: '음성 꺼짐',
    clear: '채팅 지우기',
    close: '닫기',
    kindGuide: '플랫폼 안내',
    kindMaterials: '강좌 자료에서',
    kindNoMatch: '찾지 못함',
    stop: '중지',
    thinking: '생각 중…',
    inputLabel: '도우미에게 질문',
    placeholder: '플랫폼이나 수업 주제에 대해 물어보세요…',
    send: '보내기',
    historyNote:
      '기록은 계정별로 분리되어 이 브라우저에만 저장됩니다. 서버 기록은 아직 제공되지 않습니다.',
    guideNote:
      '안내는 플랫폼 사용법을 설명하고, 수업 질문은 검토된 강좌 자료로 답합니다. 지어내지 않습니다.',
    unavailable:
      '답변 서비스를 지금 사용할 수 없습니다. 플랫폼 안내는 계속할 수 있어요. 아래 추천 질문을 눌러 보세요.',
  },
};

type MicCopy = {
  start: string;
  stop: string;
  listening: string;
  unsupported: string;
  denied: string;
};

/** Text of the voice input (microphone) button. */
export const MIC_COPY: Record<InterfaceLocale, MicCopy> = {
  ru: {
    start: 'Сказать голосом',
    stop: 'Остановить запись',
    listening: 'Слушаю… говорите вопрос.',
    unsupported:
      'Браузер не распознаёт этот язык. Переключите язык интерфейса на русский или английский или напишите текстом.',
    denied: 'Нет доступа к микрофону. Разрешите его в настройках браузера.',
  },
  tg: {
    start: 'Бо овоз гуфтан',
    stop: 'Қатъи сабт',
    listening: 'Гӯш мекунам… саволро гӯед.',
    unsupported:
      'Браузер забони тоҷикиро бо овоз намешиносад. Саволро бо русӣ ё англисӣ гӯед (забони интерфейсро иваз кунед) ё нависед.',
    denied: 'Ба микрофон иҷозат нест. Онро дар танзимоти браузер фаъол кунед.',
  },
  en: {
    start: 'Ask by voice',
    stop: 'Stop recording',
    listening: 'Listening… say your question.',
    unsupported:
      'Your browser cannot recognise this language. Switch the interface to English or Russian, or type instead.',
    denied: 'Microphone access is blocked. Allow it in your browser settings.',
  },
  uk: {
    start: 'Сказати голосом',
    stop: 'Зупинити запис',
    listening: 'Слухаю… скажіть запитання.',
    unsupported:
      'Браузер не розпізнає цю мову. Перемкніть інтерфейс на англійську чи російську або напишіть текстом.',
    denied: 'Немає доступу до мікрофона. Дозвольте його в налаштуваннях браузера.',
  },
  ja: {
    start: '音声で質問',
    stop: '録音を停止',
    listening: '聞いています… 質問をどうぞ。',
    unsupported: 'このブラウザーはこの言語を認識できません。文字で入力してください。',
    denied: 'マイクへのアクセスがブロックされています。ブラウザーの設定で許可してください。',
  },
  ko: {
    start: '음성으로 질문',
    stop: '녹음 중지',
    listening: '듣고 있어요… 질문을 말하세요.',
    unsupported: '브라우저가 이 언어를 인식하지 못합니다. 텍스트로 입력하세요.',
    denied: '마이크 접근이 차단되었습니다. 브라우저 설정에서 허용하세요.',
  },
};
