'use client';
import {useState} from 'react';
import Link from 'next/link';
import {useLearningStore} from '@/stores/learning-store';
import {courseText,type CourseText} from '@/lib/courses/schema';
import {LEARNING_FLOW_STAGES,type LearningFlow} from '@/lib/courses/learning-flow';
import type {InterfaceLocale} from '@/lib/locale';

const t=(ru:string,tg:string,en:string,uk:string,ja:string,ko:string):Record<InterfaceLocale,string>=>({ru,tg,en,uk,ja,ko});
const labels={
 learn:t('Изучите','Омӯзед','Learn','Вивчіть','学ぶ','배우기'),understand:t('Поймите','Фаҳмед','Understand','Зрозумійте','理解する','이해하기'),
 watch:t('Посмотрите','Бинед','Watch','Подивіться','見る','살펴보기'),try:t('Попробуйте с подсказкой','Бо маслиҳат санҷед','Try with guidance','Спробуйте з підказкою','ガイド付きで試す','안내에 따라 시도'),
 practice:t('Практикуйтесь самостоятельно','Мустақилона машқ кунед','Practice independently','Практикуйте самостійно','自分で演習','독립적으로 실습'),test:t('Проверьте себя','Худро санҷед','Test','Перевірте себе','確認する','평가하기'),
 review:t('Повторите','Такрор кунед','Review','Повторіть','復習する','복습하기'),master:t('Подтвердите освоение','Азхудкуниро тасдиқ кунед','Master','Підтвердьте опанування','習得を確認','숙달 확인'),
 goals:t('Цели дня','Ҳадафҳои рӯз','Daily objectives','Цілі дня','今日の目標','오늘의 목표'),real:t('Где это пригодится','Ин дар куҷо лозим мешавад','A real-world use','Де це знадобиться','実際の使い道','실제 활용'),
 route:t('Учебный маршрут','Масири омӯзиш','Learning route','Навчальний маршрут','学習ルート','학습 경로'),predict:t('Сначала выберите прогноз','Аввал пешгӯиро интихоб кунед','Choose your prediction first','Спочатку оберіть прогноз','まず予想を選ぶ','먼저 결과 예상하기'),
 hint:t('Подсказка','Маслиҳат','Hint','Підказка','ヒント','힌트'),correct:t('Прогноз верный','Пешгӯӣ дуруст аст','Correct prediction','Прогноз правильний','予想は正解','올바른 예상'),
 retry:t('Попробуйте ещё раз','Боз кӯшиш кунед','Try again','Спробуйте ще раз','もう一度試す','다시 시도'),tab:t('Вкладка браузера','Варақаи браузер','Browser tab','Вкладка браузера','ブラウザーのタブ','브라우저 탭'),
 node:t('Текст выбранного элемента','Матни унсури интихобшуда','Selected element text','Текст вибраного елемента','選択した要素のテキスト','선택한 요소의 텍스트'),
 simplified:t('Упрощённое дерево элементов этого примера: служебные meta и текстовые узлы не показаны. Нажмите title, h1 или p.','Дарахти содакардашудаи унсурҳои ин мисол: meta ва гиреҳҳои матнӣ нишон дода нашудаанд. title, h1 ё p-ро пахш кунед.','Simplified element tree for this example: meta and text nodes are omitted. Select title, h1 or p.','Спрощене дерево прикладу: meta й текстові вузли не показані. Оберіть title, h1 або p.','簡略化した要素ツリーです。metaとテキストノードは省略しています。title、h1、pを選択してください。','이 예제의 단순화한 요소 트리입니다. meta와 텍스트 노드는 생략했습니다. title, h1, p를 선택하세요.'),
 code:t('Код документа','Рамзи ҳуҷҷат','Document code','Код документа','ドキュメントのコード','문서 코드'),preview:t('Результат HTML','Натиҷаи HTML','HTML result','Результат HTML','HTMLの表示結果','HTML 결과'),
 challenge:t('Мини-задача','Масъалаи хурд','Mini challenge','Мінізавдання','ミニチャレンジ','미니 과제'),example:t('Пример для самопроверки','Намуна барои худсанҷӣ','Self-review example','Приклад для самоперевірки','自己確認の例','자체 검토 예시'),
 open:t('Открыть редактор и проверку','Муҳаррир ва санҷишро кушоед','Open editor and assessment','Відкрити редактор і перевірку','エディターと確認を開く','편집기와 평가 열기'),summary:t('Что нужно запомнить','Чиро дар хотир нигоҳ доред','What to remember','Що запам’ятати','覚えておくこと','기억할 내용'),
 threshold:t('Для Mastered нужны успешная проверка практики, ≥80% ответов и все обязательные вопросы. Самопроверка и этот прогноз не начисляют подтверждённое освоение. Ошибки можно исправлять без штрафа.','Барои Mastered санҷиши дурусти машқ, ≥80% ҷавобҳо ва ҳамаи саволҳои ҳатмӣ лозиманд. Худсанҷӣ ва ин пешгӯӣ азхудкунии тасдиқшуда намедиҳанд. Хатоҳоро бе ҷарима ислоҳ кардан мумкин.','Mastered requires passing practice, ≥80% and every critical question. Self review and this prediction do not grant verified mastery. Correct mistakes without a penalty.','Для Mastered потрібні практика, ≥80% і всі обов’язкові питання. Самоперевірка та прогноз не надають підтвердженого опанування. Помилки можна виправляти без штрафу.','Masteredには演習合格、80%以上、必須問題すべての正解が必要です。自己確認や予想だけでは達成を証明できません。減点なしで再挑戦できます。','Mastered에는 실습 통과, 80% 이상 및 모든 필수 문제 정답이 필요합니다. 자체 검토나 예상만으로 숙달이 인증되지 않습니다. 감점 없이 수정할 수 있습니다.'),
 next:t('Дальше по программе','Баъдан дар барнома','Next in the syllabus','Далі за програмою','次の学習内容','다음 학습 내용'),
 end:t('Это последний урок курса. Завершите проект и проверку, затем повторите темы, в которых остались ошибки. Конец программы сам по себе не подтверждает освоение.','Ин дарси охирини курс аст. Лоиҳа ва санҷишро анҷом диҳед, сипас мавзӯъҳои хато доштаро такрор кунед. Анҷоми барнома худ аз худ азхудкуниро тасдиқ намекунад.','This is the final lesson. Finish the project and assessment, then review topics where you made mistakes. Reaching the end alone does not certify mastery.','Це останній урок. Завершіть проєкт і перевірку, потім повторіть теми з помилками. Кінець програми сам собою не підтверджує опанування.','最後のレッスンです。プロジェクトと評価を終え、間違えた内容を復習してください。最後まで進むだけでは習得の証明になりません。','마지막 수업입니다. 프로젝트와 평가를 마치고 틀린 주제를 복습하세요. 끝에 도달하는 것만으로 숙달이 인증되지는 않습니다.'),
};

