import type { FunctionCase } from '@/content/practice';
export interface FunctionResult {
  name: string;
  passed: boolean;
  actual?: unknown;
  expected?: unknown;
  error?: string;
}
export async function runFunction(
  code: string,
  functionName: string,
  tests: FunctionCase[],
): Promise<FunctionResult[]> {
  if (typeof document === 'undefined' || typeof window === 'undefined')
    throw new Error('Browser isolation is required; learner code cannot run on the server.');
  if (!/^[A-Za-z_$][\w$]*$/.test(functionName) || !tests.length)
    throw new Error('No executable tests.');
  if (code.length > 50000) throw new Error('Код аз ҳад калон аст.');
  const ts = await import('typescript');
  const result = ts.transpileModule(code, {
    fileName: 'solution.ts',
    reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  });
  const diagnostic = result.diagnostics?.find(
    (item) => item.category === ts.DiagnosticCategory.Error,
  );
  if (diagnostic) throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
  return new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');
    frame.hidden = true;
    frame.title = 'Isolated function test';
    frame.setAttribute('sandbox', 'allow-scripts');
    const token = crypto.randomUUID();
    let settled = false;
    let dispatched = false;
    const timer = setTimeout(
      () => finish(undefined, new Error('Timeout: иҷро баъди 3 сония қатъ шуд.')),
      3000,
    );
    function finish(value?: FunctionResult[], error?: Error) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      window.removeEventListener('message', receive);
      frame.remove();
      if (error) reject(error);
      else resolve(value!);
    }
    function receive(event: MessageEvent) {
      if (event.source !== frame.contentWindow || event.data?.token !== token) return;
      if (event.data.ready) {
        if (dispatched) return;
        dispatched = true;
        frame.contentWindow?.postMessage(
          { token, code: result.outputText, functionName, tests },
          '*',
        );
      } else if (typeof event.data.error === 'string' && event.data.error) {
        finish(undefined, new Error(event.data.error));
      } else if (
        Array.isArray(event.data.results) &&
        event.data.results.length === tests.length &&
        event.data.results.every(
          (item: unknown) =>
            Boolean(item) &&
            typeof item === 'object' &&
            typeof (item as FunctionResult).name === 'string' &&
            typeof (item as FunctionResult).passed === 'boolean',
        )
      ) {
        finish(
          event.data.results.map((item: FunctionResult) => ({
            name: item.name,
            passed: item.passed,
            actual: item.actual,
            expected: item.expected,
            ...(typeof item.error === 'string' ? { error: item.error } : {}),
          })),
        );
      } else {
        finish(undefined, new Error('Хатои иҷрои код.'));
      }
    }
    window.addEventListener('message', receive);
    // The opaque iframe owns a worker. CSP blocks networking; removing it stops the worker and infinite loops.
    const workerSource = `const reply = self.postMessage.bind(self);
onmessage = async function(event) {
   try {
    const {code,functionName,tests}=event.data;
    const module={exports:{}};
    const fn=new Function('module','exports','postMessage','importScripts','Worker','SharedWorker','fetch','XMLHttpRequest','WebSocket','EventSource',code+';return typeof '+functionName+' === "function" ? '+functionName+' : module.exports["'+functionName+'"];')(module,module.exports);
    if(typeof fn!=='function')throw new Error('Функсияи '+functionName+' ёфт нашуд.');
    const equal=(a,b)=>{
     if(Object.is(a,b))return true;
     if(a===null||b===null||typeof a!=='object'||typeof b!=='object')return false;
     if(Array.isArray(a)!==Array.isArray(b))return false;
     const keys=Object.keys(a).sort(),other=Object.keys(b).sort();
     return keys.length===other.length&&keys.every((key,index)=>key===other[index]&&equal(a[key],b[key]));
    };
    const results=[];
    for(const test of tests) {
     try {
      const args=structuredClone(test.args);const before=JSON.stringify(args);
      const actual=await fn(...args);
      const mutated=JSON.stringify(args)!==before;
      results.push({name:test.name,passed:!mutated&&equal(actual,test.expected),actual,expected:test.expected,error:mutated?'Массиви аввал тағйир ёфт.':undefined});
     } catch(error) { results.push({name:test.name,passed:false,error:String(error.message||error)}); }
    }
    reply({results});
   }catch(error){reply({error:String(error.message||error)});}
  }`;
    const frameScript = `const token=${JSON.stringify(token)};let worker;
   window.addEventListener('message',event=>{
    if(event.source!==parent||event.data?.token!==token||worker)return;
    const url=URL.createObjectURL(new Blob([${JSON.stringify(workerSource)}],{type:'text/javascript'}));
    worker=new Worker(url);URL.revokeObjectURL(url);
    worker.onmessage=e=>{parent.postMessage({token,results:e.data?.results,error:e.data?.error},'*');worker.terminate();};
    worker.onerror=()=>{parent.postMessage({token,error:'Хатои иҷрои код.'},'*');worker.terminate();};
    worker.postMessage(event.data);
   });
   parent.postMessage({token,ready:true},'*');`;
    frame.srcdoc =
      "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none'; base-uri 'none'; form-action 'none';\"><script>" +
      frameScript.replaceAll('</script', '<\\/script') +
      '</script>';
    document.body.appendChild(frame);
  });
}
