import {openStore} from '../reference/storage.mjs';
const store=openStore();try{console.log(JSON.stringify({version:store.db.prepare('PRAGMA user_version').get().user_version,violations:store.db.prepare('PRAGMA foreign_key_check').all()}));}finally{store.close();}
