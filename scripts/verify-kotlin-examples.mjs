// Execute reviewed repository examples only; never pass learner submissions here.
// KOTLINC may select an installed compiler. No downloads or credentials are used.
import {existsSync, mkdtempSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const course=JSON.parse(readFileSync(path.join(root,'src/content/courses/kotlin.json'),'utf8'));
const java=process.env.JAVA || (process.env.JAVA_HOME
  ? path.join(process.env.JAVA_HOME,'bin',process.platform==='win32'?'java.exe':'java')
  : 'java');
const run=(command,args,cwd,timeout=20000)=>spawnSync(command,args,{cwd,encoding:'utf8',timeout,maxBuffer:1024*1024,windowsHide:true});

function compilerInvocation(){
  const requested=process.env.KOTLINC || 'kotlinc';
  if(process.platform!=='win32') return {command:requested,args:[]};

  const explicitPath=path.isAbsolute(requested)||path.dirname(requested)!=='.';
  const names=path.extname(requested)?[requested]:['.exe','.bat','.cmd'].map(suffix=>requested+suffix);
  const directories=explicitPath?['']:(process.env.PATH??'').split(path.delimiter).filter(Boolean);
  const launcher=directories.flatMap(directory=>names.map(name=>path.resolve(directory.replace(/^"|"$/g,''),name))).find(existsSync);
  if(!launcher) return null;
  if(!/\.(bat|cmd)$/i.test(launcher)) return {command:launcher,args:[]};

  // A Windows Kotlin distribution has bin/kotlinc.bat and lib/kotlin-compiler.jar.
  const kotlinHome=path.resolve(path.dirname(launcher),'..');
  assert.ok(existsSync(path.join(kotlinHome,'lib','kotlin-compiler.jar')),
    `KOTLINC batch launcher must be inside an unpacked Kotlin compiler distribution: ${launcher}`);
  return {command:java,args:['-cp',path.join(kotlinHome,'lib','*'),'org.jetbrains.kotlin.cli.jvm.K2JVMCompiler','-kotlin-home',kotlinHome]};
}
const success=(result,label)=>{
  assert.ifError(result.error);
  assert.equal(result.status,0,`${label}\n${result.stderr}\n${result.stdout}`);
  return result.stdout.replace(/\r\n/g,'\n').trim();
};
const expectedPracticeOutput=(solution,label)=>{
  const parts=solution.replace(/\r\n/g,'\n').split('\n// Expected output:\n');
  assert.equal(parts.length,2,`${label}: one practice output marker required`);
  const lines=parts[1].trimEnd().split('\n');
  assert.ok(lines.length && lines.every(line=>line.startsWith('//')),`${label}: expected output must be comment lines`);
  return lines.map(line=>line.replace(/^\/\/ ?/,'')).join('\n');
};
const normalizeOutput=value=>value.replace(/\r\n/g,'\n').trim().split('\n').map(line=>line.trimEnd()).join('\n');
function main(){
  const probeOnly=process.argv.includes('--probe');
  const compiler=compilerInvocation();
  // A cold Kotlin compiler JVM on a hosted Windows runner can need well over 20 s just for -version.
  const version=compiler?run(compiler.command,[...compiler.args,'-version'],root,120000):null;
  if(!version||version.error?.code==='ENOENT'){
    const message='Kotlin compiler or Java could not be found. Point KOTLINC at an installed compiler and JAVA at its Java executable.';
    if(probeOnly&&!process.env.KOTLINC&&!process.env.JAVA){
      console.error(message);
      process.exitCode=2;
      return;
    }
    throw new Error(message);
  }
  success(version,'Kotlin compiler availability');
  if(probeOnly) return;

  const temporary=mkdtempSync(path.join(tmpdir(),'devatlas-kotlin-'));
  const runHere=(command,args,timeout)=>run(command,args,temporary,timeout);
  try {
  const files=[];
  for(const lesson of course.lessons){
    const day=String(lesson.day).padStart(2,'0');
    assert.notEqual(lesson.practice.solution,lesson.sections[0].code,`${lesson.id}: independent scenario required`);
    expectedPracticeOutput(lesson.practice.solution,lesson.id);
    for(const [kind,source] of [['guided',lesson.sections[0].code],['practice',lesson.practice.solution]]){
      assert.ok(source,`${lesson.id}: ${kind} source required`);
      const filename=`${kind}Lesson${day}.kt`;
      writeFileSync(path.join(temporary,filename),`package ${kind}day${day}\n${source}`);
      files.push(filename);
    }
  }
  const day2=course.lessons[1].sections[0].code.replace('fun main()', 'fun originalMain()');
  writeFileSync(path.join(temporary,'Boundaries.kt'),`package boundaries\n${day2}
fun main() {
    check(total(0, 3) == 0)
    check(total(7, 2) == 14)
    var negativeRejected = false
    try { total(-1, 3) } catch (error: IllegalArgumentException) { negativeRejected = true }
    check(negativeRejected)
    var overflowRejected = false
    try { total(Int.MAX_VALUE, 2) } catch (error: ArithmeticException) { overflowRejected = true }
    check(overflowRejected)
    println("Boundaries passed")
}
`);
  const independentDay2=course.lessons[1].practice.solution.replace('fun main()', 'fun originalMain()');
  writeFileSync(path.join(temporary,'PracticeBoundaries.kt'),`package practiceboundaries\n${independentDay2}
fun main() {
    check(delivery(0, 3) == 0)
    check(delivery(7, 2) == 14)
    for ((fee, trips) in listOf(-1 to 3, 3 to -1)) {
        var rejected = false
        try { delivery(fee, trips) } catch (error: IllegalArgumentException) { rejected = true }
        check(rejected)
    }
    var overflowRejected = false
    try { delivery(Int.MAX_VALUE, 2) } catch (error: ArithmeticException) { overflowRejected = true }
    check(overflowRejected)
    println("Practice boundaries passed")
}
`);
  const finalLesson=course.lessons.at(-1);
  assert.match(finalLesson.practice.solution,/tasks\.filter \{ it\.id != id \}/);
  writeFileSync(path.join(temporary,'Mutation.kt'),'package mutation\n'+finalLesson.practice.solution.replace('it.id != id','it.id == id'));
  // One compilation, separate packages: every example remains an independent main.
  success(runHere(compiler.command,[...compiler.args,...files,'Boundaries.kt','PracticeBoundaries.kt','Mutation.kt','-include-runtime','-d','lessons.jar'],300000),'Compile guided examples and independent solutions');
  for(const lesson of course.lessons){
    const day=String(lesson.day).padStart(2,'0');
    const guided=success(runHere(java,['-cp','lessons.jar',`guidedday${day}.GuidedLesson${day}Kt`]),`${lesson.id}: guided example`);
    for(const locale of ['ru','tg','en']) assert.equal(normalizeOutput(guided),normalizeOutput(lesson.sections[0].output[locale]),`${lesson.id}: ${locale} guided output`);
    const practice=success(runHere(java,['-cp','lessons.jar',`practiceday${day}.PracticeLesson${day}Kt`]),`${lesson.id}: independent practice`);
    assert.equal(practice,expectedPracticeOutput(lesson.practice.solution,lesson.id).trim(),`${lesson.id}: practice output`);
    console.log(`${lesson.id}: guided and independent outputs matched`);
  }
  assert.equal(success(runHere(java,['-cp','lessons.jar','boundaries.BoundariesKt']),'Day 2 boundaries'),'Boundaries passed');
  assert.equal(success(runHere(java,['-cp','lessons.jar','practiceboundaries.PracticeBoundariesKt']),'Independent day 2 boundaries'),'Practice boundaries passed');
  const mutation=runHere(java,['-cp','lessons.jar','mutation.MutationKt']);
  assert.ifError(mutation.error);
  assert.notEqual(mutation.status,0,'Broken deletion must be rejected');
  assert.match(mutation.stderr,/IllegalStateException: Check failed/);
  console.log('30/30 guided examples and 30/30 independent solutions passed; negative input and overflow rejected; broken deletion detected.');
  } finally {
    rmSync(temporary,{recursive:true,force:true});
  }
}

main();
