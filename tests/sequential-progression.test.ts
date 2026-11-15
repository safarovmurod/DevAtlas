import { beforeEach, describe, expect, it } from 'vitest';
import { emptyProgress, mergeProgress, progressSnapshot } from '@/lib/account/progress';
import { courseDayProgress, courseMonthPlan } from '@/lib/courses/plan';
import { reactCurrentDay, reactDayProgress, reactMonthDays } from '@/lib/react-plan';
import type { CourseLesson } from '@/lib/courses/schema';
import { switchLearningAccount, useLearningStore } from '@/stores/learning-store';

const text=(value:string)=>({ru:value,tg:value});
const lessons:CourseLesson[]=[1,2,3].map(day=>({id:`lesson-${day}`,day,title:text('Lesson'),summary:text('Summary'),level:'beginner',sourceIds:['official'],sections:[{title:text('Step'),body:text('Body')}],questions:[],practice:{task:text('Build'),hint:text('Try'),solution:'<h1>Hello</h1>',criteria:[text('Works')]}}));
const plan=courseMonthPlan(lessons);
beforeEach(()=>{localStorage.clear();switchLearningAccount(null);});

describe('learner-confirmed progression with every day open and any confirmation order',()=>{
 it('opens every day from the start and never confirms from a theory or practice checkbox alone',()=>{
  expect(courseDayProgress(plan,[],[],[]).days.map(item=>item.status)).toEqual(['current','open','open']);
  expect(courseDayProgress(plan,['lesson-1'],['lesson-1'],[]).current?.day).toBe(1);
  const state=useLearningStore.getState();state.completeCourseLesson('html','lesson-1');state.completeCoursePractice('html','lesson-1');
  expect(useLearningStore.getState().courses.html?.confirmedDays).toEqual([]);
  expect(state.confirmCourseDay('html',2,plan)).toBe(false);
  expect(state.confirmCourseDay('html',1,plan)).toBe(true);
  const progress=useLearningStore.getState().courses.html!;
  expect(courseDayProgress(plan,progress.completedTopics,progress.completedPractice,progress.confirmedDays).days.map(item=>item.status)).toEqual(['done','current','open']);
 });
 it('requires both learning and practice before confirmation and awards practice XP only once',()=>{
  const state=useLearningStore.getState();
  expect(state.confirmCourseDay('html',1,plan)).toBe(false);
  state.completeCourseLesson('html','lesson-1');expect(state.confirmCourseDay('html',1,plan)).toBe(false);
  state.completeCoursePractice('html','lesson-1');expect(state.confirmCourseDay('html',1,plan)).toBe(true);
  expect(state.confirmCourseDay('html',1,plan)).toBe(false);
  state.completeCoursePractice('html','lesson-1');
  expect(useLearningStore.getState().courses.html!.awards['practice:lesson-1']).toBe(4);
  expect(useLearningStore.getState().courses.html!.confirmedDays).toEqual(['1']);
 });
 it('confirms a later day before an earlier one when that day own work is done',()=>{
  const five:CourseLesson[]=[1,2,3,4,5].map(day=>({...lessons[0],id:`five-${day}`,day}));
  const fivePlan=courseMonthPlan(five);
  const state=useLearningStore.getState();
  state.completeCourseLesson('html','five-5');state.completeCoursePractice('html','five-5');
  expect(state.confirmCourseDay('html',5,fivePlan)).toBe(true);
  let progress=useLearningStore.getState().courses.html!;
  expect(progress.confirmedDays).toEqual(['5']);
  const statuses=courseDayProgress(fivePlan,progress.completedTopics,progress.completedPractice,progress.confirmedDays);
  expect(statuses.days.map(item=>item.status)).toEqual(['current','open','open','open','done']);
  expect(statuses.current?.day).toBe(1);
  // Day 4 is open but its own work is not done yet, so it still cannot be confirmed.
  expect(state.confirmCourseDay('html',4,fivePlan)).toBe(false);
  state.completeCourseLesson('html','five-4');expect(state.confirmCourseDay('html',4,fivePlan)).toBe(false);
  state.completeCoursePractice('html','five-4');expect(state.confirmCourseDay('html',4,fivePlan)).toBe(true);
  progress=useLearningStore.getState().courses.html!;
  expect(progress.confirmedDays).toEqual(['5','4']);
  // A confirmed day is never confirmed twice, and a day that is not in the plan is refused.
  expect(state.confirmCourseDay('html',5,fivePlan)).toBe(false);
  expect(state.confirmCourseDay('html',99,fivePlan)).toBe(false);
  expect(useLearningStore.getState().courses.html!.confirmedDays).toEqual(['5','4']);
 });
 it('shows a later completion imported from another device as done and keeps the first unfinished day current',()=>{
  const statuses=courseDayProgress(plan,['lesson-1','lesson-2','lesson-3'],['lesson-1','lesson-2','lesson-3'],['3']);
  expect(statuses.days.map(item=>item.status)).toEqual(['current','open','done']);
  expect(statuses.current?.day).toBe(1);
 });
 it('preserves day confirmations in account sync and keeps guest/account/course scopes separate',()=>{
  const state=useLearningStore.getState();state.completeCourseLesson('html','lesson-1');state.completeCoursePractice('html','lesson-1');state.confirmCourseDay('html',1,plan);
  switchLearningAccount('other');expect(useLearningStore.getState().courses.html).toBeUndefined();
  switchLearningAccount(null);expect(useLearningStore.getState().courses.html!.confirmedDays).toEqual(['1']);
  expect(useLearningStore.getState().courses.css).toBeUndefined();
  const merged=mergeProgress(progressSnapshot({confirmedDays:['1:1'],courses:{html:{confirmedDays:['1']}}}),progressSnapshot({confirmedDays:['1:1','1:2'],courses:{html:{confirmedDays:['1','2']}}}));
  expect(merged.confirmedDays).toEqual(['1:1','1:2']);expect(merged.courses.html!.confirmedDays).toEqual(['1','2']);
  expect(mergeProgress(merged,merged)).toEqual(merged);
 });
 it('upgrades manually reviewed practice to a real passed check without duplicate XP',()=>{
  const state=useLearningStore.getState();state.completeCoursePractice('html','lesson-1');state.completeCoursePractice('html','lesson-1',true);state.completeCoursePractice('html','lesson-1',true);
  state.completePractice('exercise',false);state.completePractice('exercise',true);state.completePractice('exercise',false);
  expect(useLearningStore.getState().courses.html!.completedPractice).toEqual(['lesson-1']);
  expect(useLearningStore.getState().courses.html!.awards['practice:lesson-1']).toBe(20);
  expect(useLearningStore.getState().awards['practice:exercise']).toBe(20);
 });
 it('migrates old progress without silently claiming old days were confirmed',()=>{
  expect(progressSnapshot({completedTopics:['old'],completedPractice:['old']}).confirmedDays).toEqual([]);
  expect(emptyProgress().confirmedDays).toEqual([]);
 });
 it('opens every React day from the start in both months and points to the first unconfirmed day',()=>{
  for(const month of [1,2]){const statuses=reactDayProgress(month,[],[],[]).map(item=>item.status);expect(statuses[0]).toBe('current');expect(statuses.slice(1).every(status=>status==='open')).toBe(true);}
  expect(reactCurrentDay([],[],[])).toEqual({month:1,day:1});
  const monthOne=reactMonthDays(1);
  expect(reactCurrentDay(monthOne.flatMap(day=>day.topics.map(topic=>topic.id)),monthOne.flatMap(day=>day.topics.map(topic=>topic.id+'-exercise-1')),monthOne.map(day=>'1:'+day.day))).toEqual({month:2,day:1});
 });
 it('requires React practice and explicit confirmation, and refuses an unready or repeated day',()=>{
  const state=useLearningStore.getState(),first=reactMonthDays(1)[0];
  expect(state.confirmReactDay(1,2)).toBe(false);
  for(const topic of first.topics) state.completeTopic(topic.id);
  expect(state.confirmReactDay(1,1)).toBe(false);
  for(const topic of first.topics) state.completePractice(topic.id+'-exercise-1',false);
  expect(state.confirmReactDay(1,1)).toBe(true);
  const updated=useLearningStore.getState();
  expect(reactDayProgress(1,updated.completedTopics,updated.completedPractice,updated.confirmedDays).slice(0,3).map(item=>item.status)).toEqual(['done','current','open']);
  expect(state.confirmReactDay(1,1)).toBe(false);
  expect(state.confirmReactDay(0,1)).toBe(false);
  expect(reactDayProgress(2,updated.completedTopics,updated.completedPractice,updated.confirmedDays)[0].status).toBe('current');
  const monthOne=reactMonthDays(1);
  expect(reactDayProgress(2,monthOne.flatMap(day=>day.topics.map(topic=>topic.id)),monthOne.flatMap(day=>day.topics.map(topic=>topic.id+'-exercise-1')),monthOne.map(day=>'1:'+day.day))[0].status).toBe('current');
 });
 it('confirms any React day in any order once its own topics and practice are done',()=>{
  const state=useLearningStore.getState(),days=reactMonthDays(1),fourth=days[3],fifth=days[4];
  for(const topic of fifth.topics){state.completeTopic(topic.id);state.completePractice(topic.id+'-exercise-1',false);}
  expect(state.confirmReactDay(1,5)).toBe(true);
  let updated=useLearningStore.getState();
  expect(updated.confirmedDays).toEqual(['1:5']);
  const statuses=reactDayProgress(1,updated.completedTopics,updated.completedPractice,updated.confirmedDays).map(item=>item.status);
  expect(statuses[0]).toBe('current');expect(statuses[3]).toBe('open');expect(statuses[4]).toBe('done');
  expect(reactCurrentDay(updated.completedTopics,updated.completedPractice,updated.confirmedDays)).toEqual({month:1,day:1});
  // Day 4 is not ready yet (own topics not studied), so it is refused; once ready it is accepted after day 5.
  expect(state.confirmReactDay(1,4)).toBe(false);
  for(const topic of fourth.topics){state.completeTopic(topic.id);state.completePractice(topic.id+'-exercise-1',false);}
  expect(state.confirmReactDay(1,4)).toBe(true);
  updated=useLearningStore.getState();
  expect(updated.confirmedDays).toEqual(['1:5','1:4']);
  // Month 2 day 1 does not need month 1 to be finished, only its own work.
  const secondMonth=reactMonthDays(2)[0];
  expect(state.confirmReactDay(2,1)).toBe(false);
  for(const topic of secondMonth.topics){state.completeTopic(topic.id);state.completePractice(topic.id+'-exercise-1',false);}
  expect(state.confirmReactDay(2,1)).toBe(true);
  expect(useLearningStore.getState().confirmedDays).toEqual(['1:5','1:4','2:1']);
 });
});
