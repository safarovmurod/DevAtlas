type LocalizedLine = readonly [tg: string, ru: string, en: string];

export const REACT_CONCEPTS: Record<string, { title: LocalizedLine; body: LocalizedLine }> = {
  'topic-4': {
    title: ['Props ва самти дода', 'Props и передача данных', 'Props and data flow'],
    body: [
      'Props қиматҳоеанд, ки компоненти болоӣ ба компоненти дарунӣ медиҳад. Масалан ProductCard нархро аз price мехонад. Барои иваз кардан child callback-ро даъват мекунад, соҳиби дода дар parent мемонад.',
      'Props — входные данные компонента. ProductCard получает цену через price. Если карточка просит её изменить, она вызывает переданный callback, а новое значение задаёт владелец данных.',
      'Props are a component’s inputs. ProductCard reads its price from a prop. To ask for a change, it calls a callback passed by the owner of that value.',
    ],
  },
  'topic-6': {
    title: [
      'Key ва шахсияти элементи рӯйхат',
      'Key и идентичность строки',
      'Keys and list identity',
    ],
    body: [
      'Key ба React мегӯяд, ки кадом элементи нав ба кадом элементи пешина рост меояд. Барои рӯйхати мол ID-и устуворро гир. Баъди reorder input-и ҳар мол бо ID-и худаш мемонад.',
      'Key связывает строку с её предыдущей версией. Для списка товаров используйте стабильный ID записи. После сортировки текст в поле останется у того же товара.',
      'A key identifies a row across renders. Use the product’s stable ID. After sorting, the text in that row’s input stays with the same product.',
    ],
  },
  'topic-7': {
    title: ['Render ва commit', 'Render и commit', 'Render and commit'],
    body: [
      'Render ҳисоб мекунад, ки UI чӣ хел бошад. Commit тағйири лозимро ба DOM мегузорад. Компонент метавонад аз нав ҳисоб шавад, лекин агар натиҷа як бошад, DOM тағйир намеёбад.',
      'Render вычисляет, как должен выглядеть UI. Commit применяет нужные изменения к DOM. Если новый результат совпал с прежним, повторный render может пройти без видимых изменений.',
      'Render calculates what the UI should look like. Commit applies the necessary DOM changes. Another render can leave the visible DOM unchanged when the result is the same.',
    ],
  },
  'topic-8': {
    title: [
      'React кай state-ро нигоҳ медорад?',
      'Когда React сохраняет состояние',
      'When React preserves state',
    ],
    body: [
      'React ҳангоми навсозӣ тип, ҷой ва key-ро муқоиса мекунад. Агар ҳамон форма барои profile-и дигар бо key-и нав биёяд, state-и пешина reset мешавад. Инро барои холӣ кардани draft байни ду корбар истифода бурдан мумкин.',
      'React учитывает тип, положение и key элемента. Если форма другого профиля получает другой key, её состояние создаётся заново. Так можно не переносить черновик между профилями.',
      'React uses an element’s type, position, and key to track its identity. Giving a profile form a different key resets its state so one profile’s draft does not carry over to another.',
    ],
  },
  'topic-10': {
    title: ['State ҳамчун snapshot', 'Снимок состояния', 'State as a snapshot'],
    body: [
      'Ҳар render қимати state-и ҳамон лаҳзаро мегирад. setCount(4) render-и навро дархост мекунад. Агар count дар handler 3 бошад, ҳамон handler баъди setCount ҳам 3 мехонад.',
      'Каждый render получает снимок состояния. setCount(4) просит обновить экран. Если обработчик начался с count = 3, после вызова setter он всё ещё читает 3 из своего снимка.',
      'Each render sees a snapshot of state. setCount(4) requests a new render. A handler that started with count = 3 still reads 3 after calling the setter.',
    ],
  },
  'topic-11': {
    title: [
      'Қимати пешина дар updater',
      'Обновление от предыдущего значения',
      'Updates based on the previous value',
    ],
    body: [
      'Updater мисли setCount(n => n + 1) ба React ҳисобро барои навбат медиҳад. Агар аз 0 ду updater-и ҳамин хел монӣ, аввал 1 ва баъд 2 мешавад.',
      'Updater вроде setCount(n => n + 1) ставит вычисление в очередь. При двух таких обновлениях с начального 0 первый шаг даёт 1, а второй — 2.',
      'An updater such as setCount(n => n + 1) queues a calculation. Starting at zero, two queued increments process as 0 → 1 → 2.',
    ],
  },
  'topic-12': {
    title: ['Гурӯҳбандии навсозӣ', 'Группировка обновлений', 'Batching updates'],
    body: [
      'Batching чанд тағйири state-ро барои навсозии якҷоя ҷамъ мекунад. Вақте корбар формаро reset мекунад, ту метавонӣ name ва error-ро дар як handler холӣ кунӣ. Қиматҳои дар ҳамон render дидашуда snapshot мемонанд.',
      'Batching собирает несколько обновлений состояния. При сбросе формы можно очистить имя и ошибку в одном обработчике. Внутри этого обработчика всё ещё доступны значения его исходного снимка.',
      'Batching groups state updates. A reset handler can clear the name and error together. The running handler still sees the state snapshot from its render.',
    ],
  },
  'topic-13': {
    title: ['Навсозӣ бе mutation', 'Обновление без мутации', 'Updating without mutation'],
    body: [
      'Mutation объекти мавҷударо иваз мекунад. Барои state объекти нав соз, масалан { ...product, price: 12 }. Агар майдони дарунӣ тағйир ёбад, объекти ҳамон майдонро ҳам нусха гир.',
      'Мутация меняет исходный объект. Для состояния создайте новый, например { ...product, price: 12 }. При изменении вложенного поля скопируйте и его объект.',
      'Mutation changes the original object. Build a new state object, such as { ...product, price: 12 }. If you update a nested field, copy that nested object too.',
    ],
  },
  'topic-15': {
    title: [
      'Custom hook: истифодаи дубораи мантиқ',
      'Свой хук и повторное использование логики',
      'Sharing logic with a custom Hook',
    ],
    body: [
      'Custom hook функсияи use… аст, ки зангҳои hook-ро ҷамъ мекунад. Ду компонент useOnlineStatus-ро истифода мебаранд, то як мантиқро такрор накунанд. Ҳар даъват state-и худашро мегирад.',
      'Свой хук — функция с именем use…, которая объединяет вызовы хуков. Два компонента могут вызвать useOnlineStatus вместо копирования подписки. Каждый вызов получает собственное состояние.',
      'A custom Hook is a use… function that packages Hook-based logic. Two components can call useOnlineStatus instead of copying subscription logic. Each call keeps its own state.',
    ],
  },
  'topic-17': {
    title: ['Dependency-и effect чист?', 'Что такое зависимость эффекта', 'Effect dependencies'],
    body: [
      'Dependency қимати аз дохили effect хондашуда аст, мисли roomId. Вақте roomId дигар шуд, React пайвасти қисми пешинаро тоза карда, effect-и ҳуҷраи навро оғоз мекунад.',
      'Зависимость — реактивное значение, которое использует эффект, например roomId. При смене roomId React очистит предыдущее подключение и запустит эффект для новой комнаты.',
      'A dependency is a reactive value the effect reads, such as roomId. If it changes, React cleans up the previous connection and starts the effect for the new room.',
    ],
  },
  'topic-18': {
    title: ['Cleanup чӣ кор мекунад?', 'Что делает очистка эффекта', 'What cleanup does'],
    body: [
      'Cleanup функсияест, ки effect бармегардонад. Агар effect setInterval гузошта бошад, cleanup clearInterval мекунад. React онро пеш аз иҷрои нав бо dependency-и дигар ва ҳангоми баромадани компонент даъват мекунад.',
      'Cleanup — функция, которую возвращает эффект. Если эффект запустил setInterval, очистка вызывает clearInterval. React выполняет её перед повторной синхронизацией и при удалении компонента.',
      'An effect can return a cleanup function. An effect that starts setInterval cleans up with clearInterval. React calls cleanup before a new synchronization and after the component is removed.',
    ],
  },
  'topic-19': {
    title: [
      'Чаро effect боз иҷро мешавад?',
      'Почему эффект запускается снова',
      'Why an effect runs again',
    ],
    body: [
      'Агар effect state-еро иваз кунад, ки худаш аз он вобаста аст, тағйир метавонад effect-ро боз оғоз кунад. Масалан total-ро аз items дар render ҳисоб кун, то барои ҳамин ҳисоб effect state-и дигар насозад.',
      'Если эффект обновляет состояние, от которого сам зависит, обновление может запустить его снова. Например, вычисляйте total из items при рендере, если это только расчёт для экрана.',
      'An effect can retrigger itself by changing a value it depends on. If total is just a calculation from items, compute it during render instead of synchronizing a second state value.',
    ],
  },
  'topic-20': {
    title: [
      'Mount, update ва unmount',
      'Монтаж, обновление и удаление',
      'Mounting, updating, and unmounting',
    ],
    body: [
      'Mount вақте аст, ки компонент ба дарахти React ворид мешавад. Update дар ҳамон ҷой натиҷаи нав месозад. Ҳангоми unmount, масалан баъди бастани modal, state-и он компонент дигар нигоҳ дошта намешавад.',
      'Mount означает появление компонента в дереве React. Update даёт новый render компонента на своём месте. При unmount, например после удаления модалки, её состояние больше не хранится.',
      'Mounting adds a component to the React tree. Updating renders a new version in the same position. Unmounting removes it and discards its state, for example when removing a modal.',
    ],
  },
  'topic-21': {
    title: ['Хаторо то манбааш пайгирӣ кун', 'От симптома к причине', 'Tracing a bug to its cause'],
    body: [
      'Отладка аз амале сар мешавад, ки хатогиро такрор мекунад. Агар дар сабад нарх иваз нашуд, бин, handler кадом қимат дод, state чӣ шуд ва render чиро гирифт.',
      'Отладка начинается со сценария, который воспроизводит ошибку. Если цена в корзине не обновилась, проверьте значение в обработчике, сохранённое состояние и данные следующего рендера.',
      'Debugging starts with a repeatable failure. If the cart price does not update, check what the handler sent, what state holds, and what the next render receives.',
    ],
  },
  'topic-22': {
    title: ['Ref ва қимати current', 'Ref и значение current', 'Refs and current'],
    body: [
      'useRef контейнере медиҳад, ки current-и он байни render-ҳо мемонад. Дар он ID-и timer-ро нигоҳ дор. Барои рақаме, ки дар экран бояд нав шавад, state истифода кун.',
      'useRef возвращает контейнер с current, который сохраняется между рендерами. В нём удобно хранить ID таймера. Значение, которое должно менять экран, храните в состоянии.',
      'useRef gives you a current field that persists across renders. It can hold a timer ID. Use state for values that need to update the display.',
    ],
  },
  'topic-23': {
    title: ['DOM ref барои focus', 'Доступ к DOM через ref', 'Using a DOM ref to focus an input'],
    body: [
      'Ref-и ба input пайвастшуда баъди commit элементи DOM-ро медиҳад. Барои тугмаи «Ҷустуҷӯ» дар handler inputRef.current?.focus() даъват кун. Пеш аз пайдо шудани input, current метавонад null бошад.',
      'Ref на input получает DOM-элемент после commit. Чтобы кнопка поиска переводила фокус, вызовите inputRef.current?.focus() в обработчике. До появления input поле current может быть null.',
      'An input ref receives the DOM element after commit. A search button can call inputRef.current?.focus() in its handler. The ref can be null before the input appears.',
    ],
  },
  'topic-24': {
    title: ['Reducer ва action', 'Reducer и действие', 'Reducers and actions'],
    body: [
      'Reducer функсияест, ки state ва action мегирад ва state-и нав медиҳад. Масалан dispatch бо type: "added" мегӯяд мол зам шуд. Ҳисоб дар reducer мешавад, дархости шабака дар ҷои дигар иҷро мешавад.',
      'Reducer получает текущее состояние и действие и возвращает следующее состояние. dispatch сообщает, например, «товар добавлен». Reducer вычисляет результат без сетевых запросов.',
      'A reducer takes the current state and an action and returns the next state. dispatch can describe an item being added. The reducer calculates the new state without doing network work.',
    ],
  },
  'topic-26': {
    title: ['Мемоизатсия барои чӣ лозим?', 'Что даёт мемоизация', 'What memoization does'],
    body: [
      'Мемоизатсия натиҷаи ҳисоб ё reference-и пешинаро дар шароити мувофиқ истифода мебарад. Масалан рӯйхати калони филтршударо то дигар шудани items ё query боз ҳисоб намекунӣ. Аввал чен кун, ки ҳамин ҳисоб воқеан суст аст.',
      'Мемоизация позволяет повторно использовать результат расчёта или ссылку. Например, отфильтрованный большой список можно не пересчитывать до изменения items или query. Сначала измерьте, насколько дорог этот расчёт.',
      'Memoization can reuse a previous result or reference. For example, reuse a filtered list until items or query changes. Measure the calculation before deciding to cache it.',
    ],
  },
  'topic-27': {
    title: [
      'React.memo кадом render-ро кам мекунад?',
      'Как работает React.memo',
      'How React.memo works',
    ],
    body: [
      'React.memo ба React имкон медиҳад render-и child аз parent-ро бо props-и бетағйир гузаронад. Агар state ё Context-и худи child дигар шавад, он ҳоло ҳам render мешавад.',
      'React.memo помогает пропустить рендер дочернего компонента при прежних props после рендера родителя. Собственное состояние или контекст всё равно может обновить дочерний компонент.',
      'React.memo can skip a child render caused by its parent when props stay the same. Changes to the child’s state or context can still render it.',
    ],
  },
  'topic-30': {
    title: ['Аввал сустиро чен кун', 'Сначала найдите причину задержки', 'Measure the delay first'],
    body: [
      'Агар карточка дер кушояд, Network нишон медиҳад, request дер омад ё не. Profiler вақти кори компонентҳоро чен мекунад. Ислоҳро ба ҷое равона кун, ки ченкунӣ сустӣ нишон дод.',
      'Если карточка открывается медленно, Network показывает время запроса, а React Profiler — работу рендера. Исправляйте то место, где нашли задержку.',
      'If a card opens slowly, Network shows request timing and React Profiler shows render work. Fix the bottleneck that the measurements identify.',
    ],
  },
  'topic-31': {
    title: ['SPA ва MPA аз чӣ фарқ доранд?', 'SPA и MPA', 'SPA and MPA navigation'],
    body: [
      'SPA метавонад ҳангоми гузаштан аз catalog ба details қисми экранро бе ҳуҷҷати нави HTML иваз кунад. MPA одатан барои гузариш ҳуҷҷати дигар мегирад. Дар ҳар ду ҳолат линк бояд баъди reload мустақим кушояд.',
      'SPA может открыть карточку из каталога в текущем HTML-документе. MPA при навигации обычно загружает другой документ. В обоих случаях адрес карточки должен работать после обновления.',
      'An SPA can open a product details view within the current HTML document. An MPA typically loads a different document. Both should support opening or refreshing a direct link to the product.',
    ],
  },
  'topic-32': {
    title: [
      'React Router: URL ва компонент',
      'React Router связывает адрес и экран',
      'React Router maps URLs to screens',
    ],
    body: [
      'React Router URL-ро бо route-и мувофиқ мепайвандад. Link ба /products бурда, компоненти маҳсулотро мекушояд. Барои reload-и ҳамин адрес сервери SPA бояд дархостро ба HTML-и барнома расонад.',
      'React Router сопоставляет URL с маршрутом. Link ведёт на /products, где открывается нужный компонент. Для прямого запроса к этому адресу хост SPA должен отдать HTML приложения.',
      'React Router matches a URL to a route. A Link to /products shows the matching component. On a direct request to that path, an SPA host needs to serve the app’s HTML.',
    ],
  },
  'topic-35': {
    title: [
      'Code splitting дар саҳифаҳо',
      'Разделение кода по маршрутам',
      'Splitting code by route',
    ],
    body: [
      'Code splitting барномаро ба қисмҳои боршавандаи ҷудо тақсим мекунад. Агар саҳифаи Reports танҳо баъзан даркор шавад, коди онро вақти кушодан бор кун. Барои интизорӣ ҳолат нишон деҳ.',
      'Разделение кода позволяет загружать редкие экраны отдельно. Если отчёты нужны только после перехода, их код можно загрузить при открытии. Пока файл идёт, покажите состояние загрузки.',
      'Code splitting loads some screens in separate chunks. A rarely opened reports screen can load when needed. Show a loading state while its code arrives.',
    ],
  },
  'topic-25': {
    title: [
      'Кай useState ва кай useReducer?',
      'Когда брать useState или useReducer',
      'Choosing useState or useReducer',
    ],
    body: [
      'Барои checkbox-и як форма useState сода аст. Агар сабад аз Add, Remove ва Reset қоидаҳои вобаста дошта бошад, useReducer қоидаҳои навсозиро дар як функсия ҷамъ мекунад. Ҳар ду state-и ҳамин компонентро нигоҳ медоранд.',
      'Для одного checkbox обычно хватает useState. Если Add, Remove и Reset меняют связанные поля корзины, useReducer собирает эти переходы в одной функции. Оба хука могут хранить состояние компонента.',
      'A checkbox usually needs only useState. If Add, Remove, and Reset update related cart fields, useReducer keeps those transitions in one function. Either hook can hold a component’s state.',
    ],
  },
  'topic-28': {
    title: [
      'useMemo натиҷаи ҳисобро нигоҳ медорад',
      'useMemo запоминает результат расчёта',
      'useMemo caches a calculated value',
    ],
    body: [
      'useMemo метавонад рӯйхати аз items ва query ҳисобшударо то дигар шудани dependency нигоҳ дорад. Ҳисоб бояд пок бошад: дар дохилаш request ё сабт накун. Дурустии барнома набояд ба cache вобаста бошад.',
      'useMemo может повторно использовать результат фильтрации до изменения items или query. Функция расчёта должна быть чистой, без запросов и записи данных. Программа должна оставаться правильной при повторном расчёте.',
      'useMemo can reuse a filtered list until items or query changes. Keep the calculation pure, with no requests or writes. The program should stay correct if React calculates it again.',
    ],
  },
  'topic-29': {
    title: [
      'useCallback reference-и функсияро нигоҳ медорад',
      'useCallback сохраняет ссылку на функцию',
      'useCallback caches a function reference',
    ],
    body: [
      'useCallback handler-ро ҳозир иҷро намекунад. Масалан агар ProductRow бо memo сохта шуда бошад, reference-и устувори onRemove метавонад render-ро кам кунад. ID ё state-и истифодашударо дар dependencies дар назар гир.',
      'useCallback сохраняет ссылку, не вызывая саму функцию. Стабильный onRemove может помочь ProductRow, обёрнутому в memo, пропустить лишний рендер. Учтите значения, которые обработчик читает из замыкания.',
      'useCallback can reuse a handler reference without calling it. A stable onRemove can help a memoized ProductRow skip a render. Include the reactive values the handler reads in its dependency list.',
    ],
  },
  'topic-33': {
    title: [
      'Параметри URL ва ID-и сабт',
      'Параметр URL и ID записи',
      'Route parameters and record IDs',
    ],
    body: [
      'Дар /products/:id қисми :id тағйирёбанда аст. Барои /products/17 useParams сатри "17" медиҳад. Пеш аз request санҷ, ки ID мувофиқ аст; агар мол набошад, ҳолати «ёфт нашуд» нишон деҳ.',
      'В /products/:id часть :id задаёт параметр. Для /products/17 useParams вернёт строку "17". Проверьте допустимость ID и покажите отсутствие товара, если запись не найдена.',
      'The :id in /products/:id is a parameter. For /products/17, useParams supplies the string "17". Validate the ID and show a not-found state if the product is absent.',
    ],
  },
  'topic-34': {
    title: [
      'Route-и ҳифзшуда ва ҳуқуқи сервер',
      'Защищённый маршрут и права на сервере',
      'Protected routes and server permissions',
    ],
    body: [
      'Route-и ҳифзшуда дар React муайян мекунад, ки кадом экран кушода шавад. Аз он иҷозаи хондани фармоиш намебарояд. API session ва ҳуқуқи ҳамин сабтро дар ҳар request ҷудо месанҷад.',
      'Защищённый маршрут в React решает, какой экран открыть. Право читать заказ проверяет API. Серверу нужны проверенная сессия и разрешение на конкретную запись для каждого запроса.',
      'A protected React route decides which screen to show. The API separately checks the session and permission to access the specific order on every request.',
    ],
  },
  'topic-39': {
    title: [
      'Ҷои store ва selector дар Zustand',
      'Store, действия и селекторы в Zustand',
      'Zustand store, actions, and selectors',
    ],
    body: [
      'Store сабад ва амалҳои умумиро нигоҳ медорад. Selector price ё count-и лозимро медиҳад. Матни вориди форма, ки фақат як экран мехонад, метавонад дар ҳамон компонент монад.',
      'Store хранит корзину и общие действия. Селектор считывает нужное поле, например count. Текст поля, которым пользуется один экран, можно оставить в этом компоненте.',
      'The store holds the cart and its shared actions. A selector reads the field it needs, such as count. Input text used by one screen can stay in that component.',
    ],
  },
  'topic-40': {
    title: ['Роҳи дода дар Redux', 'Поток данных Redux', 'Redux data flow'],
    body: [
      'Redux state-и муштаракро дар store нигоҳ медорад. Клики Add action медиҳад, reducer state-и сабадро ҳисоб мекунад ва selector натиҷаро ба экран мерасонад.',
      'Redux хранит общее состояние в store. Клик Add отправляет action. Reducer рассчитывает новое содержимое корзины, а selector передаёт его экрану.',
      'Redux keeps shared state in a store. An Add click dispatches an action, the reducer calculates the new cart, and a selector reads the result for the UI.',
    ],
  },
  'topic-41': {
    title: ['Redux Toolkit чӣ медиҳад?', 'Что даёт Redux Toolkit', 'What Redux Toolkit provides'],
    body: [
      'Redux Toolkit маҷмӯи воситаи стандартии Redux аст. configureStore store-ро ҷамъ мекунад, createSlice state-и як бахш, reducer ва action-ҳояшро месозад. Масалан cart slice амалҳои added ва removed дорад.',
      'Redux Toolkit предоставляет инструменты для обычных задач Redux. configureStore собирает store. createSlice связывает состояние раздела с редьюсерами и actions, например added и removed для корзины.',
      'Redux Toolkit provides standard Redux tools. configureStore sets up the store, and createSlice groups a feature’s state, reducers, and actions such as cart added and removed.',
    ],
  },
  'topic-42': {
    title: [
      'Immer: draft ва натиҷаи нав',
      'Immer: черновик и новый результат',
      'Immer drafts and immutable results',
    ],
    body: [
      'Immer draft медиҳад, ки дар дохили reducer-и createSlice мисли объект тағйир медиҳӣ. state.count++ дар ҳамон draft навишта мешавад. Immer натиҷаи нав месозад, қимати пешина дар store бетағйир мемонад.',
      'В reducer из createSlice Immer даёт черновик. state.count++ изменяет этот черновик. Immer создаёт новое состояние и сохраняет исходное значение.',
      'In a createSlice reducer, Immer provides a draft. state.count++ changes that draft. Immer produces an updated state while preserving the original.',
    ],
  },
  'topic-43': {
    title: [
      'Дархости асинхронӣ дар Redux',
      'Асинхронный запрос в Redux',
      'Asynchronous work in Redux',
    ],
    body: [
      'Thunk амали асинхронӣ, мисли гирифтани мол аз API-ро, берун аз reducer иҷро мекунад. createAsyncThunk pending, fulfilled ё rejected медиҳад. Reducer аз онҳо loading, дода ё хабар месозад.',
      'Thunk выполняет асинхронную работу вне reducer, например запрос товаров. createAsyncThunk отправляет pending, fulfilled или rejected. Reducer переводит их в состояние загрузки, данные или ошибку.',
      'A thunk runs async work such as a product request outside the reducer. createAsyncThunk dispatches pending, fulfilled, or rejected. Reducers turn those events into loading state, data, or an error.',
    ],
  },
  'topic-44': {
    title: ['Atom дар Jotai чист?', 'Атомы Jotai', 'Jotai atoms'],
    body: [
      'Atom воҳиди state аст. Масалан cartAtom молҳоро нигоҳ медорад, totalAtom аз онҳо суммаро ҳисоб мекунад. Суммаи ҳисобшавандаро дар atom-и ҷудои навишташаванда такрор кардан шарт нест.',
      'Атом — единица состояния. cartAtom может хранить товары, а totalAtom — вычислять сумму из них. Вычисляемую сумму не нужно дублировать в отдельно изменяемом атоме.',
      'An atom is a unit of state. cartAtom can hold items, while totalAtom derives their total. A derived total does not require another independently writable value.',
    ],
  },
  'topic-46': {
    title: [
      'Соҳиби ҳар қиматро интихоб кун',
      'Как выбрать владельца данных',
      'Choosing where state belongs',
    ],
    body: [
      'Аввал амал ва қимати тағйирёбандаро навис. Draft-и форма дар худи форма, filter-и мубодилашаванда дар URL ва рӯйхати сабтҳои сервер дар query буда метавонад. Store-и умумӣ вақте лозим аст, ки чанд ҷои дур як қиматро тағйир диҳанд.',
      'Начните с действия и конкретного значения. Черновик может жить в форме, фильтр для ссылки — в URL, список с сервера — в query. Общее хранилище полезно, когда несколько далёких частей приложения работают с одним значением.',
      'Start with an action and the exact value it changes. A draft can live in the form, a shareable filter in the URL, and fetched records in a query. Shared storage helps when distant parts of the app work with the same value.',
    ],
  },
  'topic-47': {
    title: ['Server state ва cache', 'Серверные данные и кеш', 'Server state and caching'],
    body: [
      'Server state додаест, ки манбааш сервер аст. Рӯйхати мол дар браузер нусхаи муваққатӣ мебошад. Пас аз сабти мол query-ро нав кун, то нусха аз сервери воқеӣ гирифта шавад.',
      'Server state — данные, источник которых находится на сервере. Список товаров в браузере является кешированной копией. После записи обновите нужный запрос, чтобы прочитать актуальный список.',
      'The server owns server state. A product list in the browser is a cached copy. After a write, refresh the relevant query so the list reflects the server’s latest data.',
    ],
  },
  'topic-48': {
    title: [
      'Query key ва нав кардани cache',
      'Query key и обновление кеша',
      'Query keys and cache refresh',
    ],
    body: [
      'Калиди query муайян мекунад, ки натиҷа ба кадом request тааллуқ дорад. ["products", category] натиҷаи ҳар категорияро ҷудо мекунад. Баъди навсозӣ query-и мувофиқро invalidation кун, то нусха кӯҳна намонад.',
      'Query key обозначает, к какому запросу относятся данные. ["products", category] разделяет категории. После сохранения записи пометьте нужный запрос устаревшим, чтобы перечитать данные.',
      'A query key identifies the data a request returns. ["products", category] separates cached results by category. After saving a change, invalidate the relevant query so it can refetch.',
    ],
  },
  'topic-50': {
    title: [
      'Чӣ гуна интерфейс, дода ва request ҷудо мешаванд?',
      'Как разделить UI, данные и запрос',
      'Separating UI, data, and requests',
    ],
    body: [
      'Дар catalog URL метавонад саҳифа ва filter-ро гирад. API сабтҳоро медиҳад, компонент онҳоро нишон медиҳад, modal draft-и худашро мегирад. Агар bug барояд, ҳамин тақсимот нишон медиҳад, ки сабаб дар куҷост.',
      'В каталоге URL может хранить страницу и фильтр. API отдаёт записи, компонент их показывает, а модалка хранит свой черновик. Такое разделение помогает найти, на каком шаге возник сбой.',
      'In a catalog, the URL can hold the page and filter. The API supplies records, the component renders them, and a modal owns its draft. The boundaries make it easier to trace a failure.',
    ],
  },
  'react-hook-form': {
    title: ['React Hook Form чист?', 'Что такое React Hook Form', 'What React Hook Form does'],
    body: [
      'React Hook Form коди идораи input-ҳо, validation ва submit-ро ҷамъ мекунад. register майдонро мепайвандад ва handleSubmit қоидаҳоро пеш аз callback месанҷад. Сервер маълумоти воридшударо боз месанҷад.',
      'React Hook Form связывает поля, валидацию и отправку. register подключает поле, а handleSubmit запускает правила перед обработчиком. Сервер всё равно проверяет присланные значения.',
      'React Hook Form connects fields, validation, and submission. register connects a field and handleSubmit runs the checks before your handler. The server still validates incoming values.',
    ],
  },
  formik: {
    title: [
      'Formik ва Yup чӣ фарқ доранд?',
      'Как делят работу Formik и Yup',
      'Formik and Yup have different jobs',
    ],
    body: [
      'Formik values ва ҳолати формаро идора мекунад. Yup schema қоидаи майдонро, масалан email-и ҳатмиро, менависад. touched барои нишон додани хато баъди кор бо майдон фоида дорад.',
      'Formik управляет значениями и состоянием формы. Схема Yup задаёт правила, например обязательный email. touched помогает показывать сообщение после взаимодействия с полем.',
      'Formik manages values and form state. A Yup schema defines rules such as a required email. touched helps decide whether to show a field message after interaction.',
    ],
  },
  typescript: {
    title: [
      'TypeScript дар React чиро месанҷад?',
      'Что TypeScript проверяет в React',
      'What TypeScript checks in React',
    ],
    body: [
      'TypeScript шакли props, state ва callback-ро пеш аз иҷро месанҷад. Агар ProductCard price-и number хоҳад, сатри "12" хатои type мешавад. Додаи аз сервер омада дар runtime validation мехоҳад.',
      'TypeScript проверяет типы props, state и callbacks до запуска. Если ProductCard ждёт number, строка "12" вызовет ошибку типов. Ответ сервера всё равно требует проверки при выполнении.',
      'TypeScript checks props, state, and callback types before the app runs. A string "12" does not satisfy a numeric price prop. Data from a server still needs runtime validation.',
    ],
  },
  'data-fetching': {
    title: ['Дархост ва ҳолатҳои экран', 'Запрос и состояния экрана', 'Requests and UI states'],
    body: [
      'Дархости API вақт мегирад. Барои рӯйхати мол ҳолати интизорӣ, додаи тайёр, натиҷаи холӣ ва хатои request-ро ҷудо нишон деҳ. Агар query зуд иваз шавад, ҷавоби кӯҳна рӯйхати навро напӯшонад.',
      'Запрос к API занимает время. Покажите разные состояния списка: загрузка, данные, пустой результат и ошибка. При быстрой смене фильтра проследите, чтобы старый ответ не заменил новый.',
      'An API request takes time. Show separate loading, success, empty, and error states for the product list. When the filter changes quickly, keep an older response from overwriting the new result.',
    ],
  },
  'auth-flow': {
    title: [
      'Login, session ва иҷоза',
      'Вход, сессия и разрешения',
      'Sign-in, sessions, and access',
    ],
    body: [
      'Login шахсиятро месанҷад, session воридшавиро байни request-ҳо нигоҳ медорад. Барои хондан ё тағйири сабт API иҷозаи корбарро боз месанҷад. Дар браузер пеш аз қарор ҳолати loading-ро нишон деҳ.',
      'Вход подтверждает личность, сессия сохраняет вход между запросами. API проверяет право пользователя на чтение или изменение записи. Пока статус сессии загружается, покажите ожидание.',
      'Sign-in establishes identity and a session carries it across requests. The API checks the user’s permission to read or write a record. Show loading while the browser is still determining the session.',
    ],
  },
  'local-practice': {
    title: [
      'State-и локалӣ дар рӯйхати вазифаҳо',
      'Локальный state списка задач',
      'Local state for a task list',
    ],
    body: [
      'State-и локалӣ ба як компонент тааллуқ дорад. Дар Todo матни input ва рӯйхат дар ҳамон компонент мемонанд. Барои илова [...tasks, newTask] рӯйхати нав месозад ва рӯйхати пешинаро иваз намекунад.',
      'Локальное состояние принадлежит одному компоненту. В Todo текст поля и список живут там, где используются. При добавлении [...tasks, newTask] создаёт новый массив, сохраняя прежний.',
      'Local state belongs to a component. In a Todo screen, keep input text and the list where they are used. Adding with [...tasks, newTask] creates a new array and preserves the old one.',
    ],
  },
  'local-persistence': {
    title: [
      'localStorage пас аз reload',
      'localStorage после обновления',
      'localStorage across reloads',
    ],
    body: [
      'State-и одӣ бо reload аз нав сар мешавад. localStorage сатрҳоро аз рӯйи калид дар ҳамин origin нигоҳ медорад. Мавзӯи dark-ро мешавад аз он баргардонд. Маълумоти сервер ва session қоидаҳои нигоҳдории худашонро доранд.',
      'Обычный state начинается заново после обновления страницы. localStorage хранит строки по ключам для этого origin. Из него можно восстановить тёмную тему. Для данных сервера и сессий действуют отдельные правила хранения.',
      'Ordinary state resets when a page reloads. localStorage keeps strings under keys for this origin. It can restore a dark theme preference. Server data and sessions need their own storage policies.',
    ],
  },
};

export function withReactConcept(topicId: string, sections: { title: string; text: string }[]) {
  const concept = REACT_CONCEPTS[topicId];
  if (!concept) return sections;
  return [{ title: concept.title[0], text: concept.body[0] }, ...sections.slice(1)];
}
