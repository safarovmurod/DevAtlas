import {hashPassword} from '../reference/auth.mjs';
import assert from 'node:assert/strict';import {openStore} from '../reference/storage.mjs';
const s=openStore();try{s.addUser('A',await hashPassword('local-example-password'));s.addUser('B',await hashPassword('local-example-password'));const task=s.create(1,'Owned');assert.equal(s.remove(2,task.id),false);assert.equal(s.get(1,task.id).title,'Owned');console.log(JSON.stringify({ownershipChecks:2}));}finally{s.close();}
