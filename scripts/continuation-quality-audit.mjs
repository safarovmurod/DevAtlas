import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const {build}=await import(pathToFileURL(path.join(root,'node_modules/esbuild/lib/main.js')));
const entry=`
import {COURSE_CATALOG,LEARNING_TRACKS} from './src/content/courses/catalog';
import {loadLocalCourseContent as loadCourseContent} from './src/lib/courses/content';
import {courseMonthPlan} from './src/lib/courses/plan';
import {reactMonthDays} from './src/lib/react-plan';
import {questionsForTopic} from './src/content/course';
import {exercisesForTopic} from './src/content/practice';
import {tr} from './src/lib/translate';
import {buildStageCoverage} from './scripts/lib/stage-coverage';
export {COURSE_CATALOG,LEARNING_TRACKS,loadCourseContent,courseMonthPlan,reactMonthDays,questionsForTopic,exercisesForTopic,tr,buildStageCoverage};`;
const bundle=await build({absWorkingDir:root,stdin:{contents:entry,resolveDir:root,sourcefile:'continuation-audit.ts',loader:'ts'},bundle:true,platform:'node',format:'esm',write:false,target:'node22',logLevel:'silent'});
const api=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const locales=['ru','tg','en'];
const percentage=(n,d)=>d?Math.round(n/d*100):0;
const walk=(value,path='',out=[])=>{if(Array.isArray(value))value.forEach((item,i)=>walk(item,path+'['+i+']',out));else if(value&&typeof value==='object'){if('ru'in value&&'tg'in value)out.push({path,...value});else Object.entries(value).forEach(([key,item])=>walk(item,path+'.'+key,out));}return out;};
const rows=[];
for(const meta of api.COURSE_CATALOG){
 if(meta.id==='react'){
  const days=[1,2].flatMap(month=>api.reactMonthDays(month).map(day=>{
   const sections=day.topics.flatMap(topic=>topic.explanation);
   const qs=[...new Map(day.topics.flatMap(topic=>api.questionsForTopic(topic.id).filter(q=>q.options.length>=2)).map(q=>[q.id,q])).values()];
   const ex=day.topics.flatMap(topic=>api.exercisesForTopic(topic,'ru'));
   return {id:'react-m'+month+'-day-'+String(day.day).padStart(2,'0'),day:(month-1)*30+day.day,sections:sections.length,questions:qs.length,feedbackMissing:qs.some(q=>!q.explanation.trim()),practiceMissing:!ex.length,
    practiceCopyCandidates:ex.filter(p=>p.solution.trim().length>30&&day.topics.some(t=>t.code.some(code=>code.trim()===p.solution.trim()))).map(p=>p.id),
    untranslatedBodyCandidates:sections.filter(s=>api.tr(s.text,'en')===s.text||api.tr(s.text,'ru')===s.text).length,
    sourceMissing:day.topics.some(t=>!t.source.trim()),
   };
  }));
  rows.push({courseId:'react',tier:meta.accessTier??'starter',model:'React topics grouped by actual two-month plan; string dictionaries and legacy explanatory feedback',publishedDays:days.length,catalogDays:meta.publishedDays,
   daysWithFewerThan4Sections:days.filter(d=>d.sections<4).map(d=>d.day),daysWithFewerThan3Questions:days.filter(d=>d.questions<3).map(d=>d.day),
   daysWithMissingLinkedHints:null,daysWithEmptyExplanationFields:days.filter(d=>d.feedbackMissing).map(d=>d.day),daysWithoutPractice:days.filter(d=>d.practiceMissing).map(d=>d.day),
   missingTranslations:null,translationFallbackCandidates:days.filter(d=>d.untranslatedBodyCandidates).map(d=>({day:d.day,sections:d.untranslatedBodyCandidates})),
   daysWithPracticeSolutionInTheoryCandidates:days.filter(d=>d.practiceCopyCandidates.length).map(d=>({day:d.day,exerciseIds:d.practiceCopyCandidates})),
   note:'React has no imported-course hint/relatedSection fields; do not mark all hints missing from a schema mismatch. Translation equality is a candidate, not proof of missing translation. Practice exact code equality is a manual-review signal.',dayEvidence:days});
  continue;
 }
 const course=await api.loadCourseContent(meta.id),plan=api.courseMonthPlan(course.lessons);
 const days=plan.map(({day,lesson})=>{
  const texts=walk(lesson),q=lesson.questions,practice=lesson.practice;
  const missingTranslations=texts.flatMap(t=>locales.filter(locale=>!t[locale]?.trim()).map(locale=>({path:t.path,locale})));
  const equalBodies=lesson.sections.flatMap((s,i)=>[['tg','ru'],['en','ru']].filter(([a,b])=>s.body[a]?.trim()===s.body[b]?.trim()).map(([a,b])=>({section:i,locales:[a,b]})));
  const lines=(practice?.solution??'').split('\n').map(s=>s.trim()).filter(s=>s.length>30);
  const theory=lesson.sections.map(s=>(s.code??'')+' '+s.body.ru).join(' ');
  const matched=lines.filter(s=>theory.includes(s));
  return {day,id:lesson.id,sections:lesson.sections.length,questions:q.length,
   missingLinkedHintIds:q.filter(x=>!x.hint||x.relatedSection===undefined||locales.some(locale=>!x.hint?.[locale]?.trim())).map(x=>x.id),
   missingTranslations,equalBodyCandidates:equalBodies,practiceMissing:!practice,
   written:practice?.kind==='written',rubric:Boolean(practice?.rubric),javascriptExecution:Boolean(practice?.execution),
   practiceSolutionInTheoryCandidate:lines.length>0&&matched.length/lines.length>0.6,
   matchingSolutionLines:matched.length,substantiveSolutionLines:lines.length,
   copyingTaskCandidate:/код из примера|кодом из примера|наберите программу|повторите пример|сохраните пример|скопируйте пример/i.test(practice?.task.ru??''),
   sourceMissing:!lesson.sourceIds.length,
  };
 });
 const qs=plan.flatMap(({lesson})=>lesson.questions),positions=[0,0,0,0,0,0];
 qs.forEach(q=>positions[q.correctIndex]++);
 const longest=qs.filter(q=>q.options[q.correctIndex].ru.length===Math.max(...q.options.map(o=>o.ru.length))).length;
 const duplicateSolutions=new Map();
 for(const {day,lesson} of plan){const sol=lesson.practice?.solution.trim();if(sol&&sol.length>30)duplicateSolutions.set(sol,[...(duplicateSolutions.get(sol)??[]),day]);}
 rows.push({courseId:meta.id,tier:meta.accessTier??'starter',model:'Imported course through loadCourseContent + courseMonthPlan',publishedDays:plan.length,catalogDays:meta.publishedDays,libraryLessons:course.lessons.length-plan.length,
  daysWithFewerThan4Sections:days.filter(d=>d.sections<4).map(d=>d.day),daysWithFewerThan3Questions:days.filter(d=>d.questions<3).map(d=>d.day),
  daysWithMissingLinkedHints:days.filter(d=>d.missingLinkedHintIds.length).map(d=>({day:d.day,questionIds:d.missingLinkedHintIds})),
  daysWithoutPractice:days.filter(d=>d.practiceMissing).map(d=>d.day),
  missingTranslations:days.filter(d=>d.missingTranslations.length).map(d=>({day:d.day,fragments:d.missingTranslations})),
  equalBodyCandidates:days.filter(d=>d.equalBodyCandidates.length).map(d=>({day:d.day,fragments:d.equalBodyCandidates})),
  daysWithPracticeSolutionInTheoryCandidates:days.filter(d=>d.practiceSolutionInTheoryCandidate).map(d=>({day:d.day,matched:d.matchingSolutionLines,lines:d.substantiveSolutionLines})),
  copyingTaskCandidates:days.filter(d=>d.copyingTaskCandidate).map(d=>d.day),duplicatePracticeSolutionCandidates:[...duplicateSolutions.values()].filter(ds=>ds.length>1),
  correctPositionCounts:positions.slice(0,Math.max(3,...qs.map(q=>q.options.length))),dominantCorrectPositionPercent:percentage(Math.max(...positions),qs.length),longestCorrectOptionRuPercentIncludingTies:percentage(longest,qs.length),
  writtenDays:days.filter(d=>d.written).length,writtenDaysWithRubric:days.filter(d=>d.written&&d.rubric).length,javascriptExecutionDays:days.filter(d=>d.javascriptExecution).length,
  note:'Structural omissions are observed. Position/length patterns, same-language bodies, duplicated solutions and solution/theory overlap require manual review. No source/runtimes/independent pedagogy verification is granted by this audit.',dayEvidence:days});
}
const matrix=api.buildStageCoverage(rows,api.LEARNING_TRACKS);
const blueprints=JSON.parse(await readFile(path.join(root,'docs/curriculum-design/short-courses.draft.json'),'utf8')).courses;
const pendingShort=blueprints.flatMap(plan=>{const row=rows.find(row=>row.courseId===plan.courseId);return row.publishedDays<plan.plannedTotalDays?[{courseId:plan.courseId,publishedDays:row.publishedDays,plannedDays:plan.plannedTotalDays,remainingDays:plan.plannedTotalDays-row.publishedDays,nextDay:row.publishedDays+1}]:[]});
const structural=rows.filter(row=>row.daysWithFewerThan4Sections.length||row.daysWithFewerThan3Questions.length||row.daysWithMissingLinkedHints?.length||row.daysWithoutPractice.length||row.missingTranslations?.length);
const candidate=rows.filter(row=>structural.includes(row)||row.daysWithPracticeSolutionInTheoryCandidates.length||row.equalBodyCandidates?.length||row.translationFallbackCandidates?.length||row.daysWithEmptyExplanationFields?.length||row.copyingTaskCandidates?.length||row.duplicatePracticeSolutionCandidates?.length||row.dominantCorrectPositionPercent>45||row.longestCorrectOptionRuPercentIncludingTies>45);
const output={schemaVersion:1,reviewedOn:'2026-11-17',scope:'Current actual application loaders for all catalog courses; read-only structural/candidate audit for continuation. No new authoring.',
 limits:['Counts are not independent editorial, pedagogical, translation, source-license, runtime-execution or learner-outcome verification.','A source URL or sourceId does not prove its linked text was read.','Position and length statistics are review heuristics; preserve existing quiz IDs and option order unless explicitly authorized otherwise.','Practice-solution overlap is heuristic and requires comparing task inputs and worked example before editing.','React uses a different content model. Imported-course hint/rubric metrics must not be projected onto it.','Published stage inventory is distinct from Verified mastery and actual live deployment.'],
 summary:{courses:rows.length,tracks:api.LEARNING_TRACKS.length,scheduledDays:rows.reduce((n,r)=>n+r.publishedDays,0),catalogMismatches:rows.filter(r=>r.publishedDays!==r.catalogDays).map(r=>({courseId:r.courseId,catalog:r.catalogDays,loader:r.publishedDays})),coursesWithObservedStructuralGaps:structural.length,structuralGapCourseIds:structural.map(r=>r.courseId),coursesWithStructuralOrHeuristicReviewFlags:candidate.length,flaggedCourseIds:candidate.map(r=>r.courseId),shortCourseDaysRemaining:pendingShort.reduce((n,p)=>n+p.remainingDays,0),coursesWithKnownAuthoringOrStructuralWork:new Set([...structural.map(r=>r.courseId),...pendingShort.map(p=>p.courseId)]).size,priorityQueueIncludingHeuristics:[...new Set([...candidate.map(r=>r.courseId),...pendingShort.map(p=>p.courseId)])],missingStages:matrix.filter(r=>r.status==='Missing').length},
 shortCourseAuthoringRemaining:pendingShort,fourteenDayContinuation:['typescript','algorithms','ai-fundamentals','context-engineering','agent-harness'].map(courseId=>({courseId,publishedDays:rows.find(r=>r.courseId===courseId).publishedDays,status:'Reviewed continuation remains in accepted delivery scope; no arbitrary new duration inferred by this audit.'})),
 missingStagePrograms:matrix.filter(r=>r.status==='Missing').map(({trackId,stage,proposedCourseId,pendingVerification})=>({trackId,stage,proposedCourseId,pendingVerification})),courses:rows};
