// Server-only API adapter. Never send the API key to the browser.
export interface TutorMessage {role:'system'|'user'|'assistant';content:string}
export type TutorProvider={kind:'gemini'|'anymodel';key:string;model:string};
export class TutorProviderError extends Error { constructor(readonly status:429|502,message:string){super(message);} }
export function selectTutorProvider(env:Record<string,string|undefined>=process.env):TutorProvider|null {
 const kind=env.AI_TUTOR_PROVIDER || (env.GEMINI_API_KEY?'gemini':'anymodel');
 if(kind==='gemini'&&env.GEMINI_API_KEY?.trim()){
  const configured=env.GEMINI_MODEL || 'gemini-2.5-flash';
  return {kind:'gemini',key:env.GEMINI_API_KEY,model:/^gemini-[a-z0-9.-]+$/.test(configured)?configured:'gemini-2.5-flash'};
 }
 if(kind==='anymodel'&&env.AI_PROVIDER_KEY?.trim())return {kind:'anymodel',key:env.AI_PROVIDER_KEY,model:env.AI_MODEL||'cx/gpt-6.1-sol'};
 return null;
}
const safeUsage=(n:unknown)=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0?n:undefined;
function failure(status:number):never {
 throw new TutorProviderError(status===429?429:502,status===429?'Лимити AI тамом шуд.':status===401||status===403?'Калиди AI ё дастрасӣ ба модел қабул нашуд.':'Хидмати AI ҳоло дастнорас аст.');
}
export async function requestTutorCompletion(provider:TutorProvider,messages:TutorMessage[],maxOutputTokens:number){
 const gemini=provider.kind==='gemini';
 const response=await fetch(gemini?'https://generativelanguage.googleapis.com/v1beta/models/'+provider.model+':generateContent':'https://anymodel.org/v1/chat/completions',{
  method:'POST',headers:gemini?{'Content-Type':'application/json','x-goog-api-key':provider.key}:{'Content-Type':'application/json',Authorization:'Bearer '+provider.key},
  body:JSON.stringify(gemini?{
   systemInstruction:{parts:[{text:messages.filter(m=>m.role==='system').map(m=>m.content).join('\n\n')}]},
   contents:messages.filter(m=>m.role!=='system').map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]})),
   generationConfig:{maxOutputTokens},
  }:{model:provider.model,messages,max_tokens:maxOutputTokens}),
  signal:AbortSignal.timeout(45000),cache:'no-store',
 });
 if(!response.ok)failure(response.status);
 const data:unknown=await response.json();
 if(!data||typeof data!=='object')failure(502);
 let reply:unknown,usage:unknown;
 if(gemini){
  const d=data as {candidates?:{content?:{parts?:{text?:unknown}[]}}[];usageMetadata?:{totalTokenCount?:unknown}};
  reply=d.candidates?.[0]?.content?.parts?.map(p=>typeof p.text==='string'?p.text:'').join('');
  usage=d.usageMetadata?.totalTokenCount;
 } else {
  const d=data as {choices?:{message?:{content?:unknown}}[];usage?:{total_tokens?:unknown}};
  reply=d.choices?.[0]?.message?.content;usage=d.usage?.total_tokens;
 }
 if(typeof reply!=='string'||!reply.trim()||reply.length>20000)failure(502);
 const totalTokens=safeUsage(usage);
 return {reply:reply.trim(),...(totalTokens===undefined?{}:{totalTokens})};
}
