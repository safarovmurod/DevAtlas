import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {verifyComponent} from '../verify-component.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const project=process.env.DEVATLAS_EXPO_PROJECT;
test('simulated React Native checks accept real component behavior and reject incorrect counter, reset and missing goal', {skip:!project,timeout:120000},async()=>{
 const folder=await mkdtemp(join(tmpdir(),'DevAtlas mobile тоҷикӣ '));
 try{
  const checks=[['02','examples',"value + 1","value + 2"],['04','solutions',"setMessage('Готовы начать?');","setMessage('Урок начался');"],['06','solutions','      <Goal />\n','']];
  for(const [day,group,before,after] of checks){
   const source=await readFile(join(root,group,`day-${day}.tsx.txt`),'utf8');
   const good=join(folder,`good-${day}.tsx`);await writeFile(good,source);
   const result=await verifyComponent(day,good,project);assert.equal(result.passed,1);assert.equal(result.deviceVerified,false);assert.equal(result.masteryGranted,false);
   assert.ok(source.includes(before),'mutation must alter the implementation');
   const bad=join(folder,`bad-${day}.tsx`);await writeFile(bad,source.replace(before,after));
   await assert.rejects(verifyComponent(day,bad,project),day==='02'?/Completed: 3/:day==='04'?/Готовы начать/:/Received:.*2/s);
  }
 }finally{await rm(folder,{recursive:true,force:true});}
});
test('checker rejects a mismatched Expo and React Native toolchain before executing a learner file',async()=>{
 const projectDir=await mkdtemp(join(tmpdir(),'Incompatible Expo тоҷикӣ '));
 try{
  for(const [name,version] of [['expo','57.0.0'],['react-native','0.88.0'],['react','19.3.0']]){
   const moduleDir=join(projectDir,'node_modules',name);await mkdir(moduleDir,{recursive:true});
   await writeFile(join(moduleDir,'package.json'),JSON.stringify({name,version}));
  }
  await assert.rejects(verifyComponent('02',join(root,'examples','day-02.tsx.txt'),projectDir),/Expected Expo 58/);
 }finally{await rm(projectDir,{recursive:true,force:true});}
});
