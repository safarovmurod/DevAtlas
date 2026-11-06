// @vitest-environment node
import {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import {beforeAll,beforeEach,afterAll,it,expect} from 'vitest';
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222';
let db:PGlite;
const reserve=(id=A,cost=100,global=1000,user=500,requests=3)=>db.query('select public.react_mentor_reserve_ai_budget($1,$2,$3,$4,$5)',[id,cost,global,user,requests]);
beforeAll(async()=>{
 db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);
 create function auth.role() returns text language sql as $$select current_setting('request.jwt.claim.role',true)$$;
 grant usage on schema auth,public to anon,authenticated,service_role;grant execute on all functions in schema auth to anon,authenticated,service_role;`);
 await db.exec(await readFile(new URL('../supabase/migrations/20261026010000_tutor_budgets.sql',import.meta.url),'utf8'));
},30000);
beforeEach(async()=>{
 await db.exec(`reset role;truncate public.react_mentor_ai_daily_budget;truncate auth.users cascade;insert into auth.users values('${A}'),('${B}');set request.jwt.claim.role='service_role';set role service_role;`);
});
afterAll(async()=>{await db?.close();});
it('reserves global and account cost before dispatch and enforces a persistent rate limit',async()=>{
 await reserve();await expect(reserve()).rejects.toThrow(/limit reached/);
 expect((await db.query('select reserved_microusd from public.react_mentor_ai_daily_budget')).rows).toEqual([{reserved_microusd:100}]);
 expect((await db.query('select requests from public.react_mentor_ai_user_budget')).rows).toEqual([{requests:1}]);
});
it('cannot overspend the global cap from separate users and rolls denied reservations back',async()=>{
 const attempts=await Promise.allSettled([reserve(A,100,150),reserve(B,100,150)]);
 expect(attempts.filter(result=>result.status==='fulfilled')).toHaveLength(1);
 expect((await db.query('select reserved_microusd from public.react_mentor_ai_daily_budget')).rows).toEqual([{reserved_microusd:100}]);
 expect((await db.query('select count(*)::integer as n from public.react_mentor_ai_user_budget')).rows).toEqual([{n:1}]);
});
it('enforces per-user request/cost caps after cooldown and keeps daily windows separate',async()=>{
 await reserve(A,100,1000,100,1);
 await db.exec(`reset role;update public.react_mentor_ai_user_budget set last_requested_at='2000-01-01';set role service_role;`);
 await expect(reserve(A,1,1000,100,10)).rejects.toThrow(/limit reached/);
 await expect(reserve(A,1,1000,1000,1)).rejects.toThrow(/limit reached/);
 await reserve(B);
 await db.exec(`reset role;update public.react_mentor_ai_user_budget set day=day-1;update public.react_mentor_ai_daily_budget set day=day-1;set role service_role;`);
 await reserve(A,100,100,100,1);
 expect((await db.query('select count(*)::integer as n from public.react_mentor_ai_daily_budget')).rows).toEqual([{n:2}]);
});
it('denies anonymous/learner calls, direct writes and reading usage of other users',async()=>{
 await reserve();
 for(const role of ['anon','authenticated']){
  await db.exec(`reset role;set request.jwt.claim.role='${role}';set role ${role};`);
  await expect(reserve()).rejects.toThrow(/permission denied/);
  await expect(db.query('select * from public.react_mentor_ai_user_budget')).rejects.toThrow(/permission denied/);
  await expect(db.query('delete from public.react_mentor_ai_daily_budget')).rejects.toThrow(/permission denied/);
 }
});
