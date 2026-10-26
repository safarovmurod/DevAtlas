import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=async file=>JSON.parse(await readFile(path.join(root,file),'utf8'));
const draft=await read('docs/curriculum-design/short-courses.draft.json'),state=await read('docs/delivery-state.json');
assert.equal(draft.status,'draft_not_published');
assert.deepEqual(draft.courses.map(course=>course.courseId).sort(),[...state.phases.find(phase=>phase.id===4).courses].sort(),'Blueprints must cover every requested short course exactly once');
const research=draft.research;
const sourceIds=new Set([...research.reviewedSources,...research.retainedReferences,...research.candidateSources].map(source=>source.id));
const totals=[];
for(const course of draft.courses){
 assert.equal(course.status,'draft_not_published');
 const existing=await read(`src/content/courses/${course.courseId}.json`);
 assert.equal(new Set(course.existingLessons.map(lesson=>lesson.id)).size,course.existingLessons.length,'Preserved identities must be unique');
 assert.deepEqual(course.existingLessons.map(lesson=>lesson.day),Array.from({length:course.existingLessons.length},(_,index)=>index+1));
 for(const original of course.existingLessons){
  const actual=existing.lessons.find(lesson=>lesson.id===original.id);
  assert(actual,`Missing preserved lesson: ${original.id}`);
  assert.equal(actual.day,original.day,'Preserve existing calendar identities');
 }
 for(const id of course.sourcesToReview)assert(sourceIds.has(id),`Unresolved source record: ${id}`);
 let day=course.existingLessons.length+1;
 const topics=[];
 for(const module of course.modules){
  assert(module.title.trim()&&module.outcome.trim()&&module.deliverable.trim());
  assert(module.topics.length>0&&module.topics.every(topic=>typeof topic==='string'&&topic.trim()));
  assert.equal(module.startsAtDay,day);
  day+=module.topics.length;assert.equal(module.endsAtDay,day-1);topics.push(...module.topics);
 }
 assert.equal(new Set(topics.map(topic=>topic.toLowerCase().trim())).size,topics.length,`Duplicate planned topic: ${course.courseId}`);
 assert.equal(course.plannedTotalDays,day-1);
 assert(course.plannedTotalDays<=120,'Plan must fit the supported authored schedule');
 assert(course.capstone.deliverable.trim()&&course.capstone.criteria.length>=4);
 totals.push({courseId:course.courseId,publishedDays:existing.lessons.length,plannedDays:course.plannedTotalDays});
}
console.log(JSON.stringify({status:draft.status,blueprints:totals.length,countsAsPublishedContent:false,courses:totals}));
