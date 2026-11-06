import { InterviewQuestion } from '@/types';

export const CORE_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'int_spa_mpa',
    topicId: 'spa_vs_mpa',
    prompt:
      'Тафовути асосии байни SPA (Single Page Application) ва MPA (Multi Page Application)-ро шарҳ деҳ.',
    rubric: {
      requiredConcepts: [
        'client-side routing',
        'no full reload',
        'initial bundle vs page requests',
      ],
      forbiddenContradictions: ['SPA reload мекунад барои ҳар саҳифа', 'MPA фақат JavaScript аст'],
      keyTerms: ['SPA', 'MPA', 'Client-side routing', 'Reload', 'Virtual DOM', 'Bundle'],
      goodAnswerSummary:
        'SPA танҳо як маротиба HTML-и асосиро бор мекунад ва гузариш байни масирҳо бо ёрии JavaScript бе reload-и экран анҷом мешавад, ҳол он ки MPA дар ҳар як гузариш саҳифаи навро аз сервер дархост мекунад.',
    },
    sampleGoodAnswer:
      'SPA ин барномаест, ки дар он браузер як маротиба HTML ва JS-ро бор мекунад ва ҳангоми гузариш ба саҳифаҳои дигар reload намешавад, балки худи React интерфейсро нав мекунад. Дар MPA бошад барои ҳар як саҳифа браузер аз сервер саҳифаи навро пурра боргирӣ мекунад.',
    samplePoorAnswer: 'SPA як саҳифа дорад, MPA бисёр саҳифа дорад.',
    category: 'react_basics',
  },
  {
    id: 'int_react_state_vs_props',
    topicId: 'state',
    prompt: 'Фарқияти Props аз State чист? Оё метавон Props-ро дар фарзанд тағйир дод?',
    rubric: {
      requiredConcepts: [
        'props are read-only',
        'state is internal and mutable via setter',
        'one-way data flow',
      ],
      forbiddenContradictions: ['Props-ро кӯдак метавонад иваз кунад', 'State аз берун меояд'],
      keyTerms: ['Props', 'State', 'Read-only', 'Immutable', 'Re-render', 'Parent', 'Child'],
      goodAnswerSummary:
        'Props ин маълумоти воридотӣ аз тарафи Parent мебошад, ки танҳо барои хондан аст (read-only). State бошад хотираи худи компонент аст, ки метавонад бо setState иваз шавад ва UI-ро нав кунад.',
    },
    sampleGoodAnswer:
      'Props маълумотест, ки аз компоненти болоӣ (parent) меояд ва он read-only аст, child наметавонад онро мустақиман иваз кунад. State ин ҳолати дохилии худи компонент аст, ки ҳангоми даъвати setState тағйир меёбад ва компонентро re-render мекунад.',
    samplePoorAnswer: 'Ҳарду барои нигоҳ доштани маълумот мебошанд.',
    category: 'react_basics',
  },
  {
    id: 'int_react_lifecycle_useeffect',
    topicId: 'useeffect',
    prompt: 'useEffect чист ва dependency array дар он чӣ нақш мебозад?',
    rubric: {
      requiredConcepts: [
        'side effects',
        'mount/update/unmount phases',
        'dependency array comparison',
        'cleanup function',
      ],
      forbiddenContradictions: [
        'useEffect пеш аз render кор мекунад',
        'массиви холӣ дар ҳар render кор мекунад',
      ],
      keyTerms: ['useEffect', 'Side effect', 'Dependency array', 'Mount', 'Unmount', 'Cleanup'],
      goodAnswerSummary:
        'useEffect барои иҷрои Side Effects (дархостҳои шабакавӣ, таймерҳо, listener-ҳо) истифода мешавад. Агар dependency холӣ бошад [], танҳо як бор ҳангоми mount иҷро мешавад; агар қимат дошта бошад [id], ҳангоми тағйири ҳамон қимат; бе массив дар ҳар render кор мекунад.',
    },
    sampleGoodAnswer:
      'useEffect hook барои side effects аст, ба мисли гирифтани маълумот аз API ё таймерҳо. Он пас аз кашида шудани DOM кор мекунад. Массиви dependency назорат мекунад: агар [] бошад як бор дар mount кор мекунад, агар тағйирёбандаҳо дошта бошад, ҳангоми тағйири онҳо кор мекунад. Ҳамчунин метавонад cleanup function баргардонад барои тозакунӣ.',
    samplePoorAnswer: 'useEffect барои корҳои асинхронӣ аст ва дар охири код меистад.',
    category: 'hooks',
  },
  {
    id: 'int_react_state_vs_ref',
    topicId: 'state_vs_ref',
    prompt:
      'Кадом фарқи калидӣ байни useState ва useRef вуҷуд дорад ва кай useRef-ро истифода мебарем?',
    rubric: {
      requiredConcepts: [
        'useState triggers re-render',
        'useRef does not trigger re-render',
        'access to DOM elements',
      ],
      forbiddenContradictions: [
        'useRef саҳифаро re-render мекунад',
        'useState барои пайваст ба DOM аст',
      ],
      keyTerms: ['useState', 'useRef', 'Re-render', 'current', 'DOM node', 'Focus'],
      goodAnswerSummary:
        'Иваз шудани useState боиси re-render шудани компонент мегардад. Иваз шудани ref.current компонентро re-render намекунад. useRef барои нигоҳдории қиматҳои доимӣ ё гирифтани истинод ба элементи DOM (масалан input focus) истифода мешавад.',
    },
    sampleGoodAnswer:
      'Фарқи асосӣ дар он аст, ки ҳангоми нав шудани state компонент re-render мешавад, аммо вақте ки ref.current-ро иваз мекунем, ҳеҷ гуна re-render рух намедиҳад. useRef-ро вақте истифода мебарем, ки ё бояд мустақиман ба DOM муроҷиат кунем (масалан focus додани input) ё қиматеро нигоҳ дорем, ки тағйираш ба UI дахл надорад (масалан timer id).',
    samplePoorAnswer: 'useRef ин useState-и кӯҳна аст.',
    category: 'hooks',
  },
  {
    id: 'int_react_vdom_diffing',
    topicId: 'virtual_dom',
    prompt: 'Virtual DOM чист ва чӣ тавр React тағиротро ба DOM-и аслӣ мегузаронад?',
    rubric: {
      requiredConcepts: [
        'in-memory representation',
        'diffing algorithm',
        'reconciliation',
        'batch dom updates',
      ],
      forbiddenContradictions: [
        'Virtual DOM мустақиман дар браузер намоён аст',
        'ҳамаи саҳифа аз нав сохта мешавад',
      ],
      keyTerms: ['Virtual DOM', 'Real DOM', 'Diffing', 'Reconciliation', 'Fiber', 'Batching'],
      goodAnswerSummary:
        'Virtual DOM нусхаи сабуки дарахти DOM дар хотираи JavaScript аст. Ҳангоми тағйири state, React дарахти нави виртуалӣ месозад, онро бо дарахти пешина муқоиса мекунад (Diffing/Reconciliation) ва танҳо элементҳои воқеан тағйирёфтаро ба Real DOM ворид месозад.',
    },
    sampleGoodAnswer:
      'Virtual DOM ин намоиши дарахти интерфейс дар хотира аст. Вақте ки state иваз мешавад, React аввал дарахти нави Virtual DOM-ро месозад ва бо дарахти пешина муқоиса мекунад. Ин равандро Reconciliation меноманд. Пас аз ёфтани фарқиятҳо, React танҳо ҳамон қисмҳои заруриро дар Real DOM нав мекунад, ки ин суръатро хеле баланд мебардорад.',
    samplePoorAnswer: 'Virtual DOM барои он аст, ки React тез кор кунад.',
    category: 'react_basics',
  },
  {
    id: 'int_react_memoization',
    topicId: 'performance_memo',
    prompt: 'Тафовути байни useMemo, useCallback ва React.memo чист?',
    rubric: {
      requiredConcepts: [
        'useMemo caches calculated value',
        'useCallback caches function instance',
        'React.memo prevents component re-render on same props',
      ],
      forbiddenContradictions: [
        'useCallback натиҷаро кэш мекунад',
        'React.memo барои функсияҳои оддӣ аст',
      ],
      keyTerms: ['useMemo', 'useCallback', 'React.memo', 'Memoization', 'Shallow compare', 'Props'],
      goodAnswerSummary:
        'React.memo ин HOC барои компонент аст, ки агар props тағйир наёбад re-render-ро бозмедорад. useMemo натиҷаи як ҳисобкунии вазнинро кэш мекунад. useCallback бошад худи нусхаи функсияро кэш мекунад, то reference-и нав наёбад.',
    },
    sampleGoodAnswer:
      'React.memo компонентро мепечонад ва агар props тағйир наёбад re-render шуданашро пешгирӣ мекунад. useMemo барои кэш кардани қимати ҳисобшуда (масалан филтри вазнин) истифода мешавад. useCallback бошад худи функсияро кэш мекунад, то ки ҳангоми ҳар як re-render функсияи нав сохта нашавад ва child-ҳое, ки ба он пайвастанд, беҳуда re-render нашаванд.',
    samplePoorAnswer: 'Ҳамаашон барои тез кардани сайт мебошанд.',
    category: 'advanced',
  },
  {
    id: 'int_state_zustand_vs_redux',
    topicId: 'zustand_basics',
    prompt: 'Чаро дар лоиҳаҳои муосир Zustand ё Redux Toolkit истифода мешавад ва фарқи онҳо чист?',
    rubric: {
      requiredConcepts: [
        'avoid prop drilling',
        'centralized store',
        'Zustand simplicity without provider',
        'RTK structured patterns and devtools',
      ],
      forbiddenContradictions: [
        'Zustand Provider талаб мекунад',
        'Redux барои ҳеҷ чиз даркор нест',
      ],
      keyTerms: ['Zustand', 'Redux Toolkit', 'Store', 'Provider', 'Boilerplate', 'Selectors'],
      goodAnswerSummary:
        'Ҳарду барои идоракунии Global State ва пешгирӣ аз Prop Drilling истифода мешаванд. Zustand бениҳоят содда буда, ба Provider ниёз надорад ва хуб оптимизатсия шудааст. Redux Toolkit сохтори қатъӣ, convention, reducers ва tracing (DevTools)-ро таъмин мекунад, ки барои дастаҳои калон мувофиқ аст.',
    },
    sampleGoodAnswer:
      'Инҳо барои идоракунии ҳолати умумии барнома (global state) истифода мешаванд, то маҷбур нашавем props-ро аз даҳҳо компонент гузаронем. Zustand хеле сабук ва осон аст, Provider надорад ва коди камтар талаб мекунад. Redux Toolkit бошад сохтори стандартӣ, createSlice ва Redux DevTools дорад, ки барои лоиҳаҳои калони тиҷоратӣ пайгирии тағйиротро осон мекунад.',
    samplePoorAnswer: 'Zustand нав аст, Redux кӯҳна аст.',
    category: 'state_mgmt',
  },
  {
    id: 'int_api_crud_flow',
    topicId: 'api_crud_delete',
    prompt: 'Ҳангоми иҷрои DELETE дар React кадом қадамҳои техникӣ бояд тай шаванд?',
    rubric: {
      requiredConcepts: [
        'send HTTP DELETE to backend with id',
        'handle loading and error states',
        'update React state with filter or optimistic update',
      ],
      forbiddenContradictions: [
        'мустақиман массиви state-ро бо splice тағйир додан',
        'пас аз delete саҳифаро reload кардан',
      ],
      keyTerms: [
        'HTTP DELETE',
        'Axios/Fetch',
        'filter',
        'State update',
        'Try/Catch',
        'Disabled button',
      ],
      goodAnswerSummary:
        'Барои DELETE: 1. Нишондиҳандаи loading/disabled фаъол мешавад. 2. Дархости HTTP DELETE бо ID-и сабт фиристода мешавад. 3. Дар сурати муваффақият state бо filter((item) => item.id !== id) нав карда мешавад. 4. Хатогиҳо бо try/catch қабул карда мешаванд.',
    },
    sampleGoodAnswer:
      'Аввал тугмаро disabled мекунем ё loading нишон медиҳем, то корбар дубора назанад. Баъд бо axios.delete(`/api/items/${id}`) ба сервер дархост мефиристем. Вақте ҷавоби муваффақ омад, дар React state-ро нав мекунем: setItems(prev => prev.filter(item => item.id !== id)). Агар хато шавад, дар catch паёми хато нишон медиҳем.',
    samplePoorAnswer: 'Клик мекунем ва delete мешавад.',
    category: 'api',
  },
];

