import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import JSZip from 'jszip';
const root=fileURLToPath(new URL('../',import.meta.url));
const source=path.join(root,'content/backend-lab'),zip=new JSZip();
async function collect(folder,prefix=''){
 for(const name of (await readdir(folder)).sort()){
  const relative=prefix+name,filename=path.join(folder,name);
  if(!name.includes('.') && ['reference','starter','test','examples','daily','solutions','project'].includes(name))await collect(filename,relative+'/');
  else if(name.endsWith('.mjs')||['package.json','exercise-cases.json','README.md','LICENSE','.gitignore'].includes(name)){
   // Archive digests must be identical across Windows checkout newline settings.
   const body=(await readFile(filename,'utf8')).replaceAll('\r\n','\n');
   zip.file('devatlas-backend-lab/'+relative,body,{date:new Date('2026-01-01T00:00:00.000Z'),createFolders:false});
  }
 }
}
await collect(source);
const bytes=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE',compressionOptions:{level:9},platform:'UNIX'});
const sha256=createHash('sha256').update(bytes).digest('hex');
const filename=sha256+'.zip',url='/course-files/'+filename;
const coursePath=path.join(root,'src/content/courses/backend.json'),course=JSON.parse(await readFile(coursePath,'utf8'));
const metadata={id:'backend-local-lab',title:'Backend local Node.js laboratory (RU TG EN).zip',url,bytes:bytes.length,sha256,sourceIds:['backend-docs','node-test','node-sqlite','node-crypto']};
if(process.argv.includes('--check')){
 if(JSON.stringify(course.files.find(item=>item.id===metadata.id))!==JSON.stringify(metadata))throw new Error('Backend lab metadata is stale; run node scripts/package-backend-lab.mjs');
 const stored=await readFile(path.join(root,'content/course-files',filename));
 if(!stored.equals(bytes))throw new Error('Backend lab archive is stale');
}else{
 await mkdir(path.join(root,'content/course-files'),{recursive:true});
 await writeFile(path.join(root,'content/course-files',filename),bytes);
 course.files=[...course.files.filter(item=>item.id!==metadata.id),metadata];
 await writeFile(coursePath,JSON.stringify(course,null,2)+'\n');
}
console.log(`Backend lab: ${bytes.length} bytes, SHA256 ${sha256}`);
