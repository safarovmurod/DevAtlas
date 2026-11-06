// @vitest-environment node
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import {beforeAll,beforeEach,afterAll,it,expect} from 'vitest';

const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222';
let db:PGlite;
async function actor(role='service_role',id=A,mfa=true){await db.exec(`reset role;set request.jwt.claim.role='${role}';set request.jwt.claim.sub='${id}';set request.jwt.claim.mfa='${mfa}';set role ${role}`);}
async function record({id=A,attempt=A,hash='a'.repeat(64),correct=8,critical=2,practice=true}={}){
 return db.query('select public.react_mentor_record_assessment($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',[id,attempt,'html','html-day-01',1,hash,8,correct,2,critical,practice]);
}
beforeAll(async()=>{
 db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create schema auth;create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create function auth.role() returns text language sql as $$select current_setting('request.jwt.claim.role',true)$$;
 create function public.react_mentor_session_allowed() returns boolean language sql as $$select coalesce(current_setting('request.jwt.claim.mfa',true),'false')='true'$$;
 grant usage on schema auth,public to anon,authenticated,service_role;
 grant execute on all functions in schema auth to anon,authenticated,service_role;`);
 await db.exec(await readFile(new URL('../supabase/migrations/20261026000000_assessment_evidence.sql',import.meta.url),'utf8'));
},30000);
beforeEach(async()=>{await db.exec(`reset role;truncate auth.users cascade;insert into auth.users values('${A}'),('${B}')`);await actor();});
afterAll(async()=>{await db?.close();});
it('records idempotently and refuses reuse for another submission',async()=>{
 await record();await record();
 expect((await db.query('select mastered from public.react_mentor_assessment_attempts')).rows).toEqual([{mastered:true}]);
 await expect(record({hash:'b'.repeat(64)})).rejects.toThrow(/already used/);
});
it('computes mastery from practice, 80 percent and every critical answer',async()=>{
 await record({correct:7});await record({attempt:B,correct:7,critical:1});
 expect((await db.query('select mastered from public.react_mentor_assessment_attempts order by attempt_id')).rows).toEqual([{mastered:true},{mastered:false}]);
 await record({id:B,correct:6});await record({id:B,attempt:B,practice:false});
 expect((await db.query('select mastered from public.react_mentor_assessment_attempts where user_id=$1',[B])).rows).toEqual([{mastered:false},{mastered:false}]);
});
it('isolates account reads, checks MFA and rejects learner-minted grades',async()=>{
 await record();await record({id:B});await actor('authenticated');
 expect((await db.query('select user_id from public.react_mentor_assessment_attempts')).rows).toEqual([{user_id:A}]);
 await expect(record()).rejects.toThrow(/permission denied/);
 await expect(db.query('delete from public.react_mentor_assessment_attempts')).rejects.toThrow(/permission denied/);
 await expect(db.query('update public.react_mentor_assessment_attempts set practice_passed=true')).rejects.toThrow(/permission denied/);
 await actor('authenticated',A,false);
 expect((await db.query('select * from public.react_mentor_assessment_attempts')).rows).toEqual([]);
 await actor('anon');await expect(db.query('select * from public.react_mentor_assessment_attempts')).rejects.toThrow(/permission denied/);
});