await writeFile(path.join(root,'docs/audits/continuation-quality-2026-11-17.json'),JSON.stringify(output,null,2)+'\n');
const lines=['# DevAtlas continuation audit — 17 November 2026','',
 'Source: all actual application loaders and schedules, including the React two-month plan and Next.js overlays. This is a structural audit and review queue. It does not certify correctness, teaching effectiveness, source review, compiler execution or mastery.','',
 `${output.summary.courses} courses; ${output.summary.tracks} tracks; ${output.summary.scheduledDays} scheduled days. ${structural.length} courses have observed structural omissions under the imported-course four-section / three-question / linked-hint / complete-RU-TG-EN contract. ${candidate.length} courses have a structural omission or a heuristic review signal. Authoring-plan deltas are counted separately below. Every course still requires its own semantic and evidence review before declaring it fully verified.`,
 '',`Short-course authoring remaining: ${pendingShort.map(p=>p.courseId+' '+p.publishedDays+'/'+p.plannedDays+', resume day '+p.nextDay).join('; ')||'none'}. Missing stage programs: ${output.summary.missingStages}. The five current 14-day courses require reviewed continuation; a desired new total is not invented here.`,
 '', '| Course | Days | <4 sections | <3 questions | Days missing linked hints | Empty React explanation days | Missing translation days | Theory/solution overlap candidates | Dominant answer % / longest RU % |', '|---|---:|---:|---:|---:|---:|---:|---:|---|',
 ...rows.map(r=>`| ${r.courseId} | ${r.publishedDays} | ${r.daysWithFewerThan4Sections.length} | ${r.daysWithFewerThan3Questions.length} | ${r.daysWithMissingLinkedHints===null?'separate model':r.daysWithMissingLinkedHints.length} | ${r.daysWithEmptyExplanationFields?.length??'—'} | ${r.missingTranslations===null?'dictionary candidates only':r.missingTranslations.length} | ${r.daysWithPracticeSolutionInTheoryCandidates.length} | ${r.dominantCorrectPositionPercent===undefined?'separate model':r.dominantCorrectPositionPercent+' / '+r.longestCorrectOptionRuPercentIncludingTies} |`),
 '', '## How to use this queue', '',
 '- Assign one existing course to one author agent. Keep shared catalog, reports, loader configuration, progress semantics and final integration under the primary agent. Run as many course agents as the actual environment supports; queue the rest in waves.',
 '- All twelve short-course plans currently meet their scheduled-day targets, including Management30/30 and Digital Literacy30/30. Preserve existing authored days, IDs, prerequisites and original option order. Remaining work is semantic/source/localization/independent-practice review; do not recreate completed short-course days.',
 '- Structural omissions contain exact day/question/field coordinates in the JSON. Heuristics identify candidates only: read the actual theory, task, expected answer and UI before deciding a change is necessary.',
 '- Four sections and three questions are the current minimum authored-day structural contract, not a definition of full delivery. Approved strict delivery also calls for meaningful assessment/retry variants, 5–10 checks where appropriate, projects, source/version/license evidence and honest review methods. Do not duplicate questions or pad prose to reach counts.',
 '- Empty React explanation fields are observed data, but the answer is still displayed by QuestionAnswer. This is a meaningful-feedback review candidate, not proof that the UI gives no feedback.',
 '- React and Next.js already have at least4 sections and3 questions on every scheduled day. Their old 2026-11-15 thin-theory handoff is stale. Inspect remaining independent-practice, translation, execution and assessment evidence instead of recreating finished additions.',
 '- The72 Missing stages are absent programs rather than gaps in existing lessons. Author them only against an accepted distinct stage syllabus, prerequisites, source scope and separate progress. A Coming Soon card is not a curriculum.',
 '- A source URL is not proof of source review. Read authoritative primary sources, retain exact inspected URLs/version/license notes, create original RU/TG/EN text, and execute code in real suitable runtimes. Unavailable runtimes remain unverified.',
 '- The primary agent must review each completed course, return concrete findings to its owning agent, rerun relevant checks after fixes, and integrate only the reviewed course. A status report by the author is not independent review.',
 '', '## Boundaries', '', ...output.limits.map(v=>'- '+v),'',
 'Machine-readable evidence: [continuation-quality-2026-11-17.json](continuation-quality-2026-11-17.json). This audit intentionally does not include every premium lesson body in a public artifact.',''];
await writeFile(path.join(root,'docs/audits/continuation-quality-2026-11-17.md'),lines.join('\n'));
console.log(JSON.stringify(output.summary,null,2));
