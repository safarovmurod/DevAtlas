// @vitest-environment node
import {it,expect} from 'vitest';
import {readFile} from 'node:fs/promises';
import {courseContentSchema} from '@/lib/courses/schema';

it('Mobile day 3 draft has unique trilingual checks and matches the Expo example, while publication remains unchanged',async()=>{
 const course=JSON.parse(await readFile('src/content/courses/mobile.json','utf8'));
 const draft=JSON.parse(await readFile('content/mobile-lab/drafts/day-03.json','utf8'));
 const parsed=courseContentSchema.parse({...course,lessons:[...course.lessons,draft]});
 expect(course.lessons.map((lesson:{id:string})=>lesson.id)).toEqual(['mobile-day-01','mobile-day-02']);
 expect(parsed.lessons[2].prerequisiteDays).toEqual([2]);
 expect(new Set(draft.questions.map((question:{id:string})=>question.id)).size).toBe(5);
 for(const section of draft.sections)for(const language of ['ru','tg','en'])expect(section.body[language].length).toBeGreaterThan(100);
 expect(draft.sections[1].code).toBe((await readFile('content/mobile-lab/examples/day-03.tsx.txt','utf8')).replaceAll('\r\n','\n'));
});
