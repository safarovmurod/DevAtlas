import {openStore} from '../reference/storage.mjs';
const store=openStore();store.addUser('A','unused');store.addUser('B','unused');const task=store.create(1,'Private');
console.log(JSON.stringify({foreign:store.get(2,task.id)??null,own:store.get(1,task.id)}));store.close();
