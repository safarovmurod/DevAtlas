import type {LearningStage,LearningTrack} from '@/content/courses/catalog';

export const COVERAGE_STATUSES=['Missing','Planned','In Progress','Published','Verified'] as const;
export type CoverageStatus=typeof COVERAGE_STATUSES[number];
interface CourseAvailability {courseId:string;tier:string;publishedDays:number}
export interface StageCoverage {
  trackId:string;
  trackName:string;
  stage:LearningStage;
  status:CoverageStatus;
  courseIds:string[];
  publishedDays:number;
  proposedCourseId:string|null;
  pendingVerification:string[];
}

/** Availability is not educational verification. No source-only audit can issue Verified. */
export function buildStageCoverage(courses:CourseAvailability[],tracks:LearningTrack[]):StageCoverage[]{
  const byId=new Map(courses.map(course=>[course.courseId,course]));
  if(byId.size!==courses.length)throw new Error('Duplicate audited course');
  const seen=new Set<string>();
  const trackIds=new Set<string>();
  const stages:LearningStage[]=['beginner','pro','expert'];
  const rows:StageCoverage[]=[];
  for(const track of tracks){
    if(trackIds.has(track.id))throw new Error('Duplicate learning track: '+track.id);
    trackIds.add(track.id);
    for(const stage of stages){
      const refs=track.courses.filter(ref=>ref.stage===stage);
      let publishedDays=0;
      for(const ref of refs){
        const course=byId.get(ref.course);
        if(!course)throw new Error('Unaudited track course: '+ref.course);
        if(seen.has(ref.course))throw new Error('Repeated track course: '+ref.course);
        const expected=course.tier==='starter'?'beginner':course.tier;
        if(expected!==stage)throw new Error('Course access tier contradicts stage: '+ref.course);
        if(!Number.isInteger(course.publishedDays)||course.publishedDays<1)throw new Error('Invalid published course days: '+ref.course);
        seen.add(ref.course);
        publishedDays+=course.publishedDays;
      }
      rows.push({trackId:track.id,trackName:track.name,stage,status:refs.length?'Published':'Missing',
        courseIds:refs.map(ref=>ref.course),publishedDays,
        proposedCourseId:refs.length?null:stage==='beginner'?`${track.id}-foundations`:`${track.id}-${stage}`,
        pendingVerification:refs.length?['content-and-source-review','interactive-learning-flow','assessment-and-project-evidence','ru-tg-en-review','end-to-end-validation']:['authored-syllabus','complete-lessons','practice-and-capstone','assessment-and-feedback','ru-tg-en-review'],
      });
    }
  }
  if(seen.size!==courses.length)throw new Error('Audited course omitted from tracks');
  return rows;
}
