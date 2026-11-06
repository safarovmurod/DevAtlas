/** Editor status copy stays separate from authored source code. */
export const EDITOR_COPY = {
  ru: {
    loading: 'Загрузка редактора…',
    unavailable: 'Редактор недоступен. Можно продолжить в обычном поле ввода.',
    pasteBlocked:
      'Большая вставка отменена. Наберите код руками — так он запоминается. Короткие фрагменты вставлять можно.',
    emmetOn: 'Emmet включён: наберите ! или div.card и нажмите Tab.',
    emmetOff: 'Emmet откроется после первых уроков: сначала пишем теги руками.',
  },
  tg: {
    loading: 'Муҳаррир бор шуда истодааст…',
    unavailable: 'Муҳаррир дастрас нест. Метавонед дар майдони одии воридкунӣ идома диҳед.',
    pasteBlocked:
      'Гузоштани матни калон бекор шуд. Кодро бо даст нависед — ҳамин тавр дар хотир мемонад. Порчаҳои кӯтоҳро гузоштан мумкин аст.',
    emmetOn: 'Emmet фаъол аст: ! ё div.card нависед ва Tab-ро пахш кунед.',
    emmetOff: 'Emmet баъд аз дарсҳои аввал кушода мешавад: аввал тегҳоро бо даст менависем.',
  },
  en: {
    loading: 'Loading editor…',
    unavailable: 'The editor is unavailable. You can continue in a basic text field.',
    pasteBlocked:
      'Large paste undone. Type the code yourself — that is how it sticks. Short snippets can still be pasted.',
    emmetOn: 'Emmet is on: type ! or div.card and press Tab.',
    emmetOff: 'Emmet unlocks after the first lessons: type tags by hand first.',
  },
  uk: {
    loading: 'Завантаження редактора…',
    unavailable: 'Редактор недоступний. Можна продовжити у звичайному текстовому полі.',
    pasteBlocked:
      'Велику вставку скасовано. Наберіть код руками — так він запам’ятовується. Короткі фрагменти вставляти можна.',
    emmetOn: 'Emmet увімкнено: наберіть ! або div.card і натисніть Tab.',
    emmetOff: 'Emmet відкриється після перших уроків: спочатку пишемо теги руками.',
  },
  ja: {
    loading: 'エディターを読み込み中…',
    unavailable: 'エディターを利用できません。通常の入力欄で続けられます。',
    pasteBlocked:
      '大きな貼り付けを取り消しました。自分で入力すると身につきます。短い断片は貼り付けできます。',
    emmetOn: 'Emmetが有効です：! や div.card と入力してTabを押します。',
    emmetOff: 'Emmetは最初のレッスンの後に使えます。まずタグを手で書きましょう。',
  },
  ko: {
    loading: '편집기를 불러오는 중…',
    unavailable: '편집기를 사용할 수 없습니다. 기본 입력란에서 계속 작성할 수 있습니다.',
    pasteBlocked:
      '긴 붙여넣기를 취소했습니다. 직접 입력해야 기억에 남습니다. 짧은 조각은 붙여넣을 수 있습니다.',
    emmetOn: 'Emmet 사용 중: ! 또는 div.card 를 입력하고 Tab을 누르세요.',
    emmetOff: 'Emmet은 첫 수업 이후에 열립니다. 먼저 태그를 직접 입력하세요.',
  },
};

/** Pastes longer than this are undone in practice editors so learners type code themselves. */
export const PRACTICE_PASTE_LIMIT = 60;
/** HTML/CSS lessons before this day keep Emmet off so tags are first typed by hand. */
export const EMMET_FROM_DAY = 4;