function useFlowText(){
 const language=useLearningStore(state=>state.contentLanguage),ui=useLearningStore(state=>state.language);
 return {language,ui,text:(value:CourseText)=>courseText(value,language),label:(key:keyof typeof labels)=>labels[key][ui]};
}
const assessmentHref=(flow:LearningFlow,lessonId:string,practiceHref:string)=>flow.assessmentMode==='local-only'?practiceHref.replace('/practice','/tests'):`${practiceHref}#${lessonId}-assessment`;
const anchor=(id:string,stage:string)=>`${id}-flow-${stage}`;
export function LessonFlowIntro({flow,lessonId,practiceHref}:{flow:LearningFlow;lessonId:string;practiceHref:string}){
 const {text,label}=useFlowText();
 return <div className="lesson-flow-intro" id={anchor(lessonId,'learn')}>
  <nav className="learning-flow-nav" aria-label={label('route')}>{LEARNING_FLOW_STAGES.map(stage=><Link key={stage} href={stage==='test'?assessmentHref(flow,lessonId,practiceHref):`#${anchor(lessonId,stage)}`}>{label(stage)}</Link>)}</nav>
  <h3>{label('goals')}</h3><ul>{flow.objectives.map((objective,index)=><li key={index}>{text(objective)}</li>)}</ul>
  <h3>{label('real')}</h3><p>{text(flow.realWorld)}</p>
 </div>;
}

