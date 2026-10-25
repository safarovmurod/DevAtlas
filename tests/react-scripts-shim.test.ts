// @vitest-environment node
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {expect,it} from 'vitest';

const shim=path.join(process.cwd(),'bin/react-scripts.js');
it.each([
  {name:'successful build',result:'{status:0,signal:null}',expected:0},
  {name:'failed build',result:'{status:7,signal:null}',expected:7},
  {name:'terminated build',result:'{status:null,signal:"SIGTERM"}',expected:1},
  {name:'spawn failure',result:'{status:null,error:new Error("spawn failed")}',expected:1},
])('propagates $name without reporting a false success',({result,expected})=>{
  // Isolate process.exit inside a subprocess. The nested build is a stub: no
  // server is started and no real process needs to be killed for this regression.
  const script=`require('node:child_process').spawnSync=()=>(${result});require(${JSON.stringify(shim)});`;
  const child=spawnSync(process.execPath,['-e',script],{encoding:'utf8',timeout:10000});
  expect(child.error).toBeUndefined();
  expect(child.status,child.stdout+'\n'+child.stderr).toBe(expected);
  if(result.includes('SIGTERM'))expect(child.stderr).toContain('Next.js terminated by SIGTERM');
  if(result.includes('new Error'))expect(child.stderr).toContain('spawn failed');
});
