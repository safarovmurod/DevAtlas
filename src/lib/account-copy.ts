import type { InterfaceLocale } from '@/lib/locale';
import { JAPANESE_ACCOUNT_COPY } from './locales/ja';
import { KOREAN_ACCOUNT_COPY } from './locales/ko';
import { ACCOUNT_COPY_EN, ACCOUNT_COPY_TG, ACCOUNT_COPY_UK } from './account-copy-translations';

const ru = {
  account: 'Ваш аккаунт',
  guestMode: 'Гостевой режим',
  guestDescription:
    'Сейчас прогресс хранится в этом браузере. Войдите, чтобы продолжить обучение на телефоне и сохранить личный профиль.',
  guestLogin: 'Войти · Google или email',
  profile: 'Личный профиль',
  name: 'Ваше имя',
  saveName: 'Сохранить имя',
  wait: 'Подождите…',
  addPhoto: 'Добавить фото',
  removePhoto: 'Удалить фото',
  photoHint: 'JPEG, PNG или WebP до 5 МБ. Фото обрезается до квадрата и хранится приватно.',
  profileSaved: 'Профиль сохранён.',
  profileError: 'Не удалось сохранить профиль.',
  profileRetry: 'Не удалось сохранить профиль. Попробуйте ещё раз.',
  nameError: 'Не удалось сохранить имя.',
  nameInvalid: 'Имя должно содержать от 2 до 60 символов.',
  photoInvalid: 'Недопустимое фото.',
  loginUnavailable: 'Вход не подключён.',
  photoUploaded: 'Фото обновлено.',
  photoUploadError: 'Не удалось загрузить фото.',
  photoUploadRetry: 'Не удалось загрузить фото. Попробуйте ещё раз.',
  photoRemoved: 'Фото удалено.',
  photoRemoveError: 'Не удалось удалить фото.',
  photoFormat: 'JPEG, PNG или WebP, до 5 МБ.',
  photoSize: 'Изображение слишком большое.',
  photoProcess: 'Не удалось обработать фото.',
  devices: 'Сохранение и устройства',
  deviceDescription:
    'Ваши ответы, XP, заметки, настройки и код доступны только вашему аккаунту. На другом устройстве войдите в тот же аккаунт.',
  sync: 'Синхронизировать',
  importGuest: 'Добавить прогресс гостя из этого браузера',
  noGuestProgress: 'Гостевого прогресса пока нет.',
  guestImported: 'Гостевой прогресс добавлен. Статус облака показан ниже.',
  guestImportError: 'Не удалось прочитать гостевой прогресс. Исходные данные сохранены.',
  local: 'В этом браузере',
  syncing: 'Сохраняем в облако…',
  synced: 'Сохранено в облаке',
  offline: 'Нет сети · изменения сохранены в браузере',
  error: 'Облако недоступно · изменения сохранены в браузере',
  phone: 'Продолжить на телефоне',
  phoneDescription:
    'Сканируйте QR камерой, откройте сайт и войдите в тот же Google или email аккаунт. QR содержит только ссылку на сайт.',
  phoneAlt: 'QR: открыть вход на телефоне',
  phoneError: 'QR недоступен. Откройте этот сайт на телефоне.',
  security: 'Защита аккаунта',
  checking: 'Проверяем…',
  connected: 'Authenticator подключён',
  ordinaryLogin: 'Обычный вход',
  securityDescription:
    'Дополнительная защита через приложение на телефоне. Работает без SMS: Google Authenticator, Microsoft Authenticator, 2FAS и другие.',
  enrollScan: '1. Отсканируйте QR в приложении authenticator.',
  enrollCode: '2. Введите код, чтобы включить защиту.',
  enrollAlt: 'QR для приложения authenticator',
  enrollManual: 'Не получается сканировать? Введите ключ вручную',
  enrollHint:
    'Сохраните доступ к приложению: коды понадобятся при следующем входе. Этот QR и ключ никому не отправляйте.',
  appCode: 'Код из приложения',
  enableSecurity: 'Подключить защиту',
  cancel: 'Отмена',
  requiredCode: 'При входе потребуется код из приложения.',
  disable: 'Отключить',
  enroll: 'Подключить authenticator · QR',
  factorCheckError: 'Не удалось проверить authenticator.',
  enrollError: 'Не удалось подключить authenticator. Попробуйте позже.',
  verifyError: 'Код не принят. Возьмите новый код из приложения.',
  cancelError: 'Не удалось отменить подключение. Повторите попытку.',
  factorRemoved: 'Authenticator отключён.',
  factorRemoveError: 'Не удалось отключить authenticator. Подтвердите вход и повторите.',
  session: 'Сессия',
  sessionDescription:
    'Вход сохраняется на этом устройстве после закрытия браузера. Выход закроет аккаунт здесь; на других устройствах он останется открытым.',
  logout: 'Выйти',
  logoutAccount: 'Выйти из аккаунта',
  challengeTitle: 'Подтвердите вход',
  challengeDescription:
    'Введите 6 цифр из Google Authenticator, Microsoft Authenticator или другого приложения.',
  challengeCode: 'Код authenticator',
  confirm: 'Подтвердить',
  challengeError: 'Не удалось подтвердить код. Возьмите новый код из приложения.',
  newPassword: 'Новый пароль',
  recoveryDescription: 'После сохранения войдите с новым паролем.',
  repeatPassword: 'Повторите пароль',
  savePassword: 'Сохранить пароль',
  passwordMismatch: 'Пароли не совпадают.',
  recoveryError: 'Не удалось сменить пароль. Повторите запрос восстановления.',
  opening: 'Открываем DevAtlas…',
  restoring: 'Восстанавливаем ваш вход',
  openFailed: 'Не удалось открыть аккаунт',
  openError: 'Не удалось открыть аккаунт.',
  retry: 'Повторить',
  assuranceError: 'Не удалось проверить защиту аккаунта.',
  profileLoadError: 'Не удалось загрузить профиль. Проверьте подключение и настройку базы.',
  connectionError:
    'Не удалось проверить подключение. Сохранённый вход восстановится, когда появится интернет.',
  restoreError:
    'Сохранённый вход временно недоступен. Подключитесь к интернету — аккаунт восстановится автоматически.',
  sessionExpired: 'Сессия истекла. Войдите ещё раз.',
  sessionChanged: 'Сессия изменилась. Повторите открытие аккаунта.',
  accountUnverified: 'Не удалось подтвердить аккаунт. Войдите ещё раз.',
  loginIncomplete: 'Вход не завершён. Повторите вход через Google или email.',
  logoutError: 'Не удалось выйти. Повторите попытку.',
  emailUnconfirmed: 'Подтвердите email по ссылке в письме, затем войдите.',
  invalidCredentials: 'Не удалось войти. Проверьте email и пароль.',
  signupDisabled:
    'Регистрация сейчас закрыта. Попробуйте позже или войдите в существующий аккаунт.',
  weakPassword: 'Пароль слишком простой. Используйте минимум 8 символов, буквы и цифры.',
  emailInvalid: 'Проверьте адрес email: он не принят почтовым сервисом.',
  emailLimit: 'Лимит отправки писем временно исчерпан. Попробуйте позже.',
  requestLimit: 'Слишком много попыток. Подождите и попробуйте снова.',
  loginError: 'Не удалось войти. Проверьте email, пароль и подтверждение адреса.',
  requestError: 'Не удалось отправить запрос. Проверьте данные и повторите позже.',
};

