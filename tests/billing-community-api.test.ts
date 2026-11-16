// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks=vi.hoisted(()=>({authenticatedUser:vi.fn(),requireMembership:vi.fn()}));
vi.mock('@/lib/account/require-user',()=>({authenticatedUser:mocks.authenticatedUser}));
vi.mock('@/lib/billing/community-server',()=>({
 requireMembership:mocks.requireMembership,
 communityResponse:(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}}),
}));
import { POST as checkout } from '@/app/api/billing/checkout/route';
import { GET as chatGet, POST as chatPost } from '@/app/api/community/route';
function req(body:unknown){return new Request('https://example.test/api',{method:'POST',body:JSON.stringify(body),headers:{'Content-Type':'application/json'}});}
beforeEach(()=>{vi.resetAllMocks();});
describe('unconfigured real payments',()=>{
 it('requires authentication and never creates an unpaid subscription',async()=>{
  mocks.authenticatedUser.mockResolvedValue(null);expect((await checkout(req({tier:'pro'}))).status).toBe(401);
  mocks.authenticatedUser.mockResolvedValue({id:'verified'});
  const response=await checkout(req({tier:'expert'}));expect(response.status).toBe(503);expect(await response.json()).toEqual({error:'billing_not_configured'});
 });
 it('rejects unsupported plans and oversized authenticated payloads',async()=>{
  mocks.authenticatedUser.mockResolvedValue({id:'verified'});
  expect((await checkout(req({tier:'admin'}))).status).toBe(400);
  expect((await checkout(req({tier:'pro',text:'x'.repeat(2048)}))).status).toBe(413);
 });
});
describe('community server boundary',()=>{
 it('protects message history and writes before any data operation',async()=>{
  mocks.requireMembership.mockResolvedValue({failure:Response.json({error:'membership_required'},{status:403})});
  expect((await chatGet(new Request('https://example.test/api'))).status).toBe(403);
  expect((await chatPost(req({kind:'message',text:'hello'}))).status).toBe(403);
 });
 it('rejects forged authors, timestamps and oversized messages without RPC',async()=>{
  const rpc=vi.fn();mocks.requireMembership.mockResolvedValue({client:{rpc},user:{id:'verified'},tier:'pro'});
  for(const body of [{kind:'message',text:'hello',author_id:'other'},{kind:'heartbeat',last_seen:'2099-01-01'},{kind:'message',text:'x'.repeat(2001)},{kind:'message',text:'   '}])expect((await chatPost(req(body))).status).toBe(400);
  expect((await chatPost(req({kind:'message',text:'x'.repeat(30_000)}))).status).toBe(413);expect(rpc).not.toHaveBeenCalled();
 });
 it('sends plain text only through the bounded database RPC and preserves DB rate-limit rejection',async()=>{
  const rpc=vi.fn().mockResolvedValueOnce({data:'id',error:null}).mockResolvedValueOnce({error:{code:'PT429'}});
  mocks.requireMembership.mockResolvedValue({client:{rpc},user:{id:'verified'},tier:'pro'});
  expect((await chatPost(req({kind:'message',text:' <script>alert(1)</script> '}))).status).toBe(201);
  expect(rpc).toHaveBeenNthCalledWith(1,'react_mentor_send_message',{message_body:'<script>alert(1)</script>'});
  expect((await chatPost(req({kind:'message',text:'again'}))).status).toBe(429);
 });
 it('heartbeat and leaving cannot supply arbitrary user ids or time',async()=>{
  const rpc=vi.fn().mockResolvedValue({error:null});mocks.requireMembership.mockResolvedValue({client:{rpc},user:{id:'verified'},tier:'expert'});
  expect((await chatPost(req({kind:'heartbeat'}))).status).toBe(200);expect(rpc).toHaveBeenCalledWith('react_mentor_chat_heartbeat',{leaving:false});
  expect((await chatPost(req({kind:'leave'}))).status).toBe(200);expect(rpc).toHaveBeenCalledWith('react_mentor_chat_heartbeat',{leaving:true});
 });
});
describe('community chat for every signed-in member',()=>{
 it('rejects a visitor who is not signed in with 401 before any data operation',async()=>{
  mocks.requireMembership.mockResolvedValue({failure:Response.json({error:'authentication_required'},{status:401})});
  expect((await chatGet(new Request('https://example.test/api'))).status).toBe(401);
  expect((await chatPost(req({kind:'upload',type:'image/png',size:10}))).status).toBe(401);
 });
 it('rejects wrong media types and oversized files with 400 without signing an upload',async()=>{
  const createSignedUploadUrl=vi.fn();const storage={from:vi.fn(()=>({createSignedUploadUrl}))};
  mocks.requireMembership.mockResolvedValue({client:{rpc:vi.fn(),storage},user:{id:'11111111-1111-4111-8111-111111111111'},tier:'starter'});
  for(const body of [{kind:'upload',type:'image/gif',size:10},{kind:'upload',type:'text/html',size:10},{kind:'upload',type:'image/svg+xml',size:10}]){
   const response=await chatPost(req(body));expect(response.status).toBe(400);expect(await response.json()).toEqual({error:'invalid_type'});
  }
  for(const body of [{kind:'upload',type:'image/png',size:5*1024*1024+1},{kind:'upload',type:'video/mp4',size:25*1024*1024+1},{kind:'upload',type:'image/jpeg',size:0}]){
   const response=await chatPost(req(body));expect(response.status).toBe(400);expect(await response.json()).toEqual({error:'too_large'});
  }
  expect(createSignedUploadUrl).not.toHaveBeenCalled();
 });
 it('signs uploads only inside the member folder with a server-chosen name',async()=>{
  const createSignedUploadUrl=vi.fn().mockResolvedValue({data:{token:'t',signedUrl:'u',path:'p'},error:null});
  mocks.requireMembership.mockResolvedValue({client:{rpc:vi.fn(),storage:{from:()=>({createSignedUploadUrl})}},user:{id:'11111111-1111-4111-8111-111111111111'},tier:'starter'});
  const response=await chatPost(req({kind:'upload',type:'video/webm',size:1000}));
  expect(response.status).toBe(201);
  const {path}=await response.json();
  expect(path).toMatch(/^11111111-1111-4111-8111-111111111111\/[0-9a-f-]{36}\.webm$/);
  expect((await chatPost(req({kind:'upload',type:'video/webm',size:1000,path:'../other'}))).status).toBe(400);
 });
 it('rejects media paths outside the expected shape and maps database limits',async()=>{
  const rpc=vi.fn().mockResolvedValueOnce({error:{code:'PT429'}}).mockResolvedValueOnce({error:{code:'22023'}});
  mocks.requireMembership.mockResolvedValue({client:{rpc},user:{id:'v'},tier:'starter'});
  expect((await chatPost(req({kind:'media',path:'../../etc/passwd'}))).status).toBe(400);
  expect((await chatPost(req({kind:'code',text:'x'.repeat(8001)}))).status).toBe(400);
  expect(rpc).not.toHaveBeenCalled();
  expect((await chatPost(req({kind:'code',text:'const a = 1;',language:'js'}))).status).toBe(429);
  expect((await chatPost(req({kind:'media',path:'11111111-1111-4111-8111-111111111111/22222222-2222-4222-8222-222222222222.png'}))).status).toBe(400);
 });
 it('explains that setup is required while the community migration is missing',async()=>{
  const query={select:()=>query,order:()=>query,limit:()=>Promise.resolve({data:null,error:{code:'42703'}}),gt:()=>Promise.resolve({count:0,error:null})};
  mocks.requireMembership.mockResolvedValue({client:{from:()=>query},user:{id:'v'},tier:'starter'});
  const response=await chatGet(new Request('https://example.test/api'));
  expect(response.status).toBe(503);expect(await response.json()).toEqual({error:'setup_required'});
 });
 it('deletes only through the database RPC and removes the stored file',async()=>{
  const remove=vi.fn().mockResolvedValue({error:null});
  const rpc=vi.fn().mockResolvedValue({data:'u/f.png',error:null});
  mocks.requireMembership.mockResolvedValue({client:{rpc,storage:{from:()=>({remove})}},user:{id:'v'},tier:'starter'});
  const id='33333333-3333-4333-8333-333333333333';
  expect((await chatPost(req({kind:'delete',id}))).status).toBe(200);
  expect(rpc).toHaveBeenCalledWith('react_mentor_delete_message',{message_id:id});
  expect(remove).toHaveBeenCalledWith(['u/f.png']);
  expect((await chatPost(req({kind:'delete',id:'not-a-uuid'}))).status).toBe(400);
 });
});
