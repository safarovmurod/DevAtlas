import {spawnSync} from 'node:child_process';
import path from 'node:path';
/** Probe real Python >=3.10 execution; Windows Store aliases are not Python.
 * @param {Array<{command:string,prefixArgs:string[]}>} [candidates]
 */
export function findPython(candidates=[
 ...(process.platform==='win32'?[]:[{command:'python3',prefixArgs:[]}]),
 {command:'python',prefixArgs:[]},
 {command:'py',prefixArgs:['-3']},
 ...(process.platform==='win32'?[{command:'python3',prefixArgs:[]}]:[]),
 ...(process.env.LOCALAPPDATA?[{command:path.join(process.env.LOCALAPPDATA,'Programs/Python/Python312/python.exe'),prefixArgs:[]}]:[]),
]){
 for(const candidate of candidates){
  const result=spawnSync(candidate.command,[...candidate.prefixArgs,'-c','import sys; print("devatlas-python3" if sys.version_info >= (3,10) else "unsupported")'],{encoding:'utf8',timeout:5000,maxBuffer:16000,windowsHide:true});
  if(result.status===0&&result.stdout.trim()==='devatlas-python3')return candidate;
 }
 return null;
}
