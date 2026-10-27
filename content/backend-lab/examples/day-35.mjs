import {createApp} from '../reference/server.mjs';
import {openStore} from '../reference/storage.mjs';
import {once} from 'node:events';
const rows=[],store=openStore(),server=createApp({store,log:r=>rows.push(r)});server.listen(0,'127.0.0.1');await once(server,'listening');
try{await (await fetch('http://127.0.0.1:'+server.address().port+'/health')).text();console.log(JSON.stringify(Object.keys(rows[0]).sort()));}
finally{server.close();server.closeAllConnections();await once(server,'close');store.close();}
