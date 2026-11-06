import {openStore} from '../reference/storage.mjs';
const store=openStore();store.addUser('learner','unused-test-hash');store.create(1,'Keep');
console.log(JSON.stringify({version:store.db.prepare('PRAGMA user_version').get().user_version,rows:store.list(1,10,0)}));store.close();
