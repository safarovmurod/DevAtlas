import {hashPassword} from '../reference/auth.mjs';
import {openStore} from '../reference/storage.mjs';
const store=openStore();try{store.addUser('A',await hashPassword('local-example-password'));console.log(JSON.stringify(store.create(1,'Read')));}finally{store.close();}
