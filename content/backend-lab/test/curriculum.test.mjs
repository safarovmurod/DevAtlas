// Trusted authored examples only. A learner runs their own files explicitly via the local CLI.
import {test} from 'node:test';import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';import {readFile,mkdtemp,cp,rm,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';import {join} from 'node:path';import {tmpdir} from 'node:os';
import {checkDay} from '../check-day.mjs';import {checkProject} from '../check-project.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),book=JSON.parse(await readFile(join(root,'exercise-cases.json'),'utf8'));
test('every day 10–44 example executes in actual Node and matches its declared output',{timeout:45000},()=>{
 for(let day=10;day<=44;day++){
  const file=join(root,'examples',`day-${String(day).padStart(2,'0')}.mjs`),result=spawnSync(process.execPath,[file],{encoding:'utf8',timeout:7000});
  assert.equal(result.status,0,`day ${day}: ${result.stderr}`);assert.equal(result.stdout.trim(),book[day].expectedOutput,`day ${day}: actual stdout`);
 }
});
test('days 10–39: authored solutions pass actual cases; every unfinished starter fails',{timeout:45000},async()=>{
 for(let day=10;day<=39;day++){
  const filename=`day-${String(day).padStart(2,'0')}.mjs`,result=await checkDay(day,join(root,'solutions',filename));assert.equal(result.cases,book[day].cases.length);assert.equal(result.masteryGranted,false);
  await assert.rejects(checkDay(day,join(root,'daily',filename)),undefined,`day ${day}: unfinished learner starter must not pass`);
 }
});
test('project gates run supplied candidate: reference passes, unfinished starter and broken ownership fail',{timeout:45000},async()=>{
 const green=await checkProject(join(root,'reference'));assert.equal(green.masteryGranted,false);assert.match(green.output,/pass 8/);
 await assert.rejects(checkProject(join(root,'project')));
 const folder=await mkdtemp(join(tmpdir(),'Backend mutation тоҷикӣ '));try{
  await cp(join(root,'reference'),folder,{recursive:true});
  const filename=join(folder,'storage.mjs'),original=await readFile(filename,'utf8');
  const mutated=original.replace("get: (owner, id) => db.prepare('SELECT id,title FROM tasks WHERE owner_id=? AND id=?').get(owner,id)","get: (owner, id) => db.prepare('SELECT id,title FROM tasks WHERE id=?').get(id)");
  assert.notEqual(mutated,original,'mutation must actually alter the candidate');await writeFile(filename,mutated);
  await assert.rejects(checkProject(folder,{phase:41}),/404|undefined|Assertion/);
 }finally{await rm(folder,{recursive:true,force:true});}
});

test('session lifecycle rejects output-only simulation without actual supplied sessions',async()=>{
 const folder=await mkdtemp(join(tmpdir(),'Backend counterfeit '));try{
  const filename=join(folder,'fake.mjs');await writeFile(filename,"export function solve(i){return {before:7,after:i.logout||i.advance>=i.ttl?null:7};}");
  await assert.rejects(checkDay(28,filename),/create a real supplied session/);
 }finally{await rm(folder,{recursive:true,force:true});}
});
