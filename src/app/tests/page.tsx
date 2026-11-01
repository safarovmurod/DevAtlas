
import { PageTransition } from '@/components/layout/page-transition';
import {AssessmentHub} from '@/components/learning/assessment-hub';
import {CourseWorkspace} from '@/components/courses/course-workspace';
import {isCourseId} from '@/lib/courses/ids';
import {coursePublishedDays} from '@/content/courses/catalog';
import {courseAccessTier} from '@/lib/courses/access';
import {loadCourseContent} from '@/lib/courses/content';
import {notFound} from 'next/navigation';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
 const params=await searchParams;
 if(params.course!==undefined&&(typeof params.course!=='string'||!isCourseId(params.course)))notFound();
 if(typeof params.course==='string'&&isCourseId(params.course)&&params.course!=='react'){
  if(Array.isArray(params.day))notFound();
  const day=params.day!==undefined?Number(params.day):undefined;
  if(day!==undefined&&(!Number.isInteger(day)||day<1||day>coursePublishedDays(params.course)))notFound();
  return <PageTransition><CourseWorkspace key={params.course+day} courseId={params.course} section="tests" day={day} initialContent={courseAccessTier(params.course)==='starter'?await loadCourseContent(params.course):undefined}/></PageTransition>;
 }
 return <PageTransition><AssessmentHub params={params}/></PageTransition>;
}
