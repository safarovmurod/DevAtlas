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
      expect(lesson.practice?.task[locale]).toContain(lesson.sections[2].body[locale]);
    }
    for(const question of lesson.questions){
      expect(question.options.length).toBeGreaterThanOrEqual(3);
      expect(question.answer).toEqual(question.options[question.correctIndex]);
    }
  }
});

const compiler=process.env.KOTLINC||'kotlinc';
const probe=spawnSync(compiler,['-version'],{encoding:'utf8',timeout:15000});
it.skipIf(probe.status!==0)('executes all Kotlin solutions and rejects broken project behavior',()=>{
  const result=spawnSync(process.execPath,[path.join(process.cwd(),'scripts/verify-kotlin-examples.mjs')],{encoding:'utf8',timeout:180000,maxBuffer:1024*1024});
  expect(result.error).toBeUndefined();
  expect(result.status,result.stderr+'\n'+result.stdout).toBe(0);
  expect(result.stdout).toContain('30/30 examples passed; negative input and overflow rejected; broken deletion detected.');
},200000);
