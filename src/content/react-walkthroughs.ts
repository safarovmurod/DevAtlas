type LocalizedLine = readonly [tg: string, ru: string, en: string];

export const REACT_WALKTHROUGH_TITLES = {
  example: ['Мисол қадам ба қадам', 'Пример по шагам', 'Worked example'],
  check: ['Хатои маъмул ва санҷиш', 'Частая ошибка и проверка', 'Common mistake and check'],
} satisfies Record<string, LocalizedLine>;

export const REACT_WALKTHROUGHS: Record<string, { example: LocalizedLine; check: LocalizedLine }> =
  {
    'topic-7': {
      example: [
        'Дар экран 2 аст. Пахши тугма setCount(c => c + 1)-ро даъват мекунад. React функсияи компонентро бо count = 3 иҷро мекунад. Дар commit матни тугма аз 2 ба 3 мегузарад. DOM дарахти элементҳои саҳифа дар браузер аст.',
        'На кнопке видно 2. Клик вызывает setCount(c => c + 1). React выполняет функцию компонента с count = 3. На этапе commit текст кнопки меняется на 3. DOM — дерево элементов страницы в браузере.',
        'The button shows 2. A click calls setCount(c => c + 1). React runs the component with count = 3. The commit updates the button text to 3. The DOM is the browser’s tree of page elements.',
      ],
      check: [
        'Дар render тугмаро дастӣ тағйир надеҳ. Handler навсозиро дархост мекунад ва JSX натиҷаи дилхоҳро менависад. Пешгӯӣ кун, ки агар parent аз нав render шавад, вале count ҳамон 3 бошад, матни тугма чӣ мешавад. Ҳамон 3 мемонад.',
        'Оставьте изменение кнопки React. Обработчик запрашивает обновление, а JSX описывает результат. Если родитель перерисовался и count всё ещё равен 3, текст кнопки остаётся прежним.',
        'Let React update the button. The handler requests an update and JSX describes the result. If the parent renders again while count stays at 3, the button text remains 3.',
      ],
    },
    'topic-8': {
      example: [
        'Дар як ҷой <button>1</button> бо <button>2</button> иваз мешавад. React ҳамон тугмаи DOM-ро нигоҳ дошта, матнашро нав мекунад. Агар дар ҳамон ҷой <button> ба <input> гузарад, намуди элемент дигар аст ва React гиреҳи пешинаро иваз мекунад.',
        'На одной позиции <button>1</button> становится <button>2</button>. React сохраняет DOM-узел кнопки и меняет текст. При переходе с <button> на <input> тип элемента меняется, поэтому React заменяет узел.',
        'At one position, <button>1</button> becomes <button>2</button>. React keeps the button DOM node and changes its text. Switching from <button> to <input> changes the element type, so React replaces the node.',
      ],
      check: [
        'Агар формаи Ali бо гузаштан ба Sara матни Ali-ро нигоҳ дорад, бин, ки он ҳамон компонент дар ҳамон ҷой аст. Барои draft-и ҷудо ба форма key={profile.id} деҳ. Аз Ali ба Sara гузар ва санҷ, ки форма аз қимати ибтидоӣ сар шавад.',
        'Если форма сохраняет черновик Али при переходе к Саре, проверьте, занимает ли она ту же позицию. Для отдельного черновика задайте key={profile.id}. Переключите профили и проверьте, что форма начинается с начального значения.',
        'If Ali’s draft remains when you switch to Sara, check whether the form occupies the same position. Give the form key={profile.id} to reset its draft on a profile change. Switch profiles and check the initial value.',
      ],
    },
    'topic-9': {
      example: [
        'Дар ҳисобкунак ду кор ҷудо аст. useState(0) қимати count-ро байни render-ҳо нигоҳ медорад. onClick setter-ро даъват мекунад. React count-и навро ба компонент медиҳад ва JSX онро дар экран мегузорад.',
        'У счётчика две части. useState(0) хранит count между рендерами. onClick вызывает setter, после чего React передаёт компоненту новый count и JSX показывает его на экране.',
        'The counter has two pieces. useState(0) keeps count between renders. onClick calls the setter. React supplies the new count to the component and JSX displays it.',
      ],
      check: [
        'Агар дар компонент let count = 0 монӣ ва дар handler count++ кунӣ, React дархости render намегирад. Ивазаш бо useState санҷ. Аз 0 ду бор +1 пахш кун ва 2-ро дар экран бин.',
        'При let count = 0 и count++ внутри обработчика React не получает запроса на рендер. Замените переменную на useState. Нажмите +1 дважды и проверьте, что на экране 2.',
        'With let count = 0 and count++ in the handler, React gets no render request. Use state for the value. Click +1 twice from zero and check that the screen shows 2.',
      ],
    },
    'topic-10': {
      example: [
        'Гирем count = 3. Handler setCount(count + 1)-ро иҷро мекунад ва баъдаш console.log(count) менависад. Console 3 мебарорад. Render-и баъдӣ count = 4 мегирад, барои ҳамин дар экран 4 мебинӣ.',
        'Пусть count равен 3. Обработчик выполняет setCount(count + 1), затем console.log(count). В консоли будет 3. Следующий рендер получит count = 4 и покажет 4.',
        'Start with count = 3. The handler calls setCount(count + 1), then console.log(count). The console prints 3. The next render receives count = 4 and displays 4.',
      ],
      check: [
        'Агар дар ҳамин handler қимати нави ҳисобшударо истифода барӣ, const next = count + 1 навис. Баъд setCount(next) ва console.log(next) кун. Ҳар ду аз як ҳисоб истифода мебаранд.',
        'Если вычисленное значение нужно сразу в обработчике, сохраните его в const next = count + 1. Передайте next в setter и выведите next в консоль. Обе операции используют один расчёт.',
        'If the handler needs the calculated value immediately, assign const next = count + 1. Pass next to the setter and log next. Both operations use the same calculation.',
      ],
    },
    'topic-11': {
      example: [
        'Аз 5 сар кун. Агар дар як handler ду бор setCount(count + 1) монӣ, ҳар ду аз ҳамон snapshot 5 ҳисоб карда, 6 медиҳанд. Ду updater бо prev => prev + 1 натиҷаи навбатро мегиранд: 5 → 6 → 7.',
        'Начните с 5. Два вызова setCount(count + 1) в одном обработчике оба вычислят 6 из снимка со значением 5. Два updater с prev => prev + 1 получают результаты по очереди: 5 → 6 → 7.',
        'Start at 5. Two calls to setCount(count + 1) in one handler both calculate 6 from the snapshot. Two prev => prev + 1 updaters process the queued values in order: 5 → 6 → 7.',
      ],
      check: [
        'Барои тугмаи Reset setCount(0) кифоя аст. Тугмаи +2 аз қимати пешина вобаста аст, ду updater навис. Санҷ, ки аз 5 ба 7 ва баъд бо Reset ба 0 гузарад.',
        'Для Reset достаточно setCount(0). Кнопка +2 зависит от предыдущего значения: используйте два updater. Проверьте переход с 5 на 7 и сброс на 0.',
        'Use setCount(0) for Reset. The +2 button depends on the previous value, so use two updaters. Check that 5 becomes 7 and that Reset returns it to 0.',
      ],
    },
    'topic-12': {
      example: [
        'Форма name = «Ali», age = 22, open = true дорад. Тугмаи Reset се setter-ро дар як handler даъват мекунад. React навсозиҳоро якҷоя коркард мекунад ва формаи баста бо қиматҳои холӣ мебарояд.',
        'У формы name = «Ali», age = 22 и open = true. Reset вызывает три setter в одном обработчике. React обрабатывает эти изменения вместе, и форма закрывается с очищенными значениями.',
        'The form has name = “Ali”, age = 22, and open = true. Reset calls three setters in one handler. React processes the updates together and closes the form with cleared values.',
      ],
      check: [
        'Баъди setOpen(false) дар ҳамон handler open ҳоло true хонда мешавад. Барои санҷиш Reset кун ва формаро аз нав кушо. Майдонҳо бояд холӣ бошанд. Шумораи log-и render дар development метавонад аз ҳолати Strict Mode вобаста бошад.',
        'После setOpen(false) текущий обработчик всё ещё читает open = true. Нажмите Reset и откройте форму снова. Поля должны быть пустыми. Количество логов рендера в development зависит в том числе от Strict Mode.',
        'After setOpen(false), the same handler still reads open = true. Press Reset and reopen the form. Its fields should be empty. Development render log counts can also depend on Strict Mode.',
      ],
    },
    'topic-13': {
      example: [
        'user = { name: "Ali", address: { city: "Dushanbe" } }. Барои иваз кардани city ҳам user ва ҳам address-ро нусха гир: { ...user, address: { ...user.address, city: "Khujand" } }. Натиҷа адреси нав ва ҳамон name аст.',
        'Есть user = { name: "Ali", address: { city: "Dushanbe" } }. Для нового города скопируйте user и address: { ...user, address: { ...user.address, city: "Khujand" } }. Имя сохранится, город изменится.',
        'Given user = { name: "Ali", address: { city: "Dushanbe" } }, copy both user and address: { ...user, address: { ...user.address, city: "Khujand" } }. The city changes and the name stays the same.',
      ],
      check: [
        'Spread-и { ...user } фақат қабати болоро нусха мегирад. Шаҳрро дар address-и кӯҳна нанавис. Қиматҳои пешу баъдро санҷ: объекти аввал бояд Dushanbe ва объекти нав Khujand дошта бошад.',
        'Spread { ...user } копирует верхний уровень. Изменение старого address затронет исходные данные. Проверьте оба объекта: исходный должен хранить Dushanbe, новый — Khujand.',
        'The { ...user } spread only copies the outer level. Writing into the old address changes the original data. Check both objects: the original should keep Dushanbe and the new one should hold Khujand.',
      ],
    },
    'topic-14': {
      example: [
        'Ду useState дорӣ: якум name = "Ali", дуюм open = false. Пахши тугма open-ро true мекунад. Дар render-и баъдӣ useState-и якум ҳанӯз name медиҳад, дуюм бошад open-и навро медиҳад.',
        'Два useState хранят name = "Ali" и open = false. Клик меняет open на true. В следующем рендере первый useState по-прежнему возвращает name, а второй возвращает новый open.',
        'Two useState calls hold name = "Ali" and open = false. A click changes open to true. On the next render, the first useState still returns name and the second returns the new open value.',
      ],
      check: [
        'Агар open = false шавад, useState-и дохили if дигар иҷро намешавад ва тартиб мешиканад. Ҳар ду hook-ро дар аввали компонент мон. Шартро барои JSX истифода бар ва санҷ, ки бо open = true ва false компонент дуруст кор кунад.',
        'Когда open становится false, useState внутри if пропускается и порядок нарушается. Вызовите оба хука в начале компонента и перенесите условие к JSX. Проверьте open = true и false.',
        'When open becomes false, useState inside if is skipped and the order changes. Call both Hooks at the top of the component. Keep the condition in JSX and check both open values.',
      ],
    },
    'topic-15': {
      example: [
        'useCounter(5) count ва амалҳои increment/reset-ро бармегардонад. Counter ин қиматҳоро гирифта, тугмаҳои худро нишон медиҳад. Агар ту дар ҳамон саҳифа useCounter(10) ҳам дошта бошӣ, increment-и якум 5-ро ба 6 мебарад ва дуюм 10 мемонад.',
        'useCounter(5) возвращает count и действия increment/reset. Компонент показывает свои кнопки на основе этих данных. При отдельном вызове useCounter(10) первый increment изменит 5 на 6, а второй счётчик останется на 10.',
        'useCounter(5) returns count and the increment/reset actions. The component uses them to render its buttons. With a separate useCounter(10) call, incrementing the first changes 5 to 6 and leaves the second at 10.',
      ],
      check: [
        'Дар onClick худи useCounter-ро даъват накун. Hook дар render дар сатҳи боло иҷро мешавад, onClick бошад increment-ро мегирад. Агар ду тугма бояд як рақамро иваз кунанд, як useCounter-ро дар parent мон ва ба ҳар ду count ва амалро деҳ.',
        'Вызовите useCounter на верхнем уровне компонента и передайте increment в onClick. Если две кнопки меняют одно число, вызовите useCounter один раз в родителе и передайте обеим count и действие.',
        'Call useCounter at the top level and pass increment to onClick. If two buttons should change one number, call useCounter once in their parent and provide both with the count and action.',
      ],
    },
    'topic-16': {
      example: [
        'Дар мисол count = 2 аст. JSX рақамро дар саҳифа нишон медиҳад. Баъди commit useEffect document.title-ро ба «Count: 2» иваз мекунад. Баъди +1 рақам 3 мешавад ва effect номи вкладкаро нав мекунад.',
        'При count = 2 JSX показывает число на странице. После commit useEffect присваивает document.title значение «Count: 2». Клик +1 меняет число на 3, а эффект синхронизирует заголовок вкладки.',
        'With count = 2, JSX displays the number in the page. After the commit, useEffect writes “Count: 2” to document.title. Clicking +1 changes the number to 3 and the effect updates the tab title.',
      ],
      check: [
        'Агар дар JSX count * 2 нишон додан хоҳӣ, онро бевосита ҳисоб кун. Барои ҳамин ҳисоб state-и дуюм ва effect даркор намешавад. Санҷ, ки ҳангоми count = 3 экран 6 нишон диҳад ва title-и вкладка Count: 3 шавад.',
        'Для вывода count * 2 вычислите значение прямо в JSX. Отдельный state и effect для этого расчёта избыточны. При count = 3 проверьте число 6 на странице и Count: 3 на вкладке.',
        'Compute count * 2 directly in JSX. That calculation needs neither a second state value nor an effect. With count = 3, check for 6 on the page and Count: 3 in the tab title.',
      ],
    },
    'topic-17': {
      example: [
        'userId = 7 аст. Effect loadUser(7)-ро даъват мекунад. Вақте интихоб ба 9 гузашт, dependency-и [userId] дигар мешавад ва effect loadUser(9)-ро оғоз мекунад. Тағйири theme, ки effect онро намехонад, сабаби дархости нав намешавад.',
        'При userId = 7 эффект вызывает loadUser(7). При выборе 9 зависимость [userId] меняется, и эффект запускает loadUser(9). Изменение theme, который эффект не читает, не требует нового запроса.',
        'With userId = 7, the effect calls loadUser(7). Selecting 9 changes [userId] and starts loadUser(9). An unrelated theme change does not require a new request.',
      ],
      check: [
        'Барои хомӯш кардани такрор userId-ро аз dependency нагир. Аз 7 ба 9 зуд гузар ва санҷ, ки ҷавоби деркардаи 7 маълумоти 9-ро иваз накунад. Дар кори воқеӣ дар cleanup request-и пешинаро cancel кун ё натиҷаи куҳнаро сарфи назар кун.',
        'Не убирайте userId из зависимостей ради меньшего числа запросов. Быстро переключите 7 на 9 и проверьте, что старый ответ для 7 не перезаписывает данные 9. В реальном запросе отмените старую операцию в cleanup или проигнорируйте её результат.',
        'Keep userId in the dependency array. Switch quickly from 7 to 9 and check that a late response for 7 cannot replace the data for 9. Cancel the old request in cleanup or ignore its result.',
      ],
    },
    'topic-18': {
      example: [
        'Timer ҳангоми mount як setInterval месозад ва JS ба он id медиҳад. Баъди Hide компонент аз дарахт мебарояд ва cleanup clearInterval(id)-ро иҷро мекунад. Баъди Show timer бо id-и дигар аз нав оғоз мешавад.',
        'На mount таймер создаёт один setInterval и получает его id. После Hide компонент исчезает и cleanup вызывает clearInterval(id). После Show таймер запускается заново с другим id.',
        'On mount the timer starts one interval and keeps its ID. After Hide, the component is removed and cleanup calls clearInterval(id). After Show, the timer starts a new interval with a new ID.',
      ],
      check: [
        'Функсияи () => clearInterval(id)-ро баргардон, то баъдтар иҷро шавад. Агар clearInterval(id)-ро дар вақти setup даъват кунӣ, timer ҳамон замон қатъ мешавад. Якчанд бор Show ва Hide кун ва санҷ, ки танҳо як timer фаъол мемонад.',
        'Верните функцию () => clearInterval(id) для вызова при очистке. Вызов clearInterval(id) прямо в setup остановит таймер сразу. Несколько раз нажмите Show и Hide и убедитесь, что одновременно работает один таймер.',
        'Return () => clearInterval(id) so cleanup runs later. Calling clearInterval(id) in setup stops the timer immediately. Toggle Show and Hide and check that only one active timer runs at a time.',
      ],
    },
    'topic-19': {
      example: [
        'Агар effect бо dependency-и [count] ҳар дафъа setCount(count + 1) кунад, натиҷа 0 → 1 → 2 мешавад ва ҳар навсозӣ effect-ро боз оғоз мекунад. Барои зиёд кардани рақам аз клик ин setter-ро ба handler-и тугма гузор.',
        'Эффект с зависимостью [count], который каждый раз вызывает setCount(count + 1), получает цепочку 0 → 1 → 2. Каждое изменение заново запускает эффект. Инкремент по клику перенесите в обработчик кнопки.',
        'An effect with [count] that always calls setCount(count + 1) creates a chain 0 → 1 → 2. Every update runs the effect again. Put a click-driven increment in the button handler.',
      ],
      check: [
        'Дар interval setSeconds(s => s + 1) аз қимати охир ҳисоб мекунад. Барои санҷиши cleanup як parent соз, ки Timer-ро бо тугма аз дарахт гирад. Се сония интизор шав ва Timer-ро хориҷ кун. Cleanup бояд interval-ро қатъ кунад.',
        'На каждом тике setSeconds(s => s + 1) считает от последнего значения. Для проверки cleanup добавьте родителя с кнопкой, которая убирает Timer из дерева. Подождите три секунды и уберите Timer. Cleanup должен остановить interval.',
        'On each tick, setSeconds(s => s + 1) uses the latest queued value. To check cleanup, add a parent with a button that removes Timer from the tree. Wait three seconds and remove Timer. Cleanup should stop the interval.',
      ],
    },
    'topic-20': {
      example: [
        'Ба Child ҳисобкунаки хурд бо useState(0) илова кун. Ду клик рақамро ба 2 мебарад. Вақте parent бо visible && <Child /> онро хориҷ мекунад, state-и Child нобуд мешавад. Баъди Show Child аз 0 сар мешавад.',
        'Добавьте в Child счётчик с useState(0). Два клика меняют значение на 2. Когда родитель убирает Child через visible && <Child />, его состояние теряется. После Show счётчик начнёт с 0.',
        'Add a counter with useState(0) to Child. Two clicks change it to 2. When the parent removes Child through visible && <Child />, it loses that state. Showing it again starts at 0.',
      ],
      check: [
        'Агар танҳо CSS display: none гузорӣ, компонент дар дарахт мемонад. Ду вариантро санҷ: бо unmount ҳисобкунак аз 0 сар мешавад, бо пинҳонкунии CSS қимати 2 мемонад.',
        'При CSS display: none компонент остаётся в дереве. Сравните два варианта: после unmount счётчик стартует с 0, после скрытия через CSS остаётся значение 2.',
        'With CSS display: none, the component stays in the tree. Compare both cases: unmounting resets the counter to 0, while CSS hiding preserves 2.',
      ],
    },
    'topic-21': {
      example: [
        'Як бор +1 пахш кардӣ, вале Console ду log дорад. Ба ҳар log номи ҷояшро деҳ: handler, render ё effect. Агар handler як бор омада, экран аз 0 ба 1 гузарад, log-и иловагии render маънои клики дуюм надорад.',
        'Один клик дал две записи в Console. Подпишите место каждого лога: handler, render или effect. Если handler сработал один раз и экран перешёл с 0 на 1, повторный лог render не показывает второй клик.',
        'One click produces two console entries. Label each log by its source: handler, render, or effect. If the handler ran once and the screen changed from 0 to 1, the extra render log is not a second click.',
      ],
      check: [
        'Агар ду request гумон кунӣ, дар Network худи request-ҳоро бин. Як амалро такрор кун ва шумора, URL ва status-ро сабт кун. Баъд log-ҳоро бо натиҷаи экран муқоиса кун.',
        'Если подозреваете два запроса, проверьте сами запросы в Network. Повторите одно действие и запишите их число, URL и статус. Сопоставьте логи с тем, что показал экран.',
        'If you suspect duplicate requests, inspect the requests in Network. Repeat one action and note their count, URLs, and statuses. Compare the logs with the visible result.',
      ],
    },
    'topic-22': {
      example: [
        'useRef(0) объекте медиҳад, ки current = 0 дорад. Дар handler current += 1 кунӣ, қимат ба 1 мерасад ва дар даъвати дигар хонда мешавад. React барои ҳамин тағйир render-и нав дархост намекунад.',
        'useRef(0) создаёт объект с current = 0. Если обработчик выполнит current += 1, следующий обработчик сможет прочитать 1. React не запрашивает новый рендер из-за изменения current.',
        'useRef(0) gives you an object with current = 0. If a handler adds 1 to current, the next handler can read 1. Changing current does not request a React render.',
      ],
      check: [
        'Барои id-и timer ref мувофиқ аст, чун дар экран намебарояд. Барои рақаме, ки user бояд баъди клик бинад, state гир. Ду пахшро санҷ ва фарқи log-и ref ва рақами UI-ро бин.',
        'Ref подходит для id таймера, который не нужно выводить на экран. Для числа, которое видно после клика, используйте state. Сделайте два клика и сравните лог ref с числом на экране.',
        'Use a ref for a timer ID that does not appear on screen. Use state for the number the user should see after a click. Click twice and compare the ref log with the displayed number.',
      ],
    },
    'topic-23': {
      example: [
        'useRef(null) аввал input надорад. Вақте React <input ref={inputRef} />-ро ба DOM мегузорад, current ҳамон input мешавад. Тугмаи Focus inputRef.current?.focus()-ро даъват карда, курсорро ба майдон мебарад.',
        'У useRef(null) сначала нет ссылки на input. После помещения <input ref={inputRef} /> в DOM current указывает на это поле. Кнопка Focus вызывает inputRef.current?.focus() и переводит туда курсор.',
        'A useRef(null) starts without an input node. After React commits <input ref={inputRef} />, current points to the input. The Focus button calls inputRef.current?.focus() to place the cursor there.',
      ],
      check: [
        'Агар input шартӣ пинҳон шавад, current метавонад null шавад. Бо ?. тугма дигар crash намекунад. Вақте input намоён аст, Focus-ро бо клавиатура пахш кун ва санҷ, ки майдон focus гирад ва матн бетағйир монад.',
        'Когда условно отображаемое поле исчезает, current может стать null. Оператор ?. пропускает вызов в этом случае. При видимом поле активируйте Focus с клавиатуры и проверьте фокус и сохранение текста.',
        'If a conditional input disappears, current can become null. Optional chaining skips the call in that case. With the field visible, activate Focus from the keyboard and verify focus and unchanged text.',
      ],
    },
    'topic-24': {
      example: [
        'Аз { count: 2 } сар кун. Клик dispatch({ type: "inc" }) мефиристад. Reducer type-ро мехонад ва { count: 3 } бармегардонад. React аз ҳамин state рақами 3-ро нишон медиҳад.',
        'Начните с { count: 2 }. Клик отправляет dispatch({ type: "inc" }). Reducer читает type и возвращает { count: 3 }. React показывает 3 из нового состояния.',
        'Start with { count: 2 }. A click sends dispatch({ type: "inc" }). The reducer reads type and returns { count: 3 }. React displays 3 from the resulting state.',
      ],
      check: [
        'Дар reducer request ё тағйири мустақими state нагузор. Он бо state ва action-и додашуда қимати нав ҳисоб мекунад. Ба reducer аввал inc, баъд type-и номаълум деҳ. Рақам як бор зиёд шуда, баъд ҳамон қимат мемонад.',
        'Reducer вычисляет новое состояние из state и action. Запросы выполняйте отдельно, а исходный объект сохраняйте. Передайте inc, затем неизвестный type. Число должно увеличиться только один раз.',
        'A reducer computes the next state from its state and action inputs. Keep requests elsewhere and preserve the input object. Pass inc, then an unknown type. The count should increment once.',
      ],
    },
    'topic-25': {
      example: [
        'Барои input-и ном як useState кофист. Дар машқи омӯзишӣ start ҳам status-ро ба running ва ҳам step-ро ба 0 мебарад. Як reducer қоидаи ҳамин ду тағйирро дар амали start ҷамъ мекунад.',
        'Для поля имени достаточно одного useState. В тренажёре start одновременно меняет status на running и сбрасывает step в 0. Reducer собирает оба изменения в действии start.',
        'One useState is enough for a name input. In the practice flow, start sets status to running and step to 0. One reducer keeps both updates under the start action.',
      ],
      check: [
        'Дар ҳолати idle амали next бояд step-ро нав накунад. Ба reducer пайдарпай next, start, next, reset деҳ. Қадамҳо 0 → 0 → 1 → 0 мешаванд ва баъди reset status боз idle аст.',
        'В состоянии idle действие next не должно менять step. Передайте next, start, next, reset. Шаги будут 0 → 0 → 1 → 0, а после reset статус снова idle.',
        'In idle, next should leave step unchanged. Dispatch next, start, next, reset. Steps should be 0 → 0 → 1 → 0, with status returning to idle after reset.',
      ],
    },
    'topic-26': {
      example: [
        'Фарз кун expensiveTotal аз нархҳои 10 ва 20 натиҷаи 30 медиҳад. Ҳангоми тағйири theme ҳамон items мемонад. useMemo метавонад 30-ро аз ҳисобкунии гузашта истифода барад. Вақте items рӯйхати нави [10, 20, 5] шуд, натиҷа 35 мешавад.',
        'Допустим, expensiveTotal вычисляет 30 из цен 10 и 20. При смене темы ссылка items прежняя, и useMemo может использовать сохранённые 30. Новый список [10, 20, 5] требует расчёта 35.',
        'Suppose expensiveTotal computes 30 from prices 10 and 20. A theme change keeps the same items reference, so useMemo can reuse 30. A new list [10, 20, 5] requires computing 35.',
      ],
      check: [
        'Агар items-ро бо push иваз кунӣ, reference метавонад ҳамон монад ва ҳисоб нав нашавад. Рӯйхати нав соз. useMemo-ро муваққатан гир ва санҷ, ки натиҷа 35 мемонад. Дурустии ҳисоб бояд аз cache вобаста набошад.',
        'После push ссылка items может остаться прежней, а расчёт устареет. Создайте новый массив. Временно уберите useMemo и убедитесь, что результат всё равно 35. Корректность расчёта не должна зависеть от кеша.',
        'After push, items may keep its reference and leave a stale calculation. Create a new array. Temporarily remove useMemo and confirm the result is still 35. Correctness should hold without the cache.',
      ],
    },
    'topic-27': {
      example: [
        'Тугмаи Count рақами parent-ро аз 0 ба 1 мебарад. Label ҳамон prop-и "Study progress"-ро мегирад ва memo метавонад render-и Label-ро гузаронад. Агар баъд prop-и label аз state қимати нав гирад, Label матни навро нишон медиҳад.',
        'Кнопка Count меняет число в родителе с 0 на 1. Label получает прежний prop "Study progress", и memo может пропустить рендер Label. Если затем передать новый label из state, Label покажет новый текст.',
        'The Count button changes the parent’s number from 0 to 1. Label still receives "Study progress", so memo can skip rendering Label. If you later pass a changed label from state, Label displays the new text.',
      ],
      check: [
        'Агар ба Label ҳар render объект ё функсияи нав диҳӣ, memo онро ҳамчун prop-и нав мебинад. State ва context-и худи Label ҳам метавонанд онро нав кунанд. Тағйири count ва тағйири label-ро ҷудо санҷ.',
        'Новый объект или функция в props меняют результат сравнения memo. Собственный state и context Label тоже могут вызвать рендер. Отдельно проверьте изменение count и изменение label.',
        'A new object or function prop changes memo’s comparison. Label’s own state and context can also trigger renders. Test a count change separately from a label change.',
      ],
    },
    'topic-28': {
      example: [
        'Дар рӯйхат React Basics ва TypeScript ҳастанд. Вақте query = "react", filter танҳо React Basics-ро мемонад. Агар parent бо ҳамон query аз нав render шавад, useMemo натиҷаро истифода бурда метавонад. Бо query = "type" филтр аз нав ҳисоб мешавад.',
        'В списке React Basics и TypeScript. При query = "react" фильтр оставляет React Basics. При повторном рендере родителя с тем же query useMemo может вернуть прежний результат. При query = "type" фильтр пересчитывается.',
        'The list contains React Basics and TypeScript. With query = "react", the filter keeps React Basics. If the parent renders again with the same query, useMemo can reuse that result. With query = "type", the filter runs again.',
      ],
      check: [
        'Агар query-ро аз dependency гирӣ, рӯйхат метавонад аз паси матн нав нашавад. Ворид кун react, баъд type ва баъд чизе, ки ёфт намешавад. Натиҷаҳо бояд React Basics, TypeScript ва рӯйхати холӣ бошанд.',
        'Если убрать query из зависимостей, список может отстать от ввода. Введите react, затем type, затем запрос без совпадений. Должны получиться React Basics, TypeScript и пустой список.',
        'Leaving query out of the dependencies can keep the list from following the input. Enter react, type, then a string with no match. Expect React Basics, TypeScript, then an empty list.',
      ],
    },
    'topic-29': {
      example: [
        'Parent функсияи increment-ро ба IncrementButton медиҳад. useCallback reference-и функсияро дар render-ҳои пайдарпай нигоҳ дошта метавонад. Танҳо вақте user тугмаро пахш кард, increment даъват мешавад ва setCount(n => n + 1) count-ро зиёд мекунад.',
        'Родитель передаёт функцию increment в IncrementButton. useCallback может сохранить ссылку на неё между рендерами. После клика increment вызывает setCount(n => n + 1) и увеличивает число.',
        'The parent passes increment to IncrementButton. useCallback can keep its reference between renders. A click runs increment, which adds one through setCount(n => n + 1).',
      ],
      check: [
        'Агар callback қимати discount-ро хонад, discount-ро дар dependencies мон. Вагарна пас аз гузаштан аз 10 ба 20 callback метавонад 10-ро истифода барад. Қиматро иваз кун ва натиҷаи кликро санҷ.',
        'Если callback читает discount, укажите discount в зависимостях. Иначе после изменения с 10 на 20 функция может продолжить использовать 10. Измените значение и проверьте результат клика.',
        'If the callback reads discount, include discount in its dependencies. Otherwise it may keep using 10 after the value changes to 20. Change the value and verify the click result.',
      ],
    },
    'topic-30': {
      example: [
        'Дар ҷустуҷӯи каталоги 500 дарс ҳангоми навиштани «React» экран дер ҷавоб медиҳад. Барои ҳар санҷиш ҳамон дода ва матнро гир. Аввал дар Network бин, ки дархост сабаб аст ё не. Агар рӯйхат аз додаи маҳаллӣ суст шавад, вақти render-ро бо Profiler бин.',
        'В поиске по 500 урокам ввод «React» задерживает экран. Используйте те же данные и запрос в каждом замере. Посмотрите в Network, виноват ли запрос. Если задержка возникает на локальном списке, проверьте рендер в Profiler.',
        'Typing “React” into a list of 500 lessons feels slow. Use the same data and search text in each run. Check Network for request delays. If a local list is slow, inspect rendering in Profiler.',
      ],
      check: [
        'Як тағйирро санҷ, масалан филтри гарон аз рӯйи query memo шавад. Боз ҳамон ҷустуҷӯро чанд бор иҷро кун. Фақат дар сурате тағйирро нигоҳ дор, ки натиҷаи рӯйхат дуруст ва беҳбудӣ дар ченак такроршаванда бошад.',
        'Проверьте одно изменение, например кеширование дорогого фильтра по query. Повторите тот же поиск несколько раз. Оставляйте изменение, если список по-прежнему правильный, а улучшение видно повторно.',
        'Try one change, such as memoizing an expensive filter by query. Repeat the same search several times. Keep it if the list stays correct and the improvement consistently appears in measurements.',
      ],
    },
    'topic-31': {
      example: [
        'Аз / ба /about бо Link гузар. React Router URL-ро нав мекунад ва About-ро нишон медиҳад, ҳуҷҷати асосии HTML боз бор намешавад. Ҳамин адресро дар вкладкаи нав кушоӣ, браузер аз сервер ҳуҷҷат мегирад.',
        'Перейдите с / на /about через Link. React Router обновит URL и покажет About без загрузки нового HTML-документа. Если открыть тот же адрес в новой вкладке, браузер запросит документ у сервера.',
        'Go from / to /about with Link. React Router updates the URL and displays About without loading a new HTML document. Opening that address in a new tab requests a document from the server.',
      ],
      check: [
        'Агар Link кор кунаду F5 дар /about 404 диҳад, сервер масири мустақимро дода наметавонад. Ҳар ду роҳро санҷ. Барои SPA-и статикӣ host бояд route-и дохилиро ба index.html фиристад.',
        'Если Link работает, а F5 на /about даёт 404, сервер не обслуживает прямой вход. Проверьте оба пути. Хост статического SPA должен отдавать index.html для внутренних маршрутов.',
        'If Link works but refreshing /about gives 404, the host does not serve a direct visit. Check both paths. A static SPA host needs to return index.html for its internal routes.',
      ],
    },
    'topic-32': {
      example: [
        'Route path="/products/:id" ба адреси /products/7 мувофиқ меояд. Router компоненти Product-ро мекушояд ва useParams() id = "7" медиҳад. Ин id танҳо рақами интихобро аз URL меорад. Product бояд додаи мувофиқро худаш гирад.',
        'Route path="/products/:id" совпадает с адресом /products/7. Router показывает Product, а useParams() возвращает id = "7". Это значение из URL. Данные товара компонент получает отдельно.',
        'Route path="/products/:id" matches /products/7. The router renders Product and useParams() returns id = "7". This value comes from the URL. The component obtains product data separately.',
      ],
      check: [
        'Ду Link ба /products/7 ва /products/9 соз. Санҷ, ки route як аст, id бошад аз "7" ба "9" мегузарад. Ба route-и номаълум саҳифаи 404 деҳ, то экран холӣ намонад.',
        'Создайте два Link, на /products/7 и /products/9. Проверьте, что маршрут тот же, а id меняется с "7" на "9". Для незнакомого пути предусмотрите страницу 404.',
        'Create links to /products/7 and /products/9. Check that both match the same route and that id changes from "7" to "9". Use a 404 view for an unknown path.',
      ],
    },
    'topic-33': {
      example: [
        'useParams барои /products/2 сатри "2" медиҳад. Агар ID-ҳои рӯйхат рақам бошанд, баъди санҷиши формат онро ба адад гузарон. find дар [1, 2] маҳсулоти 2-ро меёбад. Бо /products/99 натиҷаи find undefined аст.',
        'Для /products/2 useParams возвращает строку "2". Если ID в списке числовые, проверьте формат и преобразуйте значение. find в списке с ID 1 и 2 найдёт товар 2. Для /products/99 результат find — undefined.',
        'For /products/2, useParams returns the string "2". If the list uses numeric IDs, validate the format and convert it. find in a list with IDs 1 and 2 locates product 2. For /products/99, find returns undefined.',
      ],
      check: [
        'Аз product.name пеш аз санҷиши product нахон. /products/2, /products/abc ва /products/99-ро кушо. Натиҷаҳо мутаносибан маълумоти мол, ID-и нодуруст ва «ёфт нашуд» мебошанд.',
        'Проверьте product до чтения product.name. Откройте /products/2, /products/abc и /products/99. Ожидайте данные товара, сообщение о неверном ID и «не найдено» соответственно.',
        'Check product before reading product.name. Open /products/2, /products/abc, and /products/99. Expect the product, an invalid ID message, and a not-found message.',
      ],
    },
    'topic-34': {
      example: [
        'User /orders-ро мекушояд. То муайян шудани session экран loading нишон медиҳад. Бе session router ба /login мегузарад. Бо session саҳифаи фармоишҳо кушода мешавад ва API иҷозаи хондани сабтҳоро алоҳида месанҷад.',
        'Пользователь открывает /orders. Пока сессия определяется, видно загрузку. Без сессии router отправляет на /login. С сессией открывается экран заказов, а API отдельно проверяет право на чтение записей.',
        'A user opens /orders. While the session is being checked, show loading. Without a session, the router sends the user to /login. With a session, the orders screen opens and the API separately checks permission to read records.',
      ],
      check: [
        'Дар версияи браузерӣ пинҳон кардани Link кофӣ нест, қоидаи дастрасӣ дар server ҳам даркор аст. Дар муҳити омӯзишӣ санҷ, ки меҳмон login-ро бинад ва корбари тасдиқшуда фақат фармоишҳои иҷозатдоштаашро гирад.',
        'Скрытие Link меняет интерфейс. Правило доступа выполняется и на сервере. В учебной среде проверьте, что гость попадает на вход, а вошедший пользователь получает только разрешённые заказы.',
        'Hiding Link changes the interface. Enforce the access rule on the server too. In the learning environment, check that a guest is sent to sign-in and a signed-in user receives only permitted orders.',
      ],
    },
    'topic-35': {
      example: [
        'Саҳифаи ҳисобот аз саҳифаи аввал калонтар аст. lazy(() => import("./Reports")) бор кардани модули Reports-ро то аввалин render-и он дер мекунад. Suspense то омадани код fallback-и «Бор мешавад»-ро нишон дода метавонад.',
        'Экран отчётов тяжелее первой страницы. lazy(() => import("./Reports")) откладывает загрузку модуля Reports до первого рендера компонента. Пока код загружается, Suspense может показать индикатор.',
        'The Reports screen is larger than the home page. lazy(() => import("./Reports")) defers loading its module until React first renders that component. Suspense can show a loading fallback while the code arrives.',
      ],
      check: [
        'lazy-ро берун аз компонент эълон кун, то дар ҳар render типи нав насозӣ. Дар build-и production аз Home ба Reports гузар. Дар Network бин, ки коди ҷудошуда кай омад. Боркунии код ва дархости дода ду санҷиши ҷудоанд.',
        'Объявите lazy вне компонента, чтобы не создавать новый тип при каждом рендере. Перейдите из Home в Reports в production-сборке. В Network проверьте момент загрузки отдельного кода. Запрос данных проверяйте отдельно.',
        'Declare lazy outside the component so renders do not create a new component type. Go from Home to Reports in the production build and inspect when its code loads in Network. Check any data request separately.',
      ],
    },
    'topic-36': {
      example: [
        'ThemeContext.Provider бо value="dark" App-ро дар бар мегирад. Header-и дохили App useContext(ThemeContext)-ро даъват карда, "dark" мехонад, ҳатто агар App prop нагузаронад.',
        'ThemeContext.Provider с value="dark" оборачивает App. Header внутри App вызывает useContext(ThemeContext) и получает "dark" без промежуточного prop.',
        'ThemeContext.Provider with value="dark" wraps App. Header calls useContext(ThemeContext) and reads "dark" without an intermediate prop.',
      ],
      check: [
        'Агар даруни App provider-и дуюм бо value="light" гузорӣ, component-и даруни он light мегирад. Header-и берун аз provider-и дуюм dark мемонад. Provider-и наздиктарин дар дарахтро ёб.',
        'Если внутри App добавить второй provider с value="light", его потомок получит light. Header снаружи второго provider останется dark. Найдите ближайший provider в дереве.',
        'If you add a second provider with value="light" inside App, its descendant gets light. A Header outside the second provider still gets dark. Find each consumer’s nearest provider.',
      ],
    },
    'topic-37': {
      example: [
        'ThemeProvider theme = "light"-ро дар useState нигоҳ медорад ва { theme, toggle } медиҳад. Header toggle-ро даъват мекунад. Provider theme-ро ба "dark" мегузорад ва Settings ҳам аз Context "dark" мехонад.',
        'ThemeProvider хранит theme = "light" в useState и передаёт { theme, toggle }. Header вызывает toggle. Provider устанавливает "dark", и Settings тоже читает "dark" из Context.',
        'ThemeProvider keeps theme = "light" in useState and provides { theme, toggle }. Header calls toggle. The provider sets "dark", and Settings reads "dark" from the same context.',
      ],
      check: [
        'State-и кушода ё пӯшидаи modal-ро дар компонент нигоҳ дор, агар фақат ба ҳамон ҷо лозим бошад. Modal-ро кушо ва баъд theme-ро иваз кун. Дар ҳар ду consumer theme бояд нав шавад ва modal ҳолаташро нигоҳ дорад.',
        'Держите состояние открытия modal в его компоненте, если оно нужно только там. Откройте modal, затем переключите тему. Оба потребителя должны увидеть новую тему, а modal остаться открытым.',
        'Keep the modal’s open state local when it is only needed there. Open the modal and then change the theme. Both theme consumers should see the new value while the modal stays open.',
      ],
    },
    'topic-38': {
      example: [
        'Ду Counter аз як store useStore(s => s.count)-ро мехонанд. Дар якум inc() иҷро шуд. count аз 0 ба 1 гузашт ва ҳар ду компонент 1 нишон медиҳанд. Counter-и дуюм setter-и худаш надорад.',
        'Два Counter читают один store через useStore(s => s.count). В первом вызвали inc(). Значение меняется с 0 на 1 и оба показывают 1. У второго Counter нет отдельного setter.',
        'Two counters read one store through useStore(s => s.count). Calling inc() in the first changes the count from 0 to 1 and both display 1. The second counter has no separate setter.',
      ],
      check: [
        'Барои component-и фақат count store-ро пурра нахон. Агар field-и дигар иваз шавад, selector-и count ҳамон рақамро бармегардонад. Бо тағйири count ва тағйири майдони дигар ду ҳолатро ҷудо бин.',
        'Если компоненту нужен count, выбирайте это поле. Изменение другого поля оставляет результат selector прежним. Сравните обновление count с обновлением другого значения.',
        'Select count when that is all the component needs. An unrelated field update leaves the selector result unchanged. Compare a count update with an update to another field.',
      ],
    },
    'topic-39': {
      example: [
        'Дар cart рӯйхати items ва action-и addItem дар store мемонанд, чун Catalog ва Header ҳар ду онҳоро истифода мебаранд. Catalog addItem({ id: 7, name: "Tea" })-ро даъват мекунад. Header items.length-ро хонда, badge-ро аз 0 ба 1 мебарад.',
        'В store лежат items и addItem, потому что они нужны Catalog и Header. Каталог вызывает addItem({ id: 7, name: "Tea" }). Header читает items.length и меняет число на бейдже с 0 на 1.',
        'The store holds items and addItem because both Catalog and Header need them. Catalog calls addItem({ id: 7, name: "Tea" }). Header reads items.length and changes its badge from 0 to 1.',
      ],
      check: [
        'Агар ба cart мавод илова шавад, массиви нав баргардон, то selector тағйирро бинад. Матни input-и ҷустуҷӯи Catalog-ро локалӣ мон. Санҷ, ки навиштани query badge-и cart-ро дигар накунад.',
        'При добавлении товара верните новый массив, чтобы selector увидел изменение. Поисковое поле Catalog оставьте локальным. Проверьте, что ввод запроса не меняет число в корзине.',
        'Return a new array when adding an item so the selector can observe the change. Keep Catalog’s search input local. Verify that typing a query does not change the cart count.',
      ],
    },
    'topic-40': {
      example: [
        'Store ҳолати cart-ро нигоҳ медорад. Тугма dispatch({ type: "cart/add", payload: product })-ро мефиристад. Reducer action-ро хонда, аз [] рӯйхати [product]-ро месозад. Selector шумораи молро ба UI медиҳад: 0 → 1.',
        'Store хранит состояние корзины. Кнопка отправляет dispatch({ type: "cart/add", payload: product }). Reducer читает action и получает из [] новый список [product]. Selector передаёт количество в UI: 0 → 1.',
        'The store holds cart state. The button sends dispatch({ type: "cart/add", payload: product }). The reducer reads the action and turns [] into [product]. A selector supplies the count to the UI: 0 → 1.',
      ],
      check: [
        'Action хабар аст. Худи объекти action рӯйхатро иваз намекунад, dispatch онро ба store мефиристад. Як cart/add-ро дар Redux DevTools ёб ва before/after-и state-ро муқоиса кун.',
        'Action описывает событие. Сам объект action не меняет список, его передаёт в store вызов dispatch. Найдите cart/add в Redux DevTools и сравните состояние до и после.',
        'An action describes an event. Creating the action object does not change the list. Dispatch sends it to the store. Find cart/add in Redux DevTools and compare state before and after.',
      ],
    },
    'topic-41': {
      example: [
        'createSlice бо name = "counter" ва reducer-и inc action creator-и slice.actions.inc месозад. Даъвати inc() action-и counter/inc медиҳад. Пас аз dispatch store reducer-ро иҷро карда, value-ро аз 0 ба 1 мебарад.',
        'createSlice с name = "counter" и reducer inc создаёт slice.actions.inc. Вызов inc() возвращает action counter/inc. После dispatch store вызывает reducer и меняет value с 0 на 1.',
        'createSlice with name = "counter" and reducer inc creates slice.actions.inc. Calling inc() returns a counter/inc action. Dispatch runs the reducer through the store and changes value from 0 to 1.',
      ],
      check: [
        'slice.reducer-ро ҳангоми configureStore ба store пайваст кун. Номи key-и reducer ҷойи state-ро муайян мекунад, масалан reducer: { counter: slice.reducer } → state.counter.value. Санҷ, ки selector ҳамон роҳро мехонад.',
        'Подключите slice.reducer через configureStore. Ключ reducer определяет путь к состоянию: reducer: { counter: slice.reducer } даёт state.counter.value. Проверьте, что selector читает этот путь.',
        'Register slice.reducer in configureStore. The reducer key determines the path: reducer: { counter: slice.reducer } gives state.counter.value. Check that the selector reads this path.',
      ],
    },
    'topic-42': {
      example: [
        'Пеш аз rename state.user.name = "Ali". Дар reducer-и createSlice Immer draft медиҳад. Навиштани state.user.name = "Sara" draft-ро тағйир медиҳад ва натиҷаи нав номи Sara мегирад. Объекти пешина Ali мемонад.',
        'До rename state.user.name равен "Ali". В reducer createSlice Immer даёт draft. Запись state.user.name = "Sara" меняет draft и создаёт результат с именем Sara. В прежнем объекте остаётся Ali.',
        'Before rename, state.user.name is "Ali". In a createSlice reducer, Immer supplies a draft. Writing state.user.name = "Sara" changes that draft and produces a result with Sara. The previous object still has Ali.',
      ],
      check: [
        'Дар reducer-и одии React ҳамин навиштан объекти додаатро рост иваз мекунад. Қиматҳои пешу баъди rename-ро бо нусхаи пешина санҷ. Дар createSlice ё draft-ро иваз кун ё объекти нав баргардон, ҳар дуро якҷоя накун.',
        'В обычном reducer React такая запись меняет переданный объект напрямую. Проверьте имя в старом и новом состояниях после rename. В createSlice меняйте draft или возвращайте новый объект, совмещать оба способа не нужно.',
        'In a plain React reducer, the same assignment mutates the input object. Check both the previous and next names after rename. In createSlice, either modify the draft or return a replacement object.',
      ],
    },
    'topic-43': {
      example: [
        'Тугма dispatch(loadUsers())-ро иҷро мекунад. createAsyncThunk аввал pending мефиристад. Агар request рӯйхати ду user-ро диҳад, fulfilled payload-ро меорад. Агар request хато диҳад, rejected меояд. extraReducers бояд аз ҳар action-и дахлдор state-и экранро нав кунад.',
        'Кнопка выполняет dispatch(loadUsers()). createAsyncThunk сначала отправляет pending. Если запрос вернёт двух пользователей, fulfilled принесёт список в payload. При ошибке приходит rejected. extraReducers обрабатывает эти действия и меняет состояние экрана.',
        'The button runs dispatch(loadUsers()). createAsyncThunk dispatches pending first. If the request returns two users, fulfilled carries the list in its payload. A failure dispatches rejected. Handle these actions in extraReducers to update the screen state.',
      ],
      check: [
        'api дар порчаи код client-и дархост аст ва дар файли мисол бояд муайян шавад. Барои санҷиш ҷавоби омӯзишии муваффақ ва хатодор соз. Дар ҳар ҳолат loading бояд ба охир расад ва экран рӯйхат ё паёми хаторо нишон диҳад.',
        'api в этом фрагменте — клиент запросов, который нужно определить в учебном проекте. Проверьте ответ с данными и ошибку на учебных данных. В обоих случаях загрузка заканчивается, а экран показывает список или сообщение.',
        'The snippet assumes an api client defined elsewhere in the exercise. Test a successful fixture and a failed request. Loading should finish in both cases and the screen should show a list or an error.',
      ],
    },
    'topic-44': {
      example: [
        'countAtom = atom(0) манбаи count аст. doubleAtom аз get(countAtom) * 2 ҳисоб мешавад. useAtom(countAtom) хондан ва навиштан медиҳад. Вақте count аз 2 ба 3 гузашт, doubleAtom аз 4 ба 6 мегузарад.',
        'countAtom = atom(0) хранит count. doubleAtom вычисляет get(countAtom) * 2. useAtom(countAtom) даёт чтение и запись. Когда count меняется с 2 на 3, doubleAtom меняется с 4 на 6.',
        'countAtom = atom(0) stores count. doubleAtom computes get(countAtom) * 2. useAtom(countAtom) provides read and write access. Moving count from 2 to 3 changes doubleAtom from 4 to 6.',
      ],
      check: [
        'Ҳосили дукаратаро дар atom-и дигар дастӣ sync накун. doubleAtom онро аз countAtom мегирад. Atom-ҳоро берун аз компонент эълон кун, то reference устувор монад. count-ро аз 0 то 3 зиёд кун ва 0, 2, 4, 6-ро санҷ.',
        'Пусть doubleAtom вычисляется из countAtom. Это убирает ручную синхронизацию второго числа. Объявите атомы вне компонента для стабильной ссылки. Увеличьте count с 0 до 3 и проверьте 0, 2, 4, 6.',
        'Derive doubleAtom from countAtom to avoid manually syncing a second number. Declare the atoms outside the component to keep their references stable. Increment count from 0 to 3 and check 0, 2, 4, 6.',
      ],
    },
    'topic-45': {
      example: [
        'Дар мағоза note-и форма ба худи форма тааллуқ дорад. Theme ба чанд экран лозим аст. Рӯйхати маҳсулот аз API меояд. Филтри ?q=tea ба URL мувофиқ аст, чун link-ро фиристӣ, шахси дигар ҳам ҷустуҷӯи tea-ро мебинад.',
        'В магазине note принадлежит форме. Тема нужна нескольким экранам. Товары приходят из API. Фильтр ?q=tea удобно хранить в URL: получатель ссылки откроет тот же поиск tea.',
        'In a store app, the form owns its note. Several screens share the theme. Products come from an API. The ?q=tea filter belongs in the URL so a shared link opens the same tea search.',
      ],
      check: [
        'Query-ро ҳам дар URL ва ҳам дар state-и ҷудо нигоҳ дорӣ, ду қимат метавонанд аз ҳам дур шаванд. F5 ва Back-ро санҷ. URL бояд ҷустуҷӯро баргардонад, note-и маҳаллӣ баъди F5 аз аввал сар мешавад.',
        'Если продублировать query в URL и отдельном state, значения могут разойтись. Проверьте F5 и Back. Поиск должен следовать URL, а локальная заметка после F5 начнётся заново.',
        'Duplicating query in both the URL and independent state can let the values drift. Test refresh and Back. Search should follow the URL, while the local note starts fresh after refresh.',
      ],
    },
    'topic-46': {
      example: [
        'Catalog тугмаи Add дорад ва Cart рӯйхатро нишон медиҳад. Parent як cart = [] нигоҳ медорад. Catalog onAdd({ id: 1, name: "Notebook" })-ро даъват мекунад. Parent рӯйхатро нав мекунад ва Cart ҳамон рӯйхати навро мегирад.',
        'Catalog содержит Add, а Cart показывает список. Родитель хранит cart = []. Catalog вызывает onAdd({ id: 1, name: "Notebook" }). Родитель обновляет массив, и Cart получает этот же список.',
        'Catalog contains Add, and Cart displays the list. Their parent keeps cart = []. Catalog calls onAdd({ id: 1, name: "Notebook" }). The parent updates the array and Cart receives it.',
      ],
      check: [
        'Дар Cart нусхаи дуюми cart насоз. Барои санҷиш Add-ро ду бор пахш кун: аз рӯйи қоидаи ин машқ як id як бор мемонад. Баъд Remove кун ва санҷ, ки шумораи дар parent ҳисобшуда ҳам 0 шавад.',
        'Оставьте один cart в родителе. Нажмите Add дважды: по правилу упражнения один id появится один раз. Затем нажмите Remove и проверьте, что родитель тоже вычисляет количество 0.',
        'Keep one cart in the parent. Click Add twice: the exercise allows only one row per ID. Then click Remove and check that the parent’s derived count is also 0.',
      ],
    },
    'topic-47': {
      example: [
        'Браузер аз сервер нархи 10-ро гирифт ва дар cache нигоҳ дошт. Дар сервер нарх 12 шуд. Cache то нав шудани дода 10 дорад. Refetch маълумоти ҷориро мепурсад ва баъди ҷавоби муваффақ экран 12-ро нишон медиҳад.',
        'Браузер получил цену 10 и сохранил её в cache. На сервере цена стала 12. В кеше ещё 10. Refetch запрашивает актуальные данные, и после успешного ответа экран показывает 12.',
        'The browser fetches price 10 and caches it. The server changes the price to 12. The cache still has 10. Refetch requests current data, and a successful response makes the screen show 12.',
      ],
      check: [
        'Cache нусхаи сервер аст ва қоидаи нав шудан мехоҳад. Нархро дар манбаи омӯзишӣ иваз кун ва пешу баъди refetch санҷ. Агар refetch хато диҳад, маълумоти кӯҳнаро ҳамчун ҷавоби нав нишон надеҳ.',
        'Кеш — копия серверных данных. Нужны условия обновления. Измените цену в учебном источнике и проверьте экран до и после refetch. При ошибке обновления не выдавайте старую цену за свежий ответ.',
        'The cache is a copy of server data and needs a refresh policy. Change the price in a learning fixture and check the screen before and after refetch. If refetch fails, distinguish the old value from fresh data.',
      ],
    },
    'topic-48': {
      example: [
        'Маҳсулоти 7 бо queryKey: ["product", 7] нигоҳ дошта мешавад. Ба маҳсулоти 9 гузарӣ, key ба ["product", 9] иваз мешавад ва queryFn додаи 9-ро мегирад. Барои истифодаи useQuery дар болои дарахт QueryClientProvider лозим аст.',
        'Товар 7 хранится по queryKey: ["product", 7]. При переходе к товару 9 ключ меняется на ["product", 9], и queryFn получает данные товара 9. Для useQuery нужен QueryClientProvider выше в дереве.',
        'Product 7 is cached under queryKey: ["product", 7]. Opening product 9 changes the key to ["product", 9], and queryFn loads product 9. useQuery needs a QueryClientProvider above it.',
      ],
      check: [
        'Агар id-ро дар queryFn истифода кунӣ, онро ба queryKey ҳам дохил кун. Аз 7 ба 9 ва боз ба 7 гузар. Ҳангоми боркунӣ ё хато ҳолати мувофиқро нишон деҳ ва санҷ, ки ҷавоби як маҳсулот ҳамчун маҳсулоти дигар намебарояд.',
        'Если queryFn зависит от id, включите его и в queryKey. Перейдите с 7 на 9 и обратно на 7. Покажите подходящие состояния загрузки и ошибки и проверьте, что данные одного товара не выдаются за другой.',
        'When queryFn depends on id, include it in queryKey. Go from 7 to 9 and back to 7. Show loading and error states and ensure one product’s response never appears as the other product.',
      ],
    },
    'topic-49': {
      example: [
        'Query рӯйхати Notebook ва Pencil-ро аз манбаи омӯзишӣ мегирад. Redux фақат ID-и favorite-ҳоро нигоҳ медорад. Пахши Favorite дар Notebook массивро аз [] ба [1] мебарад. Маҳсулот ҳанӯз аз ҳамон query меоянд.',
        'Query получает Notebook и Pencil из учебного источника. Redux хранит только ID избранного. Клик Favorite у Notebook меняет массив с [] на [1]. Товары по-прежнему приходят из query.',
        'The query loads Notebook and Pencil from a fixture. Redux stores only favorite IDs. Clicking Favorite on Notebook changes the array from [] to [1]. Products still come from the query.',
      ],
      check: [
        'Ба slice нусхаи рӯйхати query-ро нагузор, агар соҳиби алоҳидааш муайян нест. Пахши Favorite ва нав шудани додаи query-ро ҷудо санҷ. Аввал ID иваз шавад ва баъд рӯйхат аз манбаи худ нав шавад.',
        'Не добавляйте копию списка query в slice без отдельной причины. Проверьте Favorite и обновление данных по отдельности. В первом случае меняется ID, во втором список приходит из своего источника.',
        'Avoid copying the query list into the slice unless it has a separate purpose. Test Favorite and a data refresh separately. The first changes the ID. The second updates the list from its source.',
      ],
    },
    'topic-50': {
      example: [
        'Барои саҳифаи фармоиш аввал навис, ки user чӣ мекунад. URL page=2-ро нигоҳ медорад. API рӯйхати фармоишҳоро медиҳад. Modal-и «тафсилот» state-и маҳаллӣ аст. Ин қарорҳо маълум мекунанд, ки тағйирро аз кадом файл сар кунӣ.',
        'Для экрана заказов начните с действий пользователя. URL хранит page=2. Список заказов приходит из API. Открытие модального окна — локальный state. Так ясно, где искать код каждого поведения.',
        'Start the orders screen with user actions. The URL stores page=2. The API supplies orders. Whether the details modal is open belongs to local state. This tells you where to look for each behavior.',
      ],
      check: [
        'Саҳифаи 2-ро бо link ва F5 санҷ. Баъд modal-ро кушо ва банд. Шумораи саҳифа дар URL бетағйир мемонад ва барои кушодани modal рӯйхати фармоишҳоро дубора гирифтан шарт нест.',
        'Откройте страницу 2 по ссылке и обновите её. Затем откройте и закройте modal. Номер страницы в URL остаётся прежним, а открытие modal само по себе не требует повторной загрузки заказов.',
        'Open page 2 from a link and reload it. Then open and close the modal. The page number in the URL stays the same, and opening the modal itself does not require fetching the orders again.',
      ],
    },
    typescript: {
      example: [
        'Дар ProductCard props = { name: string, price: number } шартномаи компонент аст. <ProductCard name="Tea" price={10} /> ба он мувофиқ аст. Бо price="10" TypeScript пеш аз иҷро мегӯяд, ки ба ҷойи рақам сатр омад.',
        'В ProductCard тип { name: string, price: number } задаёт контракт props. <ProductCard name="Tea" price={10} /> ему соответствует. При price="10" TypeScript до запуска покажет, что вместо числа передана строка.',
        'In ProductCard, { name: string, price: number } defines the props contract. <ProductCard name="Tea" price={10} /> satisfies it. With price="10", TypeScript flags the string where a number is expected.',
      ],
      check: [
        'TypeScript type-и ҷавоби API-ро ҳангоми иҷро худкор намесанҷад. Агар price аз input ё API ояд, қиматро санҷида, баъд ба ProductCard деҳ. Бо 10 ва "unknown" санҷ: якум намоиш ёбад, дуюм паёми хато диҳад.',
        'Типы TypeScript не проверяют ответ API во время выполнения. Если price приходит из поля или API, проверьте значение до передачи в ProductCard. Проверьте 10 и "unknown": первое отображается, второе даёт ошибку проверки.',
        'TypeScript types do not validate an API response at runtime. If price comes from an input or API, validate it before passing it into ProductCard. Try 10 and "unknown": show the first and report a validation error for the second.',
      ],
    },
  };
