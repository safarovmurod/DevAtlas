// @vitest-environment node
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {expect,it} from 'vitest';
import {loadCourseContent} from '@/lib/courses/content';
import {COURSE_CATALOG} from '@/content/courses/catalog';

it('publishes thirty free Kotlin days with translated explanations and boundary tasks',async()=>{
  const course=await loadCourseContent('kotlin');
  expect(COURSE_CATALOG.find(item=>item.id==='kotlin')).toMatchObject({publishedDays:30,runtime:'local'});
  expect(COURSE_CATALOG.find(item=>item.id==='kotlin')?.accessTier).toBeUndefined();
  for(const lesson of course.lessons.slice(2)){
    expect(lesson.practice?.kind).toBe('code');
    for(const locale of ['ru','tg','en'] as const){
      const prose=lesson.sections.map(section=>section.body[locale]).join(' ');
      expect(prose.trim().split(/\s+/).length,`${lesson.id} ${locale}`).toBeGreaterThanOrEqual(120);
      expect(lesson.sections[2].body[locale]?.length).toBeGreaterThan(60);
      expect(lesson.practice?.task[locale]?.length).toBeGreaterThan(100);
      expect(lesson.practice?.task[locale], lesson.id).not.toBe(lesson.sections[2].body[locale]);
      expect(lesson.practice?.criteria.every(criterion => Boolean(criterion[locale]))).toBe(true);
    }
    for(const question of lesson.questions){
      expect(question.options.length).toBeGreaterThanOrEqual(3);
      expect(question.answer).toEqual(question.options[question.correctIndex]);
    }
  }
});

it('keeps guided examples separate from independent tasks and records each practice output', async()=>{
  const course=await loadCourseContent('kotlin');
  for(const lesson of course.lessons){
    const solution=lesson.practice!.solution;
    expect(solution,lesson.id).not.toBe(lesson.sections[0].code);
    expect(solution.match(/^\/\/ Expected output:$/gm),lesson.id).toHaveLength(1);
    const expected=solution.split('// Expected output:\n')[1] ?? '';
    expect(expected.trim(),lesson.id).toBeTruthy();
    expect(expected.trim().split('\n').every(line=>line.startsWith('//')),lesson.id).toBe(true);
    expect(lesson.sections[0].output?.en,lesson.id).toBeTruthy();
  }
});

const verifier=path.join(process.cwd(),'scripts/verify-kotlin-examples.mjs');
const probe=spawnSync(process.execPath,[verifier,'--probe'],{encoding:'utf8',timeout:25000,windowsHide:true});
it.skipIf(probe.status===2)('executes Kotlin examples and independent solutions and rejects broken project behavior',()=>{
  expect(probe.error).toBeUndefined();
  expect(probe.status,probe.stderr).toBe(0);
  const result=spawnSync(process.execPath,[verifier],{encoding:'utf8',timeout:180000,maxBuffer:1024*1024,windowsHide:true});
  expect(result.error).toBeUndefined();
  expect(result.status,result.stderr+'\n'+result.stdout).toBe(0);
  expect(result.stdout).toContain('30/30 guided examples and 30/30 independent solutions passed; negative input and overflow rejected; broken deletion detected.');
},200000);
