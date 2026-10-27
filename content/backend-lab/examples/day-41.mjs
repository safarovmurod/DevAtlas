import {hashPassword} from '../reference/auth.mjs';
import {openStore} from '../reference/storage.mjs';
const s=openStore();try{s.addUser('A',await hashPassword('local-example-password'));s.addUser('B',await hashPassword('local-example-password'));const first=s.create(1,'One');s.create(1,'Two');console.log(JSON.stringify({foreignUpdate:s.rename(2,first.id,'Stolen'),page:s.list(1,1,1)}));}finally{s.close();}
