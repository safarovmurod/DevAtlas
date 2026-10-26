'use client';
import {useEffect,useState} from 'react';
import {useAccount} from '@/components/account/account-provider';
import {useLearningStore} from '@/stores/learning-store';
import {courseText,type CourseText} from '@/lib/courses/schema';
import type {ImportedCourseId} from '@/lib/courses/ids';
import type {InterfaceLocale} from '@/lib/locale';
import {writtenAnswerHash,writtenReviewSchema,reviewSummary,type WrittenReview,type WrittenRubric} from '@/lib/practice/written-review';
const t=(ru:string,tg:string,en:string,uk:string,ja:string,ko:string):Record<InterfaceLocale,string>=>({ru,tg,en,uk,ja,ko});
const copy={
 title:t('Рубрика: самостоятельная оценка','Рубрика: худбаҳодиҳӣ','Rubric: self review','Рубрика: самооцінювання','ルーブリック：自己評価','루브릭: 자체 평가'),
 note:t('Выберите описание, которое подтверждается вашим текстом. Это Self Reviewed: оценка не является Auto Verified, AI Feedback или Human Reviewed и не даёт подтверждённого Mastered.','Тавсиферо интихоб кунед, ки матнатон онро тасдиқ мекунад. Ин Self Reviewed аст: на Auto Verified, AI Feedback ё Human Reviewed; Mastered-и тасдиқшуда намедиҳад.','Choose the description supported by your text. This is Self Reviewed, not Auto Verified, AI Feedback or Human Reviewed, and grants no verified Mastered status.','Оберіть опис, який підтверджує ваш текст. Це Self Reviewed, а не Auto Verified, AI Feedback чи Human Reviewed; підтверджений Mastered не надається.','文章で裏付けられる説明を選んでください。Self Reviewedは自己評価であり、自動検証・AI評価・人による審査やMasteredの認証ではありません。','글로 뒷받침할 수 있는 설명을 선택하세요. Self Reviewed는 자체 평가이며 자동 검증, AI 피드백, 사람의 심사 또는 Mastered 인증이 아닙니다.'),
 reflection:t('Обоснуйте самооценку и следующий шаг','Худбаҳодиҳӣ ва қадами баъдиро асоснок кунед','Explain your rating and next step','Обґрунтуйте самооцінку й наступний крок','自己評価の根拠と次の行動','자체 평가 근거와 다음 단계'),
 save:t('Сохранить Self Reviewed и продолжить','Self Reviewed-ро сабт карда идома диҳед','Save Self Reviewed and continue','Зберегти Self Reviewed і продовжити','Self Reviewedを保存して続ける','Self Reviewed 저장 후 계속'),
 saved:t('Сохранено как Self Reviewed. Самостоятельное обучение можно продолжить.','Ҳамчун Self Reviewed сабт шуд. Омӯзиши мустақилро идома додан мумкин.','Saved as Self Reviewed. You can continue self-study.','Збережено як Self Reviewed. Можна продовжити самостійне навчання.','Self Reviewedとして保存しました。自主学習を続けられます。','Self Reviewed로 저장했습니다. 자체 학습을 계속할 수 있습니다.'),
 working:t('Сохраняем…','Сабт мешавад…','Saving…','Збереження…','保存中…','저장 중…'),
 score:t('Самооценка','Худбаҳодиҳӣ','Self rating','Самооцінка','自己評価','자체 평가'),
 review:t('Есть критерии для доработки. Используйте пример ниже и повторите оценку без штрафа.','Меъёрҳо барои беҳтаркунӣ ҳастанд. Намунаи поёнро истифода бурда, бе ҷарима такрор кунед.','Some criteria need work. Use the example below and retry without a penalty.','Деякі критерії потребують доопрацювання. Скористайтеся прикладом нижче й повторіть без штрафу.','改善が必要な項目があります。下の例を参考に減点なしで再評価できます。','개선이 필요한 기준이 있습니다. 아래 예시를 참고해 감점 없이 다시 평가하세요.'),
 error:t('Не удалось сохранить оценку. Текст и исходная запись не удалены.','Баҳо сабт нашуд. Матн ва сабти аслӣ нест нашуданд.','Could not save the review. Text and the original record remain.','Не вдалося зберегти оцінку. Текст і початковий запис залишилися.','評価を保存できません。文章と元の記録は残っています。','평가를 저장하지 못했습니다. 글과 원래 기록은 유지됩니다.'),
 recovery:t('Предыдущая оценка несовместима. При сохранении новой исходная запись останется в резервной копии.','Баҳодиҳии пешина мувофиқ нест. Ҳангоми сабти нав сабти аслӣ дар нусхаи эҳтиётӣ мемонад.','The previous review is incompatible. Saving a new one keeps the original in a recovery copy.','Попередня оцінка несумісна. Нова оцінка збереже початковий запис у резервній копії.','以前の評価は互換性がありません。新規保存時に元の記録を復旧用コピーへ残します。','이전 평가와 호환되지 않습니다. 새 평가를 저장할 때 원본을 복구 사본으로 보존합니다.'),
 stale:t('Оценка относится к другому черновику. Проверьте критерии заново перед сохранением.','Баҳо ба сиёҳнависи дигар тааллуқ дорад. Пеш аз сабт меъёрҳоро боз санҷед.','The review belongs to a different draft. Recheck the criteria before saving.','Оцінка стосується іншої чернетки. Перевірте критерії перед збереженням.','別の下書きに対する評価です。保存前に基準を再確認してください。','다른 초안에 대한 평가입니다. 저장 전에 기준을 다시 확인하세요.'),
};
interface Props {courseId:ImportedCourseId;lessonId:string;answer:string;rubric:WrittenRubric;criteria:CourseText[]}
export function WrittenRubricReview(props:Props){const {user}=useAccount();return <ReviewSession key={`${user?.id??'guest'}:${props.courseId}:${props.lessonId}`} {...props}/>;}
function ReviewSession({courseId,lessonId,answer,rubric,criteria}:Props){
 const language=useLearningStore(state=>state.language),content=useLearningStore(state=>state.contentLanguage),label=(key:keyof typeof copy)=>copy[key][language];
 const key=`written-review-v${rubric.version}:${lessonId}`;
 const [original]=useState(()=>useLearningStore.getState().courses[courseId]?.drafts[key]);
 const [restored]=useState(()=>{
  try{if(!original)return null;const value=writtenReviewSchema.parse(JSON.parse(original));reviewSummary(rubric,value);return value;}
  catch{return null;}
 });
 const [ratings,setRatings]=useState<Record<string,number>>(restored?.ratings??{}),[reflection,setReflection]=useState(restored?.reflection??'');
 const [saved,setSaved]=useState<WrittenReview|null>(restored),[digest,setDigest]=useState<{answer:string;hash:string}|null>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState(false);
 useEffect(()=>{let disposed=false;void writtenAnswerHash(answer).then(hash=>{if(!disposed)setDigest({answer,hash});}).catch(()=>{if(!disposed)setError(true);});return()=>{disposed=true;};},[answer]);
 const active=saved&&digest?.answer===answer&&saved.answerSha256===digest.hash&&saved.ratings===ratings&&saved.reflection===reflection?reviewSummary(rubric,saved):null;
 async function save(){
  if(busy)return;setBusy(true);setError(false);
  const scope=useLearningStore.persist.getOptions().name;
  try{
   const hash=await writtenAnswerHash(answer);
   if(useLearningStore.persist.getOptions().name!==scope||useLearningStore.getState().courses[courseId]?.drafts[lessonId]!==answer)return;
   const value=writtenReviewSchema.parse({method:'Self Reviewed',rubricVersion:rubric.version,answerSha256:hash,ratings,reflection});reviewSummary(rubric,value);
   const state=useLearningStore.getState();
   if(original&&!restored&&!saved)state.saveCourseDraft(courseId,`${key}:recovery:${Date.now()}`,original);
   state.saveCourseDraft(courseId,key,JSON.stringify(value));
   state.completeCoursePractice(courseId,lessonId,false);
   setSaved(value);setRatings(value.ratings);setReflection(value.reflection);setDigest({answer,hash});
  }catch{setError(true);}finally{setBusy(false);}
 }
 return <section className="written-rubric-review" aria-label={label('title')}><h3>{label('title')}</h3><p>{label('note')}</p>
  {original&&!restored&&!saved&&<p role="alert">{label('recovery')}</p>}
  {saved&&digest?.answer===answer&&saved.answerSha256!==digest.hash&&<p>{label('stale')}</p>}
  {rubric.criteria.map((criterion,index)=><fieldset className="assessment-question" disabled={busy} key={criterion.id}><legend>{courseText(criteria[index],content)}</legend>{criterion.levels.map((level,rating)=><label className="assessment-choice" key={rating}><input type="radio" name={`${lessonId}:${criterion.id}`} checked={ratings[criterion.id]===rating} onChange={()=>setRatings(old=>({...old,[criterion.id]:rating}))}/><span>{rating}/2 — {courseText(level,content)}</span></label>)}</fieldset>)}
  <ul>{rubric.reviewQuestions.map((question,index)=><li key={index}>{courseText(question,content)}</li>)}</ul>
  <label>{label('reflection')}<textarea aria-label={label('reflection')} rows={5} maxLength={8000} value={reflection} onChange={event=>setReflection(event.target.value)}/></label>
  <button type="button" className="button subtle" disabled={busy||!answer.trim()||reflection.trim().length<20||rubric.criteria.some(item=>![0,1,2].includes(ratings[item.id]))} onClick={()=>void save()}>{busy?label('working'):label('save')}</button>
  {error&&<p role="alert">{label('error')}</p>}
  {active&&<div className="written-review-result" aria-live="polite"><p role="status">{label('saved')} {label('score')}: {active.percent}%.</p>{active.needsReview&&<p>{label('review')}</p>}</div>}
 </section>;
}