export function LessonFlowActivities({flow,lessonId,practiceHref,nextTitle}:{flow:LearningFlow;lessonId:string;practiceHref:string;nextTitle?:CourseText}){
 const {language,ui,text,label}=useFlowText();
 const [answer,setAnswer]=useState<number|null>(null),[hint,setHint]=useState(false);
 const passed=answer===flow.prediction.correctIndex;
 return <div className="lesson-flow-activities">
  <section id={anchor(lessonId,'understand')}><h3>{label('understand')}</h3><fieldset className="assessment-question"><legend>{text(flow.prediction.prompt)}</legend>
   <p className="small muted">{label('predict')}</p>{flow.prediction.options.map((option,index)=><label className="assessment-choice" key={index}><input type="radio" name={lessonId+'-prediction'} checked={answer===index} onChange={()=>setAnswer(index)}/>{text(option)}</label>)}
   <button className="button subtle" type="button" onClick={()=>setHint(true)}>{label('hint')}</button>{hint&&<p>{text(flow.prediction.hint)}</p>}
   {answer!==null&&<p role="status">{passed?`${label('correct')}. ${text(flow.prediction.explanation)}`:`${label('retry')}. ${text(flow.prediction.hint)}`}</p>}
  </fieldset></section>
  <section id={anchor(lessonId,'watch')}><h3>{label('watch')}</h3>{flow.demo.kind==='html-document'?<HtmlDocumentExplorer key={language} demo={flow.demo}/>:<CodeTrace key={language} demo={flow.demo}/>}</section>
  <section id={anchor(lessonId,'try')}><h3>{label('try')}</h3><ol>{flow.guidedPractice.steps.map((step,index)=><li key={index}>{text(step)}</li>)}</ol><details><summary>{label('hint')}</summary><p>{text(flow.guidedPractice.hint)}</p></details><p>{text(flow.guidedPractice.success)}</p></section>
  <section id={anchor(lessonId,'practice')}><h3>{label('practice')}</h3><h4>{label('challenge')}</h4><p>{text(flow.miniChallenge.task)}</p><ul>{flow.miniChallenge.criteria.map((criterion,index)=><li key={index}>{text(criterion)}</li>)}</ul><details><summary>{label('example')}</summary><p>{text(flow.miniChallenge.example)}</p></details><Link className="button primary" href={practiceHref}>{label('open')}</Link></section>
  <section id={anchor(lessonId,'review')}><h3>{label('review')}</h3><h4>{label('summary')}</h4><ul>{flow.summary.map((point,index)=><li key={index}>{text(point)}</li>)}</ul>{flow.review.map((prompt,index)=><p key={index}>{text(prompt)}</p>)}</section>
  <section id={anchor(lessonId,'master')}><h3>{label('master')}</h3><p>{flow.assessmentMode==='local-only'?localAssessment[ui]:label('threshold')}</p><Link className="text-link" href={assessmentHref(flow,lessonId,practiceHref)}>{label('test')}</Link>{flow.nextLessonId===null?<p>{flow.continuationNotice?text(flow.continuationNotice):label('end')}</p>:nextTitle&&<p>{label('next')}: {text(nextTitle)}</p>}</section>
 </div>;
}

const escaped=(value:string)=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function HtmlDocumentExplorer({demo}:{demo:Extract<LearningFlow['demo'],{kind:'html-document'}>}){
 const {language,text,label}=useFlowText();
 const [selected,setSelected]=useState<'title'|'h1'|'p'>('title');
 const [values,setValues]=useState({title:text(demo.tabTitle),h1:text(demo.heading),p:text(demo.paragraph)});
 const code=`<!doctype html>\n<html lang="${language}">\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1">\n    <title>${escaped(values.title)}</title>\n  </head>\n  <body>\n    <h1>${escaped(values.h1)}</h1>\n    <p>${escaped(values.p)}</p>\n  </body>\n</html>`;
 const node=(id:typeof selected)=><button type="button" className="button subtle" aria-pressed={selected===id} onClick={()=>setSelected(id)}>{id}</button>;
 return <div className="html-document-explorer">
  <p>{label('simplified')}</p><ul className="dom-element-tree"><li>html<ul><li>head<ul><li>{node('title')}</li></ul></li><li>body<ul><li>{node('h1')}</li><li>{node('p')}</li></ul></li></ul></li></ul>
  <label className="dom-text-input">{label('node')}: {selected}<input aria-label={`${label('node')}: ${selected}`} maxLength={160} value={values[selected]} onChange={event=>setValues(old=>({...old,[selected]:event.target.value}))}/></label>
  <p className="demo-browser-tab">{label('tab')}: <strong>{values.title}</strong></p>
  <iframe className="html-preview" title={label('preview')} sandbox="" referrerPolicy="no-referrer" srcDoc={code}/>
  <details open><summary>{label('code')}</summary><pre><code>{code}</code></pre></details>
 </div>;
}

