'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {useAccount} from '@/components/account/account-provider';
import {useLearningStore} from '@/stores/learning-store';
import {getSupabaseBrowserClient} from '@/lib/supabase/client';
import {ASSESSMENT_COPY} from '@/lib/practice/assessment-copy';
import type {AssessmentAnswer,AssessmentResponse,AssessmentSubmission,AssessmentView} from '@/lib/practice/assessment';

async function tokenFor(actor:string){
  if(actor==='guest')return undefined;
  const client=getSupabaseBrowserClient();
  if(!client)throw new Error('Session unavailable');
  let timer:ReturnType<typeof setTimeout>|undefined;
  try{
    const {data,error}=await Promise.race([client.auth.getSession(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('Session timeout')),12000);})]);
    if(error||data.session?.user.id!==actor)throw new Error('Session changed');
    return data.session.access_token;
  }finally{clearTimeout(timer);}
}
interface Draft {version:number;variantId:string;answers:Record<string,AssessmentAnswer>}
function readDraft(key:string):{draft:Draft|null;corrupt:boolean}{
  if(typeof window==='undefined')return {draft:null,corrupt:false};
  try{
    const raw=localStorage.getItem(key);if(!raw)return {draft:null,corrupt:false};
    const value=JSON.parse(raw);
    const answerValid=(answer:unknown)=>typeof answer==='string'?answer.length<=500:Array.isArray(answer)?answer.length<=6&&answer.every(item=>typeof item==='string'&&item.length<=120):answer!==null&&typeof answer==='object'&&Object.keys(answer).length<=6&&Object.values(answer).every(item=>typeof item==='string'&&item.length<=120);
    if(!value||!Number.isInteger(value.version)||typeof value.variantId!=='string'||!value.answers||typeof value.answers!=='object'||Array.isArray(value.answers)||Object.keys(value.answers).length>10||!Object.values(value.answers).every(answerValid))return {draft:null,corrupt:true};
    return {draft:{version:value.version,variantId:value.variantId,answers:value.answers},corrupt:false};
  }catch{return {draft:null,corrupt:true};}
}

export function LessonAssessment(props:{courseId:string;lessonId:string;code:string;onPracticePassed?:(code:string)=>void}){
  const {user}=useAccount();
  const actor=user?.id??'guest';
  return <AssessmentSession key={`${actor}:${props.courseId}:${props.lessonId}`} {...props} actor={actor}/>;
}