export type AccountCopyKey = keyof typeof ru;
export type AccountCopy = Record<AccountCopyKey, string>;

export const ACCOUNT_COPY: Record<InterfaceLocale, AccountCopy> = {
  ja: JAPANESE_ACCOUNT_COPY,
  ko: KOREAN_ACCOUNT_COPY,
  ru,
  en: ACCOUNT_COPY_EN,
  tg: ACCOUNT_COPY_TG,
  uk: ACCOUNT_COPY_UK,
};

const authErrorKeys: Record<string, AccountCopyKey> = {
  email_not_confirmed: 'emailUnconfirmed',
  invalid_credentials: 'invalidCredentials',
  signup_disabled: 'signupDisabled',
  weak_password: 'weakPassword',
  email_address_invalid: 'emailInvalid',
  over_email_send_rate_limit: 'emailLimit',
  over_request_rate_limit: 'requestLimit',
};

/** Translate known provider codes without exposing raw backend error details. */
export function localizedAuthError(
  error: unknown,
  mode: 'login' | 'signup' | 'reset',
  language: InterfaceLocale,
) {
  const details =
    error && typeof error === 'object' ? (error as { code?: unknown; status?: unknown }) : {};
  const key =
    typeof details.code === 'string' && Object.hasOwn(authErrorKeys, details.code)
      ? authErrorKeys[details.code]
      : details.status === 429
        ? 'requestLimit'
        : mode === 'login'
          ? 'loginError'
          : 'requestError';
  return ACCOUNT_COPY[language][key];
}

const localErrorKeys: AccountCopyKey[] = [
  'profileError',
  'profileRetry',
  'nameInvalid',
  'photoInvalid',
  'loginUnavailable',
  'photoUploadError',
  'photoUploadRetry',
  'photoRemoveError',
  'photoFormat',
  'photoSize',
  'photoProcess',
  'openError',
  'assuranceError',
  'profileLoadError',
  'connectionError',
  'restoreError',
  'sessionExpired',
  'sessionChanged',
  'accountUnverified',
  'loginIncomplete',
  'logoutError',
];
const localErrors = new Map(localErrorKeys.map((key) => [ru[key], key]));

/** The provider still owns auth behavior; the UI translates its known local errors. */
export function accountErrorKey(error: unknown, fallback: AccountCopyKey): AccountCopyKey {
  const message = typeof error === 'string' ? error : error instanceof Error ? error.message : '';
  return localErrors.get(message) || fallback;
}
