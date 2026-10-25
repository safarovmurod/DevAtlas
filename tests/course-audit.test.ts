// @vitest-environment node
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {describe,expect,it,vi} from 'vitest';
import {COURSE_CATALOG} from '@/content/courses/catalog';
import {COURSE_IDS} from '@/lib/courses/ids';
import {importedAuditLessons,loadAuditData,summarizeCourse,type AuditLesson} from '../scripts/lib/course-audit';
import type {CourseContent} from '@/lib/courses/schema';
import * as contentLoader from '@/lib/courses/content';

describe('complete source-backed course audits',()=>{
  it('loads all catalog courses, including React and Next.js, with honest day totals',async()=>{
    const {rows}=await loadAuditData();
    expect(new Set(rows.map(row=>row.courseId))).toEqual(new Set(COURSE_IDS));
    expect(rows).toHaveLength(COURSE_CATALOG.length);
    expect(rows.find(row=>row.courseId==='react')).toMatchObject({publishedDays:60});
    expect(rows.find(row=>row.courseId==='nextjs')).toMatchObject({publishedDays:20});
    for(const row of rows){
      expect(row.publishedDays).toBe(COURSE_CATALOG.find(course=>course.id===row.courseId)?.publishedDays);
      expect(row.practices,row.courseId).toBeGreaterThan(0);
      expect(row.totalQuestions,row.courseId).toBeGreaterThan(0);
    }
  },30000);

  it('fails if a real course loader is missing or broken instead of reporting partial coverage',async()=>{
    const original=contentLoader.loadCourseContent;
    const loader=vi.spyOn(contentLoader,'loadCourseContent').mockImplementation(id=>id==='nextjs'?Promise.reject(new Error('Missing Next.js curriculum')):original(id));
    try {await expect(loadAuditData()).rejects.toThrow('Missing Next.js curriculum');}
    finally {loader.mockRestore();}
  },30000);

  it('does not inflate daily quiz coverage with unscheduled library questions',()=>{
    const fixture:AuditLesson={id:'day',day:1,sections:1,theoryWords:70,codeExamples:0,recordedOutputs:0,questionIds:['q1'],practiceCount:1,practiceKind:'written',practiceWords:30,hasReferenceAnswer:true,sources:1,capstone:false,texts:{}};
    const library={...fixture,id:'library',day:null,questionIds:Array.from({length:20},(_,index)=>`reference-${index}`)};
    const summary=summarizeCourse('fixture',[fixture,library],1);
    expect(summary).toMatchObject({publishedDays:1,libraryLessons:1,totalQuestions:21,questionsPerDay:1});
    expect(summary.flags).toContain('few-questions');
  });

  it('counts repeated React quiz IDs once in totals while retaining daily assignments',()=>{
    const fixture:AuditLesson={id:'one',day:1,sections:1,theoryWords:70,codeExamples:1,recordedOutputs:0,questionIds:['shared-q'],practiceCount:1,practiceKind:'manual',practiceWords:30,hasReferenceAnswer:false,sources:1,capstone:false,texts:{}};
    expect(summarizeCourse('fixture',[fixture,{...fixture,id:'two',day:2}],1)).toMatchObject({publishedDays:2,totalQuestions:1,questionsPerDay:1,codeDays:2,codePracticeDays:0});
  });

  it('detects capitalized Tajik scope claims as well as Russian and English',()=>{
    const fixture:AuditLesson={id:'one',day:1,sections:1,theoryWords:70,codeExamples:0,recordedOutputs:0,questionIds:['q'],practiceCount:1,practiceKind:'manual',practiceWords:30,hasReferenceAnswer:false,sources:1,capstone:false,texts:{tg:['Рӯзи 1 аз 2.']}};
    const summary=summarizeCourse('fixture',[fixture,{...fixture,id:'two',day:2,texts:{}},{...fixture,id:'three',day:3,texts:{}}],1);
    expect(summary.staleHits).toContainEqual({id:'one',loc:'tg',sample:'claims 2 days, actually 3'});
    expect(summary.flags).toContain('stale-copy');
  });

  it('matches the application schedule for legacy courses without explicit day numbers',()=>{
    const text={ru:'Example',tg:'Мисол'};
    const course:CourseContent={courseId:'html',sources:[],files:[],lessons:[{id:'reference',title:text,summary:text,level:'beginner',sourceIds:[],sections:[],questions:[]}]};
    expect(importedAuditLessons(course).map(lesson=>lesson.day)).toEqual([1]);
    const scheduled={...course,lessons:[{...course.lessons[0],id:'day',day:1},course.lessons[0]]};
    expect(importedAuditLessons(scheduled).map(lesson=>lesson.day)).toEqual([1,null]);
  });

  it('runs the documented CLI without silently skipping TypeScript-backed courses',()=>{
    const output=execFileSync(process.execPath,[path.join(process.cwd(),'scripts/track-coverage-report.mjs')],{encoding:'utf8',timeout:30000});
    const total=COURSE_CATALOG.reduce((sum,course)=>sum+(course.publishedDays??0),0);
    expect(output).not.toContain('file missing');
    expect(output).toContain('react: 60d');
    expect(output).toContain('nextjs: 20d');
    expect(output).toContain(`Courses audited: ${COURSE_CATALOG.length}/${COURSE_CATALOG.length}`);
    expect(output).toContain(`Total scheduled days across track stages (including React): ${total}`);
    expect(output).toContain(`Total scheduled days across track stages (excluding React): ${total-60}`);
  },40000);
});
