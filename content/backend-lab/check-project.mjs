// Explicit local CLI: executes a learner's own code with their computer's permissions.
// Never invoke from an application server. No claim of OS-level sandboxing.
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
export function checkProject(folder,{phase=44}={}) {
 if(!Number.isInteger(phase)||phase<40||phase>44)throw new Error('Use phase 40–44');
 return new Promise((accept,reject)=>{
  const env={...process.env,DEVATLAS_BACKEND_PROJECT_ROOT:resolve(folder),DEVATLAS_BACKEND_PHASE:String(phase)};
  delete env.NODE_TEST_CONTEXT; // child must run its tests, not inherit a parent test-runner context
  const child=spawn(process.execPath,['--test','--test-reporter=tap',fileURLToPath(new URL('./test/project.test.mjs',import.meta.url)),...(phase===44?[fileURLToPath(new URL('./test/backend.test.mjs',import.meta.url))]:[])],{env,stdio:['ignore','pipe','pipe']});
  let output='';const capture=chunk=>{if(output.length<100000)output+=chunk.toString();};child.stdout.on('data',capture);child.stderr.on('data',capture);
  const timer=setTimeout(()=>{child.kill('SIGKILL');reject(new Error('Local project tests exceeded 45 seconds'));},45000);
  child.on('error',error=>{clearTimeout(timer);reject(error);});
  child.on('close',code=>{clearTimeout(timer);if(code!==0||!output.includes('# pass '+(phase===44?8:phase-39)))reject(new Error(output||`Project tests exited ${code}`));else accept({phase,localOnly:true,masteryGranted:false,output});});
 });
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{const flag=process.argv.indexOf('--phase'),phase=flag<0?44:Number(process.argv[flag+1]);console.log(JSON.stringify(await checkProject(process.argv[2]??'project',{phase})));}
 catch(error){console.error(error.message);process.exitCode=1;}
}
