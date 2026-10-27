import {hashPassword} from '../reference/auth.mjs';
import {openStore} from '../reference/storage.mjs';import {mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
const dir=await mkdtemp(join(tmpdir(),'Backend restart ')),file=join(dir,'tasks.sqlite');let s=openStore(file);
try{s.addUser('A',await hashPassword('local-example-password'));s.create(1,'Saved');s.close();s=openStore(file);console.log(JSON.stringify(s.list(1,10,0)));}finally{s.close();await rm(dir,{recursive:true,force:true});}
