import {createApp} from '../reference/server.mjs';import {openStore} from '../reference/storage.mjs';import {once} from 'node:events';
const store=openStore(),server=createApp({store});server.listen(0,'127.0.0.1');await once(server,'listening');
try{const r=await fetch('http://127.0.0.1:'+server.address().port+'/health');console.log(JSON.stringify({status:r.status,body:await r.json()}));}
finally{server.close();server.closeAllConnections();await once(server,'close');store.close();}
