import {COURSE_CATALOG, LEARNING_TRACKS} from '@/content/courses/catalog';
import {COURSE_IDS} from '@/lib/courses/ids';
import {loadCourseContent} from '@/lib/courses/content';
import type {CourseContent, CourseLesson} from '@/lib/courses/schema';
import {reactMonthDays} from '@/lib/react-plan';
import {questionsForTopic} from '@/content/course';
import {exercisesForTopic} from '@/content/practice';
import {tr} from '@/lib/translate';

type Locale = 'ru'|'tg'|'en';
export interface AuditLesson {
  id:string;
  day:number|null;
  sections:number;
  theoryWords:number;
  codeExamples:number;
  recordedOutputs:number;
  questionIds:string[];
  practiceCount:number;
  practiceKind:string;
  practiceWords:number;
  hasReferenceAnswer:boolean;
  sources:number;
  capstone:boolean;
  texts:Partial<Record<Locale,string[]>>;
}
const words=(value:string)=>value.trim().split(/\s+/).filter(Boolean).length;
const project=(title:string)=>/проект|project|кейс|case|анализатор|TODO API|планировщик|scheduler/i.test(title);
const locales=['ru','en','tg'] as const;

function importedLesson(lesson:CourseLesson):AuditLesson {
  return {
    id:lesson.id,day:lesson.day??null,sections:lesson.sections.length,
    theoryWords:lesson.sections.reduce((sum,section)=>sum+words(section.body.ru),0),
    codeExamples:lesson.sections.filter(section=>section.code?.trim()).length,
    recordedOutputs:lesson.sections.filter(section=>section.output?.en!==undefined).length,
    questionIds:lesson.questions.map(question=>question.id),practiceCount:lesson.practice?1:0,
    practiceKind:lesson.practice?.kind??'unspecified',
    practiceWords:words(lesson.practice?.task.ru??''),hasReferenceAnswer:Boolean(lesson.practice?.referenceAnswer),
    sources:lesson.sourceIds.length,capstone:project(lesson.title.ru),
    texts:Object.fromEntries(locales.map(locale=>[locale,[lesson.summary[locale],...lesson.sections.map(section=>section.body[locale]),lesson.practice?.task[locale],lesson.practice?.hint[locale]].filter((text):text is string=>Boolean(text))])),
  };
}

export function importedAuditLessons(course:CourseContent):AuditLesson[] {
  // Match courseMonthPlan: legacy courses without explicit day fields schedule
  // every lesson; explicitly scheduled courses may retain an unscheduled library.
  const scheduled=course.lessons.some(lesson=>lesson.day!==undefined);
  return course.lessons.map((lesson,index)=>importedLesson(scheduled?lesson:{...lesson,day:index+1}));
}

function reactAuditLessons():AuditLesson[] {
  return [1,2].flatMap(month=>reactMonthDays(month).map(day=>{
    const topics=day.topics;
    const exercises=topics.flatMap(topic=>exercisesForTopic(topic,'ru'));
    const sections=topics.flatMap(topic=>topic.explanation);
    return {
      // Audit coordinates only: preserve the app's month/day pairs and reuse its
      // actual topics, exercises and quiz IDs instead of creating course content.
      id:`react-m${month}-day-${String(day.day).padStart(2,'0')}`,day:(month-1)*30+day.day,
      sections:sections.length,theoryWords:sections.reduce((sum,part)=>sum+words(tr(part.text,'ru')),0),
      codeExamples:topics.reduce((sum,topic)=>sum+topic.code.filter(code=>code.trim()).length,0),
      recordedOutputs:0,
      questionIds:[...new Set(topics.flatMap(topic=>questionsForTopic(topic.id).filter(question=>question.options.length>=2).map(question=>question.id)))],
      practiceCount:exercises.length,practiceKind:'manual',practiceWords:exercises.reduce((sum,exercise)=>sum+words(exercise.task),0),
      hasReferenceAnswer:false,sources:new Set(topics.map(topic=>topic.source).filter(Boolean)).size,
      capstone:project(day.title),texts:{ru:sections.map(part=>tr(part.text,'ru'))},
    };
  }));
}

