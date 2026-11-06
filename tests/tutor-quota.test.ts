// @vitest-environment node
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
const mock=vi.hoisted(()=>({rpc:vi.fn(),available:true}));
vi.mock('@/lib/supabase/admin',()=>({getSupabaseAdminClient:()=>mock.available?{rpc:mock.rpc}:null}));
import {reserveTutorBudget,tutorBudgetConfig} from '@/lib/tutor/quota';
import {LEARNING_UI_COPY,tutorErrorKey} from '@/lib/learning-ui-copy';
beforeEach(()=>{
 mock.available=true;mock.rpc.mockReset();mock.rpc.mockResolvedValue({error:null});
 for(const [key,value] of Object.entries({AI_DAILY_BUDGET_MICROUSD:'100000',AI_USER_DAILY_BUDGET_MICROUSD:'10000',AI_USER_DAILY_REQUEST_LIMIT:'10',AI_MAX_MICROUSD_PER_TOKEN:'2',AI_PROVIDER_USAGE_BOUND_CONFIRMED:'true'}))vi.stubEnv(key,value);
});
afterEach(()=>vi.unstubAllEnvs());
it('distinguishes platform budget failures from provider balance in all six UI languages',()=>{
 for(const [code,key] of [['ai_budget_not_configured','tutorBudgetConfig'],['ai_budget_unavailable','tutorBudgetUnavailable'],['ai_budget_exhausted','tutorBudgetLimit']] as const){
  expect(tutorErrorKey(429,code)).toBe(key);
  for(const copy of Object.values(LEARNING_UI_COPY)){expect(copy[key].trim().length).toBeGreaterThan(15);expect(copy[key]).not.toContain('AnyModel');}
 }
});
it('defaults to zero and rejects unsafe, fractional or incomplete configuration',async()=>{
 expect(tutorBudgetConfig({})).toEqual({global:0,user:0,requests:0,rate:0,bounded:false});
 for(const bad of ['0','-1','1.5','Infinity','1000000000001']){
  vi.stubEnv('AI_DAILY_BUDGET_MICROUSD',bad);
  expect(await reserveTutorBudget('user',[])).toMatchObject({allowed:false,status:503,error:'ai_budget_not_configured'});
 }
 expect(mock.rpc).not.toHaveBeenCalled();
});
it('counts UTF-8 bytes plus framing and bounded output in a conservative cost reservation',async()=>{
 const messages=[{role:'user',content:'ӣӯҳқҷғ'}];
 expect(await reserveTutorBudget('owner',messages)).toEqual({allowed:true});
 expect(mock.rpc).toHaveBeenCalledWith('react_mentor_reserve_ai_budget',expect.objectContaining({learner_id:'owner',reservation_microusd:(Buffer.byteLength(JSON.stringify(messages),'utf8')+64+256)*2,user_request_limit:10}));
});
it('fails closed for missing database, denied reservations and transport failures',async()=>{
 mock.available=false;expect(await reserveTutorBudget('owner',[])).toMatchObject({allowed:false,status:503});
 mock.available=true;mock.rpc.mockResolvedValue({error:{code:'PT429'}});expect(await reserveTutorBudget('owner',[])).toMatchObject({allowed:false,status:429});
 mock.rpc.mockRejectedValue(new Error('private diagnostic'));expect(await reserveTutorBudget('owner',[])).toEqual({allowed:false,status:503,error:'ai_budget_unavailable'});
});
