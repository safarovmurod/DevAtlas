import {ReactReview} from '@/components/learning/react-review';
import {StudySession} from '@/components/learning/study-session';
import {sessionConfig} from '@/lib/session-config';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const params=await searchParams;
 if(params.start==='1'||typeof params.topic==='string')return <StudySession config={{...sessionConfig('revision',params),review:true}}/>;
 return <ReactReview mode="revision"/>;
}
