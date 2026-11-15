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
  es: {
    loading: 'Cargando el editor…',
    unavailable: 'El editor no está disponible. Puedes seguir en un campo de texto normal.',
    pasteBlocked:
      'Se deshizo el pegado grande. Escribe el código tú mismo: así se queda en la memoria. Los fragmentos cortos sí se pueden pegar.',
    emmetOn: 'Emmet está activado: escribe ! o div.card y pulsa Tab.',
    emmetOff:
      'Emmet se desbloquea después de las primeras lecciones: primero escribe las etiquetas a mano.',
  },
};

/** Pastes longer than this are undone in practice editors so learners type code themselves. */
export const PRACTICE_PASTE_LIMIT = 60;
/** HTML/CSS lessons before this day keep Emmet off so tags are first typed by hand. */
export const EMMET_FROM_DAY = 4;
