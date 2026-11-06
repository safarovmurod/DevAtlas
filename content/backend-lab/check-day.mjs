// Local learner CLI ONLY. Never imported by a Next.js server or browser route.
// You explicitly execute your own Node.js file with your computer's permissions.
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {DatabaseSync} from 'node:sqlite';
import {calculateTotal,taskInput} from './reference/validation.mjs';
import {exchange} from './reference/http-lab.mjs';
import {sessions,verifyPassword} from './reference/auth.mjs';
export async function checkDay(day,filename){
 const book=JSON.parse(await readFile(new URL('./exercise-cases.json',import.meta.url),'utf8')),entry=book[String(day)];
 if(entry?.mode==='project')throw new Error('Use check-project.mjs for capstone days 40–44');
 if(!entry)throw new Error('No published exercise for this day');
 const {solve}=await import(pathToFileURL(resolve(filename)).href);
 if(typeof solve!=='function')throw new Error('Export a function named solve');
 const normalize=value=>value===undefined?null:JSON.parse(JSON.stringify(value));
 let checked=0;
 for(const [index,test] of entry.cases.entries()){
  const folder=await mkdtemp(join(tmpdir(),'Backend тоҷикӣ '));let db=new DatabaseSync(':memory:');
  try{
   if(test.setup)db.exec(test.setup);
   const input=structuredClone(test.input),before=JSON.stringify(input);let actual,error;
   const auth=sessions();let evidence=auth,clock=0,created=[],reads=0,advances=0,deleted=0;
   if(entry.mode==='session-lifecycle'){
    const state=sessions({now:()=>clock,ttl:input.ttl});
    evidence={auth:{create(id){const token=state.create(id);created.push({id,token});return token;},read(token){reads++;return state.read(token);},delete(token){deleted++;state.delete(token);}},advance(ms){advances++;clock=ms;},state};
   }
   if(entry.mode==='session-sql')input.token=test.session==='owner'?auth.create(1):test.session==='other'?auth.create(2):'invalid';
   if(entry.mode==='persistence')input.filename=join(folder,'saved.sqlite');
   let argument=input,calls=0;
   if(entry.mode==='mutation')argument=input==='correct'?calculateTotal:input==='addition'?((a,b)=>a+b):input==='zero'?((a,b)=>b===0?a:calculateTotal(a,b)):((a,b)=>Number(a)*b);
   if(entry.mode==='validation-tests')argument=input==='correct'?taskInput:value=>{
    if(input==='empty'&&value?.title==='')return {title:''};
    if(input==='long'&&typeof value?.title==='string'&&value.title.length>120)return {title:value.title};
    if(input==='unknown'&&value?.owner_id)return taskInput({title:value.title});
    return taskInput(value);
   };
   if(entry.mode==='http-contract')argument=()=>exchange((req,res)=>{res.statusCode=input==='status'?201:200;res.setHeader('Content-Type',input==='type'?'text/plain':'application/json');res.end(JSON.stringify({status:input==='body'?'broken':'ok'}));});
   if(entry.mode==='dependency')argument=async()=>{calls++;if(input==='reject')throw new Error('offline');return structuredClone(input);};
   try{for(let n=0;n<(test.repeat??1);n++)actual=await solve(argument,db,evidence);}catch(caught){error=caught;}
   if(test.throws)assert.ok(error,`case ${index+1}: expected rejection`);
   else{
    if(error)throw new Error(`case ${index+1}: ${error.message}`,{cause:error});
    if(entry.mode==='password-hash'){
     assert.equal(typeof actual,'string');assert.match(actual,/^[a-f0-9]{32}:[a-f0-9]{128}$/);
     assert.equal(await verifyPassword(input,actual),true,'returned hash must verify the actual password');
     assert.equal(await verifyPassword('incorrect-password',actual),false);
     const again=await solve(input);assert.notEqual(again,actual,'fresh random salt required');
    }else if('expected' in test)assert.deepEqual(normalize(actual),test.expected,`case ${index+1}: expected/actual mismatch`);
   }
   if(entry.mode==='session-lifecycle'){assert.equal(created.length,1,'create a real supplied session');assert.equal(created[0].id,7);assert.ok(reads>=2,'read before and after');assert.equal(advances,1,'advance the injected clock');assert.equal(clock,input.advance);assert.equal(deleted,input.logout?1:0);assert.equal(evidence.state.read(created[0].token)??null,test.expected.after,'actual session state after expiry/logout');}
   if(entry.mode==='dependency')assert.equal(calls,1,'load must be called exactly once');
   if(entry.mode==='persistence'){db.close();db=new DatabaseSync(input.filename);}
   if(test.query)assert.deepEqual(normalize(db.prepare(test.query).all()),test.rows,`case ${index+1}: actual database state`);
   for(const probe of test.probes??[]){
    db.exec('SAVEPOINT exercise_probe');let rejected=false;
    try{db.exec(probe.sql);}catch{rejected=true;}finally{db.exec('ROLLBACK TO exercise_probe; RELEASE exercise_probe');}
    assert.equal(rejected,probe.reject,'actual database constraint');
   }
   if(entry.mode==='function')assert.equal(JSON.stringify(input),before,'do not mutate input');
   checked++;
  }finally{db.close();await rm(folder,{recursive:true,force:true});}
 }
 return {day:Number(day),cases:checked,localOnly:true,masteryGranted:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{console.log(JSON.stringify(await checkDay(process.argv[2],process.argv[3])));}
 catch(error){console.error(error.message);process.exitCode=1;}
}
