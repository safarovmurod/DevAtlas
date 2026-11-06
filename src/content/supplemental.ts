import type { LearningTopic, LearningQuestion } from './course';
import { NEXT_SEEDS } from './supplemental-next';
import { REACT_SEEDS } from './supplemental-react';

/** Short source data from which one extra topic and its quiz question are built. */
export interface ExtraSeed {
  id: string;
  month: number;
  title: string;
  ru: string;
  why: string;
  trigger: string;
  flow: string[];
  code: string;
  question: string;
  answer: string;
  wrong: [string, string];
  source: string;
}

// Topic order is the order in REACT_SEEDS followed by NEXT_SEEDS.
const seeds: ExtraSeed[] = [...REACT_SEEDS, ...NEXT_SEEDS];

export const EXTRA_TOPICS: LearningTopic[] = seeds.map((seed) => ({
  id: seed.id,
  month: seed.month,
  title: seed.title,
  titleRu: seed.ru,
  explanation: [
    { title: 'Чӣ кор мекунад?', text: seed.why },
    { title: 'Аз чӣ оғоз мешавад?', text: seed.trigger },
  ],
  flow: seed.flow,
  code: [seed.code],
  questions: [{ question: seed.question, answer: seed.answer, deeper: seed.trigger }],
  source: seed.source,
}));
export const EXTRA_QUESTIONS: LearningQuestion[] = seeds.map((seed) => ({
  id: `extra-${seed.id}`,
  sourceId: seed.id,
  topicId: seed.id,
  month: seed.month,
  group: seed.month,
  question: seed.question,
  answer: seed.answer,
  options: [seed.answer, ...seed.wrong],
  explanation: seed.why,
  code: [seed.code],
  source: seed.source,
}));

const typescriptQuestions = [
  [
    'Props-ро дар TypeScript чӣ хел менависем?',
    'Бо type ё interface майдонҳо ва callback-ҳоро тавсиф мекунем.',
    'Ба ҳар props any мемонем.',
    'TypeScript props-ро дар database нигоҳ медорад.',
  ],
  [
    'useState<User | null>(null) чӣ маъно дорад?',
    'State метавонад User ё null бошад; пеш аз user.name null-ро месанҷем.',
    'State танҳо string қабул мекунад.',
    'null худаш user месозад.',
  ],
  [
    'type Status = "idle" | "loading" чӣ медиҳад?',
    'Танҳо ду string-и иҷозатдодашуда; typo-ро type checker мебинад.',
    'Ҳар string ва number мумкин аст.',
    'Ин HTTP request мефиристад.',
  ],
  [
    'Фарқи unknown ва any чист?',
    'unknown пеш аз истифода санҷиш мехоҳад; any санҷиши type-ро канор мегузорад.',
    'unknown ҳамеша number аст.',
    'any ҳама validation-и runtime-ро мекунад.',
  ],
  [
    'Барои event-и input-и React кадом type мувофиқ аст?',
    'ChangeEvent<HTMLInputElement>, баъд event.target.value string аст.',
    'MouseEvent барои ҳамаи input value-ҳо.',
    'Event type лозим шавад, React state кор намекунад.',
  ],
  [
    'Callback-и onDelete: (id: number) => void чиро мегӯяд?',
    'Функсия number мегирад; истифодабаранда натиҷаи return-ро истифода намекунад.',
    'Функсия танҳо string қабул мекунад.',
    'Функсия ҳатман HTTP DELETE мекунад.',
  ],
  [
    'name?: string чӣ маъно дорад?',
    'name optional аст: метавонад набошад; пеш аз истифода undefined-ро ба назар мегирем.',
    'name ҳатман пур аст.',
    'Ҳама object optional мешавад.',
  ],
  [
    'Барои children-и гуногуни React чӣ type истифода мекунем?',
    'ReactNode, агар матн, JSX ва дигар children-и иҷозатдодашуда қабул шаванд.',
    'Фақат HTMLDivElement.',
    'Фақат number[].',
  ],
  [
    'Дар catch(error) чӣ тавр message-ро бехатар мегирем?',
    'Аввал error instanceof Error-ро месанҷем, баъд error.message.',
    'Ҳамеша error.data.data.message бе санҷиш.',
    'TypeScript ҳар error-ро string мекунад.',
  ],
  [
    'Файли component бо JSX дар TS-проект чӣ extension дорад?',
    '.tsx; файли бе JSX метавонад .ts бошад.',
    'Ҳама файл ҳатман .jsx аст.',
    '.json барои component аст.',
  ],
];
typescriptQuestions.forEach((question, index) =>
  EXTRA_QUESTIONS.push({
    id: `ts-${index + 1}`,
    sourceId: `ts-${index + 1}`,
    topicId: 'typescript',
    month: 2,
    group: 2,
    question: question[0],
    answer: question[1],
    options: question.slice(1),
    explanation: question[1],
    code: [],
    source: 'https://www.typescriptlang.org/docs/handbook/react.html',
  }),
);