function AssessmentSession({courseId,lessonId,code,actor,onPracticePassed}:{courseId:string;lessonId:string;code:string;actor:string;onPracticePassed?:(code:string)=>void}){
  const uiLanguage=useLearningStore(state=>state.language),language=useLearningStore(state=>state.contentLanguage);
  const label=(key:keyof typeof ASSESSMENT_COPY)=>ASSESSMENT_COPY[key][uiLanguage];
  const storageKey=`devatlas-assessment-draft-v1:${actor}:${courseId}:${lessonId}`;
  const [restored]=useState(()=>readDraft(storageKey));
  const [view,setView]=useState<AssessmentView|null>(null);
  const [answers,setAnswers]=useState<Record<string,AssessmentAnswer>>({});
  const [hints,setHints]=useState<Record<string,number>>({});
  const [exclude,setExclude]=useState(''),[reload,setReload]=useState(0);
  const [error,setError]=useState(false),[busy,setBusy]=useState(false);
  const [ledger,setLedger]=useState<{attempt_id:string;lesson_version:number;mastered:boolean}[]>([]);
  const [result,setResult]=useState<{response:AssessmentResponse;answers:typeof answers;code:string}|null>(null);
  const request=useRef<AbortController|null>(null),sending=useRef(false);
  const pending=useRef<{payload:AssessmentSubmission;answers:typeof answers;code:string;variant:string}|null>(null);
  useEffect(()=>{
    const controller=new AbortController();
    async function load(){
      try{
        const token=await tokenFor(actor);
        const params=new URLSearchParams({courseId,lessonId});
        if(exclude)params.set('excludeVariant',exclude);
        else if(restored.draft)params.set('variantId',restored.draft.variantId);
        const response=await fetch('/api/assessments?'+params,{headers:token?{Authorization:'Bearer '+token}:{},signal:AbortSignal.any([controller.signal,AbortSignal.timeout(15000)]),cache:'no-store'});
        if(!response.ok)throw new Error('Assessment unavailable');
        const data=await response.json() as AssessmentView;
        if(controller.signal.aborted)return;
        setView(data);setError(false);
        setAnswers(!exclude&&restored.draft?.version===data.version&&restored.draft.variantId===data.variantId?restored.draft.answers:{});
        if(token){
          try{
            const progress=await fetch('/api/assessments/progress?'+new URLSearchParams({courseId,lessonId}),{headers:{Authorization:'Bearer '+token},signal:AbortSignal.any([controller.signal,AbortSignal.timeout(15000)]),cache:'no-store'});
            if(progress.ok){const history=await progress.json();if(!controller.signal.aborted)setLedger(history.attempts??[]);}
          }catch{ /* History availability never prevents a new practice attempt. */ }
        }
      }catch{if(!controller.signal.aborted)setError(true);}
    }
    void load();
    return ()=>{controller.abort();request.current?.abort();};
  },[actor,courseId,lessonId,exclude,reload,restored]);

  function update(id:string,answer:AssessmentAnswer){
    const next={...answers,[id]:answer};setAnswers(next);
    if(view&&!restored.corrupt)try{localStorage.setItem(storageKey,JSON.stringify({version:view.version,variantId:view.variantId,answers:next}));}catch{ /* Keep working in memory without deleting the original draft. */ }
  }
  async function submit(){
    if(!view||sending.current)return;
    sending.current=true;setBusy(true);setError(false);
    const controller=new AbortController();request.current=controller;
    const snapshot=answers,submittedCode=code;
    if(!pending.current||pending.current.answers!==answers||pending.current.code!==code||pending.current.variant!==view.variantId){
      pending.current={answers,code,variant:view.variantId,payload:{courseId,lessonId,version:view.version,variantId:view.variantId,attemptId:crypto.randomUUID(),answers:Object.entries(answers).map(([questionId,answer])=>({questionId,answer})),code}};
    }
    const payload=pending.current.payload;
    try{
      const token=await tokenFor(actor);
      const response=await fetch('/api/assessments',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(payload),signal:AbortSignal.any([controller.signal,AbortSignal.timeout(20000)]),cache:'no-store'});
      if(!response.ok)throw new Error('Assessment failed');
      const data=await response.json() as AssessmentResponse;
      if(controller.signal.aborted)return;
      setResult({response:data,answers:snapshot,code:submittedCode});
      if(data.grade.practice.passed)onPracticePassed?.(submittedCode);
      if(data.attestation==='server')setLedger(old=>old.some(item=>item.attempt_id===data.attemptId)?old:[{attempt_id:data.attemptId,lesson_version:view.version,mastered:data.grade.mastered},...old]);
    }catch{if(!controller.signal.aborted)setError(true);}
    finally{sending.current=false;if(!controller.signal.aborted)setBusy(false);}
  }
  function retry(){
    if(!view)return;
    setExclude(view.variantId);setReload(value=>value+1);setView(null);setAnswers({});setHints({});setResult(null);pending.current=null;
  }
  const active=result?.answers===answers&&result.code===code?result.response:null;
  if(!view)return <section id={`${lessonId}-assessment`} className="panel lesson-assessment" aria-label={label('title')}><p role="status">{error?label('error'):label('loading')}</p>{error&&<button className="button subtle" onClick={()=>setReload(value=>value+1)}>{label('retryLoad')}</button>}</section>;
  return <section id={`${lessonId}-assessment`} className="panel lesson-assessment" aria-label={label('title')}>
    <h3>{label('title')}</h3><h4>{label('goals')}</h4><ul>{view.objectives.map((goal,index)=><li key={index}>{goal[language]}</li>)}</ul>
    <p>{label('practice')}</p>
    {restored.corrupt&&<p role="alert">{label('restoreError')}</p>}
    {ledger.length>0&&<p className="small muted">{label('ledger')}: {ledger.length}. {ledger.some(attempt=>attempt.lesson_version===view.version&&attempt.mastered)?label('recordedMastery'):''}</p>}
    {view.questions.map((question,index)=>{
      const current=answers[question.id],feedback=active?.grade.feedback.find(item=>item.questionId===question.id);
      const options='options' in question?question.options:null;
      return <fieldset key={`${view.variantId}:${question.id}`} className="assessment-question" disabled={busy}>
        <legend>{index+1}. {question.prompt[language]} {question.critical&&<strong>({label('critical')})</strong>}</legend>
        {options?options.map(option=><label className="assessment-choice" key={option.id}>
          <input type={question.kind==='multiple-choice'?'checkbox':'radio'} name={`${view.variantId}:${question.id}`} value={option.id}
            checked={question.kind==='multiple-choice'?Array.isArray(current)&&current.includes(option.id):current===option.id}
            onChange={event=>question.kind==='multiple-choice'?update(question.id,event.target.checked?[...(Array.isArray(current)?current:[]),option.id]:(Array.isArray(current)?current:[]).filter(id=>id!==option.id)):update(question.id,option.id)}/>{option.text[language]}
        </label>):question.kind==='matching'?question.left.map(left=><label className="assessment-match" key={left.id}>{left.text[language]}
          <select aria-label={`${question.prompt[language]} — ${left.text[language]}`} value={current&&typeof current==='object'&&!Array.isArray(current)?current[left.id]??'':''}
            onChange={event=>update(question.id,{...(current&&typeof current==='object'&&!Array.isArray(current)?current:{}),[left.id]:event.target.value})}>
            <option value="">{label('choose')}</option>{question.right.map(right=><option value={right.id} key={right.id}>{right.text[language]}</option>)}
          </select></label>):<input className="assessment-text" aria-label={question.prompt[language]} autoComplete="off" maxLength={500} value={typeof current==='string'?current:''} onChange={event=>update(question.id,event.target.value)}/>}
        <button className="text-link" type="button" disabled={(hints[question.id]??0)>=question.hints.length} onClick={()=>setHints(old=>({...old,[question.id]:(old[question.id]??0)+1}))}>{label('hint')}</button>
        {question.hints.slice(0,hints[question.id]??0).map((hint,index)=><p className="small muted" key={index}>{hint[language]}</p>)}
        {feedback&&<div className={feedback.passed?'success-text':'warning-text'}><p>{feedback.passed?label('correct'):label('needsReview')}: {feedback.explanation[language]}</p><Link href={`/courses/${courseId}/home?day=1#${lessonId}-section-${feedback.relatedSection}`}>{label('review')}</Link></div>}
      </fieldset>;
    })}
    <div className="button-row"><button className="button primary" type="button" disabled={busy||Object.keys(answers).length===0} onClick={()=>void submit()}>{busy?label('submitting'):label('submit')}</button><button className="button subtle" type="button" disabled={busy} onClick={retry}>{label('retry')}</button></div>
    {error&&<p role="alert">{label('error')}</p>}
    {active&&<div className="assessment-result" aria-live="polite"><h4>{active.grade.mastered?label('mastered'):label('needsReview')}</h4><p>{label('quiz')}: {active.grade.quiz.correct}/{active.grade.quiz.total} ({active.grade.quiz.percent}%). {label('critical')}: {active.grade.quiz.criticalCorrect}/{active.grade.quiz.criticalTotal}. {label('code')}: {active.grade.practice.checks.filter(check=>check.passed).length}/{active.grade.practice.checks.length}.</p><p>{active.attestation==='server'?label('server'):active.persistence==='unavailable'?label('unavailable'):label('local')}</p></div>}
  </section>;
}
