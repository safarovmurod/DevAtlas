// @vitest-environment node
import {beforeEach,expect,it,vi} from 'vitest';
import {readFileSync} from 'node:fs';
const mocks=vi.hoisted(()=>({user:vi.fn(),admin:vi.fn(),access:vi.fn(),rpc:vi.fn()}));
vi.mock('@/lib/account/require-user',()=>({authenticatedUser:mocks.user}));
vi.mock('@/lib/supabase/admin',()=>({getSupabaseAdminClient:mocks.admin}));
vi.mock('@/lib/courses/access-server',()=>({authorizeCourseContent:mocks.access}));
import {GET,POST} from '@/app/api/assessments/route';
import bank from '@/content/assessments/html-first-page';

const html=JSON.parse(readFileSync('src/content/courses/html.json','utf8'));
function body(){return {courseId:'html',lessonId:'html-day-01',version:1,variantId:bank.variants[0].id,attemptId:'11111111-1111-4111-8111-111111111111',answers:[],code:html.lessons[0].practice.solution};}
function request(value:unknown,token?:string){return new Request('https://example.test/api/assessments',{method:'POST',headers:{'Content-Type':'application/json',...(token?{authorization:'Bearer '+token}:{})},body:JSON.stringify(value)});}
beforeEach(()=>{vi.resetAllMocks();mocks.access.mockResolvedValue({allowed:true});mocks.user.mockResolvedValue({id:'actual-user'});mocks.admin.mockReturnValue({rpc:mocks.rpc});mocks.rpc.mockResolvedValue({error:null});});
it('serves a different retry variant without canonical keys',async()=>{
 const response=await GET(new Request('https://example.test/api/assessments?courseId=html&lessonId=html-day-01&excludeVariant=first-page-a'));
 expect(response.status).toBe(200);const data=await response.json();expect(data.variantId).toBe('first-page-b');expect(data.questions).toHaveLength(8);expect(JSON.stringify(data)).not.toContain('correctOption');
});
it('denies paid banks before loading or disclosing them',async()=>{
 mocks.access.mockResolvedValue({allowed:false,response:Response.json({error:'authentication_required'},{status:401})});
 expect((await GET(new Request('https://example.test/api/assessments?courseId=javascript-pro&lessonId=private'))).status).toBe(401);
});
it('does not mint durable attestation or XP for guest feedback',async()=>{
 const response=await POST(request(body()));expect(response.status).toBe(200);expect(await response.json()).toMatchObject({attestation:'local',persistence:'local',grade:{mastered:false}});expect(mocks.rpc).not.toHaveBeenCalled();
});
it('derives the assessment owner from authenticated identity, not the submitted payload',async()=>{
 expect((await POST(request({...body(),userId:'forged'},'valid'))).status).toBe(400);
 const response=await POST(request(body(),'valid'));expect(await response.json()).toMatchObject({attestation:'server',persistence:'saved'});
 expect(mocks.rpc).toHaveBeenCalledWith('react_mentor_record_assessment',expect.objectContaining({learner_id:'actual-user',correct:0,practice_passed:true}));
});
it('keeps missing migrations and failed persistence explicitly unverified',async()=>{
 mocks.rpc.mockResolvedValue({error:{code:'42P01'}});expect(await (await POST(request(body(),'valid'))).json()).toMatchObject({attestation:'local',persistence:'unavailable'});
 mocks.rpc.mockRejectedValue(new Error('database offline'));expect(await (await POST(request(body(),'valid'))).json()).toMatchObject({attestation:'local',persistence:'unavailable'});
 mocks.rpc.mockResolvedValue({error:{code:'PT409'}});expect((await POST(request(body(),'valid'))).status).toBe(409);
});
it('rejects forged verification fields, oversized requests and invalid identities',async()=>{
 expect((await POST(request({...body(),verified:true}))).status).toBe(400);
 expect((await POST(request({...body(),code:'x'.repeat(128001)}))).status).toBe(413);
 mocks.user.mockResolvedValue(null);expect((await POST(request(body(),'invalid'))).status).toBe(401);
});
