import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {once} from 'node:events';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const root=process.env.DEVATLAS_BACKEND_PROJECT_ROOT;
const moduleURL=name=>root?pathToFileURL(resolve(root,name+'.mjs')).href:new URL('../reference/'+name+'.mjs',import.meta.url).href;
const {calculateTotal,taskInput,positiveId,pagination}=await import(moduleURL('validation'));
const {openStore}=await import(moduleURL('storage'));
const {hashPassword,verifyPassword,sessions,loginLimiter}=await import(moduleURL('auth'));
const {createApp}=await import(moduleURL('server'));
test('validation: types, boundaries, overflow, unknown properties, IDs and duplicate pagination',()=>{
  assert.equal(calculateTotal(12,3),36);assert.equal(calculateTotal(12,0),0);
  for(const args of [[12,-1],['12',1],[NaN,1],[Infinity,1],[12,0.5],[Number.MAX_VALUE,2]]) assert.throws(()=>calculateTotal(...args),TypeError);
  assert.deepEqual(taskInput({title:'  Read  '}),{title:'Read'});
  for(const input of [null,[],{}, {title:''},{title:'a'.repeat(121)},{title:'a',owner_id:2}]) assert.throws(()=>taskInput(input));
  for(const id of ['0','-1','1.5','1 OR 1=1','01']) assert.equal(positiveId(id),null);
  assert.equal(positiveId('12'),12);
  assert.deepEqual(pagination(new URLSearchParams()),{limit:10,offset:0});
  for(const query of ['limit=0','limit=51','offset=-1','limit=1&limit=2','limit=abc']) assert.throws(()=>pagination(new URLSearchParams(query)));
});
test('database: constraints, parameter binding, owner isolation, transaction rollback and restart persistence',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'DevAtlas тоҷикӣ '));const filename=join(dir,'tasks.sqlite');let store=openStore(filename);
  try {
    store.addUser('A','not-a-real-password');store.addUser('B','not-a-real-password');
    const task=store.create(1,"Read ' OR 1=1 --");
    assert.equal(store.get(1,task.id).title,"Read ' OR 1=1 --");assert.equal(store.get(2,task.id),undefined);
    assert.equal(store.rename(2,task.id,'stolen'),false);assert.equal(store.remove(2,task.id),false);
    assert.throws(()=>store.create(99,'Missing owner'));assert.throws(()=>store.create(1,''));
    store.db.exec('BEGIN');store.create(1,'rolled back');store.db.exec('ROLLBACK');assert.equal(store.list(1,10,0).length,1);
    assert.equal(store.list(1,1,1).length,0);store.close();store=openStore(filename);assert.equal(store.get(1,task.id).title,"Read ' OR 1=1 --");
    store.close();store=openStore(filename);assert.equal(store.list(1,10,0).length,1);
  } finally {store.close();await rm(dir,{recursive:true,force:true});}
});
test('password: random salts, valid and invalid inputs; sessions expire/revoke; limiter recovers',async()=>{
  const one=await hashPassword('local-example-password'),two=await hashPassword('local-example-password');
  assert.notEqual(one,two);assert.equal(await verifyPassword('local-example-password',one),true);
  assert.equal(await verifyPassword('wrong',one),false);assert.equal(await verifyPassword('wrong','broken'),false);
  await assert.rejects(hashPassword('short'));await assert.rejects(hashPassword('x'.repeat(257)));
  let time=0;const auth=sessions({now:()=>time,ttl:10,max:1});const token=auth.create(1);
  assert.equal(auth.read(token),1);assert.throws(()=>auth.create(2));auth.delete(token);assert.equal(auth.read(token),undefined);
  const other=auth.create(2);time=10;assert.equal(auth.read(other),undefined);assert.equal(auth.read(auth.create(3)),3);
  const allow=loginLimiter({now:()=>time,limit:2,windowMs:5});assert.equal(allow('ip'),true);assert.equal(allow('ip'),true);assert.equal(allow('ip'),false);time+=5;assert.equal(allow('ip'),true);
});
test('real HTTP: authentication, CRUD, CSRF, JSON limits, owner isolation, logout, errors and private logs',async()=>{
  const store=openStore();store.addUser('A',await hashPassword('local-example-password'));store.addUser('B',await hashPassword('other-example-password'));
  const logs=[];const server=createApp({store,origin:'http://127.0.0.1:3001',log:row=>logs.push(row)});
  server.listen(0,'127.0.0.1');await once(server,'listening');const base='http://127.0.0.1:'+server.address().port;
  const send=(path,{method='GET',cookie,body,origin='http://127.0.0.1:3001',type='application/json'}={})=>fetch(base+path,{method,headers:{Origin:origin,'Content-Type':type,...(cookie?{Cookie:cookie}:{})},body});
  const login=async(name,password)=>{
    const response=await send('/login',{method:'POST',body:JSON.stringify({name,password})});assert.equal(response.status,200);
    assert.match(response.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);const json=await response.json();assert.equal('password' in json.user,false);
    return response.headers.get('set-cookie').split(';')[0];
  };
  try {
    assert.equal((await send('/health')).status,200);assert.equal((await send('/tasks')).status,401);
    assert.equal((await send('/login',{method:'POST',origin:'https://attacker.invalid',body:'{}'})).status,403);
    const a=await login('A','local-example-password'),b=await login('B','other-example-password');
    const created=await send('/tasks',{method:'POST',cookie:a,body:JSON.stringify({title:' Read '})});assert.equal(created.status,201);const task=await created.json();assert.equal(task.title,'Read');
    assert.equal(created.headers.get('location'),'/tasks/'+task.id);
    assert.equal((await send('/tasks/'+task.id,{cookie:b})).status,404);
    for(const method of ['PATCH','DELETE']) assert.equal((await send('/tasks/'+task.id,{method,cookie:b,body:method==='PATCH'?' {"title":"stolen"}':undefined})).status,404);
    assert.deepEqual((await (await send('/tasks',{cookie:b})).json()).items,[]);
    assert.equal((await send('/tasks',{method:'POST',cookie:a,body:'broken'})).status,400);
    assert.equal((await send('/tasks',{method:'POST',cookie:a,body:'{}',type:'text/plain'})).status,415);
    assert.equal((await send('/tasks',{method:'POST',cookie:a,body:JSON.stringify({title:'x'.repeat(4100)})})).status,413);
    assert.equal((await send('/tasks',{method:'POST',cookie:a,body:'{"title":"","owner_id":2}'})).status,422);
    assert.equal((await send('/tasks?limit=0',{cookie:a})).status,400);
    assert.equal((await send('/tasks/'+task.id,{method:'PATCH',cookie:a,body:'{"title":"Done"}'})).status,200);
    assert.equal((await (await send('/tasks/'+task.id,{cookie:a})).json()).title,'Done');
    assert.equal((await send('/tasks/'+task.id,{method:'DELETE',cookie:a})).status,204);
    assert.equal((await send('/tasks/'+task.id,{cookie:a})).status,404);
    assert.equal((await send('/tasks',{method:'POST',cookie:a,origin:'null',body:'{"title":"bad"}'})).status,403);
    assert.equal((await send('/logout',{method:'POST',cookie:a})).status,204);assert.equal((await send('/tasks',{cookie:a})).status,401);
    const error=await send('/missing',{cookie:b});assert.equal(error.status,404);assert.equal(error.headers.get('cache-control'),'no-store');
    assert.equal((await error.json()).error.requestId,error.headers.get('x-request-id'));
    assert.ok(logs.length>10);for(const row of logs) assert.deepEqual(Object.keys(row).sort(),['method','requestId','status']);
    assert.equal(JSON.stringify(logs).includes('password'),false);assert.equal(JSON.stringify(logs).includes(a.slice(4)),false);
  } finally {server.close();server.closeAllConnections();await once(server,'close');store.close();}
});
