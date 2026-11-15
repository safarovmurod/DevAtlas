import type { InterfaceLocale } from '@/lib/locale';

type SessionsCopy = {
  title: string;
  guestBadge: string;
  signedInBadge: string;
  guestHint: string;
  guestLogin: string;
  intro: string;
  current: string;
  signedInAt: string;
  method: string;
  sessionId: string;
  unknown: string;
  loading: string;
  othersNote: string;
  signOutOthers: string;
  signOutHere: string;
  working: string;
  othersDone: string;
  othersError: string;
  sessionError: string;
};

/** Text of Settings → sessions and devices. */
export const SESSIONS_COPY: Record<InterfaceLocale, SessionsCopy> = {
  ru: {
    title: 'Сессии и устройства',
    guestBadge: 'Гость',
    signedInBadge: 'Вы вошли',
    guestHint:
      'Сессии появляются после входа. Войдите, чтобы увидеть вход на этом устройстве и выйти на других устройствах. Пока вы гость, прогресс хранится только в этом браузере.',
    guestLogin: 'Войти · Google или email',
    intro:
      'Вход на этом устройстве сохраняется после закрытия браузера. Ниже — данные текущей сессии.',
    current: 'Это устройство',
    signedInAt: 'Вход выполнен',
    method: 'Способ входа',
    sessionId: 'ID сессии',
    unknown: 'нет данных',
    loading: 'Проверяем сессию…',
    othersNote:
      'Список других устройств сервис входа не показывает. Кнопка ниже закрывает все остальные сессии, а эта останется открытой. Другие устройства потеряют вход, когда их доступ обновится (обычно в течение часа).',
    signOutOthers: 'Выйти на других устройствах',
    signOutHere: 'Выйти здесь',
    working: 'Подождите…',
    othersDone: 'Готово: все остальные сессии закрыты. Эта сессия осталась открытой.',
    othersError: 'Не удалось выйти на других устройствах. Повторите попытку.',
    sessionError: 'Не удалось прочитать текущую сессию. Обновите страницу.',
  },
  tg: {
    title: 'Сессияҳо ва дастгоҳҳо',
    guestBadge: 'Меҳмон',
    signedInBadge: 'Шумо ворид шудаед',
    guestHint:
      'Сессияҳо баъди ворид шудан пайдо мешаванд. Ворид шавед, то вуруди ин дастгоҳро бинед ва дар дастгоҳҳои дигар бароед. То ҳол ки меҳмон ҳастед, пешрафт танҳо дар ҳамин браузер нигоҳ дошта мешавад.',
    guestLogin: 'Ворид шудан · Google ё email',
    intro:
      'Вуруд дар ин дастгоҳ баъди пӯшидани браузер низ боқӣ мемонад. Дар поён маълумоти сессияи ҳозира аст.',
    current: 'Ин дастгоҳ',
    signedInAt: 'Вақти вуруд',
    method: 'Тарзи вуруд',
    sessionId: 'ID-и сессия',
    unknown: 'маълумот нест',
    loading: 'Сессияро месанҷем…',
    othersNote:
      'Хидмати вуруд рӯйхати дастгоҳҳои дигарро нишон намедиҳад. Тугмаи поён ҳамаи сессияҳои дигарро мебандад ва ин сессия кушода мемонад. Дастгоҳҳои дигар вақте вуруди онҳо нав мешавад (одатан дар давоми як соат) вуруди худро аз даст медиҳанд.',
    signOutOthers: 'Дар дастгоҳҳои дигар баромадан',
    signOutHere: 'Дар ин ҷо баромадан',
    working: 'Интизор шавед…',
    othersDone: 'Тайёр: ҳамаи сессияҳои дигар баста шуданд. Ин сессия кушода монд.',
    othersError: 'Дар дастгоҳҳои дигар баромадан нашуд. Боз кӯшиш кунед.',
    sessionError: 'Сессияи ҳозира хонда нашуд. Саҳифаро нав кунед.',
  },
  en: {
    title: 'Sessions and devices',
    guestBadge: 'Guest',
    signedInBadge: 'Signed in',
    guestHint:
      'Sessions appear after you sign in. Sign in to see this device’s session and to sign out of other devices. As a guest, your progress stays only in this browser.',
    guestLogin: 'Sign in · Google or email',
    intro:
      'Your sign-in on this device is kept after you close the browser. Below are the details of the current session.',
    current: 'This device',
    signedInAt: 'Signed in',
    method: 'Sign-in method',
    sessionId: 'Session ID',
    unknown: 'not available',
    loading: 'Checking the session…',
    othersNote:
      'The sign-in service does not list your other devices. The button below ends every other session and keeps this one open. Other devices lose access when their sign-in next refreshes (usually within an hour).',
    signOutOthers: 'Sign out of other devices',
    signOutHere: 'Sign out here',
    working: 'Please wait…',
    othersDone: 'Done: all other sessions are closed. This session stays open.',
    othersError: 'Could not sign out of other devices. Try again.',
    sessionError: 'Could not read the current session. Refresh the page.',
  },
  es: {
    title: 'Sesiones y dispositivos',
    guestBadge: 'Invitado',
    signedInBadge: 'Sesión iniciada',
    guestHint:
      'Las sesiones aparecen después de iniciar sesión. Entra para ver la sesión de este dispositivo y para cerrar la sesión en los demás. Como invitado, tu progreso se queda solo en este navegador.',
    guestLogin: 'Entrar · Google o correo',
    intro:
      'Tu sesión en este dispositivo se mantiene aunque cierres el navegador. Abajo ves los datos de la sesión actual.',
    current: 'Este dispositivo',
    signedInAt: 'Sesión iniciada',
    method: 'Método de acceso',
    sessionId: 'ID de la sesión',
    unknown: 'no disponible',
    loading: 'Comprobando la sesión…',
    othersNote:
      'El servicio de acceso no muestra la lista de tus otros dispositivos. El botón de abajo cierra todas las demás sesiones y mantiene abierta esta. Los otros dispositivos pierden el acceso cuando se renueva su sesión (normalmente en menos de una hora).',
    signOutOthers: 'Cerrar sesión en los demás dispositivos',
    signOutHere: 'Cerrar sesión aquí',
    working: 'Espera un momento…',
    othersDone: 'Listo: se cerraron todas las demás sesiones. Esta sigue abierta.',
    othersError: 'No se pudo cerrar la sesión en los demás dispositivos. Inténtalo de nuevo.',
    sessionError: 'No se pudo leer la sesión actual. Actualiza la página.',
  },
};
