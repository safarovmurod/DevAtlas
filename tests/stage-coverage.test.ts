// @vitest-environment node
import {describe,expect,it} from 'vitest';
import {COURSE_CATALOG,LEARNING_TRACKS} from '@/content/courses/catalog';
import {buildStageCoverage} from '../scripts/lib/stage-coverage';

const courses=COURSE_CATALOG.map(course=>({courseId:course.id,tier:course.accessTier??'starter',publishedDays:course.publishedDays??0}));
describe('strict track × stage coverage',()=>{
 it('accounts for all 114 stages without treating published data as verified education',()=>{
  const rows=buildStageCoverage(courses,LEARNING_TRACKS);
  expect(rows).toHaveLength(114);
  expect(new Set(rows.map(row=>`${row.trackId}/${row.stage}`)).size).toBe(114);
  expect(rows.filter(row=>row.status==='Published')).toHaveLength(42);
  expect(rows.filter(row=>row.status==='Missing')).toHaveLength(72);
  expect(rows.some(row=>row.status==='Verified')).toBe(false);
  expect(rows.reduce((sum,row)=>sum+row.publishedDays,0)).toBe(950);
 });
 it('preserves completed Kotlin and both JavaScript Beginner modules',()=>{
  const rows=buildStageCoverage(courses,LEARNING_TRACKS);
  expect(rows.find(row=>row.trackId==='kotlin'&&row.stage==='beginner')).toMatchObject({status:'Published',publishedDays:30,courseIds:['kotlin'],proposedCourseId:null});
  expect(rows.find(row=>row.trackId==='javascript'&&row.stage==='beginner')).toMatchObject({publishedDays:60,courseIds:['javascript-1','javascript-2']});
  expect(rows.find(row=>row.trackId==='architecture'&&row.stage==='beginner')).toMatchObject({status:'Missing',proposedCourseId:'architecture-foundations'});
 });
 it('fails instead of hiding omitted, duplicated or contradictory source courses',()=>{
  expect(()=>buildStageCoverage(courses.slice(1),LEARNING_TRACKS)).toThrow('Unaudited');
  expect(()=>buildStageCoverage([...courses,courses[0]],LEARNING_TRACKS)).toThrow('Duplicate');
  expect(()=>buildStageCoverage(courses.map(course=>course.courseId==='html'?{...course,tier:'pro'}:course),LEARNING_TRACKS)).toThrow('contradicts');
  expect(()=>buildStageCoverage(courses,LEARNING_TRACKS.slice(1))).toThrow('omitted');
 });
});
