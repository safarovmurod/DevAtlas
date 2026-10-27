'use client';
import {useRef,useState} from 'react';
import {useAccount} from '@/components/account/account-provider';
import {useLearningStore} from '@/stores/learning-store';
import {runFunction,type FunctionResult} from '@/lib/grading/function-runner';
import type {CourseLesson} from '@/lib/courses/schema';
import type {InterfaceLocale} from '@/lib/locale';
type Execution=NonNullable<NonNullable<CourseLesson['practice']>['execution']>;
const copy:Record<InterfaceLocale,{run:string;note:string;passed:string;failed:string;expected:string;actual:string;error:string}>={
 ru:{run:'Выполнить тесты функции',note:'Реальное выполнение JavaScript в изолированном браузерном worker, до 3 секунд. Сеть заблокирована. Результат локальный: серверная аттестация и Mastered не начисляются. Модули Node.js проверяйте в скачиваемой лабораторной работе.',passed:'Локальные тесты пройдены.',failed:'Есть ошибки. Сравните вход, ожидание и результат; исправьте код и повторите без штрафа.',expected:'Ожидается',actual:'Получено',error:'Не удалось завершить выполнение. Проверьте синтаксис, имя функции и лимит 3 секунды.'},
 tg:{run:'Тестҳои функсияро иҷро кунед',note:'JavaScript воқеан дар worker-и ҷудои браузер, то 3 сония иҷро мешавад. Шабака баста аст. Натиҷа маҳаллӣ аст: тасдиқи сервер ва Mastered дода намешаванд. Модулҳои Node.js-ро дар лабораторияи боргирифта санҷед.',passed:'Тестҳои маҳаллӣ гузаштанд.',failed:'Хато ҳаст. Вуруд, интизорӣ ва натиҷаро муқоиса карда, рамзро бе ҷарима ислоҳ ва такрор кунед.',expected:'Интизорӣ',actual:'Натиҷа',error:'Иҷро анҷом наёфт. Синтаксис, номи функсия ва муҳлати 3 сонияро санҷед.'},
 en:{run:'Run function tests',note:'Actual JavaScript execution in an isolated browser worker, up to 3 seconds. Networking is blocked. Results are local: no server attestation or Mastered status. Check Node.js modules in the downloadable lab.',passed:'Local tests passed.',failed:'Some tests failed. Compare inputs, expected and actual results; fix the code and retry without penalty.',expected:'Expected',actual:'Actual',error:'Execution did not finish. Check syntax, function name and the 3-second limit.'},
 uk:{run:'Запустити тести функції',note:'JavaScript виконується в ізольованому worker браузера до 3 секунд. Мережа заблокована. Результат локальний, без серверного підтвердження чи Mastered. Модулі Node.js перевіряйте в завантаженій лабораторній роботі.',passed:'Локальні тести пройдено.',failed:'Є помилки. Порівняйте вхід, очікування й результат та повторіть без штрафу.',expected:'Очікується',actual:'Отримано',error:'Виконання не завершено. Перевірте синтаксис, ім’я функції та ліміт 3 секунди.'},
 ja:{run:'関数テストを実行',note:'隔離されたブラウザーworkerでJavaScriptを実行します（最大3秒）。ネットワークは禁止。結果はローカルのみで、サーバー認証やMasteredは付与されません。Node.jsモジュールはダウンロードしたラボで確認してください。',passed:'ローカルテストに合格。',failed:'不合格のテストがあります。入力・期待値・実際の結果を比較し、減点なしで再挑戦してください。',expected:'期待値',actual:'実際',error:'実行できませんでした。構文、関数名、3秒の制限を確認してください。'},
 ko:{run:'함수 테스트 실행',note:'격리된 브라우저 worker에서 실제 JavaScript를 최대 3초 실행합니다. 네트워크는 차단됩니다. 로컬 결과이며 서버 인증이나 Mastered를 부여하지 않습니다. Node.js 모듈은 내려받은 실습에서 확인하세요.',passed:'로컬 테스트 통과.',failed:'실패한 테스트가 있습니다. 입력, 예상값, 실제 결과를 비교하고 감점 없이 다시 시도하세요.',expected:'예상',actual:'실제',error:'실행을 완료하지 못했습니다. 문법, 함수 이름 및 3초 제한을 확인하세요.'},
};
function printable(value:unknown){try{return (JSON.stringify(value)??String(value)).slice(0,1200);}catch{return '[unprintable]';}}
export function FunctionPractice({code,execution}:{code:string;execution:Execution}){
 const {user}=useAccount();return <Session key={user?.id??'guest'} code={code} execution={execution}/>;
}
function Session({code,execution}:{code:string;execution:Execution}){
 const locale=useLearningStore(state=>state.language),labels=copy[locale];
 const [running,setRunning]=useState(false),[error,setError]=useState(false),[result,setResult]=useState<{code:string;execution:Execution;checks:FunctionResult[]}|null>(null);
 const sequence=useRef(0);
 async function run(){
  const id=++sequence.current;setRunning(true);setError(false);setResult(null);
  try{
   const checks=await runFunction(code,execution.functionName,execution.tests.map((test,index)=>({...test,name:String(index+1)})));
   if(sequence.current===id)setResult({code,execution,checks});
  }catch{if(sequence.current===id)setError(true);}
  finally{if(sequence.current===id)setRunning(false);}
 }
 const active=result?.code===code&&result.execution===execution?result.checks:null;
 return <section className="practice-validation function-practice"><p className="small muted">{labels.note}</p>
  <button type="button" className="button primary" disabled={running||!code.trim()} onClick={run}>{running?'…':labels.run}</button>
  {error&&<p role="alert">{labels.error}</p>}
  {active&&<div aria-live="polite"><p role="status">{active.every(check=>check.passed)?labels.passed:labels.failed}</p><ol>{active.map((check,index)=><li key={index} className={check.passed?'success-text':'warning-text'}><span aria-hidden="true">{check.passed?'✓':'×'}</span> <code>{execution.functionName}({execution.tests[index].args.map(printable).join(', ')})</code><p>{labels.expected}: <code>{printable(check.expected)}</code></p><p>{labels.actual}: <code>{check.error??printable(check.actual)}</code></p></li>)}</ol></div>}
 </section>;
}
