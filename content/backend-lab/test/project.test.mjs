import {test} from 'node:test';import assert from 'node:assert/strict';
import {resolve,join} from 'node:path';import {pathToFileURL,fileURLToPath} from 'node:url';import {once} from 'node:events';
import {mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';
const root=resolve(process.env.DEVATLAS_BACKEND_PROJECT_ROOT??fileURLToPath(new URL('../reference',import.meta.url)));
const load=name=>import(pathToFileURL(join(root,name+'.mjs')).href);
const {openStore}=await load('storage'),{hashPassword,sessions,loginLimiter}=await load('auth'),{createApp}=await load('server');
const phase=Number(process.env.DEVATLAS_BACKEND_PHASE??44);
async function start(store,options={}){
 const logs=[],server=createApp({store,log:r=>logs.push(r),...options});server.listen(0,'127.0.0.1');await once(server,'listening');
 const base='http://127.0.0.1:'+server.address().port;
 const send=(path,{method='GET',cookie,body,origin='http://127.0.0.1:3001',type='application/json'}={})=>fetch(base+path,{method,signal:AbortSignal.timeout(4000),headers:{Origin:origin,'Content-Type':type,...(cookie?{Cookie:cookie}:{})},body});
 const close=async()=>{server.close();server.closeAllConnections();await once(server,'close');};
 const login=async(name='A')=>{const r=await send('/login',{method:'POST',body:JSON.stringify({name,password:'local-example-password'})});assert.equal(r.status,200);await r.text();return r.headers.get('set-cookie').split(';')[0];};
 return {send,close,login,logs};
}
async function seed(store){const hash=await hashPassword('local-example-password');store.addUser('A',hash);store.addUser('B',hash);}
test('phase 40: real login and validated create from the session owner',async()=>{
 const store=openStore();let app;try{await seed(store);app=await start(store);const cookie=await app.login();
 assert.equal((await app.send('/tasks',{method:'POST',body:'{"title":"Read"}'})).status,401);
 const r=await app.send('/tasks',{method:'POST',cookie,body:'{"title":"  Read  "}'});assert.equal(r.status,201);const row=await r.json();assert.equal(row.title,'Read');assert.equal(r.headers.get('location'),'/tasks/'+row.id);
 assert.equal(store.get(1,row.id).title,'Read');assert.equal(store.get(2,row.id),undefined);
 assert.equal((await app.send('/tasks',{method:'POST',cookie,body:'{"title":""}'})).status,422);
 assert.equal((await app.send('/tasks',{method:'POST',cookie,body:'{"title":"Read","owner_id":2}'})).status,422);
 }finally{if(app)await app.close();store.close();}
});
if(phase>=41)test('phase 41: two owners, stable pagination, CRUD and ID rejection',async()=>{
 const store=openStore();let app;try{await seed(store);app=await start(store);const a=await app.login(),b=await app.login('B');const first=store.create(1,'One');store.create(1,'Two');store.create(2,'Private');
 for(const method of ['GET','PATCH','DELETE']){const r=await app.send('/tasks/'+first.id,{cookie:b,method,body:method==='PATCH'?' {"title":"stolen"}':undefined});assert.equal(r.status,404);await r.text();}assert.equal(store.get(1,first.id).title,'One');
 const list=await app.send('/tasks?limit=1&offset=1',{cookie:a});assert.equal(list.status,200);assert.deepEqual((await list.json()).items.map(x=>x.title),['Two']);
 for(const path of ['/tasks?limit=1&limit=2','/tasks/0','/tasks/1%20OR%201=1'])assert.equal((await app.send(path,{cookie:a})).status,400);
 assert.equal((await app.send('/tasks/'+first.id,{cookie:a,method:'PATCH',body:'{"title":"Done"}'})).status,200);
 assert.equal((await app.send('/tasks/'+first.id,{cookie:a,method:'DELETE'})).status,204);assert.equal((await app.send('/tasks/'+first.id,{cookie:a})).status,404);
 }finally{if(app)await app.close();store.close();}
});
if(phase>=42)test('phase 42: network 429, expiry, CSRF, JSON limits and private errors',async()=>{
 const store=openStore();let app;try{await seed(store);let time=0;app=await start(store,{sessionStore:sessions({now:()=>time,ttl:10}),allowLogin:loginLimiter({now:()=>time,limit:2,windowMs:10})});
 for(let i=0;i<2;i++)assert.equal((await app.send('/login',{method:'POST',body:'{"name":"A","password":"wrong"}'})).status,401);
 assert.equal((await app.send('/login',{method:'POST',body:'{"name":"A","password":"local-example-password"}'})).status,429);
 time=10;const cookie=await app.login();
 for(const [body,type,status] of [['{','application/json',400],['{}','text/plain',415],[JSON.stringify({title:'ӣ'.repeat(2100)}),'application/json',413]])assert.equal((await app.send('/tasks',{method:'POST',cookie,body,type})).status,status);
 assert.equal((await app.send('/tasks',{method:'POST',cookie,body:'{}',origin:'http://127.0.0.1:3001.evil.invalid'})).status,403);
 const r=await app.send('/missing',{cookie});const error=await r.json();assert.equal(r.status,404);assert.equal(error.error.requestId,r.headers.get('x-request-id'));
 time=20;assert.equal((await app.send('/tasks',{cookie})).status,401);
 for(const row of app.logs)assert.deepEqual(Object.keys(row).sort(),['method','requestId','status']);assert.equal(JSON.stringify(app.logs).includes(cookie.slice(4)),false);
 await app.close();app=undefined;
 app=await start({...store,list:()=>{throw new Error('PRIVATE SQL password=hidden');}});
 const fresh=await app.login(),failed=await app.send('/tasks',{cookie:fresh});assert.equal(failed.status,500);
 const failure=await failed.json();assert.equal(failure.error.message,'Service unavailable');assert.equal(JSON.stringify(failure).includes('PRIVATE'),false);assert.equal('stack' in failure.error,false);
 }finally{if(app)await app.close();store.close();}
});
if(phase>=43)test('phase 43: close/reopen file, HTTP app restart, data persists but old session expires',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'Backend restart тоҷикӣ ')),filename=join(dir,'tasks.sqlite');let store=openStore(filename),app;
 try{await seed(store);app=await start(store);const old=await app.login();const created=await app.send('/tasks',{method:'POST',cookie:old,body:'{"title":"Persisted"}'});assert.equal(created.status,201);const row=await created.json();
 await app.close();app=undefined;store.close();store=openStore(filename);app=await start(store);
 assert.equal((await app.send('/tasks',{cookie:old})).status,401);const cookie=await app.login();assert.equal((await (await app.send('/tasks/'+row.id,{cookie})).json()).title,'Persisted');
 }finally{if(app)await app.close();store.close();await rm(dir,{recursive:true,force:true});}
});
