import {createServer} from 'node:http';
import {randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {openStore} from './storage.mjs';
import {hashPassword,verifyPassword,sessions,loginLimiter} from './auth.mjs';
import {taskInput,positiveId,pagination} from './validation.mjs';
const failure = (status, message) => Object.assign(new Error(message), {status});
async function jsonBody(request) {
  if (request.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') throw failure(415,'Use application/json');
  let size = 0;const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 4096) throw failure(413,'Body exceeds 4096 bytes');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw failure(400,'Invalid JSON'); }
}
function sessionCookie(request) {
  const values = (request.headers.cookie ?? '').split(';').map(value=>value.trim()).filter(value=>value.startsWith('sid='));
  return values.length === 1 ? values[0].slice(4) : undefined;
}
export function createApp({store = openStore(),sessionStore = sessions(),allowLogin = loginLimiter(),log = () => {},origin = 'http://127.0.0.1:3001',secureCookie = false} = {}) {
  const configured = new URL(origin);
  if (configured.origin !== origin || !['http:','https:'].includes(configured.protocol) || (configured.protocol === 'https:' && !secureCookie)) throw new Error('Use an exact origin and secure cookies with HTTPS');
  if (!secureCookie && !['127.0.0.1','localhost','[::1]'].includes(configured.hostname)) throw new Error('Insecure cookies are allowed only on loopback');
  const server = createServer(async (request,response) => {
    const requestId = randomUUID();
    let status = 500;
    response.setHeader('X-Request-Id',requestId);
    response.setHeader('Content-Type','application/json; charset=utf-8');
    response.setHeader('Cache-Control','no-store');
    response.setHeader('X-Content-Type-Options','nosniff');
    const reply = (code,value) => {status=code;response.writeHead(code);response.end(code===204?undefined:JSON.stringify(value));};
    const cookie = (token, age) => `sid=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${secureCookie?'; Secure':''}`;
    try {
      const url = new URL(request.url ?? '/',origin),method = request.method;
      if (method === 'GET' && url.pathname === '/health') {store.db.prepare('SELECT 1').get();return reply(200,{status:'ok'});}
      // All writes require the exact configured Origin, even login/logout.
      if (!['GET','HEAD','OPTIONS'].includes(method) && request.headers.origin !== origin) throw failure(403,'Origin rejected');
      if (url.pathname === '/login' && method === 'POST') {
        if (!allowLogin(request.socket.remoteAddress ?? 'unknown')) throw failure(429,'Try later');
        const input = await jsonBody(request);
        if (!input || typeof input.name !== 'string' || input.name.length > 80 || typeof input.password !== 'string' || Buffer.byteLength(input.password) > 256) throw failure(400,'Invalid credentials');
        const user = store.user(input.name);
        // Perform the same expensive operation for unknown names; never return hashes.
        const dummy = '00'.repeat(16)+':'+'00'.repeat(64);
        const valid = await verifyPassword(input.password,user?.password ?? dummy);
        if (!user || !valid) throw failure(401,'Invalid credentials');
        response.setHeader('Set-Cookie',cookie(sessionStore.create(Number(user.id)),1800));
        return reply(200,{user:{id:Number(user.id),name:user.name}});
      }
      const token = sessionCookie(request),owner = sessionStore.read(token);
      if (!owner) throw failure(401,'Login required');
      if (url.pathname === '/logout' && method === 'POST') {
        sessionStore.delete(token);response.setHeader('Set-Cookie',cookie('',0));return reply(204);
      }
      if (url.pathname === '/tasks') {
        if (method === 'GET') { const {limit,offset} = pagination(url.searchParams);return reply(200,{items:store.list(owner,limit,offset)}); }
        if (method === 'POST') {const input = taskInput(await jsonBody(request));const task = store.create(owner,input.title);response.setHeader('Location','/tasks/'+task.id);return reply(201,task);}
        throw failure(405,'Method not allowed');
      }
      const match = /^\/tasks\/([^/]+)$/.exec(url.pathname);
      if (match) {
        const id = positiveId(match[1]);if (id===null) throw failure(400,'Invalid id');
        if (!store.get(owner,id)) throw failure(404,'Task not found');
        if (method === 'GET') return reply(200,store.get(owner,id));
        if (method === 'PATCH') {const input = taskInput(await jsonBody(request));if (!store.rename(owner,id,input.title)) throw failure(404,'Task not found');return reply(200,store.get(owner,id));}
        if (method === 'DELETE') {store.remove(owner,id);return reply(204);}
        throw failure(405,'Method not allowed');
      }
      throw failure(404,'Not found');
    } catch (error) {
      const code = Number.isInteger(error.status) && error.status>=400 && error.status<500 ? error.status : error.status===503?503:500;
      if (!response.headersSent && !response.destroyed) reply(code,{error:{code,message:code>=500?'Service unavailable':error.message,requestId}});
      else status=code;
    } finally {
      // No headers, body, password, cookies, query or exception message in logs.
      try {log({requestId,method:request.method,status});} catch { /* logging must not break the response */ }
    }
  });
  server.requestTimeout=10000;server.headersTimeout=5000;server.timeout=12000;server.maxHeadersCount=50;
  return server;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 3001);
  if (!Number.isInteger(port) || port<1024 || port>65535) throw new Error('Use PORT 1024–65535');
  const origin = `http://127.0.0.1:${port}`;
  const store = openStore(process.env.DB_PATH ?? 'tasks.sqlite');
  if (process.argv.includes('--seed')) {
    const password = process.env.DEMO_PASSWORD;
    if (!password) throw new Error('Set DEMO_PASSWORD for initial local seed');
    if (!store.user('learner')) store.addUser('learner',await hashPassword(password));
  }
  const server = createApp({store,origin,log:row=>console.log(JSON.stringify(row))});
  server.listen(port,'127.0.0.1',()=>console.log(`Local learning API: ${origin}`));
  const close = () => server.close(()=>{store.close();process.exitCode=0;});
  process.on('SIGINT',close);process.on('SIGTERM',close);
}
