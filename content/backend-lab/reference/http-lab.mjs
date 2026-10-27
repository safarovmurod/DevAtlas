import {createServer} from 'node:http';
import {once} from 'node:events';
/** Actual loopback HTTP exchange. Port 0 avoids collisions in classrooms/CI. */
export async function exchange(handler,{method='GET',path='/',headers={},body}={}) {
  const server=createServer(handler);server.requestTimeout=3000;server.headersTimeout=3000;
  server.listen(0,'127.0.0.1');await once(server,'listening');
  try {
    const response=await fetch('http://127.0.0.1:'+server.address().port+path,{method,headers,body,signal:AbortSignal.timeout(4000)});
    const text=await response.text();let value=text;
    if(response.headers.get('content-type')?.includes('application/json')&&text)value=JSON.parse(text);
    return {status:response.status,body:value,headers:Object.fromEntries(response.headers)};
  } finally {server.close();server.closeAllConnections();await once(server,'close');}
}