export function summarizeCourse(courseId:string, lessons:AuditLesson[], sourceCount:number) {
  const published=lessons.filter(lesson=>lesson.day!==null);
  const uniqueQuestions=new Set(lessons.flatMap(lesson=>lesson.questionIds));
  const staleHits:{id:string;loc:string;sample:string}[]=[];
  for(const lesson of lessons) for(const locale of locales){
    for(const text of lesson.texts[locale]??[]){
      for(const match of text.matchAll(/(?:День|Day|[Рр]ӯзи)\s+\d+\s+(?:из|of|аз)\s+(\d+)\b/g)){
        if(published.length>0&&Number(match[1])!==published.length)staleHits.push({id:lesson.id,loc:locale,sample:`claims ${match[1]} days, actually ${published.length}`});
      }
      if(published.length>2) for(const match of text.matchAll(/двухдневн|two introductory days|two-day course|two-day introductory|аз ду рӯз|из двух дней|Two-day introduction/g))staleHits.push({id:lesson.id,loc:locale,sample:match[0]});
    }
  }
  const avgTheoryWords=published.length?Math.round(published.reduce((sum,lesson)=>sum+lesson.theoryWords,0)/published.length):0;
  // Library questions must not inflate the published-day question average.
  const questionsPerDay=published.length?+(published.reduce((sum,lesson)=>sum+lesson.questionIds.length,0)/published.length).toFixed(1):0;
  const missingSourceLessons=lessons.filter(lesson=>lesson.sources===0).length;
  const flags:string[]=[];
  if(avgTheoryWords<60)flags.push('thin-theory');
  if(questionsPerDay<2)flags.push('few-questions');
  if(staleHits.length)flags.push('stale-copy');
  if(missingSourceLessons)flags.push('missing-sources');
  return {
    courseId,publishedDays:published.length,libraryLessons:lessons.length-published.length,
    sources:sourceCount,lessons,staleHits,avgTheoryWords,
    minTheoryWords:published.length?Math.min(...published.map(lesson=>lesson.theoryWords)):0,
    maxTheoryWords:published.length?Math.max(...published.map(lesson=>lesson.theoryWords)):0,
    totalQuestions:uniqueQuestions.size,questionsPerDay,
    practices:lessons.reduce((sum,lesson)=>sum+lesson.practiceCount,0),
    codeDays:published.filter(lesson=>lesson.codeExamples>0).length,
    writtenDays:published.filter(lesson=>lesson.practiceKind==='written').length,
    codePracticeDays:published.filter(lesson=>lesson.practiceKind==='code').length,
    projectDays:published.filter(lesson=>lesson.capstone).length,missingSourceLessons,flags,
  };
}

export async function loadAuditData() {
  const catalogIds=COURSE_CATALOG.map(course=>course.id);
  if(catalogIds.length!==new Set(catalogIds).size||COURSE_IDS.some(id=>!catalogIds.includes(id))||catalogIds.length!==COURSE_IDS.length)throw new Error('Audit catalog must include every course exactly once.');
  const rows=await Promise.all(COURSE_CATALOG.map(async entry=>{
    const content=entry.id==='react'?null:await loadCourseContent(entry.id);
    const lessons=content?importedAuditLessons(content):reactAuditLessons();
    const summary=summarizeCourse(entry.id,lessons,content?.sources.length??new Set(reactMonthDays(1).concat(reactMonthDays(2)).flatMap(day=>day.topics.map(topic=>topic.source))).size);
    if(summary.publishedDays!==entry.publishedDays)throw new Error(`${entry.id}: catalog declares ${entry.publishedDays} days, audited ${summary.publishedDays}.`);
    return {tier:entry.accessTier??'starter',...summary};
  }));
  return {rows,tracks:LEARNING_TRACKS};
}
