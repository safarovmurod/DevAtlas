// @vitest-environment node
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {afterAll,it,expect} from 'vitest';
import {findPython} from '../scripts/lib/python-runtime.mjs';
const root=mkdtempSync(path.join(tmpdir(),'devatlas tooling тоҷик '));
afterAll(()=>rmSync(root,{recursive:true,force:true}));
it('rejects launcher stubs and preserves required prefix arguments in paths with spaces',()=>{
 // Protocol fixtures simulate discovery failures only, not execution of Python.
 const fixture=path.join(root,'runtime probe.cjs');
 writeFileSync(fixture,'console.log(process.argv[2]==="--python3"?"devatlas-python3":"Python")');
 const alias={command:process.execPath,prefixArgs:[fixture]};
 const launcher={command:process.execPath,prefixArgs:[fixture,'--python3']};
 expect(findPython([alias])).toBeNull();
 expect(findPython([{command:path.join(root,'missing interpreter'),prefixArgs:[]},alias,launcher])).toEqual(launcher);
},30000);
const powershell=process.env.PWSH||'pwsh';
const available=spawnSync(powershell,['-NoLogo','-NoProfile','-Command','$PSVersionTable.PSVersion.ToString()'],{encoding:'utf8',timeout:10000}).status===0;
it.skipIf(!available)('real PowerShell stops on a native failure and preserves its exit code',()=>{
 const runner=path.join(root,'native failure.ps1');
 writeFileSync(runner,`param([string]$Helper,[string]$NodeBinary,[int]$Code)
$ErrorActionPreference='Stop'
. $Helper
try { Invoke-CheckedNative -Command $NodeBinary -Arguments @('-e', "process.exit($Code)"); Write-Output 'AFTER_SUCCESS' }
catch { exit [int]$_.Exception.Data['NativeExitCode'] }
`);
 for(const code of [0,7]){
  const result=spawnSync(powershell,['-NoLogo','-NoProfile','-ExecutionPolicy','Bypass','-File',runner,path.resolve('scripts/lib/native-process.ps1'),process.execPath,String(code)],{encoding:'utf8',timeout:15000});
  expect(result.error).toBeUndefined();expect(result.status,result.stdout+'\n'+result.stderr).toBe(code);
  expect(result.stdout.includes('AFTER_SUCCESS')).toBe(code===0);
 }
},30000);