const localAssessment=t('Квиз и тесты здесь учебные. Объяснение и локальный Node.js-проект оцениваются отдельно как Self Reviewed. Серверной аттестации Backend пока нет; эти действия не присваивают Mastered.','Квиз ва тестҳо омӯзишӣ мебошанд. Шарҳ ва лоиҳаи маҳаллии Node.js алоҳида ҳамчун Self Reviewed арзёбӣ мешаванд. Тасдиқи серверии Backend ҳоло нест; ин амалҳо Mastered намедиҳанд.','The quiz and tests here are learning checks. Review explanations and the local Node.js project separately as Self Reviewed. Backend server attestation is not available yet; these actions do not grant Mastered.','Квіз і тести навчальні. Пояснення та локальний Node.js-проєкт оцінюються окремо як Self Reviewed. Серверне підтвердження Backend поки недоступне; ці дії не надають Mastered.','クイズとテストは学習用です。説明とローカルのNode.jsプロジェクトはSelf Reviewedとして別に確認してください。Backendのサーバー認証は未対応で、Masteredは付与されません。','퀴즈와 테스트는 학습용입니다. 설명과 로컬 Node.js 프로젝트는 Self Reviewed로 별도 검토하세요. Backend 서버 인증은 아직 없으며 Mastered를 부여하지 않습니다.');
const traceCopy={
 note:t('Пошаговый разбор заданного примера, не выполнение вашего кода. Для настоящего запуска используйте редактор с тестами или локальный Node.js.','Шарҳи қадамии мисоли додашуда, на иҷрои рамзи шумо. Барои иҷрои воқеӣ муҳаррири тестдор ё Node.js-и маҳаллиро истифода баред.','A step-by-step explanation of the given example, not execution of your code. Use the test editor or local Node.js for actual execution.','Покроковий розбір прикладу, а не виконання вашого коду. Для виконання використовуйте редактор із тестами або локальний Node.js.','指定例の解説であり、入力コードの実行ではありません。実行にはテスト付きエディターかローカルNode.jsを使用してください。','제시된 예제의 단계별 해설이며 입력 코드의 실행이 아닙니다. 실제 실행에는 테스트 편집기나 로컬 Node.js를 사용하세요.'),
 previous:t('Предыдущий шаг','Қадами пешина','Previous step','Попередній крок','前のステップ','이전 단계'),
 next:t('Следующий шаг','Қадами оянда','Next step','Наступний крок','次のステップ','다음 단계'),
};
function CodeTrace({demo}:{demo:Extract<LearningFlow['demo'],{kind:'code-trace'}>}){
 const {text,ui}=useFlowText();const [index,setIndex]=useState(0);const step=demo.steps[index];
 return <div className="code-trace"><p>{traceCopy.note[ui]}</p><pre><code>{demo.code.split('\n').map((line,i)=><span key={i} aria-current={step.line===i+1?'step':undefined} style={{display:'block',background:step.line===i+1?'var(--accent-soft, #3155aa30)':undefined}}>{i+1}. {line||' '}</span>)}</code></pre><div aria-live="polite"><p>{index+1} / {demo.steps.length}: {text(step.explanation)}</p><pre><code>{step.values}</code></pre></div><div className="button-row"><button type="button" className="button subtle" disabled={index===0} onClick={()=>setIndex(value=>value-1)}>{traceCopy.previous[ui]}</button><button type="button" className="button subtle" disabled={index===demo.steps.length-1} onClick={()=>setIndex(value=>value+1)}>{traceCopy.next[ui]}</button></div></div>;
}
