import type { InterfaceLocale } from '@/lib/locale';

export type AuthCopy = {
  signupTitle: string;
  resetTitle: string;
  loginTitle: string;
  intro: string;
  unavailable: string;
  guest: string;
  google: string;
  recommended: string;
  orEmail: string;
  name: string;
  email: string;
  password: string;
  showPassword: string;
  hidePassword: string;
  passwordHint: string;
  loginTab: string;
  panelTitle: string;
  panelBenefits: string[];
  panelFlow: string;
  creating: string;
  saveWait: string;
  signUp: string;
  sendLink: string;
  signIn: string;
  existing: string;
  createAccount: string;
  forgot: string;
  backToLogin: string;
  security: string;
  googleError: string;
  resetSent: string;
  confirmEmail: string;
  firstNameTitle: string;
  firstNameDescription: string;
  firstNameStart: string;
  logout: string;
  nameError: string;
};
export const AUTH_COPY: Record<InterfaceLocale, AuthCopy> = {
  ru: {
    signupTitle: 'Начнём учиться вместе',
    resetTitle: 'Восстановить доступ',
    loginTitle: 'Продолжите своё обучение',
    intro: 'Ваш прогресс и практика — на компьютере и телефоне.',
    unavailable:
      'Вход и регистрация пока не подключены. Курс и ответы доступны без аккаунта; для AI нужен аккаунт.',
    guest: 'Продолжить как гость',
    google: 'Продолжить с Google',
    recommended: 'Рекомендуем',
    orEmail: 'или через email',
    name: 'Ваше имя',
    email: 'Электронная почта',
    password: 'Пароль',
    showPassword: 'Показать пароль',
    hidePassword: 'Скрыть пароль',
    passwordHint: 'Не менее 8 символов',
    loginTab: 'Вход',
    panelTitle: 'Учитесь спокойно, шаг за шагом.',
    panelBenefits: [
      'Понятные уроки по дням',
      'Практика и проверка результата',
      'Прогресс и результаты в одном месте',
    ],
    panelFlow: 'Урок → Код → Проверка',
    creating: 'Создаём…',
    saveWait: 'Подождите…',
    signUp: 'Создать аккаунт',
    sendLink: 'Отправить ссылку',
    signIn: 'Войти с email',
    existing: 'Уже есть аккаунт? Войти',
    createAccount: 'Создать аккаунт',
    forgot: 'Забыли пароль?',
    backToLogin: 'Назад ко входу',
    security: 'Google или email · бесплатный аккаунт',
    googleError: 'Google вход недоступен. Попробуйте email или повторите позже.',
    resetSent: 'Если этот адрес зарегистрирован, ссылка для сброса пароля придёт на email.',
    confirmEmail: 'Проверьте email и подтвердите адрес. Затем войдите в аккаунт.',
    firstNameTitle: 'Как вас называть?',
    firstNameDescription:
      'Имя будет в вашем профиле. Изменить его и добавить фото можно в настройках.',
    firstNameStart: 'Начать обучение',
    logout: 'Выйти',
    nameError: 'Не удалось сохранить имя.',
  },
  en: {
    signupTitle: "Let's learn together",
    resetTitle: 'Recover access',
    loginTitle: 'Continue your learning journey',
    intro: 'Your progress and practice — on desktop and mobile.',
    unavailable:
      'Login and registration are not configured yet. Lessons and answers are available without an account; AI requires an account.',
    guest: 'Continue as guest',
    google: 'Continue with Google',
    recommended: 'Recommended',
    orEmail: 'or use email',
    name: 'Your name',
    email: 'Email address',
    password: 'Password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    passwordHint: 'At least 8 characters',
    loginTab: 'Sign in',
    panelTitle: 'Learn at your own pace, one step at a time.',
    panelBenefits: [
      'Clear lessons organized by day',
      'Practice and check your work',
      'Progress and results in one place',
    ],
    panelFlow: 'Lesson → Code → Check',
    creating: 'Creating…',
    saveWait: 'Please wait…',
    signUp: 'Create account',
    sendLink: 'Send link',
    signIn: 'Sign in with email',
    existing: 'Already have an account? Sign in',
    createAccount: 'Create account',
    forgot: 'Forgot password?',
    backToLogin: 'Back to sign in',
    security: 'Google or email · free account',
    googleError: 'Google sign-in is unavailable. Try email or try again later.',
    resetSent: 'If this email is registered, you will receive a password reset link.',
    confirmEmail: 'Check your email and confirm your address. Then sign in.',
    firstNameTitle: 'What should we call you?',
    firstNameDescription:
      'This name will appear in your profile. You can change it and add a photo in Settings.',
    firstNameStart: 'Start learning',
    logout: 'Log out',
    nameError: 'Could not save your name.',
  },
  tg: {
    signupTitle: 'Биёед якҷоя омӯзем',
    resetTitle: 'Барқарор кардани дастрасӣ',
    loginTitle: 'Омӯзишро идома диҳед',
    intro: 'Пешрафт ва машқҳои шумо — дар компютер ва телефон.',
    unavailable:
      'Воридшавӣ ва бақайдгирӣ ҳоло танзим нашудааст. Дарсҳо бе аккаунт дастрасанд; AI аккаунт мехоҳад.',
    guest: 'Идома ҳамчун меҳмон',
    google: 'Идома бо Google',
    recommended: 'Тавсия мешавад',
    orEmail: 'ё бо email',
    name: 'Номи шумо',
    email: 'Почтаи электронӣ',
    password: 'Рамз',
    showPassword: 'Нишон додани рамз',
    hidePassword: 'Пинҳон кардани рамз',
    passwordHint: 'На камтар аз 8 аломат',
    loginTab: 'Воридшавӣ',
    panelTitle: 'Оромона, қадам ба қадам омӯзед.',
    panelBenefits: [
      'Дарсҳои фаҳмо аз рӯйи рӯзҳо',
      'Машқ ва санҷиши натиҷа',
      'Пешрафт ва натиҷаҳо дар як ҷо',
    ],
    panelFlow: 'Дарс → Код → Санҷиш',
    creating: 'Сохта мешавад…',
    saveWait: 'Лутфан интизор шавед…',
    signUp: 'Сохтани аккаунт',
    sendLink: 'Фиристодани пайванд',
    signIn: 'Воридшавӣ бо email',
    existing: 'Аллакай аккаунт доред? Ворид шавед',
    createAccount: 'Сохтани аккаунт',
    forgot: 'Рамзро фаромӯш кардед?',
    backToLogin: 'Бозгашт ба воридшавӣ',
    security: 'Google ё email · аккаунти ройгон',
    googleError: 'Воридшавӣ бо Google дастрас нест. Бо email санҷед ё дертар такрор кунед.',
    resetSent: 'Агар ин суроға сабт шуда бошад, пайванди барқароркунӣ ба email меояд.',
    confirmEmail: 'Email-ро санҷед ва суроғаро тасдиқ кунед. Баъд ворид шавед.',
    firstNameTitle: 'Шуморо чӣ ном гӯем?',
    firstNameDescription:
      'Ном дар профили шумо нишон дода мешавад. Аз Танзимот метавонед онро иваз кунед.',
    firstNameStart: 'Оғози омӯзиш',
    logout: 'Баромадан',
    nameError: 'Ном нигоҳ дошта нашуд.',
  },
  es: {
    signupTitle: 'Empecemos a aprender juntos',
    resetTitle: 'Recuperar el acceso',
    loginTitle: 'Sigue con tu aprendizaje',
    intro: 'Tu progreso y tu práctica, en el ordenador y en el móvil.',
    unavailable:
      'El inicio de sesión y el registro aún no están conectados. El curso y las respuestas están disponibles sin cuenta; la IA necesita una cuenta.',
    guest: 'Continuar como invitado',
    google: 'Continuar con Google',
    recommended: 'Recomendado',
    orEmail: 'o con tu correo',
    name: 'Tu nombre',
    email: 'Correo electrónico',
    password: 'Contraseña',
    showPassword: 'Mostrar contraseña',
    hidePassword: 'Ocultar contraseña',
    passwordHint: 'Al menos 8 caracteres',
    loginTab: 'Entrar',
    panelTitle: 'Aprende a tu ritmo, paso a paso.',
    panelBenefits: [
      'Lecciones claras organizadas por días',
      'Práctica y revisión de tu trabajo',
      'Progreso y resultados en un solo lugar',
    ],
    panelFlow: 'Lección → Código → Revisión',
    creating: 'Creando…',
    saveWait: 'Espera un momento…',
    signUp: 'Crear cuenta',
    sendLink: 'Enviar enlace',
    signIn: 'Entrar con correo',
    existing: '¿Ya tienes una cuenta? Entra',
    createAccount: 'Crear cuenta',
    forgot: '¿Olvidaste la contraseña?',
    backToLogin: 'Volver a entrar',
    security: 'Google o correo · cuenta gratuita',
    googleError:
      'El acceso con Google no está disponible. Prueba con el correo o inténtalo más tarde.',
    resetSent:
      'Si este correo está registrado, recibirás un enlace para restablecer la contraseña.',
    confirmEmail: 'Revisa tu correo y confirma la dirección. Después, entra.',
    firstNameTitle: '¿Cómo quieres que te llamemos?',
    firstNameDescription:
      'Este nombre aparecerá en tu perfil. Puedes cambiarlo y añadir una foto en Ajustes.',
    firstNameStart: 'Empezar a aprender',
    logout: 'Cerrar sesión',
    nameError: 'No se pudo guardar el nombre.',
  },
};