// Helper to generate full bank of 100+ interview questions with strict rubrics
export function getAllInterviewQuestions(): InterviewQuestion[] {
  const result: InterviewQuestion[] = [...CORE_INTERVIEW_QUESTIONS];

  const topics = [
    'let_const',
    'arrow_functions',
    'array_map',
    'array_filter',
    'array_find',
    'destructuring',
    'spread_operator',
    'async_await',
    'spa_vs_mpa',
    'react_intro',
    'component',
    'jsx',
    'props',
    'children_prop',
    'state',
    'render_cycle',
    'virtual_dom',
    'batching',
    'immutability',
    'lists_keys',
    'lifting_state_up',
    'usestate',
    'useref',
    'state_vs_ref',
    'useeffect',
    'deps_array',
    'effect_cleanup',
    'custom_hooks',
    'controlled_inputs',
    'form_submit',
    'routing_basics',
    'dynamic_params',
    'navigation_hook',
    'protected_routes',
    'api_useeffect',
    'api_crud_get',
    'api_crud_post',
    'api_crud_put_patch',
    'api_crud_delete',
    'loading_error_state',
    'search_filter_pagination',
    'context_api',
    'zustand_basics',
    'redux_toolkit_slices',
    'redux_thunks',
    'jotai_atomic',
    'tanstack_query',
    'ts_react_props',
    'performance_memo',
  ];

  topics.forEach((tId) => {
    const formatted = tId.replace(/_/g, ' ');
    result.push({
      id: `int_gen_${tId}_deep`,
      topicId: tId,
      prompt: `Дар мусоҳиба аз ту мепурсанд: "Мантиқи кори ${formatted} чист ва кадом хатогиҳои маъмул ҳангоми истифодаи он рух медиҳанд?"`,
      rubric: {
        requiredConcepts: ['working principle', 'common pitfalls', 'best practices'],
        forbiddenContradictions: ['ин чиз ҳеҷ гоҳ хато намекунад'],
        keyTerms: [formatted, 'React', 'JavaScript', 'Logic', 'Error handling'],
        goodAnswerSummary: `Барои ${formatted} муҳим аст, ки мантиқи аслии кори он, нақши он дар давраи ҳаёт ё ҷараёни додаҳо ва пешгирӣ аз хатогиҳои мутатсия ё dependency шарҳ дода шавад.`,
      },
      sampleGoodAnswer: `Мантиқи асосии ${formatted} дар он аст, ки он вазифаи муайянро бе вайрон кардани қоидаҳои React иҷро мекунад. Хатогии маъмулӣ ин риоя накардани қоидаҳои покӣ ва вобастагиҳо мебошад.`,
      samplePoorAnswer: `Ин барои сохтани сайт даркор аст.`,
      category: 'interview_prep',
    });

    result.push({
      id: `int_gen_${tId}_junior_vs_senior`,
      topicId: tId,
      prompt: `Фарқи равиши як Junior аз як Senior таҳиягар дар истифодаи ${formatted} дар чист?`,
      rubric: {
        requiredConcepts: ['simplicity vs overengineering', 'edge case handling', 'clean code'],
        forbiddenContradictions: ['Junior ва Senior ҳеҷ фарқ надоранд'],
        keyTerms: [formatted, 'Architecture', 'Simplicity', 'Clean code'],
        goodAnswerSummary: `Junior аксар вақт бо мураккабсозӣ ва бе назардошти edge cases ё хатогиҳо код менависад, ҳол он ки Senior ба соддагӣ, муҳофизат аз хато ва фаҳмо будани ${formatted} аҳамият медиҳад.`,
      },
      sampleGoodAnswer: `Junior кӯшиш мекунад абстраксияҳои зиёдатиро истифода барад ё хатогиҳоро сарфи назар кунад. Senior бошад сохтори содда, муҳофизат бо try/catch ва назорати ҳолатҳои канориро таъмин мекунад.`,
      samplePoorAnswer: `Senior беҳтар медонад.`,
      category: 'interview_prep',
    });
  });

  return result;
}
