// Explicit local learner CLI only; never imported by the DevAtlas web server.
// Executes the supplied source with the current user's permissions using Jest's
// simulated React Native host. This is not a native-device test or attestation.
import {mkdtemp,copyFile,mkdir,writeFile,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';

export async function verifyComponent(day,source,expoProject){
 if(!['02','04','06','08'].includes(day))throw new Error('Available component checks: 02, 04, 06 and 08');
 if(!source||!expoProject)throw new Error('Usage: node verify-component.mjs 02|04|06|08 <your-file.tsx> <expo-project>');
 const project=resolve(expoProject),requireFromProject=createRequire(join(project,'package.json'));
 const expo=requireFromProject('expo/package.json').version;
 const native=requireFromProject('react-native/package.json').version;
 const react=requireFromProject('react/package.json').version;
 if(!/^58\./.test(expo)||!/^0\.88\./.test(native)||!/^19\.3\./.test(react))throw new Error(`Expected Expo 58, React Native 0.88 and React 19.3; found ${expo}, ${native}, ${react}`);
 const jest=requireFromProject.resolve('jest/bin/jest');
 const preset=requireFromProject.resolve('jest-expo/jest-preset');
 const folder=await mkdtemp(join(project,'.devatlas-component-'));
 try{
  await mkdir(join(folder,'component-tests'));
  await copyFile(resolve(source),join(folder,'App.tsx'));
  await copyFile(fileURLToPath(new URL(`./component-tests/day-${day}.test.cjs`,import.meta.url)),join(folder,'component-tests','exercise.test.cjs'));
  await writeFile(join(folder,'jest.config.cjs'),`module.exports={...require(${JSON.stringify(preset)}),rootDir:__dirname,testMatch:['**/component-tests/*.test.cjs']};\n`);
  const result=spawnSync(process.execPath,[jest,'--config',join(folder,'jest.config.cjs'),'--runInBand'],{cwd:folder,env:{...process.env,CI:'1',EXPO_NO_TELEMETRY:'1'},encoding:'utf8',timeout:60000,maxBuffer:1024*1024});
  const output=(result.stdout??'')+(result.stderr??'');
  if(result.error||result.status!==0||!/Tests:\s+1 passed/.test(output))throw new Error(output||result.error?.message||`Jest exited ${result.status}`);
  return {day,passed:1,scope:'simulated-react-native-host',versions:{expo,reactNative:native,react},deviceVerified:false,masteryGranted:false};
 }finally{await rm(folder,{recursive:true,force:true});}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{console.log(JSON.stringify(await verifyComponent(process.argv[2],process.argv[3],process.argv[4])));}
 catch(error){console.error(error.message);process.exitCode=1;}
}
