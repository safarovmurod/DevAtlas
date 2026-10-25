import {authenticatedUser} from '@/lib/account/require-user';
import {getSupabaseServerClient} from '@/lib/supabase/server';

export async function GET(request:Request){
  const headers={'Cache-Control':'private, no-store'};
  const user=await authenticatedUser(request);
  if(!user)return Response.json({error:'authentication_required'},{status:401,headers});
  const client=getSupabaseServerClient(request.headers.get('authorization')??undefined);
  if(!client)return Response.json({error:'attestation_unavailable'},{status:503,headers});
  const params=new URL(request.url).searchParams,course=params.get('courseId'),lesson=params.get('lessonId');
  if(!course||!lesson||course.length>120||lesson.length>120)return Response.json({error:'invalid_assessment_query'},{status:400,headers});
  try{
    const {data,error}=await client.from('react_mentor_assessment_attempts').select('attempt_id,course_id,lesson_id,lesson_version,quiz_total,quiz_correct,critical_total,critical_correct,practice_passed,mastered,graded_at').eq('user_id',user.id).eq('course_id',course).eq('lesson_id',lesson).order('graded_at',{ascending:false}).limit(20);
    if(error)return Response.json({error:'attestation_unavailable'},{status:503,headers});
    return Response.json({attempts:data??[]},{headers});
  }catch{return Response.json({error:'attestation_unavailable'},{status:503,headers});}
}
